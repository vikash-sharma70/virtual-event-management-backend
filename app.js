require("dotenv").config()
const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const logger = require("./src/middleware/logger")
const errorHandler = require("./src/middleware/errorHandler")
const AppError = require("./src/utils/AppError")
const { globalLimiter } = require("./src/middleware/rateLimiter")

const authRoutes = require("./src/routes/authRoutes")
const eventRoutes = require("./src/routes/eventRoutes")

const app = express()

app.use(helmet())
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
)

app.use("/api", globalLimiter)

app.use(express.json({ limit: "10kb" }))
app.use(express.urlencoded({ extended: true }))

app.use(logger)

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Virtual Event Management API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
})

app.use("/api/auth", authRoutes)

app.use("/api/events", eventRoutes)

app.use("/api/users", require("./src/routes/userRoutes"))

app.all("/{*path}", (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found on this server`, 404))
})

app.use(errorHandler)

module.exports = app