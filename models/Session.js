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
    subscribedDate: {
      type: Date,
      required: [true, 'Please provide the date subscribed'],
    },
    expiryDate: {
      type: Date,
      required: [true, 'Please provide the expiry date'],
    },
    appointments: [appointmentSchema],
    notes: [noteSchema],
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
  this.populate('therapist', 'name image username').populate(
    'patient',
    'username image'
  )
  next()
})

const Session = mongoose.model('Session', sessionSchema)
module.exports = Session
