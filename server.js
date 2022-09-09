require('dotenv').config({ path: './config.env' })
require('express-async-errors')
const log = require("./logger")
const express = require("express")
const app = express()
const http = require('http')
const { useSocket } = require('./controllers/socket')
const connectDB = require("./config/theDatabase")
require("./startup/middlewares")(app)
require("./startup/routes")(app)
require("./startup/errors")

const PORT = process.env.PORT || 9809

const start = async () => {
  try {
    // connect to database
    connectDB(process.env.mongo_URI)
    /* create a http server */
    const httpServer = http.createServer(app)
    /** Create socket connection **/
    useSocket(httpServer)
    httpServer.listen(PORT, () => log("info",`connected to port ${PORT}`))
  } catch (error) {
    log("error",error)
  }
}
start()
