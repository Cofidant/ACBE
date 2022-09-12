const jwt = require('jsonwebtoken')
const { UnAuthenticated } = require('../errors')
const User = require('../models/User')
const catchAsync = require('../utils/catchAsync')

exports.authenticationMiddleware = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization
  let token
  if (authHeader && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1]
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt
  }
  if (!token) {
    return next(
      new UnAuthenticated('You are not logged in, please log in to get access')
    )
  }

  try {
    const decoded = jwt.verify(token, process.env.jwtSecret)
    const { userId, iat } = decoded

    //verify if user still exists
    const user = await User.findById(userId)
    if (!user) {
      return next(
        new UnAuthenticated('The user with this token no longer exists')
      )
    }
    // confirm if user doesnt change password after the token is issued
    if (user.changesPasswordAfter(iat)) {
      return next(
        new UnAuthenticated(
          'User recently changed password!! please log in again'
        )
      )
    }

    req.user = user
    next()
  } catch (error) {
    next(new UnAuthenticated('Not Authorized'))
  }
})

exports.restrictRouteTo = (...clearance) => {
  return catchAsync(async (req, res, next) => {
    if (!req.user)
      return next(new UnAuthenticated('Please Log in to access this route!'))
    if (!clearance.includes(req.user._kind)) {
      return next(
        new UnAuthenticated('Ooops you are not cleared to perform this action')
      )
    }
    next()
  })
}
