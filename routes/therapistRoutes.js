const express = require('express')
const {
  getTherapist,
  getAllTherapists,
  addTherapist,
  updateTherapist,
  deleteTherapist,
  getMe,
  updateMe,
} = require('../controllers/therapistController')
const {
  authenticationMiddleware,
  restrictRouteTo,
} = require('../middlewares/authentication')
const router = require('./auth')

const therapistRouter = express.Router()
//all routes are protected
therapistRouter.use(authenticationMiddleware)

router
  .route('/')
  .get(restrictRouteTo('therapist'), getAllTherapists)
  .post(restrictRouteTo('therapist'), addTherapist)

router.route('/me').get(getMe).patch(updateMe)

router.route('/:therapistID').patch(updateTherapist).delete(deleteTherapist)

module.exports = therapistRouter
