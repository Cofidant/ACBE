const { InternalServerError } = require('../errors')

module.exports = (fn) => {
  return (req, res, next) => {
    if (fn) fn(req, res, next).catch(next)
    else next(new InternalServerError('Some unknown Error'))
  }
}
