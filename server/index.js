const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()

const User = require("./models/user")
const Interview = require("./models/Interview")
const ResumeAnalysis = require("./models/ResumeAnalysis")
// ADD THIS LINE after your existing model imports
const PrepProgress = require("./models/PrepProgress")
const { GoogleGenerativeAI } = require("@google/generative-ai")

const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const multer = require("multer")
const pdfParse = require("pdf-parse")
const fs = require("fs")
const path = require("path")

// ─── Upload Directory ─────────────────────────────────────────────────────────
const uploadDirectory = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true })
}

// ─── Gemini Setup ─────────────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

const callGeminiWithRetry = async (prompt, maxRetries = 3) => {
  let lastError
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Gemini timeout after 30s")), 30000)
        )
      ])
      const text = result.response.text()
      if (!text || text.trim().length === 0) {
        throw new Error("Empty response from Gemini API")
      }
      // Strip markdown fences Gemini sometimes wraps around JSON
      return text.replace(/```(?:json)?\s*/gi, "").replace(/```\s*/gi, "").trim()
    } catch (error) {
      lastError = error
      console.error(`Gemini attempt ${i + 1} failed:`, error.message)
      if (i < maxRetries - 1) {
        const wait = Math.pow(2, i) * 1000 + Math.random() * 500
        console.log(`Retrying in ${Math.round(wait)}ms…`)
        await new Promise((r) => setTimeout(r, wait))
      }
    }
  }
  throw lastError || new Error("Gemini API failed after all retries")
}

// ─── App & Middleware ─────────────────────────────────────────────────────────
const app = express()
const JWT_SECRET = process.env.JWT_SECRET || "secretkey"

app.use(cors())
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// ─── Auth Middleware ──────────────────────────────────────────────────────────
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" })
  }
  const token = authHeader.split(" ")[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = { id: decoded.id }
    next()
  } catch {
    return res.status(401).json({ error: "Unauthorized – invalid token" })
  }
}

