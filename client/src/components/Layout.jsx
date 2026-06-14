import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { 
  LayoutDashboard, 
  MessageSquare, 
  History as HistoryIcon, 
  LogOut, 
  Menu, 
  X,
  Bot,
  BookOpen
} from "lucide-react"

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Get user info from localStorage (we'll save it during login)
  const userName = localStorage.getItem("userName") || "Developer"
  const userEmail = localStorage.getItem("userEmail") || "user@interviewai.com"

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      description: "Overview & statistics"
    },
    {
      name: "Interview Strategy",
      path: "/prep",
      icon: BookOpen,
      description: "Intelligent resume & skill preparation"
    },
    {
  name: "Interview Preparation",
  path: "/interview-preparation",
  icon: BookOpen,
  description: "Notes, playlists & interview learning"
},
    {
      name: "Mock Interview",
      path: "/interview",
      icon: MessageSquare,
      description: "Simulate a live technical session"
    },
    {
      name: "Interview History",
      path: "/history",
      icon: HistoryIcon,
      description: "Review past scores & feedback"
    }
  ]

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userName")
    localStorage.removeItem("userEmail")
    navigate("/")
  }

  return (
    <div className="min-h-screen bg-brand-bg text-gray-100 flex font-sans overflow-x-hidden">
      {/* BACKGROUND EFFECTS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] animate-pulse-slow"></div>
      </div>

      {/* MOBILE HEADER */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900/80 backdrop-blur-md border-b border-gray-800/80 flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-200 to-indigo-300 bg-clip-text text-transparent">
            InterviewAI
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-gray-950/95 border-r border-gray-900 flex flex-col z-50 transition-transform duration-300 md:translate-x-0 md:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* BRAND LOGO */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-gray-900">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl shadow-lg shadow-indigo-500/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-white leading-none">
              InterviewAI
            </h1>
            <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-semibold">
              AI Assessment Portal
            </span>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path)
                  setSidebarOpen(false)
                }}
                className={`w-full group flex items-start gap-4 p-3.5 rounded-2xl text-left transition duration-200 ${
                  isActive
                    ? "bg-indigo-600/10 border border-indigo-500/20 text-white shadow-inner"
                    : "border border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-900/50"
                }`}
              >
                <Icon
                  className={`w-5.5 h-5.5 mt-0.5 transition duration-200 ${
                    isActive ? "text-indigo-400" : "text-gray-400 group-hover:text-gray-300"
                  }`}
                />
                <div>
                  <div className={`font-semibold text-sm ${isActive ? "text-white" : ""}`}>
                    {item.name}
                  </div>
                  <div className="text-[11px] text-gray-500 font-normal mt-0.5 line-clamp-1 group-hover:text-gray-400 transition-colors">
                    {item.description}
                  </div>
                </div>
              </button>
            )
          })}
        </nav>

        {/* USER PROFILE INFO */}
        <div className="p-4 border-t border-gray-900 bg-gray-950/40">
          <div className="flex items-center gap-3 p-2 bg-gray-900/30 rounded-2xl border border-gray-900/50 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center border border-indigo-500/30">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">{userName}</div>
              <div className="text-[10px] text-gray-500 truncate">{userEmail}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-xl text-sm font-semibold transition"
          >
            <LogOut className="w-4 h-4" />
            Logout Session
          </button>
        </div>
      </aside>

      {/* OVERLAY FOR MOBILE */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
        ></div>
      )}

      {/* MAIN CONTAINER */}
      <main className="flex-1 min-w-0 flex flex-col z-10 pt-16 md:pt-0">
        <div className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout
