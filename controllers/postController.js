const catchAsync = require('../utils/catchAsync')
const MyError = require('../utils/myError')
const factory = require('./handlerFactory')
const multer = require('multer')
const sharp = require('sharp')

const User = require('../models/User')
const Post = require('../models/postModel')

exports.assignIDs = catchAsync(async (req, res, next) => {
  if (!req.body.authorID) req.body.authorID = req.user.id
  next()
})

const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) cb(null, true)
  else cb(new MyError('Error: You can only upload an image', 400), false)
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
})

exports.uploadCoverPhoto = upload.single('coverImg')

exports.resizeCoverPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next()
  req.body.coverImg = `post-${req.params.postID}-${Date.now()}-cover.jpeg`
  await sharp(req.file.buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/posts/${req.body.coverImg}`)

  next()
})

exports.setDefaultFilter = (req, res, next) => {
  const filter = {}
  filter.published = true
  if (req._parsedOriginalUrl.pathname.split('/').includes('me')) {
    filter['authorID'] = req.user.id
  } else if (req.params.userID) {
    filter['authorID'] = req.params.userID
  }
  req.filter = filter
  next()
}

exports.publishPost = catchAsync(async (req, res, next) => {
  await Post.updateOne({ _id: req.params.postID }, { published: true })
  res
    .status(200)
    .json({ status: 'success', message: 'Post published successfully' })
})

exports.addToBookmarks = catchAsync(async (req, res, next) => {
  let suffix = 'Bookmarked'
  if (!req.user.bookmarks.includes(req.params.postID)) {
    await User.updateOne(
      { _id: req.user.id },
      { $addToSet: { bookmarks: req.params.postID } }
    )
  } else {
    if (req.method == 'DELETE') {
      suffix = 'Removed from bookmarks'
      await User.updateOne(
        { _id: req.user.id },
        { $pull: { bookmarks: req.params.postID } }
      )
    }
  }
  res
    .status(200)
    .json({ status: 'success', message: `${suffix} Successfully!` })
})

exports.getBookmarks = catchAsync(async (req, res, next) => {
  const bookmarks = await Post.find({
    _id: { $in: req.user.bookmarks },
  }).select('title summary coverImg')
  res.status(200).json({ status: 'success', bookmarks })
})

exports.likePost = factory.like(Post)
exports.allowEdits = factory.allowEdits(Post)
exports.getAll = factory.getAll(Post)
exports.getOne = factory.getOne(Post, [
  ['authorID', 'username image name'],
  ['comments', 'content authorID'],
])
exports.deletePost = factory.deleteOne(Post)
exports.createPost = factory.createOne(Post)
exports.updatePost = factory.updateOne(Post)
