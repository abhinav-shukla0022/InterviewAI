const mongoose = require("mongoose")

const InterviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    sessionId: {
      type: String,
      index: true,
      default: null
    },
    track: {
      type: String,
      default: "general"
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium"
    },
    questions: {
      type: [String],
      default: []
    },
    question: {
      type: String,
      default: ""
    },
    currentQuestionIndex: {
      type: Number,
      default: 0
    },
    answers: {
      type: [String],
      default: []
    },
    feedbacks: {
      type: [String],
      default: []
    },
    scores: {
      type: [Number],
      default: []
    },
    answer: {
      type: String,
      default: ""
    },
    feedback: {
      type: String,
      default: ""
    },
    overallScore: {
      type: Number,
      default: 0
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model("Interview", InterviewSchema)