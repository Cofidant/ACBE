const mongoose = require('mongoose')
const User = require('./User')

const therapistSchema = mongoose.Schema(
  {
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

const Therapist = User.discriminator('therapist', therapistSchema)
module.exports = Therapist
