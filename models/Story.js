const mongoose = require('mongoose')
const Post = require('./postModel')

const storySchema = mongoose.Schema({
  display: Boolean,
  tags: {
    default: ['Story'],
  },
  summary: {
    type: String,
    default: 'This is a story about my self...',
  },
})

storySchema.pre(/^find/, function (next) {
  this.populate('patient', 'username image')
  next()
})

const Story = Post.discriminator('story', storySchema)
module.exports = Story
