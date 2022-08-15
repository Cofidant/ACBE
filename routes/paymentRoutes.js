const express = require('express')

const paymentController = require('../controllers/paymentsController')
const { authenticationMiddleware } = require('../middlewares/authentication')

const paymentRouter = express.Router()

paymentRouter.use(authenticationMiddleware, paymentController.paymentMiddleware)

paymentRouter.route('/test').get((req, res, next) => {
  res.render('initialis_payment')
})

// paystack endpoints
paymentRouter.route('/paystack/pay').post(paymentController.paystackInitialize)
paymentRouter.route('/paystack/callback').get(paymentController.paystackVerify)

module.exports = paymentRouter
