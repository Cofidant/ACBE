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
    note_text: String,
  },
  { timestamps: true }
)

const sessionSchema = mongoose.Schema(
  {
    therapist: {
      type: mongoose.Schema.ObjectId,
      ref: 'Therapist',
      required: [true, 'Please provide the Therapist id'],
    },
    patient: {
      type: mongoose.Schema.ObjectId,
      ref: 'Patient',
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

const Session = mongoose.model('Session', sessionSchema)
module.exports = Session
