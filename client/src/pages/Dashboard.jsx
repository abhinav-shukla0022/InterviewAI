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
  Loader,
  Flame,
  Search,
  CheckCircle2,
  Circle
} from "lucide-react"

// ─────────────────────────────────────────────────────────────
// Small reusable chart primitives (pure SVG, no external libs)
// ─────────────────────────────────────────────────────────────

function Sparkline({ data, color = "#818cf8" }) {
  if (!data || data.length < 2) {
    return <div className="h-8" />
  }
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 100
  const h = 32
  const step = w / (data.length - 1)
  const points = data
    .map((d, i) => {
      const x = i * step
      const y = h - ((d - min) / range) * h
      return `${x},${y}`
    })
    .join(" ")

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-8 mt-2" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
    </svg>
  )
}

function PerformanceChart({ data }) {
  const w = 700
  const h = 220
  const padding = { top: 16, right: 16, bottom: 26, left: 28 }
  const innerW = w - padding.left - padding.right
  const innerH = h - padding.top - padding.bottom

  if (!data || data.length === 0) {
    return (
      <div className="h-56 flex flex-col items-center justify-center gap-2 text-gray-500 text-sm">
        <BrainCircuit className="w-8 h-8 text-gray-700" />
        Not enough data yet. Complete a few mock sessions to see your trend.
      </div>
    )
  }

  const maxScore = 10
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0

  const points = data.map((d, i) => {
    const x = padding.left + i * stepX
    const y = padding.top + innerH - (d.score / maxScore) * innerH
    return { x, y, ...d }
  })

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + innerH} L ${points[0].x} ${padding.top + innerH} Z`
  const yTicks = [0, 2, 4, 6, 8, 10]

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-56">
      <defs>
        <linearGradient id="perfGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
        </linearGradient>
      </defs>

      {yTicks.map((t) => {
        const y = padding.top + innerH - (t / maxScore) * innerH
        return (
          <g key={t}>
            <line x1={padding.left} x2={w - padding.right} y1={y} y2={y} stroke="#1e2535" strokeWidth="1" />
            <text x={padding.left - 8} y={y + 3} textAnchor="end" fontSize="10" fill="#64748b">
              {t}
            </text>
          </g>
        )
      })}

      <path d={areaPath} fill="url(#perfGradient)" />
      <path d={linePath} fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#0f0f1a" stroke="#818cf8" strokeWidth="2" />
      ))}

      {points.map((p, i) => {
        const showLabel =
          points.length <= 6 || i % Math.ceil(points.length / 6) === 0 || i === points.length - 1
        if (!showLabel) return null
        return (
          <text key={`lbl-${i}`} x={p.x} y={h - 6} textAnchor="middle" fontSize="10" fill="#64748b">
            {p.label}
          </text>
        )
      })}
    </svg>
  )
}

function DonutChart({ segments, total }) {
  const size = 150
  const strokeWidth = 20
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const safeTotal = total > 0 ? total : 1
  let cumulative = 0

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1e2535" strokeWidth={strokeWidth} />
        {segments.map((seg, i) => {
          if (seg.value <= 0) return null
          const fraction = seg.value / safeTotal
          const dash = fraction * circumference
          const gap = circumference - dash
          const offset = -cumulative * circumference
          cumulative += fraction
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={offset}
            />
          )
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold text-white">{total}</span>
        <span className="text-[10px] text-gray-500 uppercase tracking-wide">Total</span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────

function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [interviews, setInterviews] = useState([])
  const [search, setSearch] = useState("")
  const [stats, setStats] = useState({
    total: 0,
    averageScore: 0,
    highestScore: 0,
    performanceLevel: "Beginner"
  })

  const userName = localStorage.getItem("userName") || "Developer"

  // ── Robust score extractor ──────────────────────────────────────────────
  // Your backend saves interviews in two different shapes:
  //  1) Quick-practice (/evaluate-answer): singular `feedback` text +
  //     numeric `overallScore`.
  //  2) Full mock sessions (/api/mock/start + /api/mock/answer): `feedbacks`
  //     array, `scores` array, and numeric `overallScore` computed as the
  //     average of answered questions.
  // In both cases `overallScore` is already a clean number on the document,
  // so we trust that first and only fall back to regex-parsing text.
  const extractScore = (item) => {
    if (!item) return null

    // Prefer per-question scores average (best for 5-Q mock sessions)
    if (Array.isArray(item.scores) && item.scores.length > 0) {
      const validScores = item.scores.filter((s) => typeof s === "number" && !isNaN(s) && s > 0)
      if (validScores.length > 0) {
        const avg = validScores.reduce((a, b) => a + b, 0) / validScores.length
        return parseFloat(avg.toFixed(1))
      }
    }

    if (typeof item.overallScore === "number" && !isNaN(item.overallScore) && item.overallScore > 0) {
      return parseFloat(Number(item.overallScore).toFixed(1))
    }

    if (item.feedback) {
      const match =
        item.feedback.match(/Overall\s*Score:\s*(\d+(\.\d+)?)/i) ||
        item.feedback.match(/Score:\s*(\d+(\.\d+)?)/i)
      if (match && match[1]) return parseFloat(match[1])
    }

    if (Array.isArray(item.feedbacks) && item.feedbacks.length > 0) {
      const parsed = []
      for (const fb of item.feedbacks) {
        if (!fb) continue
        const match = String(fb).match(/Overall\s*Score:\s*(\d+(\.\d+)?)/i)
        if (match && match[1]) parsed.push(parseFloat(match[1]))
      }
      if (parsed.length > 0) {
        return parseFloat((parsed.reduce((a, b) => a + b, 0) / parsed.length).toFixed(1))
      }
    }

    return null
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await axios.get("https://interviewai-bnux.onrender.com/history", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        const data = Array.isArray(res.data) ? res.data : []
        setInterviews(data)

        let sum = 0
        let count = 0
        let highest = 0

        data.forEach((item) => {
          const score = extractScore(item)
          if (score !== null && score > 0) {
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
          total: data.length,
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
    // Refresh when user returns to the tab after a mock session
    const onFocus = () => fetchDashboardData()
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
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

  // ── Derived data (all computed from real `interviews`, nothing fabricated) ──

  const scoredSorted = interviews
    .map((item) => ({
      date: new Date(item.createdAt),
      score: extractScore(item),
      question: item.question
    }))
    .filter((d) => d.score !== null && !isNaN(d.date.getTime()))
    .sort((a, b) => a.date - b.date)

  const trendData = scoredSorted.slice(-10).map((d) => ({
    label: d.date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    score: d.score
  }))

  const sparklineScores = trendData.map((d) => d.score)

  const distBuckets = { excellent: 0, good: 0, average: 0, weak: 0 }
  scoredSorted.forEach((d) => {
    if (d.score >= 9) distBuckets.excellent++
    else if (d.score >= 7) distBuckets.good++
    else if (d.score >= 5) distBuckets.average++
    else distBuckets.weak++
  })
  const scoredTotal = scoredSorted.length

  const distribution = [
    { label: "9-10 (Excellent)", value: distBuckets.excellent, color: "#818cf8" },
    { label: "7-8 (Good)", value: distBuckets.good, color: "#22d3ee" },
    { label: "5-6 (Average)", value: distBuckets.average, color: "#fb923c" },
    { label: "0-4 (Needs Work)", value: distBuckets.weak, color: "#f472b6" }
  ]

  // Upcoming goals — derived from real session data
  const sessionGoalTarget = 5
  const sessionGoalProgress = Math.min(stats.total, sessionGoalTarget)

  const highScoreTarget = 3
  const highScoreCount = Math.min(scoredSorted.filter((d) => d.score >= 8).length, highScoreTarget)

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const uniqueDaysLast7 = new Set(
    interviews
      .map((i) => new Date(i.createdAt))
      .filter((d) => !isNaN(d.getTime()) && d >= sevenDaysAgo)
      .map((d) => d.toDateString())
  ).size
  const weeklyGoalTarget = 7

  const goals = [
    {
      icon: Target,
      label: "Complete 5 Mock Sessions",
      progress: sessionGoalProgress,
      target: sessionGoalTarget,
      color: "#818cf8"
    },
    {
      icon: Trophy,
      label: "Score 8+ in 3 Sessions",
      progress: highScoreCount,
      target: highScoreTarget,
      color: "#22d3ee"
    },
    {
      icon: Flame,
      label: "Practice Days (Last 7)",
      progress: uniqueDaysLast7,
      target: weeklyGoalTarget,
      color: "#fb923c"
    }
  ]

  // Achievements — unlocked state derived from real stats
  const bestEntry = scoredSorted.reduce((best, cur) => (cur.score > (best?.score ?? -1) ? cur : best), null)
  const fmtDate = (d) =>
    d ? d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : null

  const achievements = [
    {
      icon: Award,
      title: "First Steps",
      desc: "Completed your first mock session",
      unlocked: stats.total >= 1,
      date: fmtDate(scoredSorted[0]?.date)
    },
    {
      icon: Trophy,
      title: "Score Booster",
      desc: "Scored 8+ in a mock session",
      unlocked: stats.highestScore >= 8,
      date: fmtDate(bestEntry?.date)
    },
    {
      icon: Flame,
      title: "Consistent Learner",
      desc: "Completed 5+ mock sessions",
      unlocked: stats.total >= 5,
      date: fmtDate(scoredSorted[4]?.date)
    }
  ]

  const displayedInterviews = search.trim()
    ? interviews.filter((i) => i.question?.toLowerCase().includes(search.toLowerCase())).slice(0, 5)
    : interviews.slice(0, 3)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="gradient-text">{userName}</span>!
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Track your progress, practice more and become interview ready.
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
        {/* TOTAL SESSIONS */}
        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden group hover:border-indigo-500/30 transition duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition duration-300">
            <HistoryIcon className="w-24 h-24 text-indigo-400" />
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/25">
              <HistoryIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                Total Sessions
              </span>
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
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                Average Score
              </span>
              <span className="text-3xl font-extrabold text-white block mt-0.5">
                {stats.total > 0 ? `${stats.averageScore}/10` : "N/A"}
              </span>
            </div>
          </div>
          <Sparkline data={sparklineScores} color="#a78bfa" />
        </div>

        {/* PEAK SCORE */}
        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden group hover:border-emerald-500/30 transition duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition duration-300">
            <Trophy className="w-24 h-24 text-emerald-400" />
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/25">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                Peak Score
              </span>
              <span className="text-3xl font-extrabold text-white block mt-0.5">
                {stats.total > 0 ? `${stats.highestScore}/10` : "N/A"}
              </span>
            </div>
          </div>
          <Sparkline data={sparklineScores} color="#34d399" />
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
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                Current Level
              </span>
              <span className="text-2xl font-extrabold text-white block mt-1.5">
                {stats.total > 0 ? stats.performanceLevel : "Trainee"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN GRID: performance + goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PERFORMANCE OVERVIEW */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-white tracking-wide">Performance Overview</h2>
            <span className="text-xs text-gray-500">Last {trendData.length || 0} scored sessions</span>
          </div>
          <PerformanceChart data={trendData} />
        </div>

        {/* UPCOMING GOALS */}
        <div className="glass-panel rounded-3xl p-6 space-y-5">
          <h2 className="text-lg font-bold text-white tracking-wide">Upcoming Goals</h2>
          {goals.map((g, i) => {
            const Icon = g.icon
            const pct = Math.min(100, Math.round((g.progress / g.target) * 100))
            return (
              <div key={i}>
                <div className="flex items-center gap-3 mb-1.5">
                  <div
                    className="p-2 rounded-xl border shrink-0"
                    style={{
                      backgroundColor: `${g.color}1a`,
                      borderColor: `${g.color}33`,
                      color: g.color
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-gray-200 flex-1 leading-tight">{g.label}</span>
                  <span className="text-xs font-bold text-gray-400 shrink-0">
                    {g.progress}/{g.target}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-800/60 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: g.color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* MAIN GRID: recent activity + distribution + achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RECENT ACTIVITY */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-xl font-bold text-white tracking-wide">Recent Activity</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search sessions..."
                  className="bg-gray-900/60 border border-gray-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/50 transition w-40 sm:w-52"
                />
              </div>
              {stats.total > 3 && (
                <button
                  onClick={() => navigate("/history")}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1 shrink-0"
                >
                  View All
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {displayedInterviews.length > 0 ? (
              displayedInterviews.map((item, index) => {
                const score = extractScore(item)
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
                      <div
                        className={`shrink-0 px-3.5 py-1.5 rounded-xl font-bold text-xs border ${
                          score >= 8
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : score >= 6
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
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
            ) : search.trim() ? (
              <div className="glass-panel rounded-3xl p-10 text-center border-dashed border-gray-800 flex flex-col items-center justify-center gap-2">
                <Search className="w-8 h-8 text-gray-600" />
                <span className="text-gray-400 text-sm">No sessions match "{search}"</span>
              </div>
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

          {/* SCORE DISTRIBUTION */}
          <div className="glass-panel rounded-3xl p-6 mt-2">
            <h2 className="text-lg font-bold text-white tracking-wide mb-4">Score Distribution</h2>
            {scoredTotal > 0 ? (
              <div className="flex items-center gap-8 flex-wrap">
                <DonutChart segments={distribution} total={scoredTotal} />
                <div className="space-y-2.5 flex-1 min-w-[160px]">
                  {distribution.map((seg, i) => {
                    const pct = scoredTotal > 0 ? Math.round((seg.value / scoredTotal) * 100) : 0
                    return (
                      <div key={i} className="flex items-center gap-2.5 text-xs">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: seg.color }}
                        />
                        <span className="text-gray-400 flex-1">{seg.label}</span>
                        <span className="text-gray-300 font-semibold">{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 text-center py-6">
                Complete mock sessions to see your score breakdown.
              </div>
            )}
          </div>
        </div>

        {/* ACHIEVEMENTS */}
        <div className="glass-panel rounded-3xl p-6 space-y-5 h-fit">
          <h2 className="text-lg font-bold text-white tracking-wide">Achievements</h2>
          <div className="space-y-4">
            {achievements.map((a, i) => {
              const Icon = a.icon
              return (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-3 rounded-2xl border transition ${
                    a.unlocked
                      ? "bg-indigo-500/5 border-indigo-500/15"
                      : "bg-gray-900/30 border-gray-900 opacity-50"
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      a.unlocked ? "bg-indigo-500/15 text-indigo-400" : "bg-gray-800/60 text-gray-500"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-white">{a.title}</div>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{a.desc}</p>
                    {a.unlocked && a.date && (
                      <span className="text-[10px] text-gray-500 mt-1 block">Unlocked on {a.date}</span>
                    )}
                  </div>
                  {a.unlocked ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-700 shrink-0 mt-1" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard