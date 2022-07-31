const mongoose = require('mongoose')
const User = require('./User')

const patientSchema = mongoose.Schema({
  username: String,
})


const Patient = User.discriminator('patient', patientSchema);
module.exports = Patient
