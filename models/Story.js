const mongoose = require('mongoose')
const Post = require('./postModel')

const storySchema = mongoose.Schema({
  display: Boolean,
})

storySchema.pre(/^find/, function (next) {
  this.populate('patient', 'username image')
  next()
})

const Story = Post.discriminator('story', storySchema)
module.exports = Story
