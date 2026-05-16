const { verifyToken } = require("../utils/jwtHelper")
const User = require("../models/userModel")
const AppError = require("../utils/AppError")
const asyncHandler = require("../utils/asyncHandler")

const protect = asyncHandler(async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]
  }

  if (!token) {
    return next(new AppError("Access denied. Please login to continue.", 401))
  }

  let decoded
  try {
    decoded = verifyToken(token)
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new AppError("Your session has expired. Please login again.", 401))
    }
    return next(new AppError("Invalid token. Please login again.", 401))
  }

  const currentUser = await User.findById(decoded.id)
  if (!currentUser) {
    return next(new AppError("User belonging to this token no longer exists.", 401))
  }

  req.user = currentUser
  next()
})

module.exports = { protect }