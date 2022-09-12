require('dotenv').config()
const log = require('../logger')
const connectDB = require('../config/theDatabase')

module.exports = async () => {
  try {
    await connectDB(
      process.env.NODE_ENV == 'development'
        ? process.env.mongo_URI
        : process.env.DATABASE_VIRTUAL?.replace(
            '<password>',
            process.env.DB_PASSWORD
          )
    )
    log('info', 'connected to db')
  } catch (error) {
    log('error', error)
  }
}
