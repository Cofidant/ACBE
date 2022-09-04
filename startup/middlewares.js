const express = require("express")

const path = require('path')
const helmet = require('helmet')
const cors = require('cors')
const xss = require('xss-clean')
const expressRateLmt = require('express-rate-limit')
// const express = require('express')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const passport = require('../middlewares/passport')

module.exports = (app) =>{

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(
  session({
    secret: process.env.jwtSecret,
    resave: false,
    saveUninitialized: false,
  })
)
app.use(passport.initialize())
app.use(passport.session())
app.use(helmet())
app.use(cors())
app.use(xss())
app.use(
  expressRateLmt({
    windowMs: 100 * 1000,
    max: 100,
  })
)
app.use(express.static(path.join(__dirname, 'public')))

}