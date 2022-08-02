const { StatusCodes } = require('http-status-codes')
const { BadRequest, UnAuthenticated } = require('../errors')
const ChatMessage = require('../models/ChatMessage')
const Session = require('../models/Session')
const catchAsync = require('../utils/catchAsync')
const factoryController = require('./handlerFactory')

exports.attachFilter = catchAsync(async (req, res, next) => {
  req.filter = { sessionID: req.params.sessionID }
  next()
})

exports.postMessage = catchAsync(async (req, res, next) => {
  const { sessionID } = req.params
  const { messageText, messageType } = req.body
  const sender = req.user._id
  const session = await Session.findById(sessionID)
  if (!session) return next(new BadRequest('Invalid SessionID'))

  // check if the user belong to the session
  if (session.therapist != sender && session.patient != sender)
    return next(new UnAuthenticated('You cant send messages here!'))

  const newMessage = await ChatMessage.create({
    sessionID,
    postedBy: sender,
    type: messageType,
    message: {
      messageText,
    },
    readByRecipients: [{ readByUserId: sender }],
  })

  global.io.in(sessionID).serverSideEmit('new-message', newMessage)
  res.status(StatusCodes.CREATED).json({ status: 'success', data: newMessage })
})
exports.getAllSessionMessages = factoryController.getAll(ChatMessage)
