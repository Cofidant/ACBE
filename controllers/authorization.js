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

// will only Create a Patient....
const register = catchAsync(async (req, res, next) => {
  const user = await Patient.create({ ...req.body })

  // send welcome email
  // const url = `${req.protocol}://${req.get('host')}/me`
  // await new Email(user, url).sendWelcome()

  const token = user.createJWT()
  // hide password
  user.password = undefined
  res.status(StatusCodes.CREATED).json({
    status: 'success',
    message: 'Registered Successfully',
    user,
    token,
  })
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
  const token = user.createJWT()
  // hide password
  user.password = undefined
  res
    .status(StatusCodes.OK)
    .json({ status: 'success', message: 'login successfully', user, token })
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

  const token = user.createJWT()
  res.status(StatusCodes.OK).json({ status: 'success', data: user, token })
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

  const token = user.createJWT()
  res.status(StatusCodes.CREATED).json({
    status: 'success',
    message: 'password reset successfully',
    user,
    token,
  })
})

module.exports = {
  register,
  login,
  updatePassword,
  resetPassword,
  forgotPassword,
}
