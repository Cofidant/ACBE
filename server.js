require('dotenv').config({ path: './config.env' })
require('express-async-errors')
const path = require('path')
const helmet = require('helmet')
const cors = require('cors')
const xss = require('xss-clean')
const expressRateLmt = require('express-rate-limit')
const express = require('express')
const list_end_points = require('list_end_points')
const connectDB = require('./config/theDatabase')
const app = express()
// Errors Handlers
const notFound = require('./middlewares/not-found')
const errorHandler = require('./middlewares/error-handler')
const { useSocket } = require('./controllers/socket')
// const corsOptions = {
//   origin: "https://anonymous-confidants-liard.vercel.app/",
//   optionsSuccessStatus: 200,
// };

// INITIALIZE MIDDLEWARE
app.use(express.json())
app.use(helmet())
app.use(cors())
app.use(xss())
app.use(
  expressRateLmt({
    windowMs: 100 * 1000,
    max: 100,
  })
)
// serve static files
app.use(express.static(path.join(__dirname, 'public')))

// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*')
//   next()
// })

// DEFINE ROUTES

const authRouters = require('./routes/auth')
const therapistRouter = require('./routes/therapistRoutes')
const patientRouter = require('./routes/patient-routes')
const sessionRouter = require('./routes/sessionsRoter')
const subsRouter = require('./routes/subscriptionRoutes')
const postRouter = require('./routes/postRoutes')
const commentRouter = require('./routes/commentRoutes')
const paymentRouter = require('./routes/paymentRoutes')
app.use('/api/v1/auth', authRouters)
app.use('/api/v1/therapists', therapistRouter)
app.use('/api/v1/patients', patientRouter)
app.use('/api/v1/sessions', sessionRouter)
app.use('/api/v1/subscriptions', subsRouter)
app.use('/api/v1/posts', postRouter)
app.use('/api/v1/comments', commentRouter)
app.use('/api/v1/payments', paymentRouter)
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 9809
list_end_points(app)

const start = async () => {
  try {
    // connect to database
    await connectDB(
      process.env.NODE_ENV == 'development'
        ? process.env.mongo_URI
        : process.env.DATABASE_VIRTUAL.replace(
            '<password>',
            process.env.DB_PASSWORD
          )
    )
    /* create a http server */
    const httpServer = app.listen(PORT, () =>
      console.log(`Server started at port ${PORT}`)
    )
    /** Create socket connection */
    useSocket(httpServer)
    // global.io = new Server(httpServer)
    // global.io.on('connection', WebSockets.connection)
  } catch (error) {
    console.log(error)
  }
}

start()
