import { useState, useEffect, useMemo } from "react"
import { usePrepProgress } from "../hooks/usePrepProgress"
import {
  BookOpen,
  Monitor,
  Settings,
  Link2,
  Brain,
  Building2,
  Bot,
  Play,
  CheckCircle2,
  Circle,
  StickyNote,
  Loader2,
  X,
  ListChecks,
  Video,
  ArrowRight,
  Clock,
  Search
} from "lucide-react"

const ACCENT = "#7C6BFF"

const FIELDS = [
  { id: "frontend", label: "Frontend Engineer", icon: Monitor, color: "#7C6BFF", tags: ["React", "JavaScript", "TypeScript", "CSS", "Performance"] },
  { id: "backend", label: "Backend Engineer", icon: Settings, color: "#38BDF8", tags: ["Node.js", "APIs", "Databases", "Security", "DevOps"] },
  { id: "fullstack", label: "Full Stack", icon: Link2, color: "#34D399", tags: ["Architecture", "Data Flow", "Deployment", "APIs"] },
  { id: "dsa", label: "DSA / Algorithms", icon: Brain, color: "#FBBF24", tags: ["Arrays", "Trees", "Graphs", "DP"] },
  { id: "system-design", label: "System Design", icon: Building2, color: "#A78BFA", tags: ["Scalability", "Caching", "Microservices"] },
  { id: "ml", label: "Machine Learning", icon: Bot, color: "#F472B6", tags: ["Python", "Statistics", "MLOps"] }
]

