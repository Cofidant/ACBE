const { updatePassword } = require('../controllers/authorization')
const {
  authenticationMiddleware,
  restrictRouteTo,
} = require('../middlewares/authentication')
const {
  getTherapy,
  getMe,
  selectTherapy,
  getAllPatients,
  updateMe,
  getPatient,
  deletePatient,
  patientFilter,
  bookAppointment,
} = require('../controllers/patient-controller')
const storiesRouter = require('./storiesRoutes')
const chatRouter = require('./chatRoutes')
const { getMySessions } = require('../controllers/session-controller')

const patientRouter = require('express').Router()

// All routes are protected
patientRouter.use(authenticationMiddleware)

// redirect stories to stories router
patientRouter.use('/stories', patientFilter, storiesRouter)

patientRouter.route('/').get(restrictRouteTo('admin'), getAllPatients)

patientRouter.use(restrictRouteTo('patient'))
patientRouter.route('/me').get(getMe).patch(updateMe)
patientRouter.patch('/update-password', updatePassword)
patientRouter.post('/get-therapy', getTherapy)
patientRouter.post('/select-therapist', selectTherapy)
patientRouter.get('/my-sessions', getMySessions)

patientRouter
  .route('/:patientID')
  .get(restrictRouteTo('admin'), getPatient)
  .delete(restrictRouteTo('admin'), deletePatient)

patientRouter
  .route('/me/sessions/:sessionID/appointments')
  .post(bookAppointment)
patientRouter.use('/me/sessions/:sessionID/chats/', chatRouter)
module.exports = patientRouter
