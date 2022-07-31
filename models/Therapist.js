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
      default:Date(),
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
      type: String, //"12-45"
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
    activeClients: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Patient',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// virtual fields
therapistSchema.virtual('activeSessions').get(function () {
  return this.activeClients.length
})
therapistSchema.virtual('years_of_experience').get(function () {
  const years = this.practicing_from.getFullYear() - new Date().getFullYear();
  return years;
})

const Therapist = User.discriminator('therapist', therapistSchema)
module.exports = Therapist
