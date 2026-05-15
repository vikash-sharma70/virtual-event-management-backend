require("dotenv").config()

const express = require("express")
const cors = require("cors")
const helmet = require("helmet")

const logger = require("./src/middleware/logger")
const errorHandler = require("./src/middleware/errorHandler")
const AppError = require("./src/utils/appError")

const authRoutes = require("./src/routes/authRoutes")
const eventRoutes = require("./src/routes/eventRoutes")

const app = express()

// Security Middleware
app.use(helmet())

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
)

// Body Parser
app.use(express.json({ limit: "10kb" }))
app.use(express.urlencoded({ extended: true }))

// Logger
app.use(logger)

// Health Route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Virtual Event Management API Running",
    timestamp: new Date().toISOString(),
  })
})

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/events", eventRoutes)

// 404 Handler
app.all("*", (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404))
})

// Global Error Handler
app.use(errorHandler)

module.exports = app