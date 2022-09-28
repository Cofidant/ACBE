const express = require('express')
const storyController = require('../controllers/stories-controller')
const { restrictRouteTo } = require('../middlewares/authentication')
const commentRouter = require('./commentRoutes')

const storiesRouter = express.Router({ mergeParams: true })

storiesRouter
  .route('/')
  .get(storyController.getAllStories)
  .post(restrictRouteTo('patient', 'therapist'), storyController.createStory)

storiesRouter
  .route('/:storyID')
  .get(storyController.getStory)
  .patch(storyController.allowEditOrDelete, storyController.updateStory)
  .delete(storyController.allowEditOrDelete, storyController.deleteStory)

storiesRouter
  .route('/:storyID/like')
  .post(storyController.likeStory)
  .delete(storyController.likeStory)

storiesRouter.use(
  '/:storyID/comments',
  storyController.storyFilter,
  commentRouter
)

module.exports = storiesRouter