// ─── Multer ───────────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDirectory),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")
    cb(null, `${Date.now()}-${safeName}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true)
    } else {
      cb(new Error("Only PDF files are allowed"), false)
    }
  }
})

// ─── Database ─────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err))

// ─── Static Data ──────────────────────────────────────────────────────────────
const interviewTracks = [
  {
    id: "frontend",
    label: "Frontend Engineer",
    description: "React, component design, state and UI logic.",
    themes: ["React hooks", "CSS", "performance", "UX"]
  },
  {
    id: "backend",
    label: "Backend Engineer",
    description: "APIs, databases, security and architecture.",
    themes: ["Node.js", "Express", "MongoDB", "auth"]
  },
  {
    id: "fullstack",
    label: "Full Stack",
    description: "End-to-end system questions with integration.",
    themes: ["data flow", "APIs", "deployment", "security"]
  },
  {
    id: "dsa",
    label: "DSA Interview",
    description: "Data structures, algorithms and optimization.",
    themes: ["arrays", "graphs", "trees", "complexity"]
  },
  {
    id: "system-design",
    label: "System Design",
    description: "Scalable architecture, tradeoffs, and reliability.",
    themes: ["architecture", "scaling", "databases", "APIs"]
  }
]

const resourceLibrary = [
  {
    title: "AI-Driven Interview Prep",
    type: "YouTube Playlist",
    category: "General",
    source: "YouTube",
    url: "https://www.youtube.com/playlist?list=PLh_njhZ_MgInazcDWlX1RlpwIIYACSyIJ"
  },
  {
    title: "Frontend Mastery",
    type: "Playlist",
    category: "Frontend",
    source: "YouTube",
    url: "https://www.youtube.com/playlist?list=PLu0W_9lII9ahR1blWXxgSlL4y9iQBnLpR"
  },
  {
    title: "Backend Interview Mastery",
    type: "Article",
    category: "Backend",
    source: "Article",
    url: "https://www.youtube.com/watch?v=ChVE-JbtYbM&t=34253s"
  },
  {
    title: "System Design Crash Course",
    type: "Playlist",
    category: "System Design",
    source: "YouTube",
    url: "https://www.youtube.com/playlist?list=PLh_njhZ_MgInazcDWlX1RlpwIIYACSyIJ"
  }
]

// ════════════════════════════════════════════════════════════════════════════
//  ROUTES
// ════════════════════════════════════════════════════════════════════════════

app.get("/", (req, res) => res.send("Backend Running"))

// ─── Signup ───────────────────────────────────────────────────────────────────
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields are required." })

    const existing = await User.findOne({ email })
    console.log("EMAIL RECEIVED:", email)
console.log("EXISTING USER:", existing)
    if (existing)
      return res.status(409).json({ error: "User already exists." })

    const hashed = await bcrypt.hash(password, 10)
    await new User({ name, email, password: hashed }).save()
    res.json({ message: "Signup successful." })
  } catch (err) {
    console.error("Signup error:", err)
    res.status(500).json({ error: "Signup failed. Please try again." })
  }
})

// ─── Login ────────────────────────────────────────────────────────────────────
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required." })

    const user = await User.findOne({ email })
    if (!user)
      return res.status(404).json({ error: "User not found." })

    const match = await bcrypt.compare(password, user.password)
    if (!match)
      return res.status(401).json({ error: "Wrong password." })

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" })
    res.json({ message: "Login successful.", token, name: user.name, email: user.email })
  } catch (err) {
    console.error("Login error:", err)
    res.status(500).json({ error: "Login failed. Please try again." })
  }
})

// ─── Resume Upload ────────────────────────────────────────────────────────────
app.post("/upload-resume", upload.single("resume"), async (req, res) => {
  let filePath = null
  try {
    if (!req.file)
      return res.status(400).json({ error: "No PDF file uploaded." })

    filePath = req.file.path
    const buffer = fs.readFileSync(filePath)
    const pdfData = await pdfParse(buffer)

    if (!pdfData.text || pdfData.text.trim().length === 0)
      return res.status(422).json({ error: "Could not extract text from PDF. Make sure it is not a scanned image." })

    res.json({ message: "Resume uploaded successfully.", text: pdfData.text.trim() })
  } catch (err) {
    console.error("Upload error:", err)
    res.status(500).json({ error: err.message || "Resume upload failed." })
  } finally {
    if (filePath && fs.existsSync(filePath)) fs.unlink(filePath, () => {})
  }
})

// Multer error handler — must stay right after the upload route
app.use((err, req, res, next) => {
  if (err && err.message === "Only PDF files are allowed")
    return res.status(400).json({ error: "Only PDF files are allowed." })
  if (err && err.code === "LIMIT_FILE_SIZE")
    return res.status(413).json({ error: "File too large. Maximum 10 MB." })
  next(err)
})

// ─── Resume Analysis ──────────────────────────────────────────────────────────
app.post("/api/resume/analyze", authenticate, async (req, res) => {
  try {
    const { resumeText, targetRole } = req.body
    if (!resumeText || resumeText.trim().length === 0)
      return res.status(400).json({ error: "Resume text is required." })

    const prompt = `Analyze the resume below and return EXACTLY this format with no extra text:

Resume Summary: <one sentence>
Top Skills: skill1, skill2, skill3, skill4, skill5
Suggested Roles: role1, role2, role3
Resume Score: <number 0-100>
Weak Skills: skillA, skillB, skillC
Gap Summary: <two sentences about gaps>

Resume:
${resumeText.substring(0, 4000)}`

    const output = await callGeminiWithRetry(prompt)
    const get = (pattern) => { const m = output.match(pattern); return m ? m[1].trim() : null }

    const analysis = new ResumeAnalysis({
      user: req.user.id,
      rawText: resumeText,
      parsedSummary: get(/Resume Summary:\s*([^\n]+)/i) || "Resume insights generated.",
      skills: (get(/Top Skills:\s*([^\n]+)/i) || "").split(/,\s*/).map(s => s.trim()).filter(Boolean),
      weakSkills: (get(/Weak Skills:\s*([^\n]+)/i) || "").split(/,\s*/).map(s => s.trim()).filter(Boolean),
      targetRoles: (get(/Suggested Roles:\s*([^\n]+)/i) || targetRole || "Software Engineer").split(/,\s*/).map(r => r.trim()).filter(Boolean),
      resumeScore: Math.min(100, Math.max(0, parseInt(get(/Resume Score:\s*(\d+)/i) || "65"))),
      gapSummary: get(/Gap Summary:\s*([\s\S]+)/i) || "Resume requires stronger alignment with target roles.",
      updatedAt: Date.now()
    })
    await analysis.save()

    res.json({
      summary: analysis.parsedSummary,
      skills: analysis.skills,
      weakSkills: analysis.weakSkills,
      targetRoles: analysis.targetRoles,
      resumeScore: analysis.resumeScore,
      gapSummary: analysis.gapSummary
    })
  } catch (err) {
    console.error("Resume analyze error:", err.message)
    res.status(500).json({ error: err.message || "Failed to analyze resume." })
  }
})

// ─── Skill Gap ────────────────────────────────────────────────────────────────
app.post("/api/prepare/skill-gap", authenticate, async (req, res) => {
  try {
    const { resumeText, targetRole } = req.body
    if (!resumeText || resumeText.trim().length === 0)
      return res.status(400).json({ error: "Resume text is required." })

    const prompt = `You are a career coach. Analyze the resume and produce a skill gap report with three labeled sections:

STRONG SKILLS: list skills the candidate has
NEEDS IMPROVEMENT: list skills that are weak
MISSING SKILLS: list skills required for the role but absent, each with one short recommendation

Target Role: ${targetRole || "Software Engineer"}

Resume:
${resumeText.substring(0, 4000)}`

    const output = await callGeminiWithRetry(prompt)
    res.json({ output })
  } catch (err) {
    console.error("Skill gap error:", err.message)
    res.status(500).json({ error: err.message || "Skill gap analysis failed." })
  }
})

// ─── Roadmap ──────────────────────────────────────────────────────────────────
app.post("/api/prepare/roadmap", authenticate, async (req, res) => {
  try {
    const { resumeText, targetRole } = req.body
    if (!resumeText || resumeText.trim().length === 0)
      return res.status(400).json({ error: "Resume text is required." })

    const prompt = `You are an AI mentor. Create a 4-week preparation roadmap for a candidate targeting "${targetRole || "Software Engineer"}".

Format each item EXACTLY as:
Week N: Title - detail

Output exactly 4 lines, one per week. No extra text.

Resume (for context):
${resumeText.substring(0, 2000)}`

    const output = await callGeminiWithRetry(prompt)

    const roadmap = output
      .split(/\n+/)
      .filter((line) => /^week\s*\d/i.test(line.trim()))
      .slice(0, 4)
      .map((line) => {
        const rest = line.slice(line.indexOf(":") + 1).trim()
        const dashIdx = rest.indexOf(" - ")
        return {
          title: dashIdx !== -1 ? rest.slice(0, dashIdx).trim() : rest,
          detail: dashIdx !== -1 ? rest.slice(dashIdx + 3).trim() : "Focus on core strategy tasks.",
          targetDate: null,
          status: "pending"
        }
      })

    if (roadmap.length === 0) {
      return res.json({
        roadmap: [
          { title: "Fundamentals", detail: "Review core concepts for your target role.", status: "pending", targetDate: null },
          { title: "Practice", detail: "Solve problems and build small projects.", status: "pending", targetDate: null },
          { title: "Mock Interviews", detail: "Practice with timed mock interviews.", status: "pending", targetDate: null },
          { title: "Polish", detail: "Review weak areas and finalise your resume.", status: "pending", targetDate: null }
        ]
      })
    }

    res.json({ roadmap })
  } catch (err) {
    console.error("Roadmap error:", err.message)
    res.status(500).json({ error: err.message || "Roadmap generation failed." })
  }
})

// ─── Interview Tracks ─────────────────────────────────────────────────────────
app.get("/api/interview-tracks", (req, res) => res.json(interviewTracks))

// ─── Mock Start (fetches all 10 questions at once) ────────────────────────────
app.post("/api/mock/start", authenticate, async (req, res) => {
  try {
    const { resumeText, track = "general", difficulty = "Medium" } = req.body

    const prompt = `You are a strict technical interviewer conducting a ${difficulty} difficulty ${track} interview.

Generate EXACTLY 10 interview questions based on the resume below.
Return ONLY a valid JSON array of 10 strings. No markdown, no explanation, no numbering.

Example:
["Question one?","Question two?","Question three?","Question four?","Question five?","Question six?","Question seven?","Question eight?","Question nine?","Question ten?"]

Resume:
${resumeText ? resumeText.substring(0, 3000) : `No resume provided. Generate general ${track} questions.`}`

    const raw = await callGeminiWithRetry(prompt)

    let questions = []
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        questions = parsed.map((q) => String(q).trim()).filter((q) => q.length > 5)
      }
    } catch {
      questions = raw
        .split(/\n+/)
        .map((l) => l.replace(/^\d+[\.\)]\s*/, "").replace(/^["']|["']$/g, "").trim())
        .filter((l) => l.length > 10)
        .slice(0, 10)
    }

    if (questions.length === 0)
      return res.status(500).json({ error: "Failed to generate questions. Please try again." })

    while (questions.length < 10) questions.push(`Tell me about your experience with ${track}.`)
    questions = questions.slice(0, 10)

    const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    await new Interview({
      user: req.user.id,
      sessionId,
      question: questions[0],
      questions,
      answers: [],
      feedbacks: [],
      scores: [],
      currentQuestionIndex: 0,
      track,
      difficulty,
      overallScore: 0
    }).save()

    res.json({
      sessionId,
      question: questions[0],
      questions,
      totalQuestions: questions.length,
      currentQuestion: 1
    })
  } catch (err) {
    console.error("Mock start error:", err.message)
    res.status(500).json({ error: err.message || "Failed to start interview." })
  }
})

// ─── Mock Answer ──────────────────────────────────────────────────────────────
app.post("/api/mock/answer", authenticate, async (req, res) => {
  try {
    const { sessionId, answer, questionIndex } = req.body

    if (!sessionId)
      return res.status(400).json({ error: "sessionId is required." })
    if (!answer || answer.trim().length === 0)
      return res.status(400).json({ error: "Answer is required." })

    const session = await Interview.findOne({ user: req.user.id, sessionId })
    if (!session)
      return res.status(404).json({ error: "Session not found. Please start a new interview." })

    const idx = questionIndex !== undefined ? questionIndex : session.currentQuestionIndex
    const currentQuestion = session.questions[idx] || session.question

    const prompt = `You are a strict technical interviewer. Evaluate only the candidate answer below.

Question: ${currentQuestion}
Candidate Answer: ${answer}

Return EXACTLY this format (no markdown, no extra text):
Overall Score: X/10
Technical Knowledge: X/10
Communication: X/10
Confidence: X/10
Improvement Tip: one short sentence`

    const feedbackText = await callGeminiWithRetry(prompt)
    const scoreMatch = feedbackText.match(/Overall\s*Score:\s*(\d+)/i)
    const overallScore = scoreMatch ? Math.min(10, Math.max(1, parseInt(scoreMatch[1]))) : 5

    session.answers[idx] = answer
    session.feedbacks[idx] = feedbackText
    session.scores[idx] = overallScore

    const nextIndex = idx + 1
    session.currentQuestionIndex = nextIndex
    const nextQuestion = session.questions[nextIndex] || null
    if (nextQuestion) session.question = nextQuestion

    const validScores = session.scores.filter((s) => typeof s === "number")
    session.overallScore = validScores.length
      ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
      : 0

    const finished = !nextQuestion
    if (finished) session.completedAt = new Date()

    await session.save()

    res.json({
      feedback: feedbackText,
      score: overallScore,
      nextQuestion,
      finished,
      currentQuestion: nextIndex + 1,
      totalQuestions: session.questions.length
    })
  } catch (err) {
    console.error("Mock answer error:", err.message)
    res.status(500).json({ error: err.message || "Failed to evaluate answer." })
  }
})

// ─── Mock Summary ─────────────────────────────────────────────────────────────
app.get("/api/mock/summary/:sessionId", authenticate, async (req, res) => {
  try {
    const session = await Interview.findOne({ user: req.user.id, sessionId: req.params.sessionId })
    if (!session)
      return res.status(404).json({ error: "Session not found." })

    const answered = (session.scores || []).filter((s) => typeof s === "number")
    const avgScore = answered.length
      ? (answered.reduce((a, b) => a + b, 0) / answered.length).toFixed(1)
      : 0

    res.json({
      sessionId: session.sessionId,
      track: session.track,
      difficulty: session.difficulty,
      questions: session.questions,
      answers: session.answers,
      feedbacks: session.feedbacks,
      scores: session.scores,
      overallScore: session.overallScore,
      avgScore,
      totalAnswered: answered.length,
      completedAt: session.completedAt
    })
  } catch (err) {
    console.error("Summary error:", err.message)
    res.status(500).json({ error: "Failed to load summary." })
  }
})

// ─── Resources ────────────────────────────────────────────────────────────────
app.get("/api/resources", (req, res) => res.json(resourceLibrary))

// ─── Performance Summary ──────────────────────────────────────────────────────
app.get("/api/performance/summary", authenticate, async (req, res) => {
  try {
    const sessions = await Interview.find({ user: req.user.id }).sort({ createdAt: -1 })
    const total = sessions.length
    const avgScore = total
      ? sessions.reduce((acc, s) => acc + (s.overallScore || 0), 0) / total
      : 0
    const bestScore = total ? Math.max(...sessions.map((s) => s.overallScore || 0)) : 0
    const scores = sessions.map((s) => ({ date: s.createdAt, score: s.overallScore || 0, track: s.track || "general" }))
    res.json({ total, avgScore: parseFloat(avgScore.toFixed(2)), bestScore, scores })
  } catch (err) {
    console.error("Performance error:", err)
    res.status(500).json({ error: "Failed to load performance summary." })
  }
})

// ─── Single Question Generator (quick-practice) ───────────────────────────────
app.post("/generate-question", async (req, res) => {
  try {
    const { resumeText } = req.body
    const prompt = `You are a technical interviewer.

Resume:
${resumeText ? resumeText.substring(0, 2000) : "General software engineering"}

Output ONLY a single technical interview question (max 25 words, must end with ?). No labels, no preamble.`

    const text = await callGeminiWithRetry(prompt)
    const question = text.replace(/^Question:\s*/i, "").replace(/^['"`]|['"`]$/g, "").trim()
    res.json({ question })
  } catch (err) {
    console.error("Generate question error:", err)
    res.status(500).json({ question: "What is a closure in JavaScript?" })
  }
})

