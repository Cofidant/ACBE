const mongoose = require('mongoose')
const Post = require('./postModel')

const storySchema = mongoose.Schema({
  display: Boolean,
  tags: {
    type: [String],
    default: ['Story'],
  },
  summary: {
    type: String,
    default: 'This is a story about my self...',
  },
})

const Story = Post.discriminator('story', storySchema)
module.exports = Story
