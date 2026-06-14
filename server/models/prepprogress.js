const mongoose = require("mongoose")

const PrepProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    field: {
      type: String,
      required: true
    },
    notes: {
      type: [String],
      default: []
    },
    checklist: {
      type: [Boolean],
      default: []
    },
    watchedVideos: {
      type: [Number],
      default: []
    }
  },
  { timestamps: true }
)

// One document per user per field
PrepProgressSchema.index({ user: 1, field: 1 }, { unique: true })

module.exports = mongoose.model("PrepProgress", PrepProgressSchema)