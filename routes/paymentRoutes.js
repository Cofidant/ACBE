const express = require('express')

const feeregController = require('../controllers/feeRegController')

const router = express.Router()

router.get('/', feeregController.getAllRecords)

router
  .route('/:feeregID')
  .get(feeregController.getOne)
  .patch(feeregController.updatePayment)
  .delete(feeregController.removeRecord)

router.route('/test').get((req, res, next) => {
  res.render('initialis_payment')
})

router.route('/paystack/pay').post(feeregController.paystackPay)
router.route('/paystack/callback').get(feeregController.paystackCallback)

module.exports = router
