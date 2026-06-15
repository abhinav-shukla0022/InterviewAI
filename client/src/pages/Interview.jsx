import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { 
  UploadCloud, 
  FileUp, 
  Trash2, 
  Clock, 
  Award,
  Sparkles, 
  ChevronRight,
  RefreshCw,
  Play,
  Lightbulb,
  MessageSquareCode
} from "lucide-react"

function Interview() {
  const fileInputRef = useRef(null)

  const [difficulty, setDifficulty] = useState("Easy")
  const [file, setFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  
  const [resumeText, setResumeText] = useState("")
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [feedback, setFeedback] = useState("")
  const [sessionId, setSessionId] = useState(null)
  const [selectedTrack, setSelectedTrack] = useState(null)
  const [tracks, setTracks] = useState([])

  // FIX: track all questions + current index client-side
  const [allQuestions, setAllQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [finished, setFinished] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [aiTyping, setAiTyping] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120)

  // =========================================
  // TIMER EFFECT
  // =========================================
  useEffect(() => {
    if (!question || feedback) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [question, feedback])

  // =========================================
  // PARSE SCORES
  // =========================================
  const parseScores = (text) => {
    if (!text) return null
    const getScore = (regex) => {
      const match = text.match(regex)
      return match && match[1] ? parseFloat(match[1]) : null
    }
    const overall = getScore(/Overall\s*Score:\s*(\d+(\.\d+)?)/i) || getScore(/Overall:\s*(\d+(\.\d+)?)/i) || 0
    const technical = getScore(/Technical\s*Knowledge:\s*(\d+(\.\d+)?)/i) || getScore(/Technical:\s*(\d+(\.\d+)?)/i) || overall
    const communication = getScore(/Communication:\s*(\d+(\.\d+)?)/i) || overall
    const confidence = getScore(/Confidence:\s*(\d+(\.\d+)?)/i) || overall

    const tipIndex = text.toLowerCase().indexOf("improvement tip:")
    let tip = tipIndex !== -1
      ? text.substring(tipIndex + "improvement tip:".length).trim()
      : text.split("\n").filter(l => 
          !l.toLowerCase().includes("score") && 
          !l.toLowerCase().includes("knowledge") && 
          !l.toLowerCase().includes("communication") && 
          !l.toLowerCase().includes("confidence")
        ).join("\n")

    return { overall, technical, communication, confidence, tip: tip || "Keep practicing to see detailed advice." }
  }

  // =========================================
  // DRAG & DROP
  // =========================================
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === "dragenter" || e.type === "dragover")
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const dropped = e.dataTransfer.files?.[0]
    if (dropped?.type === "application/pdf") setFile(dropped)
    else alert("Please upload a PDF file only.")
  }

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) setFile(e.target.files[0])
  }

  const removeFile = () => {
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // =========================================
  // LOAD TRACKS
  // =========================================
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const res = await axios.get("https://interviewai-bnux.onrender.com/api/interview-tracks")
        setTracks(res.data || [])
        setSelectedTrack(res.data?.[0] || null)
      } catch (err) {
        console.error("Failed to load tracks", err)
      }
    }
    fetchTracks()
  }, [])

  // =========================================
  // START SESSION
  // =========================================
  const handleStartSession = async () => {
    if (!file || !selectedTrack) return
    try {
      setLoading(true)
      setAiTyping(true)
      setFeedback("")
      setAnswer("")
      setQuestion("")
      setFinished(false)
      setCurrentIndex(0)
      setAllQuestions([])

      // Upload resume
      const formData = new FormData()
      formData.append("resume", file)
      const uploadRes = await axios.post("https://interviewai-bnux.onrender.com/upload-resume", formData)

      if (!uploadRes.data.text) {
        alert("Failed to extract text from PDF. Please try another file.")
        return
      }

      const extractedText = uploadRes.data.text
      setResumeText(extractedText)

      // Start mock session — gets all 10 questions at once
      const token = localStorage.getItem("token")
      const res = await axios.post(
        "https://interviewai-bnux.onrender.com/api/mock/start",
        { track: selectedTrack.id, difficulty, resumeText: extractedText },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const questions = res.data.questions || [res.data.question]
      setAllQuestions(questions)
      setSessionId(res.data.sessionId)
      setQuestion(questions[0])
      setCurrentIndex(0)
      setTimeLeft(120)
    } catch (err) {
      console.error("Start session error:", err)
      alert(err.response?.data?.error || "Failed to start mock interview. Make sure backend is running.")
    } finally {
      setAiTyping(false)
      setLoading(false)
    }
  }

  // =========================================
  // SUBMIT ANSWER — uses client-side question array
  // =========================================
  const handleEvaluation = async () => {
    if (!answer.trim() || !sessionId) return
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const res = await axios.post(
        "https://interviewai-bnux.onrender.com/api/mock/answer",
        { sessionId, answer, questionIndex: currentIndex },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setFeedback(res.data.feedback)

      if (res.data.finished) {
        setFinished(true)
      }
    } catch (err) {
      console.error("Evaluation error:", err.response?.data || err.message)
      alert(err.response?.data?.error || "Failed to evaluate answer. Check your login status.")
    } finally {
      setLoading(false)
    }
  }

  // =========================================
  // NEXT QUESTION — uses local array, no extra API call
  // =========================================
  const handleNextQuestion = () => {
    const nextIdx = currentIndex + 1
    if (nextIdx >= allQuestions.length) {
      setFinished(true)
      return
    }
    setCurrentIndex(nextIdx)
    setQuestion(allQuestions[nextIdx])
    setAnswer("")
    setFeedback("")   // FIX: clear feedback so step goes back to 2
    setTimeLeft(120)
  }

  // =========================================
  // RESET
  // =========================================
  const handleReset = () => {
    setQuestion("")
    setAnswer("")
    setFeedback("")
    setTimeLeft(120)
    setSessionId(null)
    setAllQuestions([])
    setCurrentIndex(0)
    setFinished(false)
    setResumeText("")
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // Wizard step
  let currentStep = 1
  if (aiTyping || (question && !feedback && !finished)) currentStep = 2
  else if (feedback || finished) currentStep = 3

  const scores = feedback ? parseScores(feedback) : null

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in pb-12">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Mock Simulator</h1>
        <p className="text-gray-400 text-sm mt-1">
          Simulate a real technical screening. Select your level, upload your resume, and face AI questions.
        </p>
      </div>

      {/* STEP PROGRESS WIZARD */}
      <div className="glass-panel rounded-2xl p-4 flex items-center justify-between border-gray-900/60 max-w-md mx-auto">
        {[["1","Setup"],["2","Session"],["3","Feedback"]].map(([num, label], i) => (
          <>
            {i > 0 && <div key={`div-${i}`} className="w-10 h-px bg-gray-800"></div>}
            <div key={num} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-xs border ${
                currentStep >= parseInt(num) 
                  ? "bg-indigo-600 text-white border-indigo-500" 
                  : "bg-gray-900 text-gray-500 border-gray-800"
              }`}>{num}</div>
              <span className={`text-xs font-semibold ${currentStep >= parseInt(num) ? "text-gray-200" : "text-gray-500"}`}>{label}</span>
            </div>
          </>
        ))}
      </div>

      {/* ── STEP 1: SETUP ── */}
      {currentStep === 1 && (
        <div className="glass-panel rounded-3xl p-8 shadow-xl space-y-8 animate-slide-up">
          {/* DIFFICULTY */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
              Choose Interview Difficulty
            </label>
            <div className="grid grid-cols-3 gap-3 p-1.5 bg-gray-950/80 rounded-2xl border border-gray-900 max-w-md">
              {["Easy", "Medium", "Hard"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setDifficulty(lvl)}
                  className={`py-3 rounded-xl font-bold text-xs transition duration-200 cursor-pointer ${
                    difficulty === lvl
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                      : "text-gray-400 hover:text-gray-200 hover:bg-gray-900/50"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* TRACKS */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
              Select Interview Track
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl">
              {tracks.length > 0 ? tracks.map((track) => (
                <button
                  key={track.id}
                  onClick={() => setSelectedTrack(track)}
                  className={`rounded-2xl border p-4 text-left transition duration-200 ${
                    selectedTrack?.id === track.id
                      ? "border-indigo-500 bg-indigo-600/10 text-white"
                      : "border-gray-800 bg-gray-950 text-gray-300 hover:border-indigo-500/40"
                  }`}
                >
                  {/* FIX: was track.name — backend sends track.label */}
                  <div className="text-sm font-semibold">{track.label}</div>
                  <p className="text-xs text-gray-500 mt-1">{track.description}</p>
                </button>
              )) : (
                <div className="rounded-2xl border border-gray-800 bg-gray-950 p-4 text-sm text-gray-500">Loading tracks...</div>
              )}
            </div>
          </div>

          {/* UPLOAD */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
              Upload Resume (PDF format)
            </label>
            {!file ? (
              <div
                onDragEnter={handleDrag} onDragOver={handleDrag}
                onDragLeave={handleDrag} onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
                className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center gap-4 transition duration-300 cursor-pointer ${
                  dragActive ? "border-indigo-500 bg-indigo-500/5" : "border-gray-800 hover:border-gray-700 bg-gray-950/10"
                }`}
              >
                <input type="file" ref={fileInputRef} accept=".pdf" className="hidden" onChange={handleFileChange} />
                <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm text-gray-200">Drag and drop your resume here</p>
                  <p className="text-xs text-gray-500 mt-1">or click to browse (PDF only)</p>
                </div>
              </div>
            ) : (
              <div className="p-5 bg-gray-950/80 rounded-2xl border border-gray-900 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                    <FileUp className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-gray-200 truncate">{file.name}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{(file.size / (1024 * 1024)).toFixed(2)} MB • PDF</div>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="p-2.5 bg-gray-950 hover:bg-rose-500/10 border border-gray-800 hover:border-rose-500/20 text-gray-400 hover:text-rose-400 rounded-xl transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleStartSession}
            disabled={!file || !selectedTrack || loading}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-gray-900 disabled:to-gray-900 text-white font-bold rounded-2xl transition duration-200 shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <><Play className="w-4 h-4" /> Start Mock Interview</>
            )}
          </button>
        </div>
      )}

      {/* ── AI LOADING STATE ── */}
      {loading && aiTyping && (
        <div className="glass-panel rounded-3xl p-10 text-center space-y-6 border-dashed border-indigo-500/30">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-indigo-500/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-8 h-8" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Analyzing Skill Profile</h3>
            <p className="text-xs text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed">
              Generating 10 {difficulty}-difficulty questions tailored to your resume…
            </p>
          </div>
        </div>
      )}

      {/* ── STEP 2: QUESTION & ANSWER ── */}
      {currentStep === 2 && question && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex items-center justify-between gap-4">
            <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border ${
              timeLeft <= 20 ? "bg-rose-500/10 border-rose-500/20 text-rose-400" 
              : timeLeft <= 60 ? "bg-amber-500/10 border-amber-500/20 text-amber-400" 
              : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
            }`}>
              <Clock className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-bold tracking-wider">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
              </span>
            </div>

            {/* FIX: show question progress */}
            <span className="text-xs text-gray-500 font-semibold">
              Question {currentIndex + 1} of {allQuestions.length || 10}
            </span>

            <button
              onClick={handleReset}
              className="text-xs font-semibold text-gray-500 hover:text-gray-300 transition flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-950 border border-gray-900"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          <div className="glass-panel rounded-3xl p-6 border-indigo-500/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
              <MessageSquareCode className="w-40 h-40 text-indigo-400" />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-[10px] uppercase font-bold tracking-widest">
                Technical Question
              </span>
              <span className="px-2.5 py-1 bg-gray-900 text-gray-400 border border-gray-800 rounded-lg text-[10px] uppercase font-bold tracking-widest">
                {difficulty}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed whitespace-pre-wrap">
              {question}
            </h2>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Your Answer</label>
              <span className="text-[10px] text-gray-500">{answer.length} characters</span>
            </div>
            <textarea
              placeholder="Provide a clear, detailed technical explanation..."
              value={answer}
              disabled={loading}
              className="w-full h-44 p-5 bg-gray-950/80 border border-gray-900 rounded-3xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-white placeholder-gray-600 transition leading-relaxed text-sm resize-none"
              onChange={(e) => setAnswer(e.target.value)}
            />
          </div>

          <button
            onClick={handleEvaluation}
            disabled={!answer.trim() || loading}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-gray-900 disabled:to-gray-900 text-white font-bold rounded-2xl transition duration-200 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <><Award className="w-4 h-4" /> Submit & Evaluate</>
            )}
          </button>
        </div>
      )}

      {/* ── STEP 3: FEEDBACK ── */}
      {currentStep === 3 && (
        <div className="space-y-8 animate-slide-up">

          {/* FINISHED STATE */}
          {finished && !feedback && (
            <div className="glass-panel rounded-3xl p-10 text-center space-y-4 border-indigo-500/20">
              <Award className="w-16 h-16 text-indigo-400 mx-auto" />
              <h3 className="text-2xl font-extrabold text-white">Interview Complete!</h3>
              <p className="text-gray-400 text-sm">You answered all {allQuestions.length} questions.</p>
              <button
                onClick={handleReset}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition"
              >
                Start New Interview
              </button>
            </div>
          )}

          {scores && (
            <>
              {/* SCORE CARD */}
              <div className="glass-panel rounded-3xl p-6 relative overflow-hidden bg-gradient-to-br from-indigo-950/15 via-gray-900/60 to-gray-900/60 border-indigo-500/10">
                <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 font-extrabold text-2xl border border-indigo-500/25 flex items-center justify-center">
                      {scores.overall}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-xl text-white">Assessment Complete</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Question {currentIndex + 1} of {allQuestions.length} • Score: {scores.overall}/10
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {!finished && (
                      <button
                        onClick={handleNextQuestion}
                        className="flex items-center gap-2 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow transition cursor-pointer text-xs"
                      >
                        Next Question <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={handleReset}
                      className="px-5 py-3.5 bg-gray-950 hover:bg-gray-900 border border-gray-800 text-gray-400 hover:text-white font-bold rounded-xl transition cursor-pointer text-xs"
                    >
                      Restart
                    </button>
                  </div>
                </div>
              </div>

              {/* SCORE BARS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "Technical", value: scores.technical, color: "indigo" },
                  { label: "Communication", value: scores.communication, color: "emerald" },
                  { label: "Confidence", value: scores.confidence, color: "violet" }
                ].map(({ label, value, color }) => (
                  <div key={label} className="glass-panel rounded-2xl p-5 border border-gray-900 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
                      <span className={`text-sm font-extrabold text-${color}-400`}>{value}/10</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-950 rounded-full overflow-hidden border border-gray-900/50">
                      <div
                        className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-400 rounded-full transition-all duration-1000`}
                        style={{ width: `${value * 10}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* TIP */}
              <div className="glass-panel rounded-3xl p-6 border-indigo-500/10 space-y-4">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Lightbulb className="w-5 h-5 shrink-0" />
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-white">AI Improvement Tip</h4>
                </div>
                <div className="p-5 bg-gray-950/70 border border-gray-900 rounded-2xl text-sm leading-relaxed text-gray-300 whitespace-pre-wrap">
                  {scores.tip}
                </div>
              </div>

              {/* RAW OUTPUT */}
              <details className="glass-panel rounded-2xl border border-gray-900 group">
                <summary className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer list-none flex items-center justify-between">
                  <span>View Raw AI Output</span>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-open:rotate-90 transition duration-200" />
                </summary>
                <div className="p-4 pt-0 border-t border-gray-900 text-xs font-mono text-gray-400 leading-relaxed whitespace-pre-wrap">
                  {feedback}
                </div>
              </details>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default Interview