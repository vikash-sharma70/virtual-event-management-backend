const AppError = require("../utils/AppError")


const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message)
  return new AppError(`Validation failed: ${errors.join(". ")}`, 400)
}

const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0]
  const value = err.keyValue[field]
  return new AppError(
    `${field} "${value}" already exists. Please use a different value.`,
    409
  )
}

const handleCastError = (err) => {
  return new AppError(
    `Invalid ${err.path}: "${err.value}". Please provide a valid value.`,
    400
  )
}

const handleJWTError = () =>
  new AppError("Invalid token. Please login again.", 401)

const handleJWTExpiredError = () =>
  new AppError("Your session has expired. Please login again.", 401)

const handleSyntaxError = () =>
  new AppError("Invalid JSON in request body. Please check your input.", 400)

const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message
  error.statusCode = err.statusCode || 500

  if (err.name === "ValidationError") error = handleValidationError(err)
  if (err.code === 11000) error = handleDuplicateKeyError(err)
  if (err.name === "CastError") error = handleCastError(err)
  if (err.name === "JsonWebTokenError") error = handleJWTError()
  if (err.name === "TokenExpiredError") error = handleJWTExpiredError()
  if (err instanceof SyntaxError && err.status === 400) error = handleSyntaxError()

  if (process.env.NODE_ENV === "development") {
    console.error("ERROR:", err)
    return res.status(error.statusCode).json({
      status: "error",
      message: error.message,
      stack: err.stack,
      error: err,
    })
  }

  if (error.isOperational) {
    return res.status(error.statusCode).json({
      status: "error",
      message: error.message,
    })
  }

  console.error("💥 UNEXPECTED ERROR:", err)
  return res.status(500).json({
    status: "error",
    message: "Something went wrong on our end. Please try again later.",
  })
}

module.exports = errorHandler