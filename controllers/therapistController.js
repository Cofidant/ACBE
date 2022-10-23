const { StatusCodes } = require('http-status-codes')
const { BadRequest } = require('../errors')
const Session = require('../models/Session')
const Therapist = require('../models/Therapist')
const catchAsync = require('../utils/catchAsync')
const Email = require('../utils/email')
const MyError = require('../utils/myError')
const factoryController = require('./handlerFactory')

exports.getMe = catchAsync(async (req, res, next) => {
  const me = await Therapist.findById(req.user._id)
  res.status(StatusCodes.OK).json({ status: 'success', data: me })
})

// get all sessions of active therapist
// exports.getAllMySessions = catchAsync(async (req, res, next) => {
//   const therapist = req.user._id
//   const sessions = await Session.find({ therapist }).sort('-expiryDate')
//   res
//     .status(StatusCodes.OK)
//     .json({ status: 'success', results: sessions.length, data: sessions })
// })

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
    message: 'Notes added successfully',
    data: session,
  })
})

exports.getAllMyAppointments = catchAsync(async (req, res, next) => {
  const appointments = await Session.getTherapistAppointmennts(req.user._id)
  res.status(StatusCodes.OK).json({
    status: 'success',
    results: appointments.length,
    data: appointments,
  })
})

exports.modifyAppointment = catchAsync(async (req, res, next) => {
  const { appointmentID, sessionID } = req.params
  const status = req.body.status?.toLowerCase()

  const session = await Session.findById(sessionID)
  if (!session) return next(new BadRequest('Invalid sessionID'))

  // Check if appointment exist
  const appointment = session.appointments.find(
    (app) => app._id == appointmentID
  )
  if (!appointment)
    return next(new BadRequest('No appointment with the given appointmentID'))

  // check if appointment is already completed
  if (appointment.status === 'complete')
    return next(
      new MyError('Appointment is already completed', StatusCodes.FORBIDDEN)
    )

  if (!['accept', 'reject'].includes(status)) {
    return next(
      new BadRequest(
        "invalid status! status should be either 'accept' or 'reject'"
      )
    )
  }
  const appStatus = status === 'accept' ? 'active' : 'cancelled'
  const resetHour = status === 'accept' ? 0 : 2
  const updated = await Session.updateOne(
    {
      _id: sessionID,
      'appointments._id': appointmentID,
    },
    {
      'appointments.$.status': appStatus,
      $inc: { hoursRemaining: resetHour },
    },
    { new: true }
  )
  // Send Email To Patient
  try {
    const app = updated.appointments.find((a) => a._id == appointmentID)
    const patient = (
      await Session.findById(sessionID).populate('patient', 'name email image')
    ).patient
    await new Email(patient).sendAppointmentNotification({ ...app, status })
  } catch (error) {
    console.log('Error Sending Email >>>>', error.message)
  }
  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Appointment status updated successfully',
  })
})

exports.getAllTherapists = factoryController.getAll(Therapist)
exports.getTherapist = factoryController.getOne(Therapist, [
  ['activeClients', 'username name image'],
])
exports.updateTherapist = factoryController.updateOne(Therapist)
exports.deleteTherapist = factoryController.deleteOne(Therapist)
exports.addTherapist = factoryController.createOne(Therapist)
exports.updateMe = factoryController.updateMe(Therapist)
