const mongoose = require('mongoose')
const { specializations } = require('../utils/myUtills')
const User = require('./User')

const therapistSchema = mongoose.Schema({
  phone: {
    type: String,
  },
  gender: {
    type: String,
    enum: {
      values: [
        'MALE',
        'FEMALE',
        'OTHERS',
        'Male',
        'Female',
        'Others',
        'male',
        'female',
        'others',
      ],
      message: 'gender is either MALE, FEMALE or OTHERS',
    },
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
    default: function () {
      return `Hi, I'am Dr. ${this.name}`
    },
  },
  specialization: {
    type: [String],
    validate: {
      validator: function (array) {
        if (array.length > 4) return false
        return array.every((val) => specializations.includes(val))
      },
      message: 'Exceed maximum values or\nInvalid specialization',
    },
  },
  state: {
    type: String,
  },
  lga: String,
  availableTimes: {
    _id: false,
    monday: { type: String, default: '09:00am - 05:00pm' },
    tuesday: { type: String, default: '09:00am - 05:00pm' },
    wednesday: { type: String, default: '09:00am - 05:00pm' },
    thursday: { type: String, default: '09:00am - 05:00pm' },
    friday: { type: String, default: '09:00am - 05:00pm' },
    saturday: { type: String, default: '09:00am - 05:00pm' },
    sunday: { type: String, default: '09:00am - 05:00pm' },
  },
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
    country: String,
    state: String,
  },
  religionPreference: {
    type: String,
  },
  image: {
    type: String,
    default: 'default.jpg',
  },
})

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
  const years = new Date().getFullYear() - this.practicing_from?.getFullYear()
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
