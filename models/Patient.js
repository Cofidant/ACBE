const mongoose = require('mongoose')
const User = require('./User')

const patientSchema = mongoose.Schema({
  username: String,
  requestProfiles: [
    {
      type: mongoose.SchemaTypes.Mixed,
    },
  ],
})

patientSchema.virtual('stories', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'authorID',
  match: { _kind: 'story' },
})

patientSchema.virtual('activeSessions', {
  ref: 'Session',
  localField: '_id',
  foreignField: 'patient',
  match: {
    expiryDate: { $gte: Date.now() },
  },
})

patientSchema.pre('findOne', function (next) {
  this.populate('activeSessions', '-notes').populate('stories')
  next()
})
const Patient = User.discriminator('patient', patientSchema)
module.exports = Patient
