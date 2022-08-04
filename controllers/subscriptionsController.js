const SubscriptionPlan = require('../models/SubscriptionPlan')
const factoryController = require('./handlerFactory')

exports.getAllSubscriptionPlans = factoryController.getAll(SubscriptionPlan)
exports.createSubscriptionPlan = factoryController.createOne(SubscriptionPlan)
exports.getSubPlan = factoryController.getOne(SubscriptionPlan)
exports.updateSubPlan = factoryController.updateOne(SubscriptionPlan)
exports.deleteSubPlan = factoryController.deleteOne(SubscriptionPlan)
