const { StatusCodes } = require('http-status-codes')
const { BadRequest, UnAuthenticated } = require('../errors')
const ChatMessage = require('../models/ChatMessage')
const Session = require('../models/Session')
const catchAsync = require('../utils/catchAsync')
const factoryController = require('./handlerFactory')

exports.attachSessionFilter = catchAsync(async (req, res, next) => {
  const sessionID =
    req.params.sessionID || req.query.sessionID || req.body.sessionID
  const session = await Session.findById(sessionID)
  if (!session) return next(new BadRequest('Invalid SessionID'))
  req.filter = { sessionID: session._id }
  req.session = session
  next()
})

exports.postMessage = catchAsync(async (req, res, next) => {
  const { sessionID } = req.filter
  const session = req.session
  const { messageText, messageType } = req.body
  const sender = req.user._id
  console.log(session.therapist, '>>>>', session.patient)
  // check if the user belong to the session
  if (
    session.therapist?._id?.toString() != sender &&
    session.patient?._id?.toString() != sender
  )
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
  // broad cast message
  global.io.in(sessionID).emit('new-message', newMessage)
  res.status(StatusCodes.CREATED).json({ status: 'success', data: newMessage })
})

exports.markAllMessagesRead = catchAsync(async (req, res, next) => {
  const sessionID = req.session._id
  const readByUserId = req.user._id

  const result = await ChatMessage.updateMany(
    {
      sessionID,
      'readByRecipients.readByUserId': { $ne: readByUserId },
    },
    {
      $addToSet: {
        readByRecipients: { readByUserId },
      },
    },
    { multi: true }
  )

  res.status(StatusCodes.OK).json({ status: 'success', read: result.nModified })
})

exports.getAllSessionMessages = factoryController.getAll(ChatMessage)
