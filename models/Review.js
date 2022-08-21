const mongoose = require('mongoose')

const reviewSchema = mongoose.Schema(
  {
    therapist: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Please provide the Therapist id you are reviewing'],
    },
    patient: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Please provide your id'],
    },
    review_text: {
      type: String,
      required: [true, 'Please provide the review conyent'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'rating is required'],
    },
  },
  {
    timestamps: true,
  }
)

reviewSchema.post(/^find/, function (err, next) {
  this.sort('-createdAt -rating')
    .populate('patient', 'username name image')
    .populate('therapist', 'name image')
  next()
})

const Review = mongoose.model('Review', reviewSchema)
module.exports = Review
