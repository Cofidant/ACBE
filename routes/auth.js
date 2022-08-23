const express = require('express')
const passport = require('../middlewares/passport')
const router = express.Router()
const {
  login,
  register,
  forgotPassword,
  resetPassword,
  oauthRedirectCallback,
} = require('../controllers/authorization')

router.post('/register', register)
router.post('/login', login)
// Google Login
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)
router.get(
  '/googleRedirect',
  passport.authenticate('google'),
  oauthRedirectCallback
)
router.patch('/reset-password/:token', resetPassword)
router.post('/forgot-password', forgotPassword)

module.exports = router