// ─── Evaluate Single Answer (quick-practice) ─────────────────────────────────
app.post("/evaluate-answer", authenticate, async (req, res) => {
  try {
    const { question, answer } = req.body

    if (!question || question.trim().length === 0)
      return res.status(400).json({ error: "Question is required." })
    if (!answer || answer.trim().length === 0)
      return res.status(400).json({ error: "Answer is required." })

    const prompt = `You are a strict technical interviewer. Evaluate the candidate answer below.

Question: ${question}
Candidate Answer: ${answer}

Return EXACTLY this format with no markdown and no extra text:
Overall Score: X/10
Technical Knowledge: X/10
Communication: X/10
Confidence: X/10
Improvement Tip: one short sentence`

 const feedbackText = await callGeminiWithRetry(prompt)
    const scoreMatch = feedbackText.match(/Overall\s*Score:\s*(\d+)/i)
    const overallScore = scoreMatch ? Math.min(10, Math.max(1, parseInt(scoreMatch[1]))) : 5

    await new Interview({
      user: req.user.id,
      question,
      answer,
      feedback: feedbackText,
      overallScore,
      questions: [question],
      answers: [answer],
      feedbacks: [feedbackText],
      scores: [overallScore]
    }).save()

    res.json({ feedback: feedbackText, score: overallScore })
  } catch (err) {
    console.error("Evaluate answer error:", err.message)
    res.status(500).json({ error: err.message || "Failed to evaluate answer." })
  }
})

