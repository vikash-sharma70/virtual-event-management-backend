const registrationService = require("../services/registrationService")
const asyncHandler = require("../utils/asyncHandler")
const { sendSuccess } = require("../utils/responseHandler")

exports.registerForEvent = asyncHandler(async (req, res) => {
  const registration = await registrationService.registerForEvent(
    req.user._id,
    req.params.id
  )

  sendSuccess(res, 201, "Successfully registered for the event. Check your email for confirmation!", {
    registration,
  })
})

exports.getEventParticipants = asyncHandler(async (req, res) => {
  const result = await registrationService.getEventParticipants(
    req.params.id,
    req.user._id
  )

  sendSuccess(res, 200, "Participants fetched successfully", result)
})

exports.getUserRegistrations = asyncHandler(async (req, res) => {
  const registrations = await registrationService.getUserRegistrations(
    req.user._id
  )

  sendSuccess(res, 200, "Your registrations fetched successfully", {
    count: registrations.length,
    registrations,
  })
})

exports.cancelRegistration = asyncHandler(async (req, res) => {
  const result = await registrationService.cancelRegistration(
    req.user._id,
    req.params.id
  )

  sendSuccess(res, 200, result.message, null)
})