const { StatusCodes } = require('http-status-codes')
const { BadRequest } = require('../errors')
const Session = require('../models/Session')
const SubscriptionPlan = require('../models/SubscriptionPlan')
const catchAsync = require('../utils/catchAsync')
const Email = require('../utils/email')
const { getEndDate, validateId } = require('../utils/myUtills')
const paystack = require('../utils/paystack')

exports.paymentMiddleware = catchAsync(async (req, res, next) => {
  const sessionID =
    req.body.sessionID || req.query.sessionID || req.params.sessionID

  if (!validateId(sessionID))
    return res.status(401).json({ message: 'invalid session id' })

  // Get The Session
  const session = await Session.findById(sessionID)
  //.populate('subscriptionPlan')
  if (!session) return next(new BadRequest('Invalid Session Id'))
  // Check If Session is alredy paid
  if (session.paymentStatus === 'paid')
    return next(new BadRequest('Session is already paid!'))

  const { email, _id, username } = session.patient
  let sub = await SubscriptionPlan.findById(session.subscriptionPlan)
  const paymentData = {
    email,
    amount: sub.price * 100 * (process.env.DOLLAR_RATE || 600),
    // currency: 'NGN',
  }

  paymentData.metadata = {
    username,
    patientID: _id,
    sessionID: session._id,
    therapistID: session.therapist._id,
    subscriptionPlan: session.subscriptionPlan._id,
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
      paymentRef: result.data.reference,
      paymentMethod: 'paystack',
    }).catch((err) => console.log('Error updating reference >>>', err.message))

    return res.status(StatusCodes.OK).json(result.data)
    // res.status(301).redirect(result.data.authorization_url)
  })
})

exports.paystackVerify = catchAsync(async (req, res, next) => {
  const ref = req.query.reference

  if (!ref) return next(new BadRequest('Please provide the payment reference'))

  const result = await paystack.verifyPayment(ref)
  const { customer, reference, amount, metadata, status } = result.data

  // check if transaction is not paid
  if (status !== 'success') {
    return res
      .status(StatusCodes.TEMPORARY_REDIRECT)
      .redirect('htttps://anonymous-next-app.vercel.app/payment-verify')
  }

  // Transaction is paid Do the necessary Updates

  // Find The Reserved Session Paid for
  const session = await Session.findOne({
    _id: metadata.sessionID,
    patient: metadata.patientID,
  }).populate('subscriptionPlan')

  // Confirm if reservation is still there
  if (!session) {
    // sesion has exceed 24hrs and consequently got deleted
    // Decide on a remedy option
    // Check if the therapist is still available and create a session
    // Or reserve the payment and ask the user to submit a new request for a new therapist
    // Create a session for that....
  }

  // Already updated
  if (session.paymentStatus === 'paid') {
    return res
      .status(StatusCodes.TEMPORARY_REDIRECT)
      .redirect('htttps://anonymous-next-app.vercel.app/payment-verify')
  }

  // Update details of reservation to paid
  session.paymentStatus = 'paid'
  session.paymentMethod = 'paystack'
  session.subscribedDate = Date.now() - 1000
  session.expiryDate = getEndDate(session.subscriptionPlan?.duration / 40)
  session.hoursRemaining = session.subscriptionPlan?.duration
  await session.save()

  // Send Payment Successfull
  new Email(req.user)
    .sendPaymentSuccessful(session.toJSON())
    .then(() => {})
    .catch((err) => console.log('Err Sending Email >>>' + err.message))

  // Redirect to Patient Dashboard
  // For now temporary send result via json
  res
    .status(StatusCodes.PERMANENT_REDIRECT)
    .redirect('htttps://anonymous-next-app.vercel.app/payment-verify')
  // res.status(200).json({
  //   status: 'success',
  //   message: `Payment is ${status}`,
  //   data: { customer, reference, amount, metadata, status },
  // })
})
