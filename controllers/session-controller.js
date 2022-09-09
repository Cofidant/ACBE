const Session = require('../models/Session')
const factoryController = require('./handlerFactory')
const Chat = require('../models/ChatMessage')
const { StatusCodes } = require('http-status-codes')
const User = require('../models/User')

// start Session Services
require('../services')

exports.getAllSessions = factoryController.getAll(Session)
exports.createTherapySession = factoryController.createOne(Session)
exports.getOneSession = factoryController.getOne(Session)

exports.getChats = async (req, res) => {
  const { id } = req.params
  if (!id)
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: 'please provide session id' })
  const messages = await Chat.find({ sessionID: id })
    .sort({ date: 1 })
    .select('message postedBy date')
  if (!messages.length)
    return res
      .status(StatusCodes.OK)
      .json({ message: 'there are no messages here', data: messages })
  return res.status(StatusCodes.OK).json(messages)
}
exports.getMySessions = async (req, res) => {
  const { _id: id } = req.user
  const user = await User.findById(id)
  const sessions = await Session.find().or([
    { therapist: user },
    { patient: user },
  ])
  if (!sessions.length)
    return res
      .status(StatusCodes.OK)
      .json({ message: 'you have no active sessions', data: sessions })
  return res.status(StatusCodes.OK).json(sessions)
}


// Session.updateMany({}, { subscriptionPlan: '62ec3899e95128f1c4e5f8db' }).then(
//   (res) => console.log(res)
// )
