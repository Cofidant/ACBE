const mongoose = require('mongoose')

const connectDB = async (url) => {
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      // useCreateIndex: true,
      // useFindAndModify: false,
      useUnifiedTopology: true,
    })
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = connectDB
