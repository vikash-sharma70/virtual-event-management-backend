require("dotenv").config()

const app = require("./app")
const connectDB = require("./src/config/db")

const PORT = process.env.PORT || 3000

const startServer = async () => {
  try {
    await connectDB()

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`)
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`)
    })

    process.on("unhandledRejection", (err) => {
      console.error("💥 UNHANDLED REJECTION:", err.message)

      server.close(() => {
        process.exit(1)
      })
    })
  } catch (error) {
    console.error("Server startup failed:", error.message)
    process.exit(1)
  }
}

startServer()