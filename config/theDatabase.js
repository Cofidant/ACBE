const mongoose = require('mongoose')
const log = require("../logger")

const connectDB = async (url) => {
  try {
    await mongoose.connect(url/*, {
      useNewUrlParser: true,
      // useCreateIndex: true,
      // useFindAndModify: false,
      useUnifiedTopology: true,
    }*/)
    log("info","connected to db")
  } catch (err) {
    console.log("error occured",err)
    throw new Error(err)
  }
}

module.exports = connectDB
