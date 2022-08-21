const { StatusCodes } = require('http-status-codes')
const Review = require('../models/Review')
const Therapist = require('../models/Therapist')
const catchAsync = require('../utils/catchAsync')
const handlerFactory = require('./handlerFactory')

exports.to10reviews = catchAsync(async (req, res, next) => {
  res.status(StatusCodes.OK).json({ status: 'success', result: 0 })
})

exports.getAllReviews = handlerFactory.getAll(Review)
exports.getReview = handlerFactory.getOne(Review)
exports.deleteReview = handlerFactory.deleteOne(Review)
exports.updateReview = handlerFactory.updateOne(Review)
exports.createReview = handlerFactory.createOne(Review)
exports.allowReviewEdit = handlerFactory.allowEdits(Review, 'patient')