// ─── History ──────────────────────────────────────────────────────────────────
app.get("/history", authenticate, async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select("-rawText -__v")
    res.json(interviews)
  } catch (err) {
    console.error("History error:", err)
    res.status(500).json({ error: "Failed to load history." })
  }
})

app.delete("/delete-history/:id", authenticate, async (req, res) => {
  try {
    const deleted = await Interview.findOneAndDelete({ _id: req.params.id, user: req.user.id })
    if (!deleted)
      return res.status(404).json({ error: "Interview not found or unauthorized." })
    res.json({ message: "Interview deleted." })
  } catch (err) {
    console.error("Delete error:", err)
    res.status(500).json({ error: "Failed to delete interview." })
  }
})

// ─── Prep Progress: GET ───────────────────────────────────────────────────────
app.get("/prep-progress/:field", authenticate, async (req, res) => {
  try {
    const { field } = req.params
    const progress = await PrepProgress.findOne({ user: req.user.id, field })
    if (!progress) {
      return res.json({ notes: [], checklist: [], watchedVideos: [] })
    }
    res.json({
      notes: progress.notes,
      checklist: progress.checklist,
      watchedVideos: progress.watchedVideos
    })
  } catch (err) {
    console.error("Get prep progress error:", err)
    res.status(500).json({ error: "Failed to load prep progress." })
  }
})

