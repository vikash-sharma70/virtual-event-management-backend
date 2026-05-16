const mongoose = require("mongoose")

const registrationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    status: {
      type: String,
      enum: {
        values: ["confirmed", "cancelled", "waitlisted"],
        message: "Invalid registration status",
      },
      default: "confirmed",
    },

    registeredAt: {
      type: Date,
      default: Date.now,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      maxlength: 500,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v
        return ret
      },
    },
  }
)

registrationSchema.index({ user: 1, event: 1 }, { unique: true })

const Registration = mongoose.model("Registration", registrationSchema)

module.exports = Registration