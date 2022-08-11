const mongoose = require('mongoose')

const appointmentSchema = mongoose.Schema({
  start_time: {
    type: Date,
  },
  end_time: {
    type: Date,
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'canceled', 'complete', 'pending'],
      message:
        "status is one of ('active', 'canceled','pending' or 'complete')",
    },
  },
})

// Notes or Observations taken by Therapist
const noteSchema = mongoose.Schema(
  {
    noteText: String,
    _id: false,
  },
  { timestamps: true }
)

const sessionSchema = mongoose.Schema(
  {
    therapist: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Please provide the Therapist id'],
    },
    patient: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Please provide the patient id'],
    },
    appointments: [appointmentSchema],
    notes: [noteSchema],
    subscriptionPlan: {
      type: mongoose.Schema.ObjectId,
      ref: 'SubscriptionPlan',
    },
    subscribedDate: {
      type: Date,
      default: Date.now(),
    },
    expiryDate: {
      type: Date,
      default: Date.now(),
    },
    paymentRef: String,
    paymentStatus: {
      type: String,
      default: 'pending',
      enum: {
        values: ['pending', 'paid'],
        message: 'paymentStatus is either paid or pending',
      },
    },
    messages:{
      type: Array,
      default:[]
    },
    patient_socket_id:{
      type: String,
    },
    therapist_socket_id:{
      type: String
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

sessionSchema.virtual('expired').get(function () {
  return Date.now() >= this.expiryDate
})

sessionSchema.pre(/^find/, function (next) {
  this.populate('therapist', 'name image username')
    .populate('patient', 'username image')
    .sort('-createdAt')
  next()
})

const Session = mongoose.model('Session', sessionSchema)
module.exports = Session
