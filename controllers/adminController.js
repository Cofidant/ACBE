const { StatusCodes } = require('http-status-codes')
const { BadRequest } = require('../errors')
const Admin = require('../models/Admin')
const catchAsync = require('../utils/catchAsync')
const MyError = require('../utils/myError')
const { validateAdminPassword } = require('../utils/myUtills')
const factoryController = require('./handlerFactory')
// const User = require('../models/User')

exports.getMe = catchAsync(async (req, res, next) => {
  const me = await Admin.findById(req.user._id)
  res.status(StatusCodes.OK).json({ status: 'success', data: me })
})

exports.updateMe = factoryController.updateMe(Admin)

exports.adminLevelAccess =
  (...levels) =>
  (req, res, next) => {
    if (!levels.includes(req.user.clearance))
      return next(
        new MyError(
          'Oops This route is above your Level',
          StatusCodes.UNAUTHORIZED
        )
      )

    next()
  }

exports.validateAdminPassword = catchAsync(async (req, res, next) => {
  if (req.body.password) {
    const validated = validateAdminPassword(req.body.password)
    if (!validated[0]) {
      return next(new BadRequest(validated[1]))
    }
  }
  next()
})

exports.createAdmin = factoryController.createOne(Admin)
exports.getAllAdmins = factoryController.getAll(Admin)
exports.updateAdmin = factoryController.updateOne(Admin)
exports.deleteAdmin = factoryController.deleteOne(Admin)
exports.getAdmin = factoryController.getOne(Admin)

// Use this to replace previous admin with current admin
// User.deleteOne({ email: 'mamt4real@gmail.com' }).then((ex) => {
//   console.log('>>>> deleted', ex)
//   Admin.create({
//     email: 'mamt4real@gmail.com',
//     password: '12345pass',
//     name: 'Mahadi Abuhuraira',
//     clearance: 'level-3',
//   }).then((res) => {
//     console.log('>>>> created', res)
//   })
// })
