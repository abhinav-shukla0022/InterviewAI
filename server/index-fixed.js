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

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: "gemini-pro" })

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

    const { resumeText, difficulty } = req.body

    // Ultra-strict prompt for Gemini
    const prompt = `RESUME:
${resumeText}

TASK: Ask 1 technical question based on this resume.

OUTPUT EXACTLY THIS FORMAT - NOTHING ELSE:
Question: [question - max 10 words]
Difficulty: [number]/10

DO NOT ADD:
- "Hi", "Hello", "User", "Let me", "I will", "Based on"
- Any introduction or explanation
- Any text except the 2 lines above

START OUTPUT:`

    const result = await model.generateContent(prompt)
    const rawText = result.response.text()

    // Extract lines
    const lines = rawText.split("\n").map(l => l.trim()).filter(l => l)
    
    let questionText = ""
    let difficultyVal = "5"

    // Find the line with "Question:"
    for (const line of lines) {
      if (line.toLowerCase().includes("question:")) {
        questionText = line.replace(/^Question:\s*/i, "").trim()
        break
      }
    }

    // Find the line with "Difficulty:"
    for (const line of lines) {
      if (line.toLowerCase().includes("difficulty:")) {
        const match = line.match(/(\d+)\/10/i)
        if (match) {
          difficultyVal = match[1]
        }
        break
      }
    }

    // Additional cleanup - remove any conversational patterns
    const badPatterns = [
      /^(Hi|Hello|Hey|User|Let me|I will|Based on|As an|You are|I am).+?[:.!?]?\s*/i,
      /^(Here|There|This|That|The question|A question).+?[:.!?]?\s*/i,
      /^(Do you|Can you|Would you|Should you).+?[:.!?]?\s*/i
    ]

    for (const pattern of badPatterns) {
      questionText = questionText.replace(pattern, "").trim()
    }

    // Ensure it doesn't exceed reasonable length
    if (questionText.length > 100) {
      questionText = questionText.substring(0, 100)
    }

    // Validate we have a real question
    if (!questionText || questionText.length < 5) {
      questionText = "What technical skills from your resume would you like to discuss?"
    }

    res.json({
      question: questionText,
      difficulty: difficultyVal
    })

  } catch (error) {
    console.log(error)
    res.json({ error: error.message, question: "Failed to generate question" })
  }

})

app.post("/evaluate-answer", authenticate, async (req, res) => {

  try {

    const { question, answer } = req.body

    const prompt = `Q: ${question}
A: ${answer}

Score 1-10 for each. Output ONLY:

Overall Score: X/10
Technical Knowledge: X/10
Communication: X/10
Confidence: X/10
Improvement Tip: [one sentence]`

    const result = await model.generateContent(prompt)
    const feedbackText = result.response.text()

    const overallScoreMatch = feedbackText.match(/Overall\s*Score:\s*(\d+)/i)
    const overallScore = overallScoreMatch ? parseInt(overallScoreMatch[1]) : 5

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

  } catch (error) {

    console.log(error)

    res.json({ error: error.message, feedback: "Failed to evaluate answer" })

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
