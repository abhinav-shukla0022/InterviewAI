import { useState } from "react"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"
import { Mail, Lock, Eye, EyeOff, Bot, AlertCircle } from "lucide-react"

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }
    setError("")
    setLoading(true)

    try {
      const res = await axios.post("http://localhost:5000/login", {
        email,
        password,
      })

      // Since backend returns strings directly for error cases
      if (typeof res.data === "string") {
        setError(res.data)
        setLoading(false)
        return
      }

      if (res.data && res.data.token) {
        localStorage.setItem("token", res.data.token)
        localStorage.setItem("userName", res.data.name || "Developer")
        localStorage.setItem("userEmail", res.data.email || email)
        
        // Redirect to Dashboard
        navigate("/dashboard")
      } else {
        setError("Invalid response from server")
      }
    } catch (err) {
      console.error(err)
      setError("Unable to connect to server. Please try again later.")
    } finally {
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
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="p-3 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl shadow-xl shadow-indigo-500/25 mb-4 animate-float">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-white">
            Interview<span className="text-indigo-400">AI</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2 max-w-xs">
            Unlock your interview potential with instant interactive AI assessments
          </p>
        </div>

        {/* LOGIN CARD */}
        <div className="glass-panel rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500"></div>

          <h2 className="text-2xl font-bold text-white mb-6">Sign In</h2>

          {error && (
            <div className="flex items-start gap-3 p-4 bg-rose-500/15 border border-rose-500/20 text-rose-300 rounded-2xl mb-6 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
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
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-900/60 border border-gray-800 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-white placeholder-gray-600 transition"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* PASSWORD INPUT */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  className="w-full pl-11 pr-11 py-3.5 bg-gray-900/60 border border-gray-800 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-white placeholder-gray-600 transition"
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

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-indigo-700 disabled:to-violet-700 text-white font-bold rounded-xl transition duration-200 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Sign In to Portal"
              )}
            </button>
          </form>

          {/* REDIRECT TO SIGNUP */}
          <div className="mt-8 pt-6 border-t border-gray-900/60 text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold transition">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login