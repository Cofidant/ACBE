const mongoose = require('mongoose')
const User = require('./User')

const storySchema = mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'please provide your id'],
    },
    preview: {
      type: String,
      required: [true, 'please provide a previw of your story'],
    },
    body: {
      type: String,
      required: [true, 'please type in your story body'],
    },
    coverImg: String,
    comments: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

storySchema.pre(/^find/, function (next) {
  this.populate('patient', 'username image')
  next()
})

const Story = mongoose.model('Story', storySchema)
module.exports = Story
