const { StatusCodes } = require('http-status-codes')

const errorHandler = (err, req, res, next) => {
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Ooops, something went wrong',
  }

  if (err.name === 'ValidationError') {
    customError.msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(', ')
    customError.statusCode = 400
  }

  if (err.code && err.code === 11000) {
    ;(customError.msg = `Email Already Taken`), (customError.statusCode = 400)
  }

  if (err.name === 'CastError') {
    ;(customError.msg = `Not Found`), (customError.statusCode = 404)
  }

  if (process.env.NODE_ENV == 'development')
    return res
      .status(customError.statusCode)
      .json({ msg: customError.msg, err, stack: err.stack })
  return res.status(customError.statusCode).json({ msg: customError.msg })

  // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err });
}

module.exports = errorHandler
