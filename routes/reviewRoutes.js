const express = require('express')
const {
  getAllReviews,
  createReview,
  getReview,
  allowReviewEdit,
  updateReview,
  deleteReview,
} = require('../controllers/reviewsController')
const {
  authenticationMiddleware,
  restrictRouteTo,
} = require('../middlewares/authentication')
const reviewRouter = express.Router({ mergeParams: true })

// Anyone can get reviews
// only patients can write reviews
reviewRouter
  .route('/')
  .get(getAllReviews)
  .post(authenticationMiddleware, restrictRouteTo('patient'), createReview)

reviewRouter
  .route('/:reviewID')
  .get(getReview)
  .patch(authenticationMiddleware, allowReviewEdit, updateReview)
  .delete(authenticationMiddleware, allowReviewEdit, deleteReview)

module.exports = reviewRouter
