const { StatusCodes } = require('http-status-codes')
const { BadRequest, UnAuthenticated } = require('../errors')
const Review = require('../models/Review')
const Session = require('../models/Session')
const Therapist = require('../models/Therapist')
const catchAsync = require('../utils/catchAsync')
const factoryController = require('./handlerFactory')

exports.getMe = catchAsync(async (req, res, next) => {
  const me = await Therapist.findById(req.user._id)
  res.status(StatusCodes.OK).json({ status: 'success', data: me })
})

exports.updateMe = catchAsync(async (req, res, next) => {
  const data = req.body

  if (data.hasOwnProperty('password'))
    return next(new BadRequest('You cant update password from here!'))
  const updated = Therapist.findByIdAndUpdate(req.user._id, data)
  res.status(StatusCodes.OK).json({ status: 'success', data: updated })
})

// get all sessions of active therapist
exports.getAllMySessions = catchAsync(async (req, res, next) => {
  const therapist = req.user._id
  const sessions = await Session.find({ therapist }).sort('-expiryDate')
  res
    .status(StatusCodes.OK)
    .json({ status: 'success', results: sessions.length, data: sessions })
})

// record a note on a session
exports.addSessionNotes = catchAsync(async (req, res, next) => {
  const { sessionID } = req.params
  const { noteText } = req.body
  if (!noteText) return next(new BadRequest('Pleases provide the noteText!'))

  const session = await Session.updateOne(
    { _id: sessionID, therapist: req.user._id },
    {
      $addToSet: { notes: { noteText } },
    },
    { new: true }
  )

  if (!session) return next(new BadRequest('Invalid sessionID'))

  res.status(StatusCodes.CREATED).json({
    status: 'success',
    message: 'Note added successfully',
    data: session,
  })
})

exports.getAllTherapists = factoryController.getAll(Therapist)
exports.getTherapist = factoryController.getOne(Therapist, [
  ['activeClients', 'username name image'],
])
exports.updateTherapist = factoryController.updateOne(Therapist)
exports.deleteTherapist = factoryController.deleteOne(Therapist)
exports.addTherapist = factoryController.createOne(Therapist)

// Therapist.updateMany({}, { practicing_from: new Date('2018-11-15') }).then(
//   (res) => console.log(res)
// )
