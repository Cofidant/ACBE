const mongoose = require('mongoose')
const User = require('./User')

const therapistSchema = mongoose.Schema(
  {
    phone: {
      type: String,
    },
    gender: {
      type: String,
    },
    qualifictaion: [
      {
        qualifictaion_name: String,
        institute_name: String,
        date_acquired: Date,
      },
    ],
    practicing_from: {
      type: Date, //Starting Date of Practice can be used to determine years of experience
      default: Date(),
    },
    about: {
      type: String,
    },
    specialization: [String],
    state: {
      type: String,
    },
    lga: String,
    agePreference: {
      upper: {
        type: Number,
        default: 100,
      },
      lower: {
        type: Number,
        default: 0,
      },
    },
    sexPreference: {
      type: String,
    },
    statusPreference: {
      type: String,
    },
    locationPreference: {
      type: String,
    },
    religionPreference: {
      type: String,
    },
    image: {
      type: String,
      default: 'default.jpg',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Virtual Fields

// activeSessions: when populated returns the list of un-expired sessions therapist
therapistSchema.virtual('activeSessions', {
  ref: 'Session',
  localField: '_id',
  foreignField: 'therapist',
  match: {
    expiryDate: { $gte: Date.now() },
  },
})

// patientReviews: when populated returns all reviews for the therapist
therapistSchema.virtual('patientReviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'therapist',
})

// only available if patientReviews is populated
therapistSchema.virtual('averageRating').get(function () {
  const reviews = this.patientReviews
  if (!reviews) return 0
  const total = reviews.reduce((a, b) => a + b.rating, 0)
  return total / reviews.length
})

therapistSchema.virtual('years_of_experience').get(function () {
  const years = this.practicing_from.getFullYear() - new Date().getFullYear()
  return years
})

// Hooks
therapistSchema.pre('findOne', function (next) {
  this.populate('activeSessions').populate('patientReviews')
  next()
})

// methods

therapistSchema.methods.isWithinAgeRange = function (age) {
  return this.agePreference?.upper >= age && this.agePreference?.lower <= age
}

const Therapist = User.discriminator('therapist', therapistSchema)
module.exports = Therapist
