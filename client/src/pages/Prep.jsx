import { useEffect, useRef, useState } from "react"
import axios from "axios"
import { BookOpen, UploadCloud, CheckCircle2, Sparkles, ShieldCheck, ArrowRight, Globe, ListChecks, FileUp, Trash2 } from "lucide-react"

function Prep() {
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
  const [modeMessage, setModeMessage] = useState("Upload your resume to unlock prep intelligence.")

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await axios.get("https://interviewai-bnux.onrender.com/api/resources", {
          headers: { Authorization: `Bearer ${token}` }
        })
        setResources(res.data)
      } catch (error) {
        console.error("Unable to load resources", error)
      }
    }
    fetchResources()
  }, [])

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0]
      if (dropped.type === "application/pdf") {
        setFile(dropped)
      } else {
        alert("Please upload a PDF file only.")
      }
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const uploadResume = async () => {
    if (!file) return
    setLoading(true)
    setModeMessage("Parsing resume and building your role profile...")
    try {
      const formData = new FormData()
      formData.append("resume", file)
      const res = await axios.post("https://interviewai-bnux.onrender.com/upload-resume", formData)
      setResumeText(res.data.text)
      setModeMessage("Resume parsed. Generate insights now.")
    } catch (error) {
      console.error("Resume upload failed:", error.response?.data || error.message || error)
      alert("Resume upload failed. Check console for details.")
    } finally {
      setLoading(false)
    }
  }

  const analyzeResume = async () => {
    if (!resumeText) {
      alert("Upload a resume first.")
      return
    }
    setLoading(true)
    setModeMessage("Creating your personalized Strategy report...")
    try {
      const token = localStorage.getItem("token")
      const res = await axios.post(
        "https://interviewai-bnux.onrender.com/api/resume/analyze",
        { resumeText, targetRole },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setAnalysis(res.data)
      setModeMessage("Insight report ready. Next, uncover skill gaps and roadmap.")
    } catch (error) {
      console.error(error)
      alert("Resume analysis failed.")
    } finally {
      setLoading(false)
    }
  }

  const createGapOutput = async () => {
    if (!resumeText) {
      alert("Upload a resume first.")
      return
    }
    setLoading(true)
    setGapOutput("")
    try {
      const token = localStorage.getItem("token")
      const res = await axios.post(
        "https://interviewai-bnux.onrender.com/api/prepare/skill-gap",
        { resumeText, targetRole },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setGapOutput(res.data.output)
    } catch (error) {
      console.error(error)
      alert("Skill gap analysis failed.")
    } finally {
      setLoading(false)
    }
  }

  const createRoadmap = async () => {
    if (!resumeText) {
      alert("Upload a resume first.")
      return
    }
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const res = await axios.post(
        "https://interviewai-bnux.onrender.com/api/prepare/roadmap",
        { resumeText, targetRole },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setRoadmap(res.data.roadmap || [])
    } catch (error) {
      console.error(error)
      alert("Roadmap generation failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col lg:flex-row gap-6 justify-between items-start">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-2xl bg-indigo-500/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-indigo-300 font-semibold">
            <BookOpen className="w-4 h-4" />
            Interview Strategy
          </div>
          <h1 className="mt-5 text-4xl font-extrabold text-white tracking-tight">
            AI mentor for skills, gaps, and career readiness.
          </h1>
          <p className="mt-4 max-w-xl text-gray-400 leading-7">
            Build a personalized Strategy trajectory, surface role-specific gaps, and stay focused with curated resources powered by AI.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-3xl bg-slate-900/70 px-4 py-3 border border-gray-800 text-sm text-gray-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Resume analysis
            </div>
            <div className="flex items-center gap-2 rounded-3xl bg-slate-900/70 px-4 py-3 border border-gray-800 text-sm text-gray-300">
              <ListChecks className="w-4 h-4 text-sky-400" />
              Skill gap radar
            </div>
            <div className="flex items-center gap-2 rounded-3xl bg-slate-900/70 px-4 py-3 border border-gray-800 text-sm text-gray-300">
              <Globe className="w-4 h-4 text-violet-400" />
              Curated learning resources
            </div>
          </div>
        </div>
        <div className="glass-panel rounded-3xl p-6 border border-gray-800/60 w-full lg:w-[420px]">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Quick action</p>
              <h2 className="text-lg font-semibold text-white">AI Prep dashboard</h2>
            </div>
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="rounded-3xl bg-gray-950/80 border border-gray-900 p-5 space-y-4">
            <div className="text-sm text-gray-400">Target Role</div>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full rounded-2xl bg-black/20 border border-gray-800 px-4 py-3 text-white outline-none focus:border-indigo-500"
            >
              {[
                "Software Engineer",
                "Frontend Engineer",
                "Backend Engineer",
                "Full Stack Engineer",
                "Machine Learning Engineer"
              ].map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div className="mt-5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
              Upload Resume (PDF format)
            </label>

            {!file ? (
              <div
                className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center gap-4 transition duration-300 cursor-pointer ${dragActive ? "border-indigo-500 bg-indigo-500/5" : "border-gray-800 hover:border-gray-700 bg-gray-950/10 hover:bg-gray-950/20"}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
                  <FileUp className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm text-gray-200">Drag and drop your resume here</p>
                  <p className="text-xs text-gray-500 mt-1">or click to browse files (PDF only)</p>
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
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • PDF File
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFile(null)
                    if (fileInputRef.current) fileInputRef.current.value = ""
                  }}
                  className="p-2.5 bg-gray-950 hover:bg-rose-500/10 border border-gray-800 hover:border-rose-500/20 text-gray-400 hover:text-rose-400 rounded-xl transition"
                  title="Remove file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-3">
            <button
              onClick={uploadResume}
              disabled={!file || loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4" />
              Upload Resume
            </button>
            <button
              onClick={analyzeResume}
              disabled={!resumeText || loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-gray-800 bg-gray-900 text-white font-semibold hover:border-indigo-500 transition disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              Analyze Resume
            </button>
            <button
              onClick={createGapOutput}
              disabled={!resumeText || loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-gray-800 bg-slate-950 text-white font-semibold hover:border-sky-500 transition disabled:opacity-50"
            >
              <ListChecks className="w-4 h-4" />
              Generate Skill Gap
            </button>
            <button
              onClick={createRoadmap}
              disabled={!resumeText || loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-gray-800 bg-slate-950 text-white font-semibold hover:border-emerald-500 transition disabled:opacity-50"
            >
              <ArrowRight className="w-4 h-4" />
              Build Roadmap
            </button>
          </div>
          <p className="mt-5 text-sm text-gray-500">{modeMessage}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-6 border border-gray-800/60">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Resume insights</h2>
                <p className="text-sm text-gray-500">Instantly surface skills, score, and role alignment.</p>
              </div>
              <div className="text-sm font-semibold text-emerald-400">Score {analysis?.resumeScore || "--"}/100</div>
            </div>
            <div className="space-y-4">
              <div className="rounded-3xl bg-gray-950/80 border border-gray-900 p-5">
                <div className="text-xs uppercase tracking-[0.28em] text-gray-500 mb-2">Summary</div>
                <p className="text-sm text-gray-300 leading-7 min-h-[76px]">{analysis?.summary || "Your resume summary will appear here after analysis."}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-3xl bg-gray-950/80 border border-gray-900 p-5">
                  <div className="text-xs uppercase tracking-[0.28em] text-gray-500 mb-2">Top Skills</div>
                  <div className="flex flex-wrap gap-2">
                    {(analysis?.skills || []).map((skill) => (
                      <span key={skill} className="px-3 py-1 rounded-full bg-indigo-500/10 text-xs text-indigo-200">{skill}</span>
                    ))}
                  </div>
                </div>
                <div className="rounded-3xl bg-gray-950/80 border border-gray-900 p-5">
                  <div className="text-xs uppercase tracking-[0.28em] text-gray-500 mb-2">Suggested roles</div>
                  <div className="flex flex-wrap gap-2">
                    {(analysis?.targetRoles || []).map((role) => (
                      <span key={role} className="px-3 py-1 rounded-full bg-emerald-500/10 text-xs text-emerald-200">{role}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-6 border border-gray-800/60">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Skill gap radar</h2>
                <p className="text-sm text-gray-500">See where to invest your prep time.</p>
              </div>
              <Sparkles className="w-5 h-5 text-sky-400" />
            </div>
            <pre className="rounded-3xl bg-black/50 border border-gray-900 p-5 text-sm leading-6 text-gray-300 overflow-x-auto min-h-[180px]">
              {gapOutput || "Skill gap output will appear here after analysis."}
            </pre>
          </div>

          <div className="glass-panel rounded-3xl p-6 border border-gray-800/60">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Personal roadmap</h2>
                <p className="text-sm text-gray-500">A weekly plan tailored to your resume and role goals.</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="space-y-4">
              {roadmap.length > 0 ? (
                roadmap.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="rounded-3xl bg-gray-950/80 border border-gray-900 p-5">
                    <div className="text-sm font-semibold text-white">{item.title}</div>
                    <p className="text-sm text-gray-400 mt-2 leading-6">{item.detail}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">Your preparation roadmap will appear here after generation.</p>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="glass-panel rounded-3xl p-6 border border-gray-800/60">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Recommended resources</h2>
                <p className="text-sm text-gray-500">Curated playlists and guides to power your learning.</p>
              </div>
              <Globe className="w-5 h-5 text-violet-400" />
            </div>
            <div className="space-y-3">
              {resources.slice(0, 4).map((resource) => (
                <a
                  key={resource.title}
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-3xl bg-gray-950/80 border border-gray-900 p-4 transition hover:border-indigo-500/50"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{resource.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{resource.source} • {resource.type}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-indigo-400" />
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-6 border border-gray-800/60">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Preparation overview</h2>
                <p className="text-sm text-gray-500">High-impact focus areas for your next session.</p>
              </div>
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="grid gap-3">
              {[
                { title: "Resume Score", value: analysis?.resumeScore ? `${analysis.resumeScore}/100` : "--" },
                { title: "Target Role", value: targetRole },
                { title: "Current Focus", value: analysis?.gapSummary ? "Skill gap refinement" : "Resume alignment" }
              ].map((stat) => (
                <div key={stat.title} className="rounded-3xl bg-gray-950/80 border border-gray-900 p-4">
                  <div className="text-xs uppercase tracking-[0.3em] text-gray-500">{stat.title}</div>
                  <div className="text-xl font-semibold text-white mt-2">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="glass-panel rounded-3xl p-6 border border-gray-800/60">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Your preparation workflow</h2>
            <p className="text-sm text-gray-500">Move from resume diagnostics to focused practice with AI-driven coaching steps.</p>
          </div>
          <Sparkles className="w-5 h-5 text-sky-400" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Resume Analysis", description: "Extract strengths and score your resume." },
            { label: "Skill Gap Report", description: "Pinpoint what to improve for your target role." },
            { label: "Weekly Roadmap", description: "Study plan with measurable milestones." }
          ].map((item) => (
            <div key={item.label} className="rounded-3xl bg-gray-950/80 border border-gray-900 p-5">
              <div className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-2">{item.label}</div>
              <p className="text-sm text-gray-300">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Prep