const RESOURCES = {
  frontend: [
    { title: "React Interview Deep Dive", url: "https://www.youtube.com/watch?v=w7ejDZ8SWv8", duration: "6h 20m", level: "Advanced", thumb: "https://img.youtube.com/vi/w7ejDZ8SWv8/mqdefault.jpg" },
    { title: "CSS Grid & Flexbox Mastery", url: "https://www.youtube.com/watch?v=jV8B24rSN5o", duration: "2h 05m", level: "Intermediate", thumb: "https://img.youtube.com/vi/jV8B24rSN5o/mqdefault.jpg" },
    { title: "JavaScript Performance Patterns", url: "https://www.youtube.com/watch?v=cCOL7MC4Pl0", duration: "45m", level: "Advanced", thumb: "https://img.youtube.com/vi/cCOL7MC4Pl0/mqdefault.jpg" },
    { title: "TypeScript Crash Course", url: "https://www.youtube.com/watch?v=BCg4U1FzODs", duration: "1h 30m", level: "Beginner", thumb: "https://img.youtube.com/vi/BCg4U1FzODs/mqdefault.jpg" }
  ],
  backend: [
    { title: "Backend Interview Mastery", url: "https://www.youtube.com/watch?v=ChVE-JbtYbM", duration: "8h+", level: "Advanced", thumb: "https://img.youtube.com/vi/ChVE-JbtYbM/mqdefault.jpg" },
    { title: "Node.js Design Patterns", url: "https://www.youtube.com/watch?v=ENrzD9HAZK4", duration: "3h 10m", level: "Intermediate", thumb: "https://img.youtube.com/vi/ENrzD9HAZK4/mqdefault.jpg" },
    { title: "REST vs GraphQL", url: "https://www.youtube.com/watch?v=yWzKJPw_VzM", duration: "30m", level: "Beginner", thumb: "https://img.youtube.com/vi/yWzKJPw_VzM/mqdefault.jpg" },
    { title: "Database Design & Indexing", url: "https://www.youtube.com/watch?v=ztHopE5Wnpc", duration: "55m", level: "Intermediate", thumb: "https://img.youtube.com/vi/ztHopE5Wnpc/mqdefault.jpg" }
  ],
  fullstack: [
    { title: "Full Stack Interview Prep", url: "https://www.youtube.com/watch?v=ysEN5RaKOlA", duration: "5h+", level: "Advanced", thumb: "https://img.youtube.com/vi/ysEN5RaKOlA/mqdefault.jpg" },
    { title: "MERN Stack Deep Dive", url: "https://www.youtube.com/watch?v=7CqJlxBYj-M", duration: "3h 40m", level: "Intermediate", thumb: "https://img.youtube.com/vi/7CqJlxBYj-M/mqdefault.jpg" },
    { title: "Docker & Deployment", url: "https://www.youtube.com/watch?v=gAkwW2tuIqE", duration: "1h 10m", level: "Intermediate", thumb: "https://img.youtube.com/vi/gAkwW2tuIqE/mqdefault.jpg" },
    { title: "System Integration Patterns", url: "https://www.youtube.com/watch?v=rI8tNMsozo0", duration: "50m", level: "Advanced", thumb: "https://img.youtube.com/vi/rI8tNMsozo0/mqdefault.jpg" }
  ],
  dsa: [
    { title: "DSA Full Course", url: "https://www.youtube.com/watch?v=0IAPZzGSbME", duration: "20h+", level: "Beginner", thumb: "https://img.youtube.com/vi/0IAPZzGSbME/mqdefault.jpg" },
    { title: "LeetCode Patterns", url: "https://www.youtube.com/watch?v=A3syeQgB-qw", duration: "4h 30m", level: "Intermediate", thumb: "https://img.youtube.com/vi/A3syeQgB-qw/mqdefault.jpg" },
    { title: "Dynamic Programming", url: "https://www.youtube.com/watch?v=oBt53YbR9Kk", duration: "5h", level: "Advanced", thumb: "https://img.youtube.com/vi/oBt53YbR9Kk/mqdefault.jpg" },
    { title: "Graph Algorithms", url: "https://www.youtube.com/watch?v=tWVWeAqZ0WU", duration: "2h", level: "Intermediate", thumb: "https://img.youtube.com/vi/tWVWeAqZ0WU/mqdefault.jpg" }
  ],
  "system-design": [
    { title: "System Design Crash Course", url: "https://www.youtube.com/watch?v=i7twT3x5yv8", duration: "8h+", level: "Advanced", thumb: "https://img.youtube.com/vi/i7twT3x5yv8/mqdefault.jpg" },
    { title: "Data-Intensive Apps", url: "https://www.youtube.com/watch?v=PdtlXdse7pw", duration: "1h 20m", level: "Advanced", thumb: "https://img.youtube.com/vi/PdtlXdse7pw/mqdefault.jpg" },
    { title: "Microservices Architecture", url: "https://www.youtube.com/watch?v=rv4LlmLmVWk", duration: "1h 45m", level: "Intermediate", thumb: "https://img.youtube.com/vi/rv4LlmLmVWk/mqdefault.jpg" },
    { title: "CAP Theorem", url: "https://www.youtube.com/watch?v=BHqjEjzAicA", duration: "40m", level: "Beginner", thumb: "https://img.youtube.com/vi/BHqjEjzAicA/mqdefault.jpg" }
  ],
  ml: [
    { title: "ML Interview Prep", url: "https://www.youtube.com/watch?v=aircAruvnKk", duration: "10h+", level: "Beginner", thumb: "https://img.youtube.com/vi/aircAruvnKk/mqdefault.jpg" },
    { title: "Statistics for DS", url: "https://www.youtube.com/watch?v=xxpc-HPKN28", duration: "2h", level: "Intermediate", thumb: "https://img.youtube.com/vi/xxpc-HPKN28/mqdefault.jpg" },
    { title: "scikit-learn ML", url: "https://www.youtube.com/watch?v=pqNCD_5r0IU", duration: "1h 30m", level: "Intermediate", thumb: "https://img.youtube.com/vi/pqNCD_5r0IU/mqdefault.jpg" },
    { title: "Neural Nets from Scratch", url: "https://www.youtube.com/watch?v=w8yWXqWQYmU", duration: "20m", level: "Advanced", thumb: "https://img.youtube.com/vi/w8yWXqWQYmU/mqdefault.jpg" }
  ]
}

