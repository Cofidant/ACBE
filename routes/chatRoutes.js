const express = require('express')
const { postMessage } = require('../controllers/chatMsgController')

const chatRouter = express.Router({ mergeParams: true })

chatRouter.post('/:sessionID/message', postMessage)
// charRouter.post('/:sessionID/')

module.exports = chatRouter
