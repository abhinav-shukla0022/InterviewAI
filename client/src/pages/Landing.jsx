import { Link } from "react-router-dom"
import {
  Bot,
  ArrowRight,
  BrainCircuit,
  Target,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Zap
} from "lucide-react"

function Landing() {
  const scrollTo = (id) => (e) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const features = [
    {
      icon: BrainCircuit,
      title: "AI Mock Interviews",
      desc: "Practice live technical rounds with instant, structured feedback."
    },
    {
      icon: Target,
      title: "Resume & Skill Gap",
      desc: "Score your resume and see exactly what to improve for your target role."
    },
    {
      icon: BookOpen,
      title: "Guided Prep Paths",
      desc: "4-week roadmaps, checklists, videos and notes for every track."
    },
    {
      icon: Sparkles,
      title: "Performance Insights",
      desc: "Track scores, streaks and achievements on a clear dashboard."
    }
  ]

  return (
    <div className="min-h-screen bg-[#090d16] text-white font-sans overflow-x-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/15 blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/10 blur-[100px]" />
      </div>

      {/* Navbar */}
      <header className="relative z-20 border-b border-white/[0.06] bg-[#090d16]/80 backdrop-blur-md sticky top-0">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="p-1.5 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">
              Interview<span className="text-indigo-400">AI</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-white/50">
            <a
              href="#features"
              onClick={scrollTo("features")}
              className="hover:text-white transition cursor-pointer"
            >
              Features
            </a>
            <a
              href="#how"
              onClick={scrollTo("how")}
              className="hover:text-white transition cursor-pointer"
            >
              How it works
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              to="/signin"
              className="h-9 px-4 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/[0.06] transition flex items-center"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="h-9 px-4 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 transition shadow-lg shadow-indigo-600/20 flex items-center gap-1.5"
            >
              Sign up
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-5 pt-20 pb-24 md:pt-28 md:pb-32 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-medium text-indigo-300 mb-8">
          <Zap className="w-3.5 h-3.5" />
          AI-powered interview preparation
        </div>

        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] max-w-3xl mx-auto">
          Ace every interview with{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
            AI coaching
          </span>
        </h1>

        <p className="mt-6 text-base md:text-lg text-white/45 max-w-xl mx-auto leading-relaxed">
          Mock interviews, resume analysis, skill-gap maps and week-by-week prep paths — built for
          engineers who want to level up fast.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/signup"
            className="h-12 px-7 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 transition shadow-xl shadow-indigo-600/25 flex items-center gap-2"
          >
            Get started free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/signin"
            className="h-12 px-7 rounded-xl text-sm font-medium text-white/70 border border-white/10 hover:border-white/20 hover:bg-white/[0.04] hover:text-white transition flex items-center"
          >
            Sign in to portal
          </Link>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-white/30">
          {["No credit card", "Instant AI feedback", "Role-specific tracks"].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/70" />
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-5 pb-24 scroll-mt-20">
        <div className="text-center mb-12">
          <p className="text-[11px] uppercase tracking-[0.2em] text-indigo-400/80 font-semibold mb-3">
            Features
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
            Everything you need to prepare
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 hover:border-indigo-500/30 hover:bg-white/[0.04] transition"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1.5">{f.title}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative z-10 max-w-6xl mx-auto px-5 pb-24 scroll-mt-20">
        <div className="text-center mb-12">
          <p className="text-[11px] uppercase tracking-[0.2em] text-indigo-400/80 font-semibold mb-3">
            How it works
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
            From resume to ready in four steps
          </h2>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: "01", title: "Create account", desc: "Sign up in seconds and set your target role." },
            { step: "02", title: "Upload resume", desc: "Get AI scoring, skills and gap analysis." },
            { step: "03", title: "Follow roadmap", desc: "Use prep paths, videos and checklists." },
            { step: "04", title: "Mock & improve", desc: "Run interviews and track your scores." }
          ].map((s) => (
            <div key={s.step}>
              <div className="text-3xl font-extrabold text-white/[0.06] font-display mb-2">{s.step}</div>
              <h3 className="text-sm font-semibold text-white mb-1">{s.title}</h3>
              <p className="text-xs text-white/40 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 max-w-6xl mx-auto px-5 pb-24">
        <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/15 via-violet-600/10 to-transparent p-10 md:p-14 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-3">
            Ready to start preparing?
          </h2>
          <p className="text-sm text-white/45 max-w-md mx-auto mb-8">
            Join InterviewAI and turn interview anxiety into a clear, measurable plan.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 h-12 px-7 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 transition shadow-xl shadow-indigo-600/25"
          >
            Create free account
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] py-8">
        <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/30">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-400/60" />
            <span>InterviewAI</span>
          </div>
          <p>© {new Date().getFullYear()} InterviewAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Landing