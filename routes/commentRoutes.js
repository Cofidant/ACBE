const express = require('express')
const commentController = require('../controllers/commentController')
const { authenticationMiddleware } = require('../middlewares/authentication')

const commentRouter = express.Router({ mergeParams: true })

commentRouter
  .route('/')
  .post(
    authenticationMiddleware,
    commentController.assignIDs,
    commentController.commentPost
  )
  .get(commentController.setDefaultFilter, commentController.getComments)

commentRouter
  .route('/:commentID')
  .get(commentController.getOne)
  .patch(
    authenticationMiddleware,
    commentController.allowEdits,
    commentController.updateComment
  )
  .delete(
    authenticationMiddleware,
    commentController.allowEdits,
    commentController.deleteComment
  )

commentRouter.use(authenticationMiddleware)
commentRouter
  .route('/:commentID/like')
  .post(commentController.likeComment)
  .delete(commentController.likeComment)

/* commentRouter.route("/:pid/reply")
    .post(authenticationMiddleware,commentController.replyComment)
    .get(commentController.getCommentReplies); */

module.exports = commentRouter
