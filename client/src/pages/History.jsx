import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { 
  Search, 
  Trash2, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare,
  Award,
  Sparkles,
  HelpCircle,
  BrainCircuit,
  Filter,
  CheckCircle2,
  AlertTriangle
} from "lucide-react"

function History() {
  const navigate = useNavigate()
  const [interviews, setInterviews] = useState([])
  const [filteredInterviews, setFilteredInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("")
  const [scoreFilter, setScoreFilter] = useState("all") // all, high (8+), mid (6-7), low (<6)
  
  // Expanded & Delete confirmation States
  const [expandedId, setExpandedId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const res = await axios.get("https://interviewai-bnux.onrender.com/history", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setInterviews(res.data)
      setFilteredInterviews(res.data)
    } catch (error) {
      console.error("Error fetching history:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  // Extract score from text using regex
  const extractScore = (feedbackText) => {
    if (!feedbackText) return null
    const match = feedbackText.match(/Overall\s*Score:\s*(\d+(\.\d+)?)\s*\/10/i) || 
                  feedbackText.match(/Overall\s*Score:\s*(\d+(\.\d+)?)/i) ||
                  feedbackText.match(/Score:\s*(\d+(\.\d+)?)\s*\/10/i) ||
                  feedbackText.match(/Overall\s*Score:\s*(\d+(\.\d+)?)/i)
    if (match && match[1]) {
      return parseFloat(match[1])
    }
    return null
  }

  // Parse feedback into metrics
  const parseScores = (text) => {
    if (!text) return null
    const getScore = (regex) => {
      const match = text.match(regex)
      return match && match[1] ? parseFloat(match[1]) : null
    }

    const overall = getScore(/Overall\s*Score:\s*(\d+(\.\d+)?)/i) || getScore(/Overall:\s*(\d+(\.\d+)?)/i) || getScore(/Score:\s*(\d+(\.\d+)?)/i)
    const technical = getScore(/Technical\s*Knowledge:\s*(\d+(\.\d+)?)/i) || getScore(/Technical:\s*(\d+(\.\d+)?)/i)
    const communication = getScore(/Communication:\s*(\d+(\.\d+)?)/i)
    const confidence = getScore(/Confidence:\s*(\d+(\.\d+)?)/i)

    const tipIndex = text.toLowerCase().indexOf("improvement tip:")
    let tip = ""
    if (tipIndex !== -1) {
      tip = text.substring(tipIndex + "improvement tip:".length).trim()
    } else {
      const lines = text.split("\n").map(l => l.trim()).filter(Boolean)
      const tipLines = lines.filter(l => 
        !l.toLowerCase().includes("score") && 
        !l.toLowerCase().includes("knowledge") && 
        !l.toLowerCase().includes("communication") && 
        !l.toLowerCase().includes("confidence")
      )
      tip = tipLines.join("\n")
    }

    return {
      overall: overall || 0,
      technical: technical || overall || 0,
      communication: communication || overall || 0,
      confidence: confidence || overall || 0,
      tip: tip || "Review your responses and focus on structural technical definitions."
    }
  }

  // Handle Search & Filter Changes
  useEffect(() => {
    let result = interviews

    // 1. Text Search
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        item => 
          item.question.toLowerCase().includes(query) || 
          item.answer.toLowerCase().includes(query) ||
          item.feedback.toLowerCase().includes(query)
      )
    }

    // 2. Score Badge Filter
    if (scoreFilter !== "all") {
      result = result.filter(item => {
        const score = extractScore(item.feedback)
        if (score === null) return false
        if (scoreFilter === "high") return score >= 8
        if (scoreFilter === "mid") return score >= 6 && score < 8
        if (scoreFilter === "low") return score < 6
        return true
      })
    }

    setFilteredInterviews(result)
  }, [searchQuery, scoreFilter, interviews])

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token")
      await axios.delete(`https://interviewai-bnux.onrender.com/delete-history/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setConfirmDeleteId(null)
      fetchHistory()
    } catch (error) {
      console.error("Delete error:", error)
      alert("Failed to delete interview history item.")
    }
  }

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null)
    } else {
      setExpandedId(id)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Interview History</h1>
          <p className="text-gray-400 text-sm mt-1">
            Review and track details of all your previous mock technical evaluations.
          </p>
        </div>
        <div className="text-xs font-semibold text-gray-500 bg-gray-900 border border-gray-800/80 px-4 py-2.5 rounded-xl self-start md:self-auto">
          Completed: <span className="text-white font-bold">{interviews.length} sessions</span>
        </div>
      </div>

      {/* FILTER & SEARCH PANEL */}
      <div className="glass-panel rounded-3xl p-5 border-gray-900/60 flex flex-col md:flex-row items-center gap-4">
        {/* SEARCH BAR */}
        <div className="relative w-full md:flex-1">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by keywords, questions or tech..."
            value={searchQuery}
            className="w-full pl-10 pr-4 py-3 bg-gray-950/60 border border-gray-900 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20 rounded-2xl outline-none text-xs text-white placeholder-gray-600 transition"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* SCORE FILTER SELECT */}
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Score:</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-gray-950/80 border border-gray-900 rounded-2xl w-full md:w-auto">
            {[
              { id: "all", label: "All" },
              { id: "high", label: "8+" },
              { id: "mid", label: "6-7" },
              { id: "low", label: "<6" }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setScoreFilter(opt.id)}
                className={`px-3 py-2 rounded-xl text-[10px] font-bold transition cursor-pointer ${
                  scoreFilter === opt.id
                    ? "bg-indigo-600 text-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SESSIONS LIST */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-500 text-xs mt-2">Loading historical assessments...</span>
        </div>
      ) : filteredInterviews.length > 0 ? (
        <div className="space-y-4">
          {filteredInterviews.map((item, index) => {
            const isExpanded = expandedId === item._id
            const isConfirmingDelete = confirmDeleteId === item._id
            const score = extractScore(item.feedback)
            const scoresParsed = isExpanded && item.feedback ? parseScores(item.feedback) : null

            return (
              <div
                key={item._id || index}
                className={`glass-panel rounded-3xl border transition duration-300 overflow-hidden ${
                  isExpanded ? "border-indigo-500/20 shadow-xl" : "border-gray-900/60 hover:border-gray-800"
                }`}
              >
                {/* HEADER LOG CARD */}
                <div
                  onClick={() => toggleExpand(item._id)}
                  className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-950/10 select-none"
                >
                  <div className="min-w-0 flex-1 space-y-1.5 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit"
                        })}</span>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-200 truncate">
                      {item.question}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0" onClick={e => e.stopPropagation()}>
                    {/* SCORE BADGE */}
                    {score !== null ? (
                      <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                        score >= 8 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                          : score >= 6 
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}>
                        {score}/10
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-gray-800/40 text-gray-400 border border-gray-700/30">
                        Assessed
                      </span>
                    )}

                    {/* ACTIONS: DELETE CONFIRMATION OR BUTTON */}
                    {isConfirmingDelete ? (
                      <div className="flex items-center gap-2 bg-rose-500/15 border border-rose-500/25 p-1 rounded-xl">
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold rounded-lg transition cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2.5 py-1 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white text-[10px] font-bold rounded-lg transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(item._id)}
                        className="p-2 bg-gray-950 hover:bg-rose-500/10 border border-gray-900 hover:border-rose-500/20 text-gray-500 hover:text-rose-400 rounded-xl transition cursor-pointer"
                        title="Delete log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    {/* EXPAND ICON */}
                    <button
                      onClick={() => toggleExpand(item._id)}
                      className="p-2 text-gray-500 hover:text-gray-300 transition"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* DETAILS CONTAINER */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-gray-900/60 bg-gray-950/20 space-y-6 animate-fade-in text-sm leading-relaxed">
                    {/* FULL QUESTION */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <HelpCircle className="w-4 h-4 text-indigo-400" />
                        <span>Interview Question</span>
                      </div>
                      <p className="text-gray-200 font-medium pl-1 bg-gray-950/30 p-3.5 rounded-xl border border-gray-900/50 leading-relaxed">
                        {item.question}
                      </p>
                    </div>

                    {/* YOUR ANSWER */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <MessageSquare className="w-4 h-4 text-yellow-400" />
                        <span>Submitted Answer</span>
                      </div>
                      <p className="text-gray-300 pl-1 bg-gray-950/50 p-4 rounded-xl border border-gray-900/80 leading-relaxed whitespace-pre-wrap">
                        {item.answer}
                      </p>
                    </div>

                    {/* AI FEEDBACK EVALUATION */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <Award className="w-4 h-4 text-emerald-400" />
                        <span>AI Score Breakdown</span>
                      </div>

                      {scoresParsed ? (
                        <div className="space-y-5">
                          {/* PROGRESS BARS */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {/* Technical */}
                            <div className="space-y-2 bg-gray-950/40 p-4 rounded-xl border border-gray-900/50">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-gray-400">Technical</span>
                                <span className="font-extrabold text-indigo-400">{scoresParsed.technical}/10</span>
                              </div>
                              <div className="w-full h-2 bg-gray-950 rounded-full overflow-hidden border border-gray-900/50">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${scoresParsed.technical * 10}%` }}></div>
                              </div>
                            </div>
                            
                            {/* Communication */}
                            <div className="space-y-2 bg-gray-950/40 p-4 rounded-xl border border-gray-900/50">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-gray-400">Communication</span>
                                <span className="font-extrabold text-emerald-400">{scoresParsed.communication}/10</span>
                              </div>
                              <div className="w-full h-2 bg-gray-950 rounded-full overflow-hidden border border-gray-900/50">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${scoresParsed.communication * 10}%` }}></div>
                              </div>
                            </div>

                            {/* Confidence */}
                            <div className="space-y-2 bg-gray-950/40 p-4 rounded-xl border border-gray-900/50">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-gray-400">Confidence</span>
                                <span className="font-extrabold text-violet-400">{scoresParsed.confidence}/10</span>
                              </div>
                              <div className="w-full h-2 bg-gray-950 rounded-full overflow-hidden border border-gray-900/50">
                                <div className="h-full bg-violet-500 rounded-full" style={{ width: `${scoresParsed.confidence * 10}%` }}></div>
                              </div>
                            </div>
                          </div>

                          {/* RECOMENDATION CARD */}
                          <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl space-y-2">
                            <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-xs">
                              <Sparkles className="w-4 h-4 shrink-0" />
                              <span>AI Feedback & Suggestions</span>
                            </div>
                            <p className="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap pl-5">
                              {scoresParsed.tip}
                            </p>
                          </div>
                        </div>
                      ) : (
                        // Fallback display
                        <div className="flex flex-col gap-3">
                          {item.feedback.split("\n").map((line, i) => (
                            <div
                              key={i}
                              className="bg-gray-950/50 border border-gray-900 rounded-xl p-3.5 text-xs text-gray-300"
                            >
                              {line}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        /* NO RESULTS FOUND MATCHING SEARCH/FILTER */
        <div className="glass-panel rounded-3xl p-16 text-center border-dashed border-gray-800 flex flex-col items-center justify-center gap-3">
          <HelpCircle className="w-12 h-12 text-gray-600 animate-pulse" />
          <h3 className="font-bold text-white text-base">No Matching Sessions Found</h3>
          <p className="text-gray-500 text-xs max-w-xs leading-relaxed mt-1">
            Try adjusting your search keywords or filters. To record a new mock session, click below.
          </p>
          <button
            onClick={() => navigate("/interview")}
            className="mt-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition"
          >
            Start Practice Session
          </button>
        </div>
      )}
    </div>
  )
}

export default History