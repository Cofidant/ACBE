const CustomApiError = require('./customApi')
const UnAuthenticated = require('./unAuthenticated')
const NotFound = require('./not-found')
const BadRequest = require('./badRequest')
const InternalServerError = require('./internalError')

module.exports = {
  CustomApiError,
  UnAuthenticated,
  BadRequest,
  NotFound,
  InternalServerError,
}
