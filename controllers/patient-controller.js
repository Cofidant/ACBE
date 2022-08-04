const Patient = require('../models/Patient')
const Therapist = require('../models/User')
const catchAsync = require('../utils/catchAsync')
const {
  createTherapySession,
  endTherapySession,
} = require('./session-controller')
const { StatusCodes } = require('http-status-codes')
const Session = require('../models/Session')
const factoryController = require('./handlerFactory')
const { BadRequest } = require('../errors')

// create a search weight Function
const getTherapistSuitabilty = (therapist, profile) => {
  const suitability = 0
  // specialization has highest weight
  if (therapist.specializations.includes(profile.problem)) suitability += 15
  if (therapist.sexPreference == profile.gender) suitability += 2
  if (therapist.isWithinAgeRange(profile.age)) suitability += 2
  if (therapist.religionPreference == profile.religion) suitability += 2
  if (therapist.statusPreference == profile.status) suitability += 2
  if (therapist.locationPreference == profile.location) suitability += 2
  //   consider years of experience and patient rating
  suitability += therapist.years_of_experience + therapist.averageRating

  return suitability
}

//find a therapist based on preference and standard max-activeSession
const fetchTherapist = async (profile, maxActiveSession) => {
  //grab all therapists
  let therapists = await Therapist.find().populate('activeSessions')

  //  filter out unavailable
  therapists = therapists.filter((therapist) => {
    return therapist.activeSessions.length < maxActiveSession
  })

  //sort base on suitabilty with the m
  therapists.sort(
    (a, b) =>
      getTherapistSuitabilty(b, profile) - getTherapistSuitabilty(a, profile)
  )

  // return a max of 10
  if (therapists.length > 10) therapists = therapists.slice(0, 10)

  return therapists
}

module.exports.getMe = catchAsync(async (req, res, next) => {
  const id = req.user.id
  const patient = await Patient.findById(id)
  if (!patient) {
    res.status(StatusCodes.NOT_FOUND).json('user does not exist')
  }
})

module.exports.getTherapy = catchAsync(async (req, res, next) => {
  //get available therapist
  const potentialTherapists = fetchTherapist(
    req.body.profile,
    process.env.MAXSESSION
  )
  res.status(StatusCodes.OK).json({
    status: 'success',
    results: potentialTherapists.length,
    data: potentialTherapists,
  })
})

module.exports.getSessions = async (req, res) => {
  const sessions = []
  const { id } = req.user._id
  const user = await Patient.findById(id)
  if (!user) {
    res.status(StatusCodes.NOT_FOUND).json('user does not exist')
  }
  const sessionIDs = user.sessions
  await sessionIDs.map((session) => {
    Patient.findById(session).then((session) => {
      sessions.push(session)
    })
  })
  res.status(StatusCodes.OK.json(sessions))
}

module.exports.getSession = async (req, res) => {
  const session = await Session.findById(req.params.id)
  res.status(StatusCodes.OK).json(session)
}

module.exports.endSession = async (req, res) => {
  const modified = await endTherapySession(req.params.id)
  res.status(StatusCodes.OK).json(modified)
}
//req.body includes selected therapists id, contract period (duration)
module.exports.selectTherapy = catchAsync(async (req, res, next) => {
  const { therapistID, duration } = req.body

  const therapist = await Therapist.findById(therapistID)
  if (!therapist) {
    return next(new BadRequest('Invalid therapistID'))
  }
  if (!duration) return next(new BadRequest('please provide the duration'))

  const newSession = await createTherapySession(
    duration,
    req.user._id,
    therapist._id
  )

  if (!newSession)
    res.status(500).json({ status: 'error', message: 'Something went wrong!' })

  res.status(StatusCodes.CREATED).json({
    status: 'success',
    message: 'session created successfully',
    data: newSession,
  })
})

exports.getAllPatients = factoryController.getAll(Patient)
exports.getPatient = factoryController.getOne(Patient)
exports.deletePatient = factoryController.deleteOne(Patient)
