const mongoose = require('mongoose')
const User = require('./User')
const Story = require('./Story')

const patientSchema = mongoose.Schema({
  username: String,
})

patientSchema.virtual('stories', {
  ref: 'Story',
  localField: '_id',
  foreignField: 'patient',
  sort: '-createdAt',
})

patientSchema.virtual('activeSessions', {
  ref: 'Session',
  localField: '_id',
  foreignField: 'patient',
  sort: '-createdAt',
  match: {
    expiryDate: { $gte: Date.now() },
  },
})

patientSchema.pre('findOne', function (next) {
  this.populate('activeSessions').populate('stories')
  next()
})
const Patient = User.discriminator('patient', patientSchema)
module.exports = Patient
