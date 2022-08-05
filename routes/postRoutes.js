const express = require('express')
const postController = require('../controllers/postController')
const commentRouter = require('./commentRoutes')
const {
  authenticationMiddleware,
  restrictRouteTo,
} = require('../middlewares/authentication')

const postRouter = express.Router({ mergeParams: true })

postRouter.use('/:postID/comments', commentRouter)

postRouter
  .route('/')
  .get(postController.setDefaultFilter, postController.getAll)
  .post(
    authenticationMiddleware,
    postController.uploadCoverPhoto,
    postController.resizeCoverPhoto,
    postController.assignIDs,
    postController.createPost
  )

postRouter
  .route('/:postID')
  .get(postController.getOne)
  .patch(
    authenticationMiddleware,
    postController.allowEdits,
    postController.uploadCoverPhoto,
    postController.resizeCoverPhoto,
    postController.updatePost
  )
  .delete(
    authenticationMiddleware,
    postController.allowEdits,
    postController.deletePost
  )

postRouter.use(authenticationMiddleware)

postRouter.post(
  '/:postID/publish',
  restrictRouteTo('admin'),
  postController.publishPost
)

postRouter
  .route('/:postID/bookmark')
  .post(postController.addToBookmarks)
  .get(postController.getBookmarks)
  .delete(postController.addToBookmarks)

postRouter
  .route('/:postID/like')
  .post(postController.likePost)
  .delete(postController.likePost)

module.exports = postRouter
