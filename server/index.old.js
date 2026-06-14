const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()

const User = require("./models/user")
const { GoogleGenerativeAI } = require("@google/generative-ai")

const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const multer = require("multer")
const pdfParse = require("pdf-parse")
const fs = require("fs")

const axios = require("axios")

const Interview = require("./models/Interview")
const ResumeAnalysis = require("./models/ResumeAnalysis")
const crypto = require("crypto")

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
})

const interviewTracks = [
  {
    id: "frontend",
    label: "Frontend Engineer",
    description: "React, CSS, component design and modern UI logic.",
    themes: ["React hooks", "state management", "accessibility", "performance"]
  },
  {
    id: "backend",
    label: "Backend Engineer",
    description: "APIs, databases, authentication and architecture design.",
    themes: ["Node.js", "Express", "MongoDB", "REST patterns"]
  },
  {
    id: "fullstack",
    label: "Full Stack",
    description: "End-to-end system questions across frontend and backend.",
    themes: ["integration", "data flow", "deployment", "security"]
  },
  {
    id: "dsa",
    label: "DSA Interview",
    description: "Data structures, algorithms and code problem solving.",
    themes: ["arrays", "graphs", "search", "optimization"]
  },
  {
    id: "system-design",
    label: "System Design",
    description: "Scalable architecture, tradeoffs, APIs and reliability.",
    themes: ["architecture", "scaling", "microservices", "databases"]
  }
]

const resourceLibrary = [
  {
    title: "AI-Powered Interview Preparation",
    type: "YouTube Playlist",
    category: "General",
    url: "https://www.youtube.com/playlist?list=PLAIInterview",
    source: "YouTube"
  },
  {
    title: "Frontend Expert Track",
    type: "Playlist",
    category: "Frontend",
    url: "https://www.youtube.com/playlist?list=PLFrontendPrep",
    source: "YouTube"
  },
  {
    title: "Backend Interview Mastery",
    type: "Article",
    category: "Backend",
    url: "https://example.com/backend-interview-guide",
    source: "Article"
  },
  {
    title: "System Design Crash Course",
    type: "Playlist",
    category: "System Design",
    url: "https://www.youtube.com/playlist?list=PLSystemDesign",
    source: "YouTube"
  }
]

const app = express()

const JWT_SECRET = process.env.JWT_SECRET || "secretkey"

app.use(cors())
app.use(express.json())

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json("Unauthorized")
  }

  const token = authHeader.split(" ")[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = { id: decoded.id }
    next()
  } catch (error) {
    return res.status(401).json("Unauthorized")
  }
}


// =======================================
// MULTER SETUP
// =======================================

const storage = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, "uploads")
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname)
  }

})

const upload = multer({ storage: storage })



// =======================================
// MONGODB CONNECTION
// =======================================

mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err))



// =======================================
// HOME ROUTE
// =======================================

app.get("/", (req, res) => {
  res.send("Backend Running")
})



// =======================================
// SIGNUP API
// =======================================

app.post("/signup", async (req, res) => {

  const { name, email, password } = req.body

  try {

    // CHECK USER
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.json("User Already Exists")
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10)

    // CREATE USER
    const user = new User({
      name,
      email,
      password: hashedPassword
    })

    await user.save()

    res.json("Signup Successful")

  } catch (error) {

    console.log(error)

    res.json(error)

  }

})



// =======================================
// LOGIN API
// =======================================

app.post("/login", async (req, res) => {

  const { email, password } = req.body

  try {

    // FIND USER
    const user = await User.findOne({ email })

    if (!user) {
      return res.json("User Not Found")
    }

    // CHECK PASSWORD
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.json("Wrong Password")
    }

    // CREATE TOKEN
    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET
    )

    res.json({
      message: "Login Successful",
      token,
      name: user.name,
      email: user.email
    })

  } catch (error) {

    console.log(error)

    res.json(error)

  }

})



// =======================================
// RESUME UPLOAD API
// =======================================

app.post("/upload-resume", upload.single("resume"), async (req, res) => {

  try {

    const dataBuffer = fs.readFileSync(req.file.path)

    const pdfData = await pdfParse(dataBuffer)

    res.json({
      message: "Resume Uploaded Successfully",
      text: pdfData.text
    })

  } catch (error) {

    console.log(error)

    res.json(error)

  }

})



// =======================================
// AI QUESTION GENERATOR API
// =======================================

app.post("/generate-question", async (req, res) => {

  try {

    const { resumeText } = req.body

    const prompt = `
You are a technical interviewer.

Resume:
${resumeText}

Rules:
- Ask exactly ONE technical interview question
- Maximum 20 words
- Must end with a question mark
- Use technologies mentioned in the resume
- Do NOT summarize the resume
- Do NOT explain anything
- Do NOT output difficulty
- Do NOT output labels
- Output ONLY the question
`

    const result = await model.generateContent(prompt)

    let questionText =
      result.response.text().trim()

    questionText = questionText
      .replace(/^Question:\s*/i, "")
      .replace(/^["']|["']$/g, "")
      .trim()

    res.json({
      question: questionText
    })

  } catch (error) {

    console.log(error)

    res.json({
      question: "Unable to generate question"
    })

  }

})

app.post("/evaluate-answer", authenticate, async (req, res) => {

  try {

    const { question, answer } = req.body

    const prompt = `
You are a strict technical interviewer.

Question:
${question}

Candidate Answer:
${answer}

Evaluate ONLY the answer.

Return EXACTLY:

Overall Score: X/10
Technical Knowledge: X/10
Communication: X/10
Confidence: X/10
Improvement Tip: one short sentence

Rules:
- Use only numbers 1-10
- No markdown
- No extra text
- No explanations
`

    const result = await model.generateContent(prompt)

    const feedbackText = result.response.text()

    console.log(feedbackText)

    const overallScoreMatch =
      feedbackText.match(/Overall\\s*Score:\\s*(\\d+)/i)

    const overallScore =
      overallScoreMatch
        ? parseInt(overallScoreMatch[1])
        : 5

    const newInterview = new Interview({
      user: req.user.id,
      question,
      answer,
      feedback: feedbackText,
      overallScore
    })

    await newInterview.save()

    res.json({
      feedback: feedbackText
    })

  } catch(error){

  console.log("========== ERROR ==========")
  console.log(error)
  console.log(error.message)
  console.log("==========================")

  res.json({
    feedback:"Failed to evaluate answer"
  })



  }

})

app.get("/history", authenticate, async (req, res) => {

  try {
    const interviews = await Interview.find({ user: req.user.id }).sort({ createdAt: -1 })
    res.json(interviews)
  } catch (error) {
    console.log(error)
    res.json(error)
  }

})

app.delete("/delete-history/:id", authenticate, async (req, res) => {

  try {
    const interview = await Interview.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    })

    if (!interview) {
      return res.status(404).json("Interview not found or unauthorized")
    }

    res.json({
      message: "Interview Deleted"
    })
  } catch (error) {
    console.log(error)
    res.json(error)
  }

})

// =======================================
// SERVER
// =======================================

app.listen(5000, () => {
  console.log("Server Started")
})
