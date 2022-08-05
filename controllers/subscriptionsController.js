const SubscriptionPlan = require('../models/SubscriptionPlan')
const factoryController = require('./handlerFactory')

exports.getAllSubscriptionPlans = factoryController.getAll(SubscriptionPlan)
exports.createSubscriptionPlan = factoryController.createOne(SubscriptionPlan)
exports.getSubPlan = factoryController.getOne(SubscriptionPlan)
exports.updateSubPlan = factoryController.updateOne(SubscriptionPlan)
exports.deleteSubPlan = factoryController.deleteOne(SubscriptionPlan)

// SubscriptionPlan.create([
//   {
//     title: '1-Month Plan',
//     price: 12000,
//     duration: 1,
//   },
//   {
//     title: '3-Month Plan',
//     price: 18000,
//     duration: 3,
//   },
//   {
//     title: '6-month Premium',
//     price: 200000,
//     duration: 1,
//     discount: 800,
//   },
// ])
//   .then((res) => console.log(res))
//   .catch((err) => console.log(err))
