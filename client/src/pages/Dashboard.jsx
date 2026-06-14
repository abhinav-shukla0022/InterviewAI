import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { 
  Trophy, 
  Target, 
  Sparkles, 
  ArrowRight, 
  BrainCircuit, 
  BookOpen,
  History as HistoryIcon,
  Award,
  Loader
} from "lucide-react"

function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [interviews, setInterviews] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    averageScore: 0,
    highestScore: 0,
    performanceLevel: "Beginner"
  })

  const userName = localStorage.getItem("userName") || "Developer"

  const extractScore = (feedbackText) => {
    if (!feedbackText) return null
    // Matches "Overall Score: X/10" or "Overall Score: X" or "Score: X"
    const match = feedbackText.match(/Overall\s*Score:\s*(\d+(\.\d+)?)\s*\/10/i) || 
                  feedbackText.match(/Overall\s*Score:\s*(\d+(\.\d+)?)/i) ||
                  feedbackText.match(/Score:\s*(\d+(\.\d+)?)\s*\/10/i) ||
                  feedbackText.match(/Overall\s*Score:\s*(\d+(\.\d+)?)/i)
    if (match && match[1]) {
      return parseFloat(match[1])
    }
    return null
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await axios.get("http://localhost:5000/history", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        setInterviews(res.data)
        
        // Calculate statistics
        const total = res.data.length
        let sum = 0
        let count = 0
        let highest = 0

        res.data.forEach(item => {
          const score = extractScore(item.feedback)
          if (score !== null) {
            sum += score
            count++
            if (score > highest) highest = score
          }
        })

        const average = count > 0 ? parseFloat((sum / count).toFixed(1)) : 0
        
        let level = "Beginner"
        if (average >= 8) level = "Expert"
        else if (average >= 6) level = "Intermediate"

        setStats({
          total,
          averageScore: average,
          highestScore: highest,
          performanceLevel: level
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-10 h-10 text-indigo-500 animate-spin" />
          <span className="text-gray-400 text-sm">Syncing analytics data...</span>
        </div>
      </div>
    )
  }

  const recentInterviews = interviews.slice(0, 3)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="gradient-text">{userName}</span>!
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Here is your mock interview analytics overview. Keep practicing to boost your scores!
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/interview")}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 transition cursor-pointer"
          >
            <BrainCircuit className="w-5 h-5" />
            Start Mock Session
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate("/prep")}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 border border-gray-800 text-gray-200 hover:text-white rounded-2xl transition cursor-pointer"
          >
            <BookOpen className="w-5 h-5" />
            Open Strategy Studio
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* TOTAL INTERVIEWS */}
        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden group hover:border-indigo-500/30 transition duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition duration-300">
            <HistoryIcon className="w-24 h-24 text-indigo-400" />
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/25">
              <HistoryIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Total Sessions</span>
              <span className="text-3xl font-extrabold text-white block mt-0.5">{stats.total}</span>
            </div>
          </div>
        </div>

        {/* AVERAGE SCORE */}
        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden group hover:border-violet-500/30 transition duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition duration-300">
            <Target className="w-24 h-24 text-violet-400" />
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-violet-500/10 text-violet-400 rounded-2xl border border-violet-500/25">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Average Rating</span>
              <span className="text-3xl font-extrabold text-white block mt-0.5">
                {stats.total > 0 ? `${stats.averageScore}/10` : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* HIGHEST SCORE */}
        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden group hover:border-emerald-500/30 transition duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition duration-300">
            <Trophy className="w-24 h-24 text-emerald-400" />
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/25">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Peak Rating</span>
              <span className="text-3xl font-extrabold text-white block mt-0.5">
                {stats.total > 0 ? `${stats.highestScore}/10` : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* PERFORMANCE LEVEL */}
        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden group hover:border-indigo-500/30 transition duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition duration-300">
            <Sparkles className="w-24 h-24 text-indigo-400" />
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/25">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Standing Level</span>
              <span className="text-2xl font-extrabold text-white block mt-1.5">{stats.total > 0 ? stats.performanceLevel : "Trainee"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* DASHBOARD SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* RECENT INTERVIEWS */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-wide">Recent Activity</h2>
            {stats.total > 3 && (
              <button
                onClick={() => navigate("/history")}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1"
              >
                View Full History
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-4">
            {recentInterviews.length > 0 ? (
              recentInterviews.map((item, index) => {
                const score = extractScore(item.feedback)
                return (
                  <div
                    key={item._id || index}
                    className="glass-panel rounded-2xl p-5 border border-gray-900 flex items-start justify-between gap-4 hover:border-gray-800 transition duration-200"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="text-xs text-gray-500 font-semibold">
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </div>
                      <p className="text-sm font-semibold text-gray-200 line-clamp-2 pr-4 leading-relaxed">
                        {item.question}
                      </p>
                    </div>

                    {score !== null ? (
                      <div className={`shrink-0 px-3.5 py-1.5 rounded-xl font-bold text-xs border ${
                        score >= 8 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                          : score >= 6 
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}>
                        Score: {score}/10
                      </div>
                    ) : (
                      <div className="shrink-0 px-3.5 py-1.5 rounded-xl font-bold text-xs bg-gray-800/40 text-gray-400 border border-gray-700/30">
                        Evaluated
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="glass-panel rounded-3xl p-10 text-center border-dashed border-gray-800 flex flex-col items-center justify-center gap-3">
                <BrainCircuit className="w-12 h-12 text-gray-600 animate-pulse" />
                <span className="text-gray-400 text-sm">No interviews completed yet. Ready to start?</span>
                <button
                  onClick={() => navigate("/interview")}
                  className="mt-2 text-xs font-semibold px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
                >
                  Take Your First Interview
                </button>
              </div>
            )}
          </div>
        </div>

        {/* TIPS CARD & MOTIVATION */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white tracking-wide">Strategy Blueprint</h2>
          
          <div className="glass-panel rounded-3xl p-6 bg-gradient-to-br from-indigo-950/20 via-gray-900/60 to-gray-900/60 border border-gray-900 relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-20%] w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl"></div>
            
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl mt-1">
                <Award className="w-5 h-5" />
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-white text-sm">Target Weak Areas</h3>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Upload resumes highlighting various technologies. The AI generates specific questions tailored to your skills to ensure comprehensive coverage.
                  </p>
                </div>

                <div className="border-t border-gray-800 pt-4">
                  <h3 className="font-bold text-white text-sm">Time Under Pressure</h3>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Practice answering questions within the 120-second mark. Fast, coherent formatting of technical topics scores higher ratings.
                  </p>
                </div>

                <div className="border-t border-gray-800 pt-4">
                  <h3 className="font-bold text-white text-sm">Analyze AI Feedback</h3>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Pay close attention to "Improvement Tips" on scores. Reviewing communication structure changes is key to matching expert-level assessments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard