const Session = require('../models/Session')
// const catchAsync = require('../utils/catchAsync')
const factoryController = require('./handlerFactory')

exports.getAllSessions = factoryController.getAll(Session)
exports.createTherapySession = factoryController.createOne(Session)
exports.getOneSession = factoryController.getOne(Session)

// Session.create({
//   therapist: "62ff38ef570848aae4c91e9f",
//   patient: "62fa21e31bce6d6c844ab835",
//   subscribedDate: Date.now(),
//   expiryDate: Date.now() + 60 * 24 * 60 * 60 * 60,
// })
//   .then((res) => console.log(res))
//   .catch((err) => console.log(err.message))
// Session.find().then(res =>{
//     res.map(ses =>{
// Session.findByIdAndDelete(ses._id).then(res =>{
//     console.log("deleted")
// })
// })
// })
// Session.find().then(res =>{
//     console.log(res)
// })

