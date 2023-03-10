const mongoose = require('mongoose')

const appointmentSchema = mongoose.Schema({
  title: String,
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
      values: ['active', 'cancelled', 'complete', 'pending'],
      message:
        "status is one of ('active', 'cancelled','pending' or 'complete')",
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
    paymentMethod: {
      type: String,
      enum: {
        values: ['paystack'],
        message: 'paymentMethod is one of (paystack, )',
      },
    },
    paymentStatus: {
      type: String,
      default: 'pending',
      enum: {
        values: ['pending', 'paid'],
        message: 'paymentStatus is either paid or pending',
      },
    },
    socketIDs: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// indexes
sessionSchema.index({ paymentStatus: 1 })

// virtual Fields
sessionSchema.virtual('expired').get(function () {
  return Date.now() >= this.expiryDate
})

// Hooks
sessionSchema.pre(/^find/, function (next) {
  this.populate('therapist', 'name image username email availableTimes')
    .populate('patient', 'username image email name')
    .sort('-createdAt')
  next()
})

sessionSchema.statics.getTherapistAppointmennts = async function (therapist) {
  const activeAppointments = []

  // get therapist active Sessions
  const activeSessions = await this.find({
    therapist: therapist._id || therapist,
    hoursRemaining: { $gt: 0 },
  }).select('appointments')

  // for each session find the active appointments
  activeSessions.forEach((element) => {
    const appointments =
      element.appointments?.filter(
        (ap) => ap.start_time?.getTime() >= Date.now() && ap.status == 'active'
      ) || []
    activeAppointments.push(...appointments)
  })

  return activeAppointments
}

/**
 * Check if a new appointment will overlap with exsting appointments
 * @param {Therapist} therapist The therapist object
 * @param {Date} time the appointment time
 * @returns {Bolean}
 */
sessionSchema.statics.checkAppointmentOverlap = async function (
  therapist,
  time
) {
  const activeAppointments = await this.getTherapistAppointmennts(therapist)

  // check for overlap
  // an appointment overlaps if the time is within 2hrs15min
  // (135 mins) of the start_time of active appointments
  for (const apt of activeAppointments) {
    if (
      time.getTime() >= apt.start_time?.getTime() &&
      time.getTime() <= apt.start_time?.getTime() + 135 * 60
    )
      return false
  }

  return true
}
const Session = mongoose.model('Session', sessionSchema)
module.exports = Session
