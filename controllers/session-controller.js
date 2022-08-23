const Session = require('../models/Session')
// const catchAsync = require('../utils/catchAsync')
const factoryController = require('./handlerFactory')

// start Session Services
require('../services')

exports.getAllSessions = factoryController.getAll(Session)
exports.createTherapySession = factoryController.createOne(Session)
exports.getOneSession = factoryController.getOne(Session)

