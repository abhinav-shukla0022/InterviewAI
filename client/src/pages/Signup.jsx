import { useState } from "react"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"
import { User, Mail, Lock, Eye, EyeOff, Bot, AlertCircle, CheckCircle2 } from "lucide-react"

function Signup() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e) => {
    e.preventDefault()
    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const res = await axios.post("https://interviewai-bnux.onrender.com/signup", {
        name,
        email,
        password,
      })

      // Backend returns strings like "User Already Exists" or "Signup Successful"
     if (res.data.message === "Signup successful.") {
  setSuccess("Account created successfully! Redirecting to sign in...")

  setTimeout(() => {
    navigate("/")
  }, 2200)
} else {
  setError(res.data.error || "Registration failed")
}
    }catch (err) {
  console.error(err)

  setError(
    err.response?.data?.error ||
    "Unable to connect to server. Please try again later."
  )
}finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* FLOATING AMBIENT GLOWS */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"></div>

      <div className="w-full max-w-md z-10">
        {/* LOGO & HERO HEADLINE */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="p-3 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl shadow-xl shadow-indigo-500/25 mb-4 animate-float">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-white">
            Interview<span className="text-indigo-400">AI</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2">Create an account to start your training</p>
        </div>

        {/* SIGNUP CARD */}
        <div className="glass-panel rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500"></div>

          <h2 className="text-2xl font-bold text-white mb-6">Create Account</h2>

          {error && (
            <div className="flex items-start gap-3 p-4 bg-rose-500/15 border border-rose-500/20 text-rose-300 rounded-2xl mb-6 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-3 p-4 bg-emerald-500/15 border border-emerald-500/20 text-emerald-300 rounded-2xl mb-6 text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            {/* NAME INPUT */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                  <User className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  className="w-full pl-11 pr-4 py-3 bg-gray-900/60 border border-gray-800 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-white placeholder-gray-600 transition"
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* EMAIL INPUT */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  className="w-full pl-11 pr-4 py-3 bg-gray-900/60 border border-gray-800 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-white placeholder-gray-600 transition"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* PASSWORD INPUT */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  className="w-full pl-11 pr-11 py-3 bg-gray-900/60 border border-gray-800 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-white placeholder-gray-600 transition"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD INPUT */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  className="w-full pl-11 pr-4 py-3 bg-gray-900/60 border border-gray-800 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-white placeholder-gray-600 transition"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading || !!success}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-indigo-700 disabled:to-violet-700 text-white font-bold rounded-xl transition duration-200 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Create Free Account"
              )}
            </button>
          </form>

          {/* REDIRECT TO SIGNIN */}
          <div className="mt-8 pt-6 border-t border-gray-900/60 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link to="/" className="text-indigo-400 hover:text-indigo-300 font-semibold transition">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup