const eventService = require("../services/eventService")
const asyncHandler = require("../utils/asyncHandler")
const { sendSuccess } = require("../utils/responseHandler")

exports.createEvent = asyncHandler(async (req, res) => {
  const event = await eventService.createEvent(req.user._id, req.body)

  sendSuccess(res, 201, "Event created successfully", { event })
})

exports.getAllEvents = asyncHandler(async (req, res) => {
  const result = await eventService.getAllEvents(req.query)

  sendSuccess(res, 200, "Events fetched successfully", result)
})

exports.getMyEvents = asyncHandler(async (req, res) => {
  const events = await eventService.getMyEvents(req.user._id)

  sendSuccess(res, 200, "Your events fetched successfully", {
    count: events.length,
    events,
  })
})

exports.getEventById = asyncHandler(async (req, res) => {
  const event = await eventService.getEventById(req.params.id)

  sendSuccess(res, 200, "Event fetched successfully", { event })
})

exports.updateEvent = asyncHandler(async (req, res) => {
  const event = await eventService.updateEvent(
    req.params.id,
    req.user._id,
    req.body
  )

  sendSuccess(res, 200, "Event updated successfully", { event })
})

exports.deleteEvent = asyncHandler(async (req, res) => {
  const result = await eventService.deleteEvent(req.params.id, req.user._id)

  sendSuccess(res, 200, result.message, null)
})