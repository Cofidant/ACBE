const express = require('express')
const {
  postMessage,
  getAllSessionMessages,
  attachSessionFilter,
} = require('../controllers/chatMsgController')

const chatRouter = express.Router({ mergeParams: true })

chatRouter.use(attachSessionFilter)
chatRouter.route('/message').post(postMessage).get(getAllSessionMessages)
chatRouter.post('/mark-all-read')

module.exports = chatRouter
