const express = require('express')
const { updatePassword } = require('../controllers/authorization')
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

const therapistRouter = express.Router()
//all routes are protected
therapistRouter.use(authenticationMiddleware)

therapistRouter
  .route('/')
  .get(restrictRouteTo('admin'), getAllTherapists)
  .post(restrictRouteTo('admin'), addTherapist)

therapistRouter.route('/me').get(getMe).patch(updateMe)
therapistRouter.patch('/update-password', updatePassword)

therapistRouter
  .route('/:therapistID')
  .patch(updateTherapist)
  .delete(deleteTherapist)

module.exports = therapistRouter
