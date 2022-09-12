const mongoose = require('mongoose')
const User = require('./User')

const adminSchema = mongoose.Schema({
  clearance: {
    type: String,
    default: 'level-1',
    enum: {
      values: ['level-1', 'level-2', 'level-3'],
      message:
        "Invalid clearance value\n clearance is one of ('level-1','level-2','level-3')",
    },
  },
})

const Admin = User.discriminator('admin', adminSchema)
module.exports = Admin