const STRATEGIES = {
  frontend: [
    { week: 1, title: "JavaScript & TypeScript Core", hours: 12, tasks: ["Closures, prototypes, event loop", "TypeScript generics & utility types", "ES2020+ features", "Browser APIs & Storage"] },
    { week: 2, title: "React Deep Dive", hours: 14, tasks: ["Hooks internals (useMemo, useCallback)", "State management patterns", "Performance optimization", "Testing with RTL"] },
    { week: 3, title: "CSS & UI Engineering", hours: 10, tasks: ["CSS Grid & Flexbox mastery", "Responsive design patterns", "Accessibility (WCAG 2.1)", "Animation & performance"] },
    { week: 4, title: "Mock Interviews & Review", hours: 10, tasks: ["5 timed challenges/day", "Build a feature from scratch", "Review weak areas", "Behavioral questions"] }
  ],
  backend: [
    { week: 1, title: "APIs & Node.js Fundamentals", hours: 12, tasks: ["REST design principles", "Express middleware", "JWT / OAuth", "Error handling"] },
    { week: 2, title: "Databases & Data Modeling", hours: 14, tasks: ["SQL vs NoSQL", "MongoDB aggregation", "Indexing", "Transactions"] },
    { week: 3, title: "Security & Scalability", hours: 12, tasks: ["OWASP Top 10", "Rate limiting", "Redis queues", "Containers"] },
    { week: 4, title: "System Polish & Practice", hours: 10, tasks: ["Build REST API", "Integration tests", "Architecture review", "Mocks"] }
  ],
  fullstack: [
    { week: 1, title: "End-to-End Architecture", hours: 12, tasks: ["Clean architecture", "API contracts", "State sync", "Auth flows"] },
    { week: 2, title: "Frontend + Backend Integration", hours: 12, tasks: ["CORS & headers", "Uploads", "WebSockets", "Error boundaries"] },
    { week: 3, title: "DevOps & Deployment", hours: 10, tasks: ["Docker", "CI/CD", "Envs", "Monitoring"] },
    { week: 4, title: "Project & Mocks", hours: 12, tasks: ["Full-stack app", "Code review", "Profiling", "System design"] }
  ],
  dsa: [
    { week: 1, title: "Arrays, Strings & Hashing", hours: 14, tasks: ["Two-pointer", "HashMap patterns", "Strings", "Prefix sums"] },
    { week: 2, title: "Trees, Graphs & Recursion", hours: 14, tasks: ["BST", "BFS/DFS", "Backtracking", "Trie"] },
    { week: 3, title: "Dynamic Programming", hours: 16, tasks: ["Memoization", "Classic DP", "Knapsack", "Sequence DP"] },
    { week: 4, title: "Timed Practice", hours: 12, tasks: ["2 mediums/day", "1 hard/day", "Mock OA", "Big-O drills"] }
  ],
  "system-design": [
    { week: 1, title: "Foundations", hours: 12, tasks: ["CAP theorem", "SQL vs NoSQL", "Caching", "Load balancing"] },
    { week: 2, title: "Scalability", hours: 12, tasks: ["Horizontal scaling", "Sharding", "CDN", "Rate limiting"] },
    { week: 3, title: "Real Systems", hours: 14, tasks: ["Twitter feed", "URL shortener", "Payments", "Microservices"] },
    { week: 4, title: "Interview Practice", hours: 10, tasks: ["45-min designs", "Whiteboard", "Estimations", "Trade-offs"] }
  ],
  ml: [
    { week: 1, title: "Math & Statistics", hours: 12, tasks: ["Linear algebra", "Probability", "Hypothesis testing", "Info theory"] },
    { week: 2, title: "Classical ML", hours: 14, tasks: ["Regression", "Trees & ensembles", "SVM", "Clustering"] },
    { week: 3, title: "Deep Learning", hours: 14, tasks: ["Architectures", "Optimizers", "Metrics", "Features"] },
    { week: 4, title: "Coding & Cases", hours: 10, tasks: ["From-scratch models", "ML system design", "A/B tests", "Mocks"] }
  ]
}

