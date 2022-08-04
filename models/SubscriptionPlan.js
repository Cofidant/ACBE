const mongoose = require('mongoose')

const subsPlanSchema = mongoose.Schema({
  duration: {
    // duration in months
    type: Number,
    required: [true, 'Please provide the duration of the plan'],
    default: 1,
  },
  title: {
    // Name of the Plan
    type: String,
    required: [true, 'Please provide The title of the plan'],
  },
  price: {
    type: Number,
    required: [true, 'Please provide the Price'],
  },
  discount: {
    type: Number,
    default: 0,
  },
})

const SubscriptionPlan = mongoose.model('SubscriptionPlan', subsPlanSchema)
module.exports = SubscriptionPlan
