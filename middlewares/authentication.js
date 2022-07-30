const jwt = require('jsonwebtoken')
const { UnAuthenticated } = require('../errors')
const User = require('../models/User')

exports.authenticationMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer')) {
    throw new UnAuthenticated('No token provided')
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.jwtSecret)
    const { id, username } = decoded

    //verify if user still exists
    const user = await User.findById(id)
    if (!user) {
      return next(
        new UnAuthenticated('The user with this token no longer exists')
      )
    }

    req.user = user
    next()
  } catch (error) {
    throw new UnAuthenticated('Not Authorized')
  }
}

exports.restrictRouteTo = (...clearance) => {
  return (req, res, next) => {
    if (!clearance.includes(req.user.kind)) {
      throw new UnAuthenticated(
        'Ooops you are not cleared to perform this action'
      )
    }
    next()
  }
}

// exports.forgotPassword = catchAsync(async (req, res, next) => {
//   if (!req.body.email) {
//     throw new MyError('Please provide an email!!', 404)
//   }
//   const user = await User.findOne({ email: req.body.email })
//   if (!user) {
//     throw new MyError('User does not exist!!', 404)
//   }
//   const resetToken = user.getPasswordResetToken()
//   await user.save({ validateBeforeSave: false })
//   const resetURL = `${req.protocol}://${req.get(
//     'host'
//   )}/api/v1/users/resetpassword/${resetToken}`
//   try {
//     await new Email(user, resetURL).sendPasswordReset()
//     res
//       .status(200)
//       .json({
//         status: 'success',
//         message: 'Token sent to your email success fully!!',
//       })
//   } catch (err) {
//     user.passwordResetToken = undefined
//     user.resetTokenExpiresAt = undefined
//     await user.save({ validateBeforeSave: false })
//     return next(
//       new MyError(
//         'There is an error sending the email, please try again later!',
//         500
//       )
//     )
//   }
// })
