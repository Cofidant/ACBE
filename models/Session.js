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
    set: function (val) {
      return val.toLowerCase()
    },
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
    hoursRemaining: {
      type: Number,
      default: 0,
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
    messages: {
      type: Array,
      default: [],
    },
    socketIDs:[String]
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
    .populate('patient', 'username image email')
    .sort('-createdAt')
  next()
})

sessionSchema.statics.checkAppointmentOverlap = async function (
  therapist,
  time
) {
  const activeAppointments = []

  // get therapist active Sessions
  const activeSessions = await this.find({
    therapist,
    hoursRemaining: { $gt: 0 },
  }).select('appointments')

  // for each session find the actve appointments
  activeSessions.array.forEach((element) => {
    const appointments = element.appointments.filter(
      (ap) => ap.start_time >= Date.now() && ap.status == 'active'
    )
    activeAppointments.push(...appointments)
  })

  // check for overlap
  // an appointment overlaps if the time is within 2hrs15min
  // (135 mins) of the start_time of active appointments
  for (const apt of activeAppointments) {
    if (time >= apt.start_time && time <= apt.start_time + 135 * 60)
      return false
  }

  return true
}
const Session = mongoose.model('Session', sessionSchema)
module.exports = Session
