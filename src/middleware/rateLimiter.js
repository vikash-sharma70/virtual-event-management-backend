const rateLimit = require("express-rate-limit")

// ─── AUTH ROUTES LIMITER ───────────────────────────────
// Login/Register pe strict - brute force attacks se bachao
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // 10 attempts only
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      status: "fail",
      message: "Too many attempts from this IP. Please try again after 15 minutes.",
    })
  },
  skipSuccessfulRequests: false,
})

// ─── EVENT ROUTES LIMITER ─────────────────────────────
const eventLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,             // 60 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      status: "fail",
      message: "Too many event requests. Please slow down.",
    })
  },
})

// ─── GLOBAL API LIMITER ────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,                  // 200 requests per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      status: "fail",
      message: "Too many requests from this IP. Please try again later.",
    })
  },
})

module.exports = { authLimiter, eventLimiter, globalLimiter }