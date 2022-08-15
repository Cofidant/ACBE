const { BadRequest } = require('../errors')
const Session = require('../models/Session')
const catchAsync = require('../utils/catchAsync')
const paystack = require('../utils/paystack')

exports.paymentMiddleware = catchAsync(async (req, res, next) => {
  const session = await Session.findById(req.body.sessionID).populate(
    'subscriptionPlan'
  )
  if (!session) return next(new BadRequest('Invalid Session Id'))
  if (session.paymentStatus === 'paid')
    return next(new BadRequest('Session is already paid!'))

  const { email, _id, username } = session.patient
  const { price } = session.subscriptionPlan

  const paymentData = {
    email,
    amount: price * 100,
    // currency: 'NGN',
  }

  paymentData.metadata = {
    username,
    patientID: _id,
  }
  req.paymentData = paymentData
  req.sessionPaid = session
  next()
})

exports.paystackInitialize = catchAsync(async (req, res, next) => {
  const paymentData = req.paymentData

  await paystack.initializePayment(paymentData, (result) => {
    // Update payment reference
    Session.findByIdAndUpdate(req.sessionPaid._id, {
      paymentRef: result.reference,
    })
      .then(() => {})
      .catch((err) => {})

    res.status(200).json(result)
    // res.redirect(result.data.authorization_url)
  })
})

exports.paystackVerify = catchAsync(async (req, res, next) => {
  const ref = req.query.reference

  await paystack.verifyPayment(ref, (result) => {
    const { customer, reference, amount, metadata } = result.data
    //do some updates in the database
    res.status(200).json({
      status: 'success',
      message: 'Payment successful!',
      data: { customer, reference, amount, metadata },
    })
  })
})
