const Registration = require("../models/registrationModel")
const Event = require("../models/eventModel")
const User = require("../models/userModel")
const { sendRegistrationConfirmation } = require("./emailService")
const AppError = require("../utils/AppError")

// ─── EVENT ME REGISTER KARO ───────────────────────────
const registerForEvent = async (userId, eventId) => {
  // ── Step 1: Event exist karta hai? ──────────────────
  const event = await Event.findById(eventId).populate(
    "organizer",
    "name email"
  )

  if (!event) {
    throw new AppError("Event not found", 404)
  }

  // ── Step 2: Event upcoming hai? ─────────────────────
  if (event.status === "cancelled") {
    throw new AppError("Cannot register for a cancelled event", 400)
  }

  if (event.status === "completed") {
    throw new AppError("Cannot register for a completed event", 400)
  }

  // ── Step 3: Past event check ─────────────────────────
  const eventDateTime = new Date(`${event.date}T${event.time}`)
  if (eventDateTime < new Date()) {
    throw new AppError("Cannot register for a past event", 400)
  }

  // ── Step 4: Already registered? ─────────────────────
  const existingRegistration = await Registration.findOne({
    user: userId,
    event: eventId,
  })

  if (existingRegistration) {
    if (existingRegistration.status === "confirmed") {
      throw new AppError("You are already registered for this event", 409)
    }
    // Pehle cancel kiya tha - re-register karo
    if (existingRegistration.status === "cancelled") {
      throw new AppError(
        "You had previously cancelled your registration. Please contact the organizer.",
        400
      )
    }
  }

  // ── Step 5: Organizer apne event me register nahi kar sakta ──
  if (event.organizer._id.toString() === userId.toString()) {
    throw new AppError(
      "Organizers cannot register for their own events",
      400
    )
  }

  // ── Step 6: Event full hai? ──────────────────────────
  if (event.participants.length >= event.maxParticipants) {
    throw new AppError(
      `Event is full. Maximum ${event.maxParticipants} participants allowed.`,
      400
    )
  }

  // ── Step 7: Registration create karo ────────────────
  const registration = await Registration.create({
    user: userId,
    event: eventId,
    status: "confirmed",
  })

  // ── Step 8: Event ke participants array me add karo ──
  await Event.findByIdAndUpdate(eventId, {
    $addToSet: { participants: userId }, // addToSet = duplicate nahi add hoga
  })

  // ── Step 9: User ke registeredEvents me add karo ────
  await User.findByIdAndUpdate(userId, {
    $addToSet: { registeredEvents: eventId },
  })

  // ── Step 10: Populated registration return karo ──────
  await registration.populate([
    { path: "user", select: "name email" },
    { path: "event", select: "title date time location" },
  ])

  // ── Step 11: Confirmation email bhejo (async) ────────
  const user = await User.findById(userId)
  sendRegistrationConfirmation({ user, event }).catch((err) => {
    console.error("Registration email failed:", err.message)
  })

  return registration
}

// ─── USER KI SAARI REGISTRATIONS ─────────────────────
const getUserRegistrations = async (userId) => {
  const registrations = await Registration.find({
    user: userId,
    status: "confirmed",
  })
    .populate({
      path: "event",
      select: "title description date time location status organizer",
      populate: { path: "organizer", select: "name email" },
    })
    .sort({ registeredAt: -1 })

  return registrations
}

// ─── EVENT KE SAARE PARTICIPANTS ──────────────────────
const getEventParticipants = async (eventId, organizerId) => {
  const event = await Event.findById(eventId)

  if (!event) {
    throw new AppError("Event not found", 404)
  }

  // Sirf organizer apne event ke participants dekh sakta hai
  if (event.organizer.toString() !== organizerId.toString()) {
    throw new AppError(
      "Access denied. Only the event organizer can view participants.",
      403
    )
  }

  const registrations = await Registration.find({
    event: eventId,
    status: "confirmed",
  })
    .populate("user", "name email createdAt")
    .sort({ registeredAt: 1 })

  return {
    event: {
      title: event.title,
      date: event.date,
      time: event.time,
      maxParticipants: event.maxParticipants,
      currentParticipants: registrations.length,
      availableSpots: event.maxParticipants - registrations.length,
    },
    participants: registrations.map((r) => ({
      user: r.user,
      registeredAt: r.registeredAt,
      status: r.status,
    })),
  }
}

const cancelRegistration = async (userId, eventId) => {
  const registration = await Registration.findOne({
    user: userId,
    event: eventId,
    status: "confirmed",
  })

  if (!registration) {
    throw new AppError(
      "No active registration found for this event",
      404
    )
  }

  const event = await Event.findById(eventId)
  if (!event) {
    throw new AppError("Event not found", 404)
  }

  const eventDateTime = new Date(`${event.date}T${event.time}`)
  if (eventDateTime < new Date()) {
    throw new AppError("Cannot cancel registration for a past event", 400)
  }

  registration.status = "cancelled"
  registration.cancelledAt = new Date()
  await registration.save()

  await Event.findByIdAndUpdate(eventId, {
    $pull: { participants: userId },
  })

  await User.findByIdAndUpdate(userId, {
    $pull: { registeredEvents: eventId },
  })

  return {
    message: "Registration cancelled successfully",
    eventTitle: event.title,
  }
}

module.exports = {
  registerForEvent,
  getUserRegistrations,
  getEventParticipants,
  cancelRegistration,
}