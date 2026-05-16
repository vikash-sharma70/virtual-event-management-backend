const mongoose = require("mongoose")

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    description: {
      type: String,
      required: [true, "Event description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    date: {
      type: String, 
      required: [true, "Event date is required"],
    },

    time: {
      type: String, 
      required: [true, "Event time is required"],
    },

    location: {
      type: String,
      required: [true, "Event location is required"],
      trim: true,
    },

    maxParticipants: {
      type: Number,
      default: 100,
      min: [1, "maxParticipants must be at least 1"],
      max: [10000, "maxParticipants cannot exceed 10,000"],
    },

    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Organizer is required"],
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    status: {
      type: String,
      enum: {
        values: ["upcoming", "ongoing", "completed", "cancelled"],
        message: "Invalid status value",
      },
      default: "upcoming",
    },

    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,

    toJSON: {
      virtuals: true, 
      transform: function (doc, ret) {
        delete ret.__v
        return ret
      },
    },
  }
)

eventSchema.virtual("participantCount").get(function () {
  return this.participants.length
})

eventSchema.virtual("isFull").get(function () {
  return this.participants.length >= this.maxParticipants
})

eventSchema.virtual("availableSpots").get(function () {
  return Math.max(0, this.maxParticipants - this.participants.length)
})

eventSchema.index({ date: 1 })
eventSchema.index({ organizer: 1 })
eventSchema.index({ status: 1 })
eventSchema.index({ title: "text", description: "text" }) 

const Event = mongoose.model("Event", eventSchema)

module.exports = Event