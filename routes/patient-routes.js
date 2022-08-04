const { updatePassword } = require('../controllers/authorization')
const {
  authenticationMiddleware,
  restrictRouteTo,
} = require('../middlewares/authentication')
const {
  getTherapy,
  getMe,
  getSessions,
  getSession,
  endSession,
  selectTherapy,
  getAllPatients,
  getPatient,
  deletePatient,
} = require('../controllers/patient-controller')
const storiesRouter = require('./storiesRoutes')

const patientRouter = require('express').Router()

// All routes are protected
patientRouter.use(authenticationMiddleware)

// redirect stories to stories router
patientRouter.use(
  '/stories',
  (req, res, next) => {
    // assign necessary filter
    req.filter = { patient: req.user._id }
    req.body.patient = req.user._id
    next()
  },
  storiesRouter
)

patientRouter.route('/').get(restrictRouteTo('admin'), getAllPatients)

patientRouter.use(restrictRouteTo('patient'))
patientRouter.get('/me', getMe)
patientRouter.patch('/update-password', updatePassword)
patientRouter.post('/get-therapy', getTherapy)
patientRouter.get('/sessions', getSessions)

patientRouter
  .route('/:patientID')
  .get(restrictRouteTo('admin'), getPatient)
  .delete(restrictRouteTo('admin'), deletePatient)

patientRouter.post('/therapy/select', selectTherapy)
patientRouter.route('/session/:id').get(getSession).delete(endSession)

module.exports = patientRouter
