require("dotenv").config()
const passport = require('passport')
const User = require('../models/User')
const GoogleStrategy = require('passport-google-oauth20').Strategy

// Google Middleware
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${
        process.env.NODE_ENV === 'development'
          ? 'http://127.0.0.1:9890'
          : 'https://anonymous-confidant.herokuapp.com'
      }/api/v1/auth/googleRedirect`,
    },
    function (accessToken, refreshToken, profile, done) {
      return done(null, profile)
    }
  )
)

passport.serializeUser(function (user, done) {
  done(null, user._json.email)
})

passport.deserializeUser(function (id, done) {
  User.findOne({ email: id }, (err, user) => done(err, user))
})

module.exports = passport
