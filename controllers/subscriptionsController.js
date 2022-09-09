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
//     price: 120,
//     duration: 1,
//   },
//   {
//     title: '3-Month Plan',
//     price: 180,
//     duration: 3,
//   },
//   {
//     title: '6-month Premium',
//     price: 2000,
//     duration: 1,
//     discount: 8,
//   },
// ])
//   .then((res) => console.log(res))
//   .catch((err) => console.log(err))
     SubscriptionPlan.find().then(res =>{
    console.log(res)
    // res.map(item =>{ SubscriptionPlan.findOneAndRemove(item).then(()=>{console.log("deleted")})})
   
     })


