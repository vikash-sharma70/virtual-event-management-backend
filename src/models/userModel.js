const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Response me password kabhi nahi aayega
    },

    // ── Role field - NEWS AGGREGATOR ME NAHI THA ─────────
    // organizer: events bana/edit/delete kar sakta hai
    // attendee: events me register kar sakta hai
    role: {
      type: String,
      enum: {
        values: ["organizer", "attendee"],
        message: "Role must be either organizer or attendee",
      },
      default: "attendee",
    },

    // Registered events track karne ke liye
    // Registration model se populate hoga
    registeredEvents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
  },
  {
    timestamps: true,

    toJSON: {
      transform: function (doc, ret) {
        delete ret.password
        delete ret.__v
        return ret
      },
    },
  }
)

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12
  this.password = await bcrypt.hash(this.password, saltRounds)
})

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model("User", userSchema)

module.exports = User