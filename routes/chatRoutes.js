const express = require('express')
const {
  postMessage,
  getAllSessionMessages,
  attachSessionFilter,
  markAllMessagesRead,
} = require('../controllers/chatMsgController')

const chatRouter = express.Router({ mergeParams: true })

chatRouter.use(attachSessionFilter)
chatRouter.route('/').post(postMessage).get(getAllSessionMessages)
chatRouter.post('/mark-all-read', markAllMessagesRead)

module.exports = chatRouter
