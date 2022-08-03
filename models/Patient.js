const mongoose = require('mongoose')
const User = require('./User');
const Story = require("./Story")

const patientSchema = mongoose.Schema({
  username: String,
  stories: [Story]
})


const Patient = User.discriminator('patient', patientSchema);
module.exports = Patient
