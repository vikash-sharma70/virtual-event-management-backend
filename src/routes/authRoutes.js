const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const { validateRegister, validateLogin } = require("../middleware/validator")
const { protect } = require("../middleware/authMiddleware")
const { authLimiter } = require("../middleware/rateLimiter")

router.post("/register", authLimiter, validateRegister, authController.register)
router.post("/login", authLimiter, validateLogin, authController.login)

router.get("/me", protect, authController.getMe)

module.exports = router