const mongoose = require('mongoose')

exports.specializations = [
  'dating',
  'marriage',
  'depression',
  'divorce',
  'child',
  'food',
  'exercise',
  'personalityDisorder',
  'suicide',
]

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
  return '0 second ago'
}
exports.getEndDate = (month) => {
  return new Date(new Date().getTime() + month * 30 * 24 * 60 * 60 * 1000)
}
exports.validateId = (id) => {
  return mongoose.Types.ObjectId.isValid(id)
}

/**
 * Validate an admin level password
 * @param {String} password The password to validate
 * @return {[Boolean, String]} index 0 validate?, index 1 message
 */

exports.validateAdminPassword = (password) => {
  // check length
  if (password.length < 8) {
    return [false, 'Password length should be at least 8 characters']
  }
  const requirements = new Array()
  requirements.push(['[A-Z]', 'Password must contian Uppercase Alphabates']) //
  requirements.push(['[a-z]', 'Password must contain Lowercase Alphabates']) //
  requirements.push(['[0-9]', 'Password must contain Digits']) // Numbers
  requirements.push(['[$@$!%*#?&]', 'Password must contain Special Charector']) //

  // Check Requirements
  for (var i = 0; i < requirements.length; i++) {
    if (!new RegExp(requirements[i][0]).test(password))
      return [false, requirements[i][1]]
  }
  // All requirements passed
  return [true, 'Validated!!']
}

/**
 * Calculate the Order of Intersectin of two arrays
 * @param {Array} arr1 Array 1
 * @param {Array} arr2 Array 2
 * @return {Number} number of elements present in both arrays
 */
exports.getIntersectionCount = (arr1, arr2) => {
  return arr1.filter((x) => arr2?.includes(x)).length
}
