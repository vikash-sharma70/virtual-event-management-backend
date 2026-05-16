const authService = require("../services/authService")
const asyncHandler = require("../utils/asyncHandler")
const { sendSuccess } = require("../utils/responseHandler")

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body

  const { user, token } = await authService.registerUser({
    name,
    email,
    password,
    role,
  })

  sendSuccess(res, 201, "Registration successful", { user, token })
})

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const { user, token } = await authService.loginUser({ email, password })

  sendSuccess(res, 200, "Login successful", { user, token })
})

exports.getMe = asyncHandler(async (req, res) => {
  const user = await authService.getUserProfile(req.user._id)

  sendSuccess(res, 200, "Profile fetched successfully", { user })
})