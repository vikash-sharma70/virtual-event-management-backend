const AppError = require("../utils/AppError")

const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
const VALID_ROLES = ["organizer", "attendee"]

// ─── HELPER FUNCTIONS ─────────────────────────────────

const sanitizeString = (str) => {
  if (typeof str !== "string") return str
  return str
    .trim()
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
}

const isValidDate = (dateStr) => {
  const date = new Date(dateStr)
  return date instanceof Date && !isNaN(date)
}

const isFutureDate = (dateStr) => {
  return new Date(dateStr) > new Date()
}

const isValidTime = (timeStr) => {
  // HH:MM format validate karo
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/
  return timeRegex.test(timeStr)
}

// ═══════════════════════════════════════════════════════
// AUTH VALIDATORS
// ═══════════════════════════════════════════════════════

const validateRegister = (req, res, next) => {
  let { name, email, password, role } = req.body

  // ── Name ──────────────────────────────────────────────
  if (!name || typeof name !== "string" || name.trim() === "") {
    return next(new AppError("Name is required", 400))
  }
  name = sanitizeString(name)
  if (name.length < 2) {
    return next(new AppError("Name must be at least 2 characters long", 400))
  }
  if (name.length > 50) {
    return next(new AppError("Name cannot exceed 50 characters", 400))
  }

  // ── Email ─────────────────────────────────────────────
  if (!email || typeof email !== "string" || email.trim() === "") {
    return next(new AppError("Email is required", 400))
  }
  email = email.trim().toLowerCase()
  if (!EMAIL_REGEX.test(email)) {
    return next(new AppError("Please provide a valid email address", 400))
  }

  // ── Password ──────────────────────────────────────────
  if (!password || typeof password !== "string") {
    return next(new AppError("Password is required", 400))
  }
  if (password.length < 8) {
    return next(new AppError("Password must be at least 8 characters", 400))
  }
  if (password.length > 128) {
    return next(new AppError("Password is too long (max 128 characters)", 400))
  }

  // ── Role ──────────────────────────────────────────────
  // Role optional hai - default "attendee" hoga
  if (role !== undefined) {
    if (!VALID_ROLES.includes(role)) {
      return next(
        new AppError(
          `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}`,
          400
        )
      )
    }
  }

  // Sanitized values set karo
  req.body.name = name
  req.body.email = email

  next()
}

const validateLogin = (req, res, next) => {
  let { email, password } = req.body

  if (!email || typeof email !== "string" || email.trim() === "") {
    return next(new AppError("Email is required", 400))
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return next(new AppError("Please provide a valid email address", 400))
  }
  if (!password || typeof password !== "string") {
    return next(new AppError("Password is required", 400))
  }

  req.body.email = email.trim().toLowerCase()
  next()
}

// ═══════════════════════════════════════════════════════
// EVENT VALIDATORS
// ═══════════════════════════════════════════════════════

const validateCreateEvent = (req, res, next) => {
  let { title, description, date, time, location, maxParticipants } = req.body

  // ── Title ─────────────────────────────────────────────
  if (!title || typeof title !== "string" || title.trim() === "") {
    return next(new AppError("Event title is required", 400))
  }
  title = sanitizeString(title)
  if (title.length < 3) {
    return next(new AppError("Title must be at least 3 characters", 400))
  }
  if (title.length > 100) {
    return next(new AppError("Title cannot exceed 100 characters", 400))
  }

  // ── Description ───────────────────────────────────────
  if (!description || typeof description !== "string" || description.trim() === "") {
    return next(new AppError("Event description is required", 400))
  }
  description = sanitizeString(description)
  if (description.length < 10) {
    return next(new AppError("Description must be at least 10 characters", 400))
  }
  if (description.length > 2000) {
    return next(new AppError("Description cannot exceed 2000 characters", 400))
  }

  // ── Date ──────────────────────────────────────────────
  if (!date) {
    return next(new AppError("Event date is required", 400))
  }
  if (!isValidDate(date)) {
    return next(new AppError("Invalid date format. Use YYYY-MM-DD", 400))
  }
  if (!isFutureDate(date)) {
    return next(new AppError("Event date must be in the future", 400))
  }

  // ── Time ──────────────────────────────────────────────
  if (!time) {
    return next(new AppError("Event time is required", 400))
  }
  if (!isValidTime(time)) {
    return next(new AppError("Invalid time format. Use HH:MM (24-hour)", 400))
  }

  // ── Location ──────────────────────────────────────────
  if (!location || typeof location !== "string" || location.trim() === "") {
    return next(new AppError("Event location/link is required", 400))
  }

  // ── Max Participants ──────────────────────────────────
  if (maxParticipants !== undefined) {
    const max = parseInt(maxParticipants)
    if (isNaN(max) || max < 1) {
      return next(new AppError("maxParticipants must be a positive number", 400))
    }
    if (max > 10000) {
      return next(new AppError("maxParticipants cannot exceed 10,000", 400))
    }
    req.body.maxParticipants = max
  }

  // Sanitized values
  req.body.title = title
  req.body.description = description
  req.body.location = sanitizeString(location)

  next()
}

const validateUpdateEvent = (req, res, next) => {
  const { title, description, date, time, location, maxParticipants } = req.body

  // Update me koi bhi field dono honi chahiye
  const allowedFields = ["title", "description", "date", "time", "location", "maxParticipants"]
  const providedFields = Object.keys(req.body).filter((key) =>
    allowedFields.includes(key)
  )

  if (providedFields.length === 0) {
    return next(
      new AppError(
        `Provide at least one field to update: ${allowedFields.join(", ")}`,
        400
      )
    )
  }

  // Sirf jo fields diye hain unhe validate karo
  if (title !== undefined) {
    if (typeof title !== "string" || title.trim() === "") {
      return next(new AppError("Title cannot be empty", 400))
    }
    if (title.trim().length < 3 || title.trim().length > 100) {
      return next(new AppError("Title must be between 3 and 100 characters", 400))
    }
    req.body.title = sanitizeString(title)
  }

  if (description !== undefined) {
    if (typeof description !== "string" || description.trim() === "") {
      return next(new AppError("Description cannot be empty", 400))
    }
    if (description.trim().length < 10 || description.trim().length > 2000) {
      return next(new AppError("Description must be between 10 and 2000 characters", 400))
    }
    req.body.description = sanitizeString(description)
  }

  if (date !== undefined) {
    if (!isValidDate(date)) {
      return next(new AppError("Invalid date format. Use YYYY-MM-DD", 400))
    }
    if (!isFutureDate(date)) {
      return next(new AppError("Event date must be in the future", 400))
    }
  }

  if (time !== undefined) {
    if (!isValidTime(time)) {
      return next(new AppError("Invalid time format. Use HH:MM (24-hour)", 400))
    }
  }

  if (location !== undefined) {
    if (typeof location !== "string" || location.trim() === "") {
      return next(new AppError("Location cannot be empty", 400))
    }
    req.body.location = sanitizeString(location)
  }

  if (maxParticipants !== undefined) {
    const max = parseInt(maxParticipants)
    if (isNaN(max) || max < 1) {
      return next(new AppError("maxParticipants must be a positive number", 400))
    }
    req.body.maxParticipants = max
  }

  next()
}

module.exports = {
  validateRegister,
  validateLogin,
  validateCreateEvent,
  validateUpdateEvent,
}