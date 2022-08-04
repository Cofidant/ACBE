const express = require('express')
const router = express.Router()
const {
  login,
  register,
  forgotPassword,
  resetPassword,
} = require('../controllers/authorization')

router.post('/register', register)
router.post('/login', login)
router.patch('/reset-password/:token', resetPassword)
router.post('/forgot-password', forgotPassword)

module.exports = router
