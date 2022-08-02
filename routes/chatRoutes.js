const express = require('express')
const { postMessage } = require('../controllers/chatMsgController')

const chatRouter = express.Router({ mergeParams: true })

chatRouter.post('/:sessionID/message', postMessage)

module.exports = chatRouter
