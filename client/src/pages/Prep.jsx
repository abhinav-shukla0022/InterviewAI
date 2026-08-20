import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import {
  BookOpen,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Globe,
  ListChecks,
  FileUp,
  Trash2,
  Loader2,
  Target,
  Zap,
  Brain,
  TrendingUp,
  AlertTriangle,
  Star,
  Calendar,
  ExternalLink,
  Play,
  ChevronRight,
  Flame
} from "lucide-react"

const API_BASE = import.meta.env.VITE_API_URL || "https://interviewai-bnux.onrender.com"

const ROLES = [
  "Software Engineer",
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Engineer",
  "Machine Learning Engineer",
  "System Design Specialist",
  "DevOps Engineer"
]

function ScoreRing({ score }) {
  const size = 128
  const stroke = 11
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.min(100, Math.max(0, score || 0)) / 100
  const offset = c * (1 - pct)
  const color =
    pct >= 0.8 ? "#34d399" : pct >= 0.6 ? "#818cf8" : pct >= 0.4 ? "#fb923c" : "#f472b6"
  const label =
    pct >= 0.8 ? "Excellent" : pct >= 0.6 ? "Strong" : pct >= 0.4 ? "Fair" : "Needs work"

  return (
    <div className="relative shrink-0 flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e2535" strokeWidth={stroke} />
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
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ height: size }}>
        <span className="text-3xl font-extrabold text-white leading-none">{score ?? "—"}</span>
        <span className="text-[10px] text-gray-500 mt-1">/ 100</span>
      </div>
      <span className="mt-2 text-xs font-semibold" style={{ color }}>{label}</span>
    </div>
  )
}

