const express = require('express')
const {
  getAllAdmins,
  createAdmin,
  getAdmin,
  updateAdmin,
  deleteAdmin,
  getMe,
  updateMe,
  validateAdminPassword,
} = require('../controllers/adminController')
const { updatePassword } = require('../controllers/authorization')
const {
  authenticationMiddleware,
  restrictRouteTo,
} = require('../middlewares/authentication')

const adminRouter = express.Router()

adminRouter.use(authenticationMiddleware, restrictRouteTo('admin'))

adminRouter
  .route('/')
  .get(getAllAdmins)
  .post(validateAdminPassword, createAdmin)

adminRouter.route('/me').get(getMe).patch(updateMe)
adminRouter.patch('/update-password', validateAdminPassword, updatePassword)

adminRouter
  .route('/:adminID')
  .get(getAdmin)
  .patch(updateAdmin)
  .delete(deleteAdmin)

module.exports = adminRouter
