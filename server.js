require("dotenv").config()
const app = require("./app")
const connectDB = require("./src/config/db")

const PORT = process.env.PORT || 3000

const startServer = async () => {
  await connectDB()

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`🏥 Health: http://localhost:${PORT}/health`)
    console.log(`📝 Environment: ${process.env.NODE_ENV}`)
    console.log(`🔗 API Base: http://localhost:${PORT}/api`)
  })

  process.on("unhandledRejection", (err) => {
    console.error("💥 UNHANDLED REJECTION:", err.message)
    server.close(() => process.exit(1))
  })

  process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down gracefully...")
    server.close(() => {
      console.log("Server closed.")
      process.exit(0)
    })
  })
}

startServer()