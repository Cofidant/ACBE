const express = require('express')
const storyController = require('../controllers/stories-controller')
const storiesRouter = express.Router({ mergeParams: true })

storiesRouter
  .route('/')
  .get(storyController.getAllStories)
  .post(storyController.createStory)

storiesRouter
  .route('/:storyID')
  .get(storyController.getStory)
  .patch(storyController.allowEditOrDelete, storyController.updateStory)
  .delete(storyController.allowEditOrDelete, storyController.deleteStory)

module.exports = storiesRouter
