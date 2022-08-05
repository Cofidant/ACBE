const { BadRequest, NotFound } = require('../errors')
const SubscriptionPlan = require('../models/SubscriptionPlan')
const catchAsync = require('../utils/catchAsync')
const { initializePayment, verifyPayment } = require('../utils/paystack')

exports.paystackPay = catchAsync(async (req, res, next) => {
  // is a protected route
  const { email, _id, username } = req.user
  const { therapistID, subscriptionID } = req.body
  if (!therapistID || !subscriptionID)
    return next(
      new BadRequest('Please provide the therapistID and subscriptionID')
    )
  const subPlan = await SubscriptionPlan.findById(subscriptionID)
  if (!subPlan) return next(new NotFound("Plan Doesn't Exist!"))
  const data = {
    email,
    amount: (subPlan.price - subPlan.discount) * 100,
    currency: 'NGN',
  }
  data.metadata = {
    username,
    patientID: _id,
  }

  await initializePayment(data, (result) => {
    // console.log(result);
    res.status(200).json(result)
    // res.redirect(result.data.authorization_url)
  })
})

exports.paystackCallback = catchAsync(async (req, res, next) => {
  const ref = req.query.reference
  await verifyPayment(ref, (result) => {
    const { customer, reference, amount, metadata } = result.data
    //do some updates in the database
    res.status(200).json({
      status: 'success',
      message: 'Payment successful!',
      data: { customer, reference, amount, metadata },
    })
  })
})
