const { StatusCodes } = require('http-status-codes')
const CustomApiError = require('./customApi')

class UnAuthenticated extends CustomApiError {
  constructor(message) {
    super(message)
    this.statusCode = StatusCodes.UNAUTHORIZED
  }
}

module.exports = UnAuthenticated
