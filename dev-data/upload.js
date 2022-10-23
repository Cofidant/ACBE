const mongoose = require('mongoose')
const dotenv = require('dotenv')
const fs = require('fs')
const path = require('path')
dotenv.config({ path: path.join(__dirname, '../.env') })
const { argv } = require('process')
const User = require('../models/User')
const SubscriptionPlan = require('../models/SubscriptionPlan')
const Post = require('../models/postModel')
// console.log(process.env.DATABASE_VIRTUAL)
mongoose
  .connect(
    process.env.NODE_ENV == 'development' && false
      ? process.env.mongo_URI
      : process.env.DATABASE_VIRTUAL?.replace(
          '<password>',
          process.env.DB_PASSWORD
        ),
    {
      useNewUrlParser: true,
    }
  )
  .then(() => {
    console.log('Database Connection Successfull!')
    if (process.argv[2] === '--import') {
      controllerFunc(0)
    } else if (process.argv[2] === '--save') {
      controllerFunc(1)
    } else if (process.argv[2] === '--delete') {
      controllerFunc(2)
    } else if ((process, argv[2] === '--updateIDs')) {
      replaceClassWithID()
    }
  })
  .catch((err) => console.log(err))

const loadData = async (Model, filePath) => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, filePath)))
  try {
    await Model.create(data)
    console.log(`${Model.modelName}s Data loaded successfully`)
  } catch (error) {
    console.log(error.message)
  }
}

const saveData = async (Model, filePath) => {
  const data = await Model.find()
  try {
    fs.writeFileSync(path.join(__dirname, filePath), JSON.stringify(data))
    console.log(`${Model.modelName}s Data saved successfully`)
  } catch (error) {
    console.log(error.message)
  }
}

const deleteData = async (Model, filePath) => {
  try {
    await Model.deleteMany({})
    console.log(`${Model.modelName}s Data deleted successfully`)
  } catch (error) {
    console.log(error.message)
  }
}

const controllerFunc = async (i) => {
  const funcs = [loadData, saveData, deleteData]
  ;[
    // [User, 'users.json'],
    [SubscriptionPlan, 'subplans.json'],
    // [Post, 'postsSample.json'],
  ].forEach((params) => funcs[i](...params))
}
