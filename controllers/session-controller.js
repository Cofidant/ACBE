const Session = require('../models/Session')
const catchAsync = require('../utils/catchAsync')
const factoryController = require('./handlerFactory')

exports.getAllSessions = factoryController.getAll(Session)

const getEndDate = async (duration) => {
  return new Date(new Date().getTime() + duration * 24 * 60 * 60 * 1000)
}

const updateSessions = async (userID, sessionID) => {
  const user = await user.findByIdAndUpdate(userID, {
    $push: {
      sessions: sessionID,
    },
  })
  if (!user) {
    throw Error('user does not exist')
  }
  return
}

module.exports.createTherapySession = async (
  duration,
  patientID,
  therapistID
) => {
  try {
    const session = await Session.create({
      duration,
      EndDate: getEndDate(duration),
      patientID,
      therapistID,
    })
    await updateSessions(patientID, session._id)
    await updateSessions(therapistID, session._id)
    return session
  } catch (error) {
    console.log(error)
    return false
  }
}
module.exports.endTherapySession = async (id) => {
  const modified = await findByIdAndDelete(id)
  return modified
}

// 62e589f011986b779bc46f05 62e59426d86f719bb562f34c
// Session.create({
//   therapist: '62e59426d86f719bb562f34c',
//   patient: '62e589f011986b779bc46f05',
//   subscribedDate: Date.now(),
//   expiryDate: Date.now() + 60 * 24 * 60 * 60 * 60,
// })
//   .then((res) => console.log(res))
//   .catch((err) => console.log(err.message))