// ─── Prep Progress: SAVE ──────────────────────────────────────────────────────
app.post("/prep-progress/save", authenticate, async (req, res) => {
  try {
    const { field, notes, checklist, watchedVideos } = req.body
    if (!field) return res.status(400).json({ error: "Field is required." })

    await PrepProgress.findOneAndUpdate(
      { user: req.user.id, field },
      { notes, checklist, watchedVideos },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    res.json({ message: "Progress saved." })
  } catch (err) {
    console.error("Save prep progress error:", err)
    res.status(500).json({ error: "Failed to save prep progress." })
  }
})

// ─── Prep Progress: DELETE NOTE ───────────────────────────────────────────────
app.delete("/prep-note/:field/:noteIndex", authenticate, async (req, res) => {
  try {
    const { field, noteIndex } = req.params
    const idx = parseInt(noteIndex)
    if (isNaN(idx)) return res.status(400).json({ error: "Invalid note index." })

    const progress = await PrepProgress.findOne({ user: req.user.id, field })
    if (!progress) return res.status(404).json({ error: "Progress not found." })

    if (idx < 0 || idx >= progress.notes.length)
      return res.status(400).json({ error: "Note index out of range." })

    progress.notes.splice(idx, 1)
    // Keep checklist in sync — remove corresponding checklist entry if exists
    if (progress.checklist.length > idx) {
      progress.checklist.splice(idx, 1)
    }
    await progress.save()
    res.json({ message: "Note deleted.", notes: progress.notes, checklist: progress.checklist })
  } catch (err) {
    console.error("Delete prep note error:", err)
    res.status(500).json({ error: "Failed to delete note." })
  }
})

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err)
  res.status(500).json({ error: err.message || "Internal server error." })
})

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))