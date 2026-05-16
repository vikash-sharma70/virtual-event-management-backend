const Event = require("../models/eventModel")
const Registration = require("../models/registrationModel")
const { checkEventOwnership } = require("../middleware/roleMiddleware")
const AppError = require("../utils/AppError")

const createEvent = async (organizerId, eventData) => {
  const { title, description, date, time, location, maxParticipants, tags } = eventData

  const event = await Event.create({
    title,
    description,
    date,
    time,
    location,
    maxParticipants: maxParticipants || 100,
    tags: tags || [],
    organizer: organizerId,
    participants: [],
  })

  await event.populate("organizer", "name email")

  return event
}

const getAllEvents = async (query = {}) => {
  const {
    status,
    date,
    search,
    page = 1,
    limit = 10,
    sortBy = "date",
    order = "asc",
  } = query

  const filter = {}

  if (status) filter.status = status

  if (date) filter.date = date

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ]
  }

  const pageNum = Math.max(1, parseInt(page))
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)))
  const skip = (pageNum - 1) * limitNum

  const sortOrder = order === "desc" ? -1 : 1
  const sortObj = { [sortBy]: sortOrder }

  const [events, totalCount] = await Promise.all([
    Event.find(filter)
      .populate("organizer", "name email")
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum),
    Event.countDocuments(filter),
  ])

  return {
    events,
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      totalEvents: totalCount,
      limit: limitNum,
      hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
      hasPrevPage: pageNum > 1,
    },
  }
}

const getEventById = async (eventId) => {
  const event = await Event.findById(eventId)
    .populate("organizer", "name email")
    .populate("participants", "name email")

  if (!event) {
    throw new AppError("Event not found", 404)
  }

  return event
}

const updateEvent = async (eventId, organizerId, updateData) => {
  const event = await Event.findById(eventId)

  if (!event) {
    throw new AppError("Event not found", 404)
  }

  checkEventOwnership(event, organizerId)

  if (event.status === "cancelled") {
    throw new AppError("Cannot update a cancelled event", 400)
  }

  const allowedUpdates = [
    "title",
    "description",
    "date",
    "time",
    "location",
    "maxParticipants",
    "status",
    "tags",
  ]

  allowedUpdates.forEach((field) => {
    if (updateData[field] !== undefined) {
      event[field] = updateData[field]
    }
  })

  if (
    updateData.maxParticipants !== undefined &&
    updateData.maxParticipants < event.participants.length
  ) {
    throw new AppError(
      `Cannot set maxParticipants to ${updateData.maxParticipants}. 
       Event already has ${event.participants.length} registered participants.`,
      400
    )
  }

  await event.save()
  await event.populate("organizer", "name email")

  return event
}

const deleteEvent = async (eventId, organizerId) => {
  const event = await Event.findById(eventId)

  if (!event) {
    throw new AppError("Event not found", 404)
  }

  checkEventOwnership(event, organizerId)

  if (event.participants.length > 0) {
    event.status = "cancelled"
    await event.save()

    await Registration.updateMany(
      { event: eventId, status: "confirmed" },
      { status: "cancelled", cancelledAt: new Date() }
    )

    return {
      deleted: false,
      cancelled: true,
      message:
        "Event cancelled (had registered participants). All registrations have been cancelled.",
    }
  }

  await Event.findByIdAndDelete(eventId)

  return {
    deleted: true,
    cancelled: false,
    message: "Event deleted successfully",
  }
}

const getMyEvents = async (organizerId) => {
  const events = await Event.find({ organizer: organizerId })
    .populate("participants", "name email")
    .sort({ createdAt: -1 })

  return events
}

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getMyEvents,
}