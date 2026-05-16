const jwt = require("jsonwebtoken")
const AppError = require("./AppError")

const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new AppError("JWT_SECRET environment variable is not set", 500)
  }

  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  )
}

const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new AppError("JWT_SECRET environment variable is not set", 500)
  }
  return jwt.verify(token, process.env.JWT_SECRET)
}

module.exports = { generateToken, verifyToken }