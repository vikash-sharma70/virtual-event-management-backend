const express = require("express")
const router = express.Router()
const registrationController = require("../controllers/registrationController")
const { protect } = require("../middleware/authMiddleware")

router.get(
  "/registrations",
  protect,
  registrationController.getUserRegistrations
)

module.exports = router