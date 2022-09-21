const { NotFound, UnAuthenticated } = require('../errors')
const Story = require('../models/Story')
const catchAsync = require('../utils/catchAsync')
const factoryController = require('./handlerFactory')

exports.allowEditOrDelete = catchAsync(async (req, res, next) => {
  const { storyID } = req.params
  const story = await Story.findById(storyID)
  if (!story) return next(new NotFound('Story doesnt exist'))

  // check if the user is the author of the story
  const isAuthor = story.patient._id == req.user._id
  if (!isAuthor) return next(new UnAuthenticated('You cant edit this story'))
  next()
})

exports.storyFilter = catchAsync(async (req, res, next) => {
  if (req.params.storyID) {
    req.params.postID = req.params.storyID
  }
  next()
})

exports.getStory = factoryController.getOne(Story)
exports.createStory = factoryController.createOne(Story)
exports.updateStory = factoryController.updateOne(Story)
exports.getAllStories = factoryController.getAll(Story)
exports.deleteStory = factoryController.deleteOne(Story)
