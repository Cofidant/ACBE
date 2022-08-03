const Patient = require('../models/Patient')
const Therapist = require('../models/User')
const catchAsync = require('../utils/catchAsync')
const {
  createTherapySession,
  endTherapySession,
} = require('./session-controller')
const { StatusCodes } = require('http-status-codes')
const Session = require('../models/Session')
const Story = require('../models/Story')
const { getStory, deleteStory } = require('./stories-controller')

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
  try {
    //get available therapist
    const therapist = fetchTherapist(req.body.profile, process.env.MAXSESSION)
    const patientID = req.user.id
    //create session from id embeded in token and most available therapist id
    const newSession = await createTherapySession(
      req.body.duration,
      patientID,
      therapist._id
    )
    res
      .status(StatusCodes.CREATED)
      .json({ message: 'new therapy session created', data: newSession })
  } catch (error) {
    res.status(500).json('could not create session')
  }
})

module.exports.getSessions = async (req, res) => {
  const sessions = []
  const { id } = req.user
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
module.exports.selectTherapy = async (req, res) => {
  const therapist = await Therapist.find(req.body.id)
  if (!therapist) {
    res
      .status(400)
      .json({ status: 'failed', message: 'please select a therapist' })
  }
  const patient = await Patient.find(req.user.id)
  if (!patient) {
    res
      .status(StatusCodes.NOT_FOUND)
      .json({ status: 'failed', message: 'user not found' })
  }
  const newSession = await createTherapySession(
    req.body.duration,
    patient._id,
    therapist._id
  )
  if (!newSession) {
    res
      .status(500)
      .json({ status: 'failed', message: 'could not create therapy session' })
  }
}

//anonymously share story
module.exports.createStory = async (req, res) => {
  const { preview, body } = req.body
  const story = await Story.create({
    preview,
    body,
  })
  const id = req.user.id
  const updated = await Patient.findByIdAndUpdate(id, {
    $push: {
      stories: story,
    },
  })
  res
    .status(StatusCodes.CREATED)
    .json({ message: 'new story created', data: updated })
}
//get a story
module.exports.getStory = async (req, res) => {
  const storyID = req.params.id
  if (!storyID) {
    res.status(400).json({ message: 'select a story' })
  }
  const story = await getStory(storyID)
  if (!story) {
    res.status(StatusCodes.NOT_FOUND).json({})
  }
  res.status(StatusCodes.OK).json(story)
}
//delete a story
module.exports.deleteStory = async (req, res) => {
  const storyID = req.params.id
  if (!storyID) {
    res.status(400).json({ message: 'select a story to delete' })
  }
  const updated = await deleteStory(storyID)
  if (!updated) {
    res.status(500).json({ message: 'could not delete story' })
  }
  res.status(StatusCodes.OK).json({ message: 'story deleted', data: updated })
}
//get my stories
module.exports.getMyStories = async (req, res) => {
  const patientID = req.user.id
  const user = await Patient.findById(patientID)
  res.status(StatusCodes.OK).json(user.stories)
}
