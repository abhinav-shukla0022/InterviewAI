const mongoose = require("mongoose")

const ResumeAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    rawText: {
      type: String,
      default: ""
    },
    parsedSummary: {
      type: String,
      default: ""
    },
    skills: {
      type: [String],
      default: []
    },
    weakSkills: {
      type: [String],
      default: []
    },
    targetRoles: {
      type: [String],
      default: []
    },
    resumeScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    gapSummary: {
      type: String,
      default: ""
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model("ResumeAnalysis", ResumeAnalysisSchema)