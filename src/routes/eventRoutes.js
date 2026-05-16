const express = require("express")
const router = express.Router()
const eventController = require("../controllers/eventController")
const registrationController = require("../controllers/registrationController")
const { protect } = require("../middleware/authMiddleware")
const { isOrganizer } = require("../middleware/roleMiddleware")
const { eventLimiter } = require("../middleware/rateLimiter")
const { validateCreateEvent, validateUpdateEvent } = require("../middleware/validator")

router.get("/", eventController.getAllEvents)

router.get(
  "/organizer/my-events",  
  protect,
  isOrganizer,
  eventController.getMyEvents
)

router.get("/:id", eventController.getEventById)

router.post(
  "/",
  protect,
  isOrganizer,
  eventLimiter,
  validateCreateEvent,
  eventController.createEvent
)

router.put(
  "/:id",
  protect,
  isOrganizer,
  validateUpdateEvent,
  eventController.updateEvent
)

router.delete(
  "/:id",
  protect,
  isOrganizer,
  eventController.deleteEvent
)

router.get(
  "/:id/participants",
  protect,
  isOrganizer,
  registrationController.getEventParticipants
)

router.post(
  "/:id/register",
  protect,
  registrationController.registerForEvent
)

router.delete(
  "/:id/register",
  protect,
  registrationController.cancelRegistration
)

module.exports = router