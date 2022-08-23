const express = require('express')
const { updatePassword } = require('../controllers/authorization')
const { getMySessions } = require('../controllers/session-controller')
const {
  getTherapist,
  getAllTherapists,
  addTherapist,
  updateTherapist,
  deleteTherapist,
  getMe,
  updateMe,
  getAllMySessions,
  addSessionNotes,
  getAllMyAppointments,
  modifyAppointment,
} = require('../controllers/therapistController')
const {
  authenticationMiddleware,
  restrictRouteTo,
} = require('../middlewares/authentication')
const chatRouter = require('./chatRoutes')

const therapistRouter = express.Router()

//all routes are protected
therapistRouter.use(authenticationMiddleware)

// only admins can get all therapist or add/delete a therapist
therapistRouter
  .route('/')
  .get(restrictRouteTo('admin'), getAllTherapists)
  .post(restrictRouteTo('admin'), addTherapist)

therapistRouter.use(restrictRouteTo('therapist'))
therapistRouter.route('/me').get(getMe).patch(updateMe)
therapistRouter.patch('/update-password', updatePassword)

therapistRouter
  .route('/:therapistID')
  .patch(restrictRouteTo('admin'), updateTherapist)
  .delete(restrictRouteTo('admin'), deleteTherapist)
  .get(getTherapist)
therapistRouter.get("/my-sessions",getMySessions)
therapistRouter.get('/me/sessions', getAllMySessions)
therapistRouter.route('/me/sessions/:sessionID/notes').post(addSessionNotes)
therapistRouter.use('/me/sessions/:sessionID/chats/', chatRouter)
therapistRouter
  .route('/me/sessions/:sessionID/appointments/')
  .get(getAllMyAppointments)
therapistRouter.patch(
  '/me/sessions/:sessionID/appointments/:appointmentID',
  modifyAppointment
)

// .get(getSessionNotes)

module.exports = therapistRouter
