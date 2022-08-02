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
      throw new UnAuthenticated(
        'User recently changed password!! please log in again'
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
    // Is Admin has all access and doest have _kind property
    if (req.user._kind)
      if (!clearance.includes(req.user._kind)) {
        throw new UnAuthenticated(
          'Ooops you are not cleared to perform this action'
        )
      }
    next()
  }
}
