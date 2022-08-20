const Session = require('../models/Session')
// const catchAsync = require('../utils/catchAsync')
const factoryController = require('./handlerFactory')

exports.getAllSessions = factoryController.getAll(Session)
exports.createTherapySession = factoryController.createOne(Session)
exports.getOneSession = factoryController.getOne(Session)

Session.find().then(res =>{
    console.log(res)
})