function StepBadge({ step, current, label }) {
  const done = current > step
  const active = current === step
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition ${
          done
            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
            : active
            ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-[0_0_14px_rgba(99,102,241,0.4)]"
            : "bg-gray-900/60 border-gray-800 text-gray-600"
        }`}
      >
        {done ? <CheckCircle2 className="w-4 h-4" /> : step}
      </div>
      <span className={`text-xs font-semibold hidden sm:block ${active ? "text-white" : done ? "text-emerald-400/80" : "text-gray-600"}`}>
        {label}
      </span>
    </div>
  )
}

function SkillBar({ label, level, color }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-gray-300 font-medium truncate pr-2">{label}</span>
        <span className="text-gray-500 shrink-0">{level}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${level}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

function parseGapSections(raw) {
  if (!raw || typeof raw !== "string") return null
  const sections = { strong: [], improve: [], missing: [] }
  const lines = raw.split(/\n+/).map((l) => l.trim()).filter(Boolean)
  let mode = null
  for (const line of lines) {
    const lower = line.toLowerCase()
    if (lower.includes("strong skill")) { mode = "strong"; continue }
    if (lower.includes("needs improvement") || lower.includes("weak")) { mode = "improve"; continue }
    if (lower.includes("missing skill")) { mode = "missing"; continue }
    if (!mode) continue
    const cleaned = line.replace(/^[-•*]\s*/, "").replace(/^\d+[\.\)]\s*/, "").trim()
    if (cleaned.length > 2) sections[mode].push(cleaned)
  }
  const hasAny = sections.strong.length + sections.improve.length + sections.missing.length > 0
  return hasAny ? sections : null
}

function NextStepBanner({ title, desc, onClick, icon: Icon, color = "indigo" }) {
  return (
    <button
      onClick={onClick}
      className="w-full group flex items-center gap-4 rounded-2xl border p-4 text-left transition hover:scale-[1.01]"
      style={{
        background: `linear-gradient(135deg, rgba(99,102,241,0.12), rgba(16,185,129,0.06))`,
        borderColor: "rgba(99,102,241,0.35)"
      }}
    >
      <div className="p-3 rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-white group-hover:text-indigo-200 transition">{title}</div>
        <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
      </div>
      <ChevronRight className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition shrink-0" />
    </button>
  )
}

function Prep() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [resumeText, setResumeText] = useState("")
  const [targetRole, setTargetRole] = useState("Software Engineer")
  const [analysis, setAnalysis] = useState(null)
  const [gapOutput, setGapOutput] = useState("")
  const [roadmap, setRoadmap] = useState([])
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeAction, setActiveAction] = useState(null)
  const [modeMessage, setModeMessage] = useState("Upload your resume to unlock AI-powered prep intelligence.")
  const [revealed, setRevealed] = useState(false)

  const step =
    roadmap.length > 0 ? 4 : gapOutput ? 3 : analysis ? 2 : resumeText ? 1 : 0

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await axios.get(`${API_BASE}/api/resources`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setResources(res.data || [])
      } catch (e) {
        console.error(e)
      }
    }
    fetchResources()
  }, [])

  useEffect(() => {
    if (analysis || gapOutput || roadmap.length) {
      setRevealed(false)
      requestAnimationFrame(() => setRevealed(true))
    }
  }, [analysis, gapOutput, roadmap])

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === "dragenter" || e.type === "dragover")
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const f = e.dataTransfer.files?.[0]
    if (f?.type === "application/pdf") setFile(f)
    else if (f) alert("Please upload a PDF file only.")
  }

  const uploadResume = async () => {
    if (!file) return
    setLoading(true)
    setActiveAction("upload")
    setModeMessage("Parsing resume…")
    try {
      const formData = new FormData()
      formData.append("resume", file)
      const res = await axios.post(`${API_BASE}/upload-resume`, formData)
      setResumeText(res.data.text)
      setModeMessage("Resume ready. Analyze to get your score.")
    } catch (e) {
      console.error(e)
      alert("Resume upload failed.")
    } finally {
      setLoading(false)
      setActiveAction(null)
    }
  }

  const analyzeResume = async () => {
    if (!resumeText) return alert("Upload a resume first.")
    setLoading(true)
    setActiveAction("analyze")
    setModeMessage("AI is scoring your resume…")
    try {
      const token = localStorage.getItem("token")
      const res = await axios.post(
        `${API_BASE}/api/resume/analyze`,
        { resumeText, targetRole },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setAnalysis(res.data)
      setModeMessage("Insights ready. Continue with skill gap.")
    } catch (e) {
      console.error(e)
      alert("Resume analysis failed.")
    } finally {
      setLoading(false)
      setActiveAction(null)
    }
  }

  const createGapOutput = async () => {
    if (!resumeText) return alert("Upload a resume first.")
    setLoading(true)
    setActiveAction("gap")
    setGapOutput("")
    setModeMessage("Mapping strong, weak & missing skills…")
    try {
      const token = localStorage.getItem("token")
      const res = await axios.post(
        `${API_BASE}/api/prepare/skill-gap`,
        { resumeText, targetRole },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setGapOutput(res.data.output || "")
      setModeMessage("Skill gap mapped. Build your roadmap next.")
    } catch (e) {
      console.error(e)
      alert("Skill gap analysis failed.")
    } finally {
      setLoading(false)
      setActiveAction(null)
    }
  }

  const createRoadmap = async () => {
    if (!resumeText) return alert("Upload a resume first.")
    setLoading(true)
    setActiveAction("roadmap")
    setModeMessage("Building 4-week roadmap…")
    try {
      const token = localStorage.getItem("token")
      const res = await axios.post(
        `${API_BASE}/api/prepare/roadmap`,
        { resumeText, targetRole },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setRoadmap(res.data.roadmap || [])
      setModeMessage("Roadmap ready. Time to practice.")
    } catch (e) {
      console.error(e)
      alert("Roadmap generation failed.")
    } finally {
      setLoading(false)
      setActiveAction(null)
    }
  }

  const gapSections = parseGapSections(gapOutput)
  const weekColors = ["#818cf8", "#22d3ee", "#34d399", "#fb923c"]

  // Fake relative strength for visual bars from skill lists
  const skillBars = (analysis?.skills || []).slice(0, 5).map((s, i) => ({
    label: s,
    level: 88 - i * 9,
    color: "#818cf8"
  }))
  const weakBars = (analysis?.weakSkills || []).slice(0, 4).map((s, i) => ({
    label: s,
    level: 35 + i * 8,
    color: "#f472b6"
  }))

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row gap-6 justify-between items-start">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-2xl bg-indigo-500/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-indigo-300 font-semibold border border-indigo-500/20">
            <BookOpen className="w-4 h-4" />
            Interview Strategy Studio
          </div>
          <h1 className="mt-5 text-4xl font-extrabold text-white tracking-tight leading-tight">
            AI mentor for{" "}
            <span className="gradient-text">skills, gaps & readiness</span>
          </h1>
          <p className="mt-4 max-w-xl text-gray-400 leading-7">
            Upload your resume → get a live score, visual skill map, and a week-by-week plan you can act on.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {[
              { icon: ShieldCheck, label: "Resume scoring", color: "text-emerald-400" },
              { icon: ListChecks, label: "Skill gap radar", color: "text-sky-400" },
              { icon: Calendar, label: "4-week roadmap", color: "text-violet-400" },
              { icon: Globe, label: "Curated resources", color: "text-amber-400" }
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-2 rounded-2xl bg-slate-900/70 px-3.5 py-2.5 border border-gray-800 text-sm text-gray-300">
                <f.icon className={`w-4 h-4 ${f.color}`} />
                {f.label}
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-3 sm:gap-5 flex-wrap">
            <StepBadge step={1} current={step} label="Upload" />
            <div className="w-6 h-px bg-gray-800 hidden sm:block" />
            <StepBadge step={2} current={step} label="Analyze" />
            <div className="w-6 h-px bg-gray-800 hidden sm:block" />
            <StepBadge step={3} current={step} label="Skill Gap" />
            <div className="w-6 h-px bg-gray-800 hidden sm:block" />
            <StepBadge step={4} current={step} label="Roadmap" />
          </div>
        </div>

        {/* CONTROL PANEL */}
        <div className="glass-panel rounded-3xl p-6 border border-gray-800/60 w-full lg:w-[400px] shrink-0">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-semibold">Control panel</p>
              <h2 className="text-lg font-semibold text-white">AI Prep Console</h2>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
          </div>

          <div className="rounded-2xl bg-gray-950/80 border border-gray-900 p-4 mb-4">
            <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-semibold block mb-2">Target Role</label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full rounded-xl bg-black/30 border border-gray-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-semibold block mb-2">Resume (PDF)</label>
            {!file ? (
              <div
                className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center gap-3 transition cursor-pointer ${
                  dragActive ? "border-indigo-500 bg-indigo-500/10" : "border-gray-800 hover:border-gray-600 bg-gray-950/20"
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input type="file" ref={fileInputRef} accept=".pdf" className="hidden" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                  <FileUp className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm text-gray-200">Drop PDF here</p>
                  <p className="text-[11px] text-gray-500">or click to browse</p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-950/80 rounded-2xl border border-gray-900 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                    <FileUp className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-xs text-gray-200 truncate">{file.name}</div>
                    <div className="text-[10px] text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                </div>
                <button
                  onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = "" }}
                  className="p-2 border border-gray-800 hover:border-rose-500/30 text-gray-400 hover:text-rose-400 rounded-xl transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="grid gap-2.5">
            <button
              onClick={uploadResume}
              disabled={!file || loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold disabled:opacity-45"
            >
              {activeAction === "upload" ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              Upload Resume
            </button>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "analyze", fn: analyzeResume, icon: Brain, label: "Analyze" },
                { id: "gap", fn: createGapOutput, icon: ListChecks, label: "Skill Gap" },
                { id: "roadmap", fn: createRoadmap, icon: Calendar, label: "Roadmap" }
              ].map((b) => (
                <button
                  key={b.id}
                  onClick={b.fn}
                  disabled={!resumeText || loading}
                  className="inline-flex items-center justify-center gap-1 px-2 py-2.5 rounded-xl border border-gray-800 bg-gray-900 text-white text-xs font-semibold hover:border-indigo-500 disabled:opacity-40"
                >
                  {activeAction === b.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <b.icon className="w-3.5 h-3.5" />}
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl bg-gray-950/60 border border-gray-900 px-3.5 py-3">
            {loading ? <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0 mt-0.5" /> : <Zap className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />}
            <p className="text-xs text-gray-400 leading-relaxed">{modeMessage}</p>
          </div>
        </div>
      </div>

      {/* NEXT STEP (keeps flow alive) */}
      {step === 1 && (
        <NextStepBanner
          title="Resume uploaded — analyze it now"
          desc="Get score, top skills and role fit in one click"
          onClick={analyzeResume}
          icon={Brain}
        />
      )}
      {step === 2 && !gapOutput && (
        <NextStepBanner
          title="Insights ready — map your skill gaps"
          desc={`See what to improve for ${targetRole}`}
          onClick={createGapOutput}
          icon={ListChecks}
        />
      )}
      {step === 3 && roadmap.length === 0 && (
        <NextStepBanner
          title="Gaps mapped — generate your 4-week plan"
          desc="Get a weekly roadmap tailored to your resume"
          onClick={createRoadmap}
          icon={Calendar}
        />
      )}
      {step === 4 && (
        <NextStepBanner
          title="Roadmap ready — practice in a mock interview"
          desc="Turn insights into real session scores"
          onClick={() => navigate("/interview")}
          icon={Play}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-[1.45fr_0.85fr]">
        <div className="space-y-6">
          {/* INSIGHTS */}
          <div className={`glass-panel rounded-3xl p-6 border border-gray-800/60 transition-all duration-500 ${revealed && analysis ? "opacity-100 translate-y-0" : ""}`}>
            <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
              <div>
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-400" />
                  Resume Insights
                </h2>
                <p className="text-sm text-gray-500 mt-1">Score, strengths and role alignment</p>
              </div>
              {analysis && <ScoreRing score={analysis.resumeScore} />}
            </div>

            {!analysis ? (
              <div className="rounded-2xl border border-dashed border-gray-800 bg-gray-950/40 p-10 text-center">
                <Brain className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Upload & analyze to unlock your score and skill map.</p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-2xl bg-gray-950/80 border border-gray-900 p-5">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2 font-semibold">AI Summary</div>
                  <p className="text-sm text-gray-300 leading-7">{analysis.summary}</p>
                </div>

                {analysis.gapSummary && (
                  <div className="rounded-2xl bg-amber-500/5 border border-amber-500/20 p-4 flex gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-amber-300 mb-1">Focus area</div>
                      <p className="text-sm text-gray-400 leading-6">{analysis.gapSummary}</p>
                    </div>
                  </div>
                )}

                {/* Visual skill meters */}
                {(skillBars.length > 0 || weakBars.length > 0) && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-gray-950/80 border border-gray-900 p-5 space-y-3">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-indigo-300 font-semibold flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5" /> Strengths
                      </div>
                      {skillBars.map((s) => (
                        <SkillBar key={s.label} {...s} />
                      ))}
                    </div>
                    <div className="rounded-2xl bg-gray-950/80 border border-gray-900 p-5 space-y-3">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-rose-300 font-semibold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> Grow these
                      </div>
                      {weakBars.length ? weakBars.map((s) => (
                        <SkillBar key={s.label} {...s} />
                      )) : (
                        <p className="text-xs text-gray-600">No weak skills flagged</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {(analysis.targetRoles || []).map((role) => (
                    <span key={role} className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200 font-medium flex items-center gap-1.5">
                      <Star className="w-3 h-3" /> {role}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SKILL GAP — interactive cards */}
          <div className="glass-panel rounded-3xl p-6 border border-gray-800/60">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-sky-400" />
                  Skill Gap Radar
                </h2>
                <p className="text-sm text-gray-500 mt-1">Click a skill to practice it in mock mode</p>
              </div>
            </div>

            {!gapOutput ? (
              <div className="rounded-2xl border border-dashed border-gray-800 bg-gray-950/40 p-10 text-center">
                <ListChecks className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Run Skill Gap to see visual recommendations.</p>
              </div>
            ) : gapSections ? (
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { key: "strong", title: "Strong", items: gapSections.strong, bg: "rgba(16,185,129,0.07)", border: "rgba(16,185,129,0.28)", icon: CheckCircle2, iconColor: "#34d399" },
                  { key: "improve", title: "Improve", items: gapSections.improve, bg: "rgba(245,158,11,0.07)", border: "rgba(245,158,11,0.28)", icon: AlertTriangle, iconColor: "#fbbf24" },
                  { key: "missing", title: "Missing", items: gapSections.missing, bg: "rgba(244,63,94,0.07)", border: "rgba(244,63,94,0.28)", icon: Zap, iconColor: "#fb7185" }
                ].map((col) => (
                  <div key={col.key} className="rounded-2xl border p-4" style={{ backgroundColor: col.bg, borderColor: col.border }}>
                    <div className="flex items-center gap-2 mb-3">
                      <col.icon className="w-4 h-4" style={{ color: col.iconColor }} />
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-300">{col.title}</span>
                      <span className="ml-auto text-[10px] text-gray-500">{col.items.length}</span>
                    </div>
                    <ul className="space-y-2">
                      {col.items.length === 0 && <li className="text-xs text-gray-600">—</li>}
                      {col.items.slice(0, 6).map((item, i) => (
                        <li key={i}>
                          <button
                            onClick={() => navigate("/interview")}
                            className="w-full text-left text-xs text-gray-300 leading-relaxed pl-2 border-l-2 border-gray-800 hover:border-indigo-400 hover:text-white transition py-0.5 group flex items-start gap-1"
                            title="Practice in mock interview"
                          >
                            <span className="flex-1">{item.length > 80 ? item.slice(0, 80) + "…" : item}</span>
                            {col.key !== "strong" && (
                              <Play className="w-3 h-3 text-gray-600 group-hover:text-indigo-400 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition" />
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <pre className="rounded-2xl bg-black/50 border border-gray-900 p-5 text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap">{gapOutput}</pre>
            )}
          </div>

          {/* ROADMAP TIMELINE */}
          <div className="glass-panel rounded-3xl p-6 border border-gray-800/60">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-400" />
                  Personal Roadmap
                </h2>
                <p className="text-sm text-gray-500 mt-1">4-week plan · tick weeks as you go</p>
              </div>
            </div>

            {roadmap.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-800 bg-gray-950/40 p-10 text-center">
                <Calendar className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Generate a roadmap for weekly milestones.</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-[19px] top-3 bottom-3 w-px bg-gradient-to-b from-indigo-500/40 via-emerald-500/30 to-transparent" />
                {roadmap.map((item, index) => (
                  <div key={index} className="relative flex gap-4 pb-5 last:pb-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border-2 z-10"
                      style={{
                        backgroundColor: `${weekColors[index % 4]}18`,
                        borderColor: `${weekColors[index % 4]}55`,
                        color: weekColors[index % 4]
                      }}
                    >
                      W{index + 1}
                    </div>
                    <div className="flex-1 rounded-2xl bg-gray-950/80 border border-gray-900 p-4 hover:border-gray-700 transition">
                      <div className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-1" style={{ color: weekColors[index % 4] }}>
                        Week {index + 1}
                      </div>
                      <div className="text-sm font-semibold text-white">{item.title}</div>
                      <p className="text-sm text-gray-400 mt-1.5 leading-6">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className="space-y-6">
          <div className="glass-panel rounded-3xl p-6 border border-gray-800/60">
            <h2 className="text-lg font-semibold text-white mb-4">Prep Overview</h2>
            <div className="grid gap-3">
              {[
                { title: "Resume Score", value: analysis?.resumeScore != null ? `${analysis.resumeScore}/100` : "—", accent: "text-indigo-300" },
                { title: "Target Role", value: targetRole, accent: "text-sky-300" },
                {
                  title: "Stage",
                  value: ["Awaiting upload", "Ready to analyze", "Insights ready", "Gaps mapped", "Roadmap complete"][step],
                  accent: "text-emerald-300"
                },
                { title: "Skills found", value: analysis?.skills?.length ?? "—", accent: "text-violet-300" }
              ].map((s) => (
                <div key={s.title} className="rounded-2xl bg-gray-950/80 border border-gray-900 p-3.5 flex justify-between items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-gray-500 font-semibold">{s.title}</span>
                  <span className={`text-sm font-bold ${s.accent} truncate max-w-[55%] text-right`}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-6 border border-gray-800/60">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Resources</h2>
              <Globe className="w-5 h-5 text-violet-400" />
            </div>
            <div className="space-y-2.5">
              {resources.slice(0, 5).map((r) => (
                <a
                  key={r.title}
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl bg-gray-950/80 border border-gray-900 p-3.5 hover:border-indigo-500/40 group transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-white truncate group-hover:text-indigo-200">{r.title}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{r.source} · {r.type}</p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-indigo-400 shrink-0" />
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-6 border border-gray-800/60">
            <h2 className="text-lg font-semibold text-white mb-3">Workflow</h2>
            <ol className="space-y-3">
              {["Upload PDF", "Analyze score", "Skill gap radar", "4-week roadmap", "Mock practice"].map((label, i) => (
                <li key={label} className="flex items-start gap-3 text-sm">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    step > i ? "bg-emerald-500/20 text-emerald-400" : step === i ? "bg-indigo-500/20 text-indigo-300" : "bg-gray-900 text-gray-600"
                  }`}>
                    {step > i ? "✓" : i + 1}
                  </span>
                  <span className={step > i ? "text-gray-500 line-through" : "text-gray-300"}>{label}</span>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Prep