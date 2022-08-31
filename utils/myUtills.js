const mongoose = require('mongoose')

exports.getDuration = (dateCreated) => {
  const timeDiff = Date.now() - dateCreated
  const dateVars = {
    Year: parseInt(timeDiff / (1000 * 60 * 60 * 24 * 365)),
    Month: parseInt(timeDiff / (1000 * 60 * 60 * 24 * 30)),
    Week: parseInt(timeDiff / (1000 * 60 * 60 * 24 * 7)),
    Day: parseInt(timeDiff / (1000 * 60 * 60 * 24)),
    Hour: parseInt(timeDiff / (1000 * 60 * 60)),
    Minute: parseInt(timeDiff / (1000 * 60)),
    Seconds: parseInt(timeDiff / 1000),
  }

  for (const timeParam in dateVars) {
    const no = dateVars[timeParam]
    if (no >= 1) {
      return `${no} ${timeParam}${no > 1 ? 's' : ''} ago`
    }
  }
  return '0 seconds ago'
}
exports.getEndDate = (month) => {
  return new Date(new Date().getTime() + month * 30 * 24 * 60 * 60 * 1000)
}
exports.validateId = (id) => {
  return mongoose.Types.ObjectId.isValid(id)
}