const CHECKLIST_TEMPLATES = {
  frontend: [
    { text: "Review React lifecycle & hooks", difficulty: "Medium", mins: 40 },
    { text: "Practice 10 CSS layout challenges", difficulty: "Easy", mins: 30 },
    { text: "Build a component library", difficulty: "Hard", mins: 90 },
    { text: "Study browser rendering pipeline", difficulty: "Medium", mins: 45 },
    { text: "Read WCAG accessibility guidelines", difficulty: "Easy", mins: 25 },
    { text: "Complete 20 JS algorithm problems", difficulty: "Hard", mins: 120 },
    { text: "Review TypeScript handbook", difficulty: "Medium", mins: 50 },
    { text: "Mock 3 frontend interviews", difficulty: "Hard", mins: 90 }
  ],
  backend: [
    { text: "Design 3 REST APIs from scratch", difficulty: "Hard", mins: 90 },
    { text: "Practice SQL query optimization", difficulty: "Medium", mins: 45 },
    { text: "Implement JWT authentication", difficulty: "Medium", mins: 40 },
    { text: "Study database indexing", difficulty: "Medium", mins: 35 },
    { text: "Review OWASP Top 10", difficulty: "Easy", mins: 30 },
    { text: "Build a caching layer with Redis", difficulty: "Hard", mins: 60 },
    { text: "Write tests for existing APIs", difficulty: "Medium", mins: 50 },
    { text: "Mock 3 backend interviews", difficulty: "Hard", mins: 90 }
  ],
  fullstack: [
    { text: "Build end-to-end CRUD app", difficulty: "Hard", mins: 120 },
    { text: "Set up CI/CD pipeline", difficulty: "Medium", mins: 45 },
    { text: "Practice Docker containerization", difficulty: "Medium", mins: 40 },
    { text: "Review WebSocket implementation", difficulty: "Medium", mins: 35 },
    { text: "Study microservices patterns", difficulty: "Hard", mins: 50 },
    { text: "Complete integration test suite", difficulty: "Hard", mins: 60 },
    { text: "Deploy app to cloud", difficulty: "Medium", mins: 40 },
    { text: "Mock 3 fullstack interviews", difficulty: "Hard", mins: 90 }
  ],
  dsa: [
    { text: "Solve 50 LeetCode easy problems", difficulty: "Easy", mins: 200 },
    { text: "Solve 30 LeetCode medium problems", difficulty: "Hard", mins: 300 },
    { text: "Implement 10 data structures", difficulty: "Hard", mins: 120 },
    { text: "Study graph algorithms deeply", difficulty: "Hard", mins: 90 },
    { text: "Practice DP patterns daily", difficulty: "Hard", mins: 100 },
    { text: "Timed contest participation x5", difficulty: "Hard", mins: 150 },
    { text: "Review Big-O complexity guide", difficulty: "Easy", mins: 30 },
    { text: "Mock 3 OA tests", difficulty: "Hard", mins: 90 }
  ],
  "system-design": [
    { text: "Design URL shortener end-to-end", difficulty: "Hard", mins: 60 },
    { text: "Design social media feed system", difficulty: "Hard", mins: 75 },
    { text: "Study distributed systems paper", difficulty: "Hard", mins: 90 },
    { text: "Practice estimation problems", difficulty: "Medium", mins: 40 },
    { text: "Design payment processing system", difficulty: "Hard", mins: 75 },
    { text: "Review Netflix/Twitter architecture", difficulty: "Medium", mins: 45 },
    { text: "Whiteboard practice sessions x5", difficulty: "Hard", mins: 120 },
    { text: "Mock 3 design interviews", difficulty: "Hard", mins: 90 }
  ],
  ml: [
    { text: "Review linear algebra fundamentals", difficulty: "Medium", mins: 50 },
    { text: "Implement logistic regression", difficulty: "Hard", mins: 60 },
    { text: "Study backpropagation math", difficulty: "Hard", mins: 70 },
    { text: "Build ML pipeline end-to-end", difficulty: "Hard", mins: 90 },
    { text: "Practice feature engineering", difficulty: "Medium", mins: 45 },
    { text: "Study model evaluation metrics", difficulty: "Easy", mins: 30 },
    { text: "Implement a neural net from scratch", difficulty: "Hard", mins: 100 },
    { text: "Mock 3 ML interviews", difficulty: "Hard", mins: 90 }
  ]
}

const normalizeNote = (note) =>
  typeof note === "string" ? { text: note, ts: "", pinned: false } : { pinned: false, ...note }

const getYTId = (url) => url?.match(/(?:v=|\.be\/|embed\/)([^&?/]+)/)?.[1] || ""

const DIFF_COLOR = {
  Easy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Hard: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  Beginner: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Intermediate: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Advanced: "text-rose-400 bg-rose-500/10 border-rose-500/20"
}

const TABS = [
  { id: "strategy", label: "Roadmap", icon: BookOpen },
  { id: "checklist", label: "Checklist", icon: ListChecks },
  { id: "videos", label: "Videos", icon: Video },
  { id: "notes", label: "Notes", icon: StickyNote }
]

function ProgressRing({ value, size = 72, stroke = 6, color = ACCENT }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c * (1 - Math.min(100, Math.max(0, value)) / 100)
  return (
    <svg width={size} height={size} className="-rotate-90 shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }}
      />
    </svg>
  )
}

