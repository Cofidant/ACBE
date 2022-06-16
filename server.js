require("dotenv").config();
require("express-async-errors");
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const expressRateLmt = require("express-rate-limit");
const express = require("express");
const list_end_points = require("list_end_points");
const connectDB = require("./config/theDatabase");
const app = express();
// Errors Handlers
const notFound = require("./middlewares/not-found");
const errorHandler = require("./middlewares/error-handler");
// const corsOptions = {
//   origin: "https://anonymous-confidants-liard.vercel.app/",
//   optionsSuccessStatus: 200,
// };

// INITIALIZE MIDDLEWARE
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(
  expressRateLmt({
    windowMs: 100 * 1000,
    max: 100,
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

// DEFINE ROUTES

app.get("/", (req, res) => {
  res.send("Anonymous Confidant");
});

const authRouters = require("./routes/auth");

app.use("/api/v1/auth", authRouters);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 9809;
list_end_points(app);

const start = async () => {
  try {
    // connect to database
    await connectDB(process.env.mongo_URI);
    app.listen(PORT, () => console.log(`Server started at port ${PORT}`));
  } catch (error) {
    console.log(error);
  }
};

start();
