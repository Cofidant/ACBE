const mongoose = require('mongoose')

const reviewSchema = mongoose.Schema(
  {
    therapist: {
      type: mongoose.Schema.ObjectId,
      ref: 'Therapist',
      required: [true, 'Please provide the Therapist id you are reviewing'],
    },
    patient: {
      type: mongoose.Schema.ObjectId,
      ref: 'Patient',
      required: [true, 'Please provide your id'],
    },
    review_text: String,
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
  },
  {
    timestamps: true,
  }
)

reviewSchema.pre(/^find/, function (next) {
  this.populate('therapist', 'name image').populate('patient', 'username image')
  next()
})

const Review = mongoose.model('Review', reviewSchema)
module.exports = Review
