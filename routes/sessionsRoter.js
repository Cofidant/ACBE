const express = require('express')
const { getAllSessions } = require('../controllers/session-controller')
const {
  authenticationMiddleware,
  restrictRouteTo,
} = require('../middlewares/authentication')
const chatRouter = require('./chatRoutes')

const sessionRouter = express.Router()
// All routes are protected
sessionRouter.use(authenticationMiddleware)
sessionRouter
  .route('/')
  .get(restrictRouteTo('admin'), getAllSessions)
  .post(restrictRouteTo('admin'))

sessionRouter.use('/:sessionID/chats', chatRouter)

module.exports = sessionRouter
