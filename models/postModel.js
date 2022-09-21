const mongoose = require('mongoose')
const { getDuration } = require('../utils/myUtills')
//const Comment = require("./commentModel");
const User = require('./User')

const postSchema = mongoose.Schema(
  {
    authorID: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Please provide the author ID'],
    },
    title: {
      type: String,
      maxlength: [100, 'Title shouldnt be more than 60 characters'],
      required: [true, 'Please provide a title for the post'],
      unique: [true, 'Title already exists, please re-caption your post!'],
      minlength: [15, 'A title should be atleast 15 characters'],
    },
    summary: {
      type: String,
      maxlength: [250, 'Summary shouldnt be more than 250 characters'],
      // required: [true, 'Please provide a summary for the post'],
    },
    tags: {
      type: [String],
      validate: {
        validator: function (val) {
          return val.length >= 1
        },
        message: 'Please provide the main topic of your post!',
      },
    },
    coverImg: {
      type: String,
      default: 'default.png',
    },
    content: {
      type: String,
      required: [true, 'Please provide the content of your posts'],
    },
    readTime: {
      type: Number,
      default: 1,
    },
    published: {
      type: Boolean,
      default: false,
    },
    noOfComments: {
      type: Number,
      default: 0,
    },
    claps: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    discriminatorKey: '_kind',
  }
)

postSchema.statics.incrementAuthorPosts = async function (author) {
  await User.findByIdAndUpdate(author, {
    $inc: { noOfPosts: 1 },
  })
}

postSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('content')) {
    const x = Math.round(this.content.split(' ').length / 200)
    this.readTime = x == 0 ? 1 : x
  }
  if (this.isNew) this.constructor.incrementAuthorPosts(this.authorID)
  next()
})
postSchema.virtual('comments', {
  ref: 'Comment',
  foreignField: 'postID',
  localField: '_id',
  select: 'content authorID',
  match: { parentID: null },
})

postSchema.virtual('noOfClaps').get(function () {
  if (this.claps) return this.claps.length
  return 0
})

postSchema.virtual('duration').get(function () {
  return getDuration(this.dateCreated)
})

const Post = mongoose.model('Post', postSchema)
module.exports = Post
