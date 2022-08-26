const express = require('express')
const passport = require('../middlewares/passport')
const router = express.Router()
const {
  login,
  register,
  forgotPassword,
  resetPassword,
  oauthRedirectCallback,
  updatePassword,
  logout,
} = require('../controllers/authorization')
const { authenticationMiddleware } = require('../middlewares/authentication')

router.post('/register', register)
router.post('/login', login)
router.get('/logout',authenticationMiddleware,logout)
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
router.post('/forgot-password', forgotPassword)
router.post('/update-password', updatePassword)
router.patch('/reset-password/:token', resetPassword)

module.exports = router
