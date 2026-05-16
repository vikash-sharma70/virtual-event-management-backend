const AppError = require("../utils/AppError")

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Only ${roles.join(" or ")} can perform this action.`,
          403 
        )
      )
    }
    next()
  }
}

const isOrganizer = restrictTo("organizer")

const checkEventOwnership = (event, userId) => {
  if (event.organizer.toString() !== userId.toString()) {
    throw new AppError(
      "Access denied. You can only modify your own events.",
      403
    )
  }
}

module.exports = { restrictTo, isOrganizer, checkEventOwnership }