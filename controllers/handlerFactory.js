const QueryHandler = require('../utils/queryHandler')
const catchAsync = require('../utils/catchAsync')
const MyError = require('../utils/myError')
const { NotFound } = require('../errors')
const { StatusCodes } = require('http-status-codes')

const confirmExistence = (doc, docName) => {
  if (!doc) {
    throw new NotFound(`No ${docName} found with that ID`)
  }
}

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const id = Model.modelName.toLowerCase() + 'ID'
    const doc = await Model.findByIdAndDelete(req.params[id])
    confirmExistence(doc, Model.modelName)
    res
      .status(204)
      .json({ status: 'succcess', message: 'Document deleted successfully' })
  })

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const id = Model.modelName.toLowerCase() + 'ID'
    const doc = await Model.findByIdAndUpdate(req.params[id], req.body, {
      new: true,
      runValidators: true,
    })
    confirmExistence(doc, Model.modelName)
    res.status(StatusCodes.OK).json({ status: 'success', data: doc })
  })

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    const id = Model.modelName.toLowerCase() + 'ID'
    let query = Model.findById(req.params[id])
    if (populateOptions) {
      populateOptions.forEach((option) => {
        query = query.populate(...option)
      })
    }
    const doc = await query
    confirmExistence(doc, Model.modelName)
    res.status(200).json({ status: 'succcess', data: doc })
  })

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const filter = req.filter ? req.filter : {}
    const Processor = new QueryHandler(Model, { ...req.query, ...filter })
    const results = await Processor.process()
    res
      .status(StatusCodes.OK)
      .json({ status: 'success', result: results.length, data: results })
  })

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body)
    res.status(201).json({ status: 'success', data: newDoc })
  })

exports.updateMe = (Model) =>
  catchAsync(async (req, res, next) => {
    const data = req.body
    const forbidden = ['password', '_kind', 'clearance']
    for (const field of forbidden)
      if (data.hasOwnProperty(field))
        return next(new BadRequest(`Unauthorized field (${field}) included!`))
    const updated = await Model.findByIdAndUpdate(req.user._id, data, {
      new: true,
    })
    res.status(StatusCodes.OK).json({ status: 'success', data: updated })
  })

exports.allowEdits = (Model, field = 'authorID') =>
  catchAsync(async (req, res, next) => {
    const id = Model.modelName.toLowerCase() + 'ID'
    const doc = await Model.findById(req.params[id])
    if (doc[field] != req.user.id) {
      throw new MyError(
        `You can only ${req.method.toLowerCase()} ${Model.modelName.toLowerCase()} you created`,
        403
      )
    }
    //you cant change author or publish post via this route
    ;[field, 'published'].forEach((field) => {
      if (req.body.hasOwnProperty(field)) delete req.body[field]
    })

    next()
  })

/**
 * Like or unlike a post | story | comment
 * @param {Model} Model The model of the document to like
 * @returns
 */
exports.like = (Model) =>
  catchAsync(async (req, res, next) => {
    const id = Model.modelName.toLowerCase() + 'ID'
    let method = 'post'
    let action = req.method.toLowerCase()
    let liked
    // Like for Post Method
    if (action === 'post') {
      liked = await Model.findByIdAndUpdate(req.params[id], {
        $addToSet: { claps: req.user.id },
      })
    } else if (action === 'delete') {
      //Unlike for delete
      liked = await Model.findByIdAndUpdate(req.params[id], {
        $pull: { claps: req.user.id },
      })
      method = 'delet'
    }

    res.status(200).json({
      status: 'success',
      message: `Like ${method}ed successfully`,
      liked,
    })
  })
