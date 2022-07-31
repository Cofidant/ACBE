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
    let processed = new QueryHandler(
      Model.find(filter).clone(),
      req.query
    ).process()
    const results = await processed
    res
      .status(200)
      .json({ status: 'success', result: results.length, data: results })
  })

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body)
    res.status(201).json({ status: 'success', data: newDoc })
  })
