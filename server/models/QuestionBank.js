const mongoose = require("mongoose")

const QuestionBankSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    track: {
      type: String,
      required: true,
      index: true,
      default: "general"
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
      index: true,
      default: "Medium"
    },
    question: {
      type: String,
      required: true
    },
    topic: {
      type: String,
      default: ""
    },
    type: {
      type: String,
      default: "technical"
    },
    status: {
      type: String,
      enum: ["unused", "used"],
      default: "unused",
      index: true
    },
    batchId: {
      type: String,
      index: true
    },
    sessionId: {
      type: String,
      default: null
    },
    usedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
)

QuestionBankSchema.index({ user: 1, track: 1, difficulty: 1, status: 1, createdAt: 1 })

module.exports = mongoose.model("QuestionBank", QuestionBankSchema)