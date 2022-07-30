const { StatusCodes } = require('http-status-codes')
const { BadRequest, UnAuthenticated } = require('../errors')
const Therapist = require('../models/Therapist')
const User = require('../models/User')
const catchAsync = require('../utils/catchAsync')
const QueryHandler = require('../utils/queryHandler')
const factoryController = require('./handlerFactory')

exports.getMe = catchAsync(async (req, res, next) => {
  res.status(StatusCodes.OK).json({ status: 'success', data: req.user })
})

exports.updateMe = catchAsync(async (req, res, next) => {
  const data = req.body

  if (data.hasOwnProperty('password'))
    return next(new BadRequest('You cant update password from here!'))

  const updated = Therapist.findByIdAndUpdate(req.user._id, data)
  res.status(StatusCodes.OK).json({ status: 'success', data: updated })
})

exports.getAllTherapists = factoryController.getAll(Therapist)

exports.getTherapist = factoryController.getOne(Therapist, [
  ['activeClients', 'username name image'],
])
exports.updateTherapist = factoryController.updateOne(Therapist)
exports.deleteTherapist = factoryController.deleteOne(Therapist)
exports.addTherapist = factoryController.createOne(Therapist)
