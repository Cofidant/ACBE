const { StatusCodes } = require('http-status-codes')
const { BadRequest } = require('../errors')
const Session = require('../models/Session')
const SubscriptionPlan = require('../models/SubscriptionPlan')
const catchAsync = require('../utils/catchAsync')
const Email = require('../utils/email')
const { getEndDate } = require('../utils/myUtills')
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
    amount: price * 100 * (process.env.DOLLAR_RATE || 600),
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
      paymentMethod: 'paystack',
    })
      .then(async (updated) => {
        // Send Payment Successfull Email
        const populated = await Session.findById(updated._id)
          .populate('subscriptionPlan')
          .populate('patient', 'name email username')
        await new Email(populated.patient).sendPaymentSuccessful(populated)
      })
      .catch((err) => {
        console.log(err)
      })

    res.status(200).json(result.data)
    // res.redirect(result.data.authorization_url)
  })
})

exports.paystackVerify = catchAsync(async (req, res, next) => {
  const ref = req.query.reference
  const session = await Session.findOne({
    paymentRef: ref,
    paymentMethod: 'paystack',
  })
  if (!ref) return next(new BadRequest('Please provide the payment reference'))
  // Check if payment is already verified
  if (session.paymentStatus === 'paid')
    return res
      .status(StatusCodes.OK)
      .json({ status: 'success', message: 'payment already verified' })

  await paystack.verifyPayment(ref, (result) => {
    const { customer, reference, amount, metadata } = result.data
    //do some updates in the database
    Session.findByIdAndUpdate(
      session._id,
      {
        paymentStatus: 'paid',
        paymentMethod: 'paystack',
        subscribedDate: Date.now() - 1000,
        expiryDate: getEndDate(session?.subscriptionPlan?.duration / 40),
        hoursRemaining: session?.subscriptionPlan?.duration,
      },
      { new: true }
    ).then((updatedSession) => {
      // Send Payment Successfull Email
      new Email(req.user)
        .sendPaymentSuccessful(updatedSession)
        .then(() => {})
        .catch((err) => console.log('Err Sending Email >>>\n' + err.message))
      // Yet to be Implemented
      res.status(200).json({
        status: 'success',
        message: 'Payment successful!',
        data: { customer, reference, amount, metadata },
      })
    })
  })
})
