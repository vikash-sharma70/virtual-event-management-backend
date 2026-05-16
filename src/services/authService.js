const User = require("../models/userModel")
const { generateToken } = require("../utils/jwtHelper")
const { sendWelcomeEmail } = require("./emailService")
const AppError = require("../utils/AppError")

const registerUser = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() })
  if (existingUser) {
    throw new AppError("Email already registered. Please login.", 409)
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || "attendee", // Default attendee
  })

  sendWelcomeEmail({ user }).catch((err) => {
    console.error("Welcome email failed:", err.message)
  })

  const token = generateToken(user._id)

  return { user, token }
}

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({
    email: email.toLowerCase(),
  }).select("+password")

  if (!user) {
    throw new AppError("Invalid email or password", 401)
  }

  const isPasswordCorrect = await user.comparePassword(password)
  if (!isPasswordCorrect) {
    throw new AppError("Invalid email or password", 401)
  }

  const token = generateToken(user._id)

  return { user, token }
}

const getUserProfile = async (userId) => {
  const user = await User.findById(userId).populate({
    path: "registeredEvents",
    select: "title date time location status",
  })

  if (!user) {
    throw new AppError("User not found", 404)
  }

  return user
}

module.exports = { registerUser, loginUser, getUserProfile }