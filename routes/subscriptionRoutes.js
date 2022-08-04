const express = require('express')
const {
  getAllSubscriptionPlans,
  createSubscriptionPlan,
  getSubPlan,
  updateSubPlan,
  deleteSubPlan,
} = require('../controllers/subscriptionsController')
const {
  authenticationMiddleware,
  restrictRouteTo,
} = require('../middlewares/authentication')

const subsRouter = express.Router()
// oonly un-protected route
subsRouter.get('/', getAllSubscriptionPlans)

// only accessed by admins
subsRouter.use(authenticationMiddleware, restrictRouteTo('admin'))
subsRouter.post('/', createSubscriptionPlan)
subsRouter
  .route('/:subscriptionplanID')
  .get(getSubPlan)
  .patch(updateSubPlan)
  .delete(deleteSubPlan)

module.exports = subsRouter
