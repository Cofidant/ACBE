const mongoose = require('mongoose')
const User = require('./User')

const patientSchema = mongoose.Schema({
  username: String,
})

patientSchema.virtual('stories', {
  ref: 'Story',
  localField: '_id',
  foreignField: 'patient',
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