export default function InterviewPrepHub() {
  const [selectedField, setSelectedField] = useState(null)
  const [activeTab, setActiveTab] = useState("strategy")
  const [playingVideo, setPlayingVideo] = useState(null)
  const [noteInput, setNoteInput] = useState("")
  const [expandedWeek, setExpandedWeek] = useState(null)
  const [videoFilter, setVideoFilter] = useState("All")
  const [videoSearch, setVideoSearch] = useState("")
  const [noteSearch, setNoteSearch] = useState("")
  const [noteSort, setNoteSort] = useState("newest")

  const {
    notes,
    checklist,
    watchedVideos,
    loadingProgress,
    addNote: triggerAddNote,
    deleteNote: triggerDeleteNote,
    toggleChecklist,
    toggleWatchedVideo
  } = usePrepProgress(selectedField)

  const field = FIELDS.find((f) => f.id === selectedField)
  const resources = selectedField ? RESOURCES[selectedField] || [] : []
  const strategies = selectedField ? STRATEGIES[selectedField] || [] : []
  const checkMeta = selectedField ? CHECKLIST_TEMPLATES[selectedField] || [] : []

  const checklistArr = Array.isArray(checklist) ? checklist : checklist?.[selectedField] || []
  const notesArr = (Array.isArray(notes) ? notes : notes?.[selectedField] || []).map(normalizeNote)
  const watchedArr = Array.isArray(watchedVideos) ? watchedVideos : watchedVideos?.[selectedField] || []

  const tasksDone = checklistArr.filter(Boolean).length
  const tasksTotal = checkMeta.length || 1
  const checklistPct = Math.round((tasksDone / tasksTotal) * 100)
  const videosDone = watchedArr.length
  const videosTotal = resources.length || 1
  const videoPct = Math.round((videosDone / videosTotal) * 100)
  const overallPct = Math.round(checklistPct * 0.5 + videoPct * 0.35 + (notesArr.length > 0 ? 15 : 0))

  const currentWeekIdx = useMemo(() => {
    if (!checkMeta.length) return 0
    const perWeek = Math.ceil(checkMeta.length / 4)
    for (let w = 0; w < 4; w++) {
      const slice = checklistArr.slice(w * perWeek, (w + 1) * perWeek)
      if (slice.some((x) => !x) || slice.length < perWeek) return w
    }
    return 3
  }, [checklistArr, checkMeta.length])

  const currentStrategy = strategies[currentWeekIdx] || strategies[0]
  const weeksLeft = Math.max(0, 4 - currentWeekIdx - (checklistPct === 100 ? 1 : 0))

  useEffect(() => {
    setPlayingVideo(null)
  }, [activeTab, selectedField])

  useEffect(() => {
    if (selectedField != null) setExpandedWeek(currentWeekIdx)
  }, [selectedField, currentWeekIdx])

  const handleAddNote = () => {
    if (!noteInput.trim() || !selectedField) return
    triggerAddNote(noteInput.trim())
    setNoteInput("")
  }

  const goContinue = () => {
    if (!selectedField) {
      setSelectedField("frontend")
    }
    setActiveTab("strategy")
    const week = typeof currentWeekIdx === "number" ? currentWeekIdx : 0
    setExpandedWeek(week)
    requestAnimationFrame(() => {
      setTimeout(() => {
        document.getElementById("prep-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 80)
    })
  }

  const filteredVideos = resources.filter((v) => {
    const matchLevel = videoFilter === "All" || v.level === videoFilter
    const matchQ = !videoSearch || v.title.toLowerCase().includes(videoSearch.toLowerCase())
    return matchLevel && matchQ
  })

  const sortedNotes = [...notesArr]
    .filter((n) => !noteSearch || n.text.toLowerCase().includes(noteSearch.toLowerCase()))
    .sort((a, b) => {
      if (noteSort === "pinned") return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)
      return 0
    })

  const FieldIcon = field?.icon
  const accent = field?.color || ACCENT

  return (
    <div className="space-y-8 pb-16 max-w-6xl">
      {/* Field selector */}
      <section>
        <p className="text-[11px] font-medium tracking-widest uppercase text-white/30 mb-4">Learning path</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {FIELDS.map((f) => {
            const active = selectedField === f.id
            const Icon = f.icon
            const pct = active ? overallPct : 0
            return (
              <button
                key={f.id}
                onClick={() => {
                  setSelectedField(active ? null : f.id)
                  setActiveTab("strategy")
                }}
                className={`group relative text-left rounded-2xl p-4 border transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-[#7C6BFF]/60 ${
                  active
                    ? "bg-white/[0.04] border-[#7C6BFF]/40 shadow-[0_0_0_1px_rgba(124,107,255,0.15),0_8px_32px_rgba(124,107,255,0.12)]"
                    : "bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]"
                }`}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition"
                  style={{
                    background: active ? `${f.color}22` : "rgba(255,255,255,0.04)",
                    color: active ? f.color : "rgba(255,255,255,0.45)"
                  }}
                >
                  <Icon className="w-4.5 h-4.5" strokeWidth={1.75} />
                </div>
                <div className={`text-[13px] font-medium leading-snug mb-3 ${active ? "text-white" : "text-white/50 group-hover:text-white/70"}`}>
                  {f.label}
                </div>
                <div className="h-[3px] rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: f.color }} />
                </div>
                {active && (
                  <div className="text-[10px] mt-2 font-medium tabular-nums" style={{ color: f.color }}>
                    {pct}% complete
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </section>

      {loadingProgress && (
        <div className="flex items-center gap-2 text-sm text-white/40">
          <Loader2 className="w-4 h-4 animate-spin" /> Syncing…
        </div>
      )}

      {!selectedField && !loadingProgress && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-8 py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4 text-white/30">
            <BookOpen className="w-5 h-5" />
          </div>
          <p className="text-white/80 font-medium mb-1">Select a learning path</p>
          <p className="text-sm text-white/35 max-w-sm mx-auto">
            Choose a field above to open your roadmap, checklist, videos and notes.
          </p>
        </div>
      )}

      {selectedField && field && !loadingProgress && (
        <>
          {/* Hero */}
          <section className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.04] to-transparent p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center gap-8">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accent}20`, color: accent }}>
                    {FieldIcon && <FieldIcon className="w-5 h-5" strokeWidth={1.75} />}
                  </div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-semibold text-white tracking-tight">{field.label}</h1>
                    <p className="text-[12px] text-white/35 mt-0.5">{field.tags.join(" · ")}</p>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-white/40">Overall progress</span>
                    <span className="font-medium tabular-nums text-white/70">{overallPct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${overallPct}%`, background: accent }} />
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-[12px]">
                  <div>
                    <div className="text-white/30 mb-0.5">Resume from</div>
                    <div className="text-white/80 font-medium">Week {currentWeekIdx + 1}</div>
                  </div>
                  <div>
                    <div className="text-white/30 mb-0.5">Current topic</div>
                    <div className="text-white/80 font-medium truncate">
                      {currentStrategy?.tasks?.[0]?.split(",")[0] || currentStrategy?.title || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-white/30 mb-0.5">Est. remaining</div>
                    <div className="text-white/80 font-medium">
                      {weeksLeft} week{weeksLeft !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div>
                    <div className="text-white/30 mb-0.5">Tasks done</div>
                    <div className="text-white/80 font-medium tabular-nums">
                      {tasksDone}/{tasksTotal}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={goContinue}
                className="shrink-0 inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl text-sm font-medium text-white transition hover:brightness-110 active:scale-[0.98]"
                style={{ background: ACCENT, boxShadow: `0 0 0 1px ${ACCENT}55, 0 8px 24px ${ACCENT}33` }}
              >
                Continue learning
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>

          {/* Continue strip */}
          <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-[#7C6BFF]/15 text-[#7C6BFF] flex items-center justify-center shrink-0">
                <Play className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-white/30 uppercase tracking-wider font-medium">Continue where you left off</p>
                <p className="text-sm text-white/85 font-medium truncate mt-0.5">
                  Week {currentWeekIdx + 1} · {currentStrategy?.title || "Getting started"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={goContinue}
              className="shrink-0 h-9 px-4 rounded-lg text-[13px] font-medium border border-white/[0.1] text-white/70 hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition"
            >
              Resume
            </button>
          </section>

          {/* Progress overview */}
          <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="relative flex items-center justify-center">
                <ProgressRing value={overallPct} size={80} stroke={7} color={accent} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-semibold text-white tabular-nums">{overallPct}%</span>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Tasks completed", value: `${tasksDone}/${tasksTotal}` },
                  { label: "Videos watched", value: `${videosDone}/${videosTotal}` },
                  { label: "Notes created", value: notesArr.length },
                  { label: "Current week", value: `Week ${currentWeekIdx + 1}` }
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-[11px] text-white/30 mb-1">{s.label}</div>
                    <div className="text-[15px] font-medium text-white/90 tabular-nums">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Tabs + content — THIS is prep-workspace */}
          <section
            id="prep-workspace"
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden scroll-mt-24"
          >
            <div className="relative flex border-b border-white/[0.06] px-2 overflow-x-auto">
              {TABS.map((t) => {
                const Icon = t.icon
                const on = activeTab === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id)}
                    className={`relative flex items-center gap-2 px-4 py-3.5 text-[13px] font-medium whitespace-nowrap transition ${
                      on ? "text-white" : "text-white/35 hover:text-white/60"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                    {t.label}
                    {on && (
                      <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full" style={{ background: ACCENT }} />
                    )}
                  </button>
                )
              })}
            </div>

            <div className="p-5 md:p-6">
              {activeTab === "strategy" && (
                <div className="relative space-y-0">
                  <div className="absolute left-[15px] top-3 bottom-3 w-px bg-white/[0.06]" />
                  {strategies.map((s, idx) => {
                    const done = idx < currentWeekIdx
                    const current = idx === currentWeekIdx
                    const open = expandedWeek === idx
                    return (
                      <div key={s.week} className="relative pl-10 pb-5 last:pb-0">
                        <div
                          className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold border z-10 ${
                            done
                              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                              : current
                              ? "border-[#7C6BFF]/50 text-[#7C6BFF] bg-[#7C6BFF]/15"
                              : "bg-white/[0.03] border-white/[0.08] text-white/30"
                          }`}
                        >
                          {done ? <CheckCircle2 className="w-4 h-4" /> : s.week}
                        </div>
                        <button
                          type="button"
                          onClick={() => setExpandedWeek(open ? null : idx)}
                          className={`w-full text-left rounded-xl border p-4 transition ${
                            open ? "bg-white/[0.03] border-white/[0.1]" : "bg-transparent border-transparent hover:bg-white/[0.02]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-medium text-white/30 uppercase tracking-wider">Week {s.week}</span>
                                {current && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#7C6BFF]/15 text-[#7C6BFF] font-medium">Current</span>
                                )}
                                {done && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium">Done</span>
                                )}
                              </div>
                              <div className="text-[14px] font-medium text-white/90 mt-1">{s.title}</div>
                            </div>
                            <div className="text-[12px] text-white/30 flex items-center gap-1 shrink-0">
                              <Clock className="w-3 h-3" /> ~{s.hours}h
                            </div>
                          </div>
                          {open && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {s.tasks.map((task) => (
                                <span
                                  key={task}
                                  className="text-[12px] text-white/50 bg-white/[0.04] border border-white/[0.06] rounded-lg px-2.5 py-1"
                                >
                                  {task}
                                </span>
                              ))}
                            </div>
                          )}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              {activeTab === "checklist" && (
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <div className="text-[13px] text-white/50">Week progress</div>
                      <div className="text-lg font-semibold text-white tabular-nums mt-0.5">{checklistPct}%</div>
                    </div>
                    <div className="w-32 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${checklistPct}%`, background: accent }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {checkMeta.map((item, idx) => {
                      const done = !!checklistArr[idx]
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleChecklist(idx)}
                          className={`w-full flex items-center gap-3.5 rounded-xl border px-4 py-3.5 text-left transition ${
                            done
                              ? "bg-emerald-500/[0.06] border-emerald-500/15"
                              : "bg-white/[0.02] border-white/[0.06] hover:border-white/[0.1] hover:bg-white/[0.03]"
                          }`}
                        >
                          {done ? (
                            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="w-4.5 h-4.5 text-white/20 shrink-0" />
                          )}
                          <span className={`flex-1 text-[13px] ${done ? "text-white/40 line-through" : "text-white/80"}`}>
                            {item.text}
                          </span>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${DIFF_COLOR[item.difficulty] || DIFF_COLOR.Medium}`}>
                            {item.difficulty}
                          </span>
                          <span className="text-[11px] text-white/25 tabular-nums w-12 text-right shrink-0">{item.mins}m</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {activeTab === "videos" && (
                <div>
                  <div className="flex flex-col sm:flex-row gap-3 mb-5">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-white/25 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        value={videoSearch}
                        onChange={(e) => setVideoSearch(e.target.value)}
                        placeholder="Search videos…"
                        className="w-full h-9 rounded-lg bg-white/[0.03] border border-white/[0.08] pl-9 pr-3 text-[13px] text-white placeholder:text-white/25 outline-none focus:border-[#7C6BFF]/40"
                      />
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      {["All", "Beginner", "Intermediate", "Advanced"].map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setVideoFilter(f)}
                          className={`h-9 px-3 rounded-lg text-[12px] font-medium transition border ${
                            videoFilter === f
                              ? "bg-[#7C6BFF]/15 border-[#7C6BFF]/30 text-[#7C6BFF]"
                              : "bg-transparent border-white/[0.06] text-white/35 hover:text-white/60"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {playingVideo !== null && resources[playingVideo] && (
                    <div className="mb-5 rounded-xl overflow-hidden border border-white/[0.08] bg-black">
                      <div className="flex items-center justify-between px-3 py-2 bg-white/[0.03] border-b border-white/[0.06]">
                        <span className="text-[12px] text-white/50 truncate">{resources[playingVideo].title}</span>
                        <button type="button" onClick={() => setPlayingVideo(null)} className="p-1 text-white/30 hover:text-white">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="relative pt-[56.25%]">
                        <iframe
                          className="absolute inset-0 w-full h-full"
                          src={`https://www.youtube.com/embed/${getYTId(resources[playingVideo].url)}?autoplay=1`}
                          allow="autoplay; fullscreen"
                          allowFullScreen
                          title={resources[playingVideo].title}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {filteredVideos.map((v) => {
                      const i = resources.indexOf(v)
                      const watched = watchedArr.includes(i)
                      return (
                        <div
                          key={i}
                          className={`rounded-xl border overflow-hidden transition hover:-translate-y-0.5 ${
                            watched
                              ? "border-emerald-500/20 bg-emerald-500/[0.03]"
                              : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]"
                          }`}
                        >
                          <div className="relative aspect-video bg-black/40 group">
                            <img
                              src={v.thumb}
                              alt=""
                              className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition"
                              onError={(e) => {
                                e.target.style.display = "none"
                              }}
                            />
                            <button type="button" onClick={() => setPlayingVideo(i)} className="absolute inset-0 flex items-center justify-center">
                              <span className="w-10 h-10 rounded-full bg-black/60 border border-white/15 flex items-center justify-center text-white hover:bg-[#7C6BFF]/90 transition">
                                <Play className="w-3.5 h-3.5 ml-0.5" />
                              </span>
                            </button>
                            {watched && (
                              <span className="absolute top-2 right-2 text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/90 text-white">
                                Done
                              </span>
                            )}
                          </div>
                          <div className="p-3">
                            <div className="text-[12px] font-medium text-white/80 leading-snug line-clamp-2 mb-2">{v.title}</div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] text-white/30">{v.duration}</span>
                              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${DIFF_COLOR[v.level] || ""}`}>
                                {v.level}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleWatchedVideo(i)}
                              className="mt-2.5 w-full h-7 rounded-lg text-[11px] font-medium border border-white/[0.08] text-white/40 hover:text-white/70 hover:border-white/15 transition"
                            >
                              {watched ? "Mark unwatched" : "Mark watched"}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {filteredVideos.length === 0 && (
                    <p className="text-center text-sm text-white/30 py-10">No videos match your filters.</p>
                  )}
                </div>
              )}

              {activeTab === "notes" && (
                <div>
                  <div className="flex flex-col sm:flex-row gap-3 mb-5">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-white/25 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        value={noteSearch}
                        onChange={(e) => setNoteSearch(e.target.value)}
                        placeholder="Search notes…"
                        className="w-full h-9 rounded-lg bg-white/[0.03] border border-white/[0.08] pl-9 pr-3 text-[13px] text-white placeholder:text-white/25 outline-none focus:border-[#7C6BFF]/40"
                      />
                    </div>
                    <select
                      value={noteSort}
                      onChange={(e) => setNoteSort(e.target.value)}
                      className="h-9 rounded-lg bg-white/[0.03] border border-white/[0.08] px-3 text-[12px] text-white/60 outline-none"
                    >
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                      <option value="pinned">Pinned first</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <textarea
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      placeholder="Capture a learning note…"
                      className="w-full min-h-[88px] rounded-xl bg-white/[0.03] border border-white/[0.08] px-4 py-3 text-[13px] text-white placeholder:text-white/25 outline-none focus:border-[#7C6BFF]/40 resize-y"
                    />
                    <button
                      type="button"
                      onClick={handleAddNote}
                      disabled={!noteInput.trim()}
                      className="mt-2 h-9 px-4 rounded-lg text-[13px] font-medium text-white disabled:opacity-40 transition hover:brightness-110"
                      style={{ background: ACCENT }}
                    >
                      Save note
                    </button>
                  </div>

                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {sortedNotes.length === 0 ? (
                      <p className="col-span-2 text-center text-sm text-white/30 py-12">No notes yet.</p>
                    ) : (
                      sortedNotes.map((note, index) => (
                        <div
                          key={index}
                          className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-white/[0.1] transition group"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-[13px] text-white/80 leading-relaxed line-clamp-4 flex-1 whitespace-pre-wrap">{note.text}</p>
                            <button
                              type="button"
                              onClick={() => triggerDeleteNote(index)}
                              className="opacity-0 group-hover:opacity-100 text-white/25 hover:text-rose-400 transition p-0.5"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {note.ts && <div className="text-[10px] text-white/25">{note.ts}</div>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  )
}