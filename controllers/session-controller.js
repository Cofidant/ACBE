const Session = require('../models/Session')
// const catchAsync = require('../utils/catchAsync')
const factoryController = require('./handlerFactory')
const sessionService = require('../services')

exports.getAllSessions = factoryController.getAll(Session)
exports.createTherapySession = factoryController.createOne(Session)
exports.getOneSession = factoryController.getOne(Session)

// 62e589f011986b779bc46f05 62e59426d86f719bb562f34c
// Session.create({
//   therapist: '62e59426d86f719bb562f34c',
//   patient: '62e589f011986b779bc46f05',
//   subscribedDate: Date.now(),
//   expiryDate: Date.now() + 60 * 24 * 60 * 60 * 60,
// })
//   .then((res) => console.log(res))
//   .catch((err) => console.log(err.message))
