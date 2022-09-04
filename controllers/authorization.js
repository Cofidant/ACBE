const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const {
  BadRequest,
  UnAuthenticated,
  NotFound,
  InternalServerError,
} = require('../errors')
const catchAsync = require('../utils/catchAsync')
const Patient = require('../models/Patient')
// const { promisify } = require('util')
const crypto = require('crypto')
const Email = require('../utils/email')
const { validateId } = require('../utils/myUtills')

/**
 *
 * @param {Object} user The user that is created / updated
 * @param {StatusCodes} code The http status code to send
 * @param {String} message The prompt message
 * @param {Response} res The http response object
 */
const createAndSendToken = (user, code, message, res) => {
  const token = user.createJWT()
  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  })
  user.password = undefined
  res.set('authorization', token)
  res.status(code).json({ status: 'success', message, user, token })
}

// will only Create a Patient....
const register = catchAsync(async (req, res, next) => {
  const user = await Patient.create({ ...req.body }) // send welcome email
  new Email(user)
    .sendWelcome()
    .catch((err) => console.log('Error Sending Email >>', err))

  createAndSendToken(user, StatusCodes.CREATED, 'Registered Successfully', res)
})

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body
  if (!email || !password) {
    throw new BadRequest('Enter Email and Password')
  }

  const user = await User.findOne({ email }).select('+password')
  // compare
  if (!user) {
    throw new UnAuthenticated('Invalid Credentials')
  }

  const isPasswordCorrect = await user.comparePassword(password)
  if (!isPasswordCorrect) {
    throw new UnAuthenticated('Invalid Credentials')
  }
  createAndSendToken(user, StatusCodes.OK, 'Login Successfully', res)
})

const updatePassword = catchAsync(async (req, res, next) => {
  const { oldpassword, password } = req.body
  if (!oldpassword || !password)
    return next(new BadRequest('Please provide oldpassword and password'))
  const user = await User.findById(req.user._id).select('+password')
  const passCorrect = await user.comparePassword(oldpassword)
  if (!passCorrect) return next(new UnAuthenticated('Invalid Credentials'))

  user.password = password
  await user.save()

  createAndSendToken(user, StatusCodes.OK, 'Password Updated Successfully', res)
})

const forgotPassword = catchAsync(async (req, res, next) => {
  if (!req.body.email) {
    throw new MyError('Please provide an email!!', 404)
  }
  const user = await User.findOne({ email: req.body.email })
  if (!user) {
    throw new NotFound('User does not exist!!')
  }
  const resetToken = user.getPasswordResetToken()
  await user.save({ validateBeforeSave: false })
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/reset-password/${resetToken}`
  try {
    await new Email(user, resetURL).sendPasswordReset()
    res.status(200).json({
      status: 'success',
      message: 'Token sent to your email successfully!!',
    })
  } catch (err) {
    user.passwordResetToken = undefined
    user.resetTokenExpiresAt = undefined
    await user.save({ validateBeforeSave: false })
    return next(
      new InternalServerError(
        'There is an error sending the email, please try again later!'
      )
    )
  }
})

const resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex')

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    resetTokenExpiresAt: { $gte: Date.now() },
  })

  if (!user) {
    throw new UnAuthenticated('Token is invalid or has expired!')
  }
  user.password = req.body.password
  user.confirmpass = req.body.confirmpass
  user.passwordResetToken = undefined
  user.resetTokenExpiresAt = undefined
  await user.save()
  createAndSendToken(
    user,
    StatusCodes.OK,
    'Password Resetted Successfully',
    res
  )
})

const oauthRedirectCallback = catchAsync(async (req, res, next) => {
  let user
  let message = 'Login successfully!'
  let code = StatusCodes.OK
  // Find user
  user = await User.findOne({ email: req.user._json.email })
  if (!user) {
    // create user as a Patient
    user = await Patient.create({
      email: req.user._json.email,
      name: req.user._json.name,
      provider: req.user.provider,
      password: req.user.id,
      image: req.user._json.picture,
    })
    // Send Welcome Email
    try {
      const url = `${req.protocol}://${req.get('host')}/me`
      await new Email(user, url).sendWelcome()
    } catch (error) {
      console.log('Error Sending Email >>>>', error.message)
    }
    message = 'Signup Successfully'
    code = StatusCodes.CREATED
  }
  createAndSendToken(user, code, message, res)
})

const logout = (req, res) => {
  if (!req.user._id || !validateId(req.user._id))
    return res.status(400).json({ message: 'this user is not logged in' })
  res.cookie('jwt', {}, { expires: new Date() })
  return res.status(200).json({ message: 'logged out' })
}

module.exports = {
  register,
  login,
  updatePassword,
  resetPassword,
  forgotPassword,
  oauthRedirectCallback,
  logout,
}
