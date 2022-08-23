const express = require('express')
const {
  postMessage,
  getAllSessionMessages,
  attachSessionFilter,
  markAllMessagesRead,
} = require('../controllers/chatMsgController')
const { getChats } = require('../controllers/session-controller')

const chatRouter = express.Router({ mergeParams: true })

chatRouter.use(attachSessionFilter)
chatRouter.route('/').post(postMessage).get(getAllSessionMessages)
chatRouter.post('/read-all', markAllMessagesRead)
chatRouter.get('/',getChats)

module.exports = chatRouter
