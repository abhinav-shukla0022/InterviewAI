import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  MessageSquare,
  History as HistoryIcon,
  LogOut,
  Menu,
  X,
  Bot,
  BookOpen,
  Search,
  Bell,
  Moon,
  Sun,
  Trophy,
  TrendingUp,
  AlertTriangle,
  Target,
  BookMarked,
  Briefcase
} from "lucide-react"

const DEMO_NOTIFICATIONS = [
  {
    id: 1,
    type: "goal",
    icon: Target,
    title: "Goal completed",
    body: "You completed 5 mock sessions.",
    time: "2h ago",
    unread: true,
    color: "text-emerald-400 bg-emerald-500/15"
  },
  {
    id: 2,
    type: "score",
    icon: TrendingUp,
    title: "Score improvement",
    body: "Your average score improved from 5.2 → 6.8.",
    time: "5h ago",
    unread: true,
    color: "text-sky-400 bg-sky-500/15"
  },
  {
    id: 3,
    type: "weak",
    icon: AlertTriangle,
    title: "Weak area alert",
    body: "DSA remains your weakest topic.",
    time: "1d ago",
    unread: true,
    color: "text-amber-400 bg-amber-500/15"
  },
  {
    id: 4,
    type: "achievement",
    icon: Trophy,
    title: "Achievement unlocked",
    body: "New personal best: 8.5/10.",
    time: "2d ago",
    unread: false,
    color: "text-violet-400 bg-violet-500/15"
  },
  {
    id: 5,
    type: "prep",
    icon: BookMarked,
    title: "Preparation reminder",
    body: "You haven't practiced JavaScript in 3 days.",
    time: "3d ago",
    unread: false,
    color: "text-indigo-400 bg-indigo-500/15"
  },
  {
    id: 6,
    type: "interview",
    icon: Briefcase,
    title: "Interview reminder",
    body: "Upcoming practice focus: System Design this week.",
    time: "4d ago",
    unread: false,
    color: "text-rose-400 bg-rose-500/15"
  }
]

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS)
  const notifRef = useRef(null)

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme")
    if (saved) return saved === "dark"
    return true
  })
  const navigate = useNavigate()
  const location = useLocation()

  const userName = localStorage.getItem("userName") || "Developer"
  const userEmail = localStorage.getItem("userEmail") || "user@interviewai.com"
  const unreadCount = notifications.filter((n) => n.unread).length

  useEffect(() => {
    const root = document.documentElement
    if (darkMode) {
      root.classList.add("dark")
      root.classList.remove("light")
      localStorage.setItem("theme", "dark")
    } else {
      root.classList.add("light")
      root.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [darkMode])

  useEffect(() => {
    const saved = localStorage.getItem("theme")
    const isDark = saved ? saved === "dark" : true
    const root = document.documentElement
    if (isDark) {
      root.classList.add("dark")
      root.classList.remove("light")
    } else {
      root.classList.add("light")
      root.classList.remove("dark")
    }
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const toggleTheme = () => setDarkMode((prev) => !prev)

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  const markRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    )
  }

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, description: "Overview & statistics" },
    { name: "Interview Strategy", path: "/prep", icon: BookOpen, description: "Intelligent resume & skill preparation" },
    { name: "Interview Preparation", path: "/interview-preparation", icon: BookOpen, description: "Notes, playlists & interview learning" },
    { name: "Mock Interview", path: "/interview", icon: MessageSquare, description: "Simulate a live technical session" },
    { name: "Interview History", path: "/history", icon: HistoryIcon, description: "Review past scores & feedback" }
  ]

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userName")
    localStorage.removeItem("userEmail")
    navigate("/")
  }

  return (
    <div className="min-h-screen bg-brand-bg text-gray-100 flex font-sans overflow-x-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] animate-pulse-slow"></div>
      </div>

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900/80 backdrop-blur-md border-b border-gray-800/80 flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-200 to-indigo-300 bg-clip-text text-transparent">
            InterviewAI
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border border-gray-950" />
            )}
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-gray-950/95 border-r border-gray-900 flex flex-col z-50 transition-transform duration-300 md:translate-x-0 md:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-20 flex items-center gap-3 px-6 border-b border-gray-900">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl shadow-lg shadow-indigo-500/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-white leading-none">InterviewAI</h1>
            <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-semibold">
              AI Assessment Portal
            </span>
          </div>
        </div>

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
                  className={`w-5 h-5 mt-0.5 transition duration-200 ${
                    isActive ? "text-indigo-400" : "text-gray-400 group-hover:text-gray-300"
                  }`}
                />
                <div>
                  <div className={`font-semibold text-sm ${isActive ? "text-white" : ""}`}>{item.name}</div>
                  <div className="text-[11px] text-gray-500 font-normal mt-0.5 line-clamp-1 group-hover:text-gray-400 transition-colors">
                    {item.description}
                  </div>
                </div>
              </button>
            )
          })}
        </nav>

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

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      <main className="flex-1 min-w-0 flex flex-col z-10 pt-16 md:pt-0">
        <header className="hidden md:flex items-center justify-between h-20 px-8 border-b border-gray-900/70 bg-gray-950/30 backdrop-blur-md sticky top-0 z-20">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full bg-gray-900/60 border border-gray-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/50 transition"
            />
          </div>

          <div className="flex items-center gap-3 pl-6 shrink-0">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-900 transition relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-indigo-500 rounded-full border border-gray-950 text-[10px] font-bold text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-[340px] rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl shadow-black/50 overflow-hidden z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                    <span className="text-sm font-semibold text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[380px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-center text-sm text-gray-500 py-10">No notifications</p>
                    ) : (
                      notifications.map((n) => {
                        const Icon = n.icon
                        return (
                          <button
                            key={n.id}
                            onClick={() => markRead(n.id)}
                            className={`w-full text-left flex gap-3 px-4 py-3.5 border-b border-gray-900/80 hover:bg-gray-900/50 transition ${
                              n.unread ? "bg-indigo-500/[0.04]" : ""
                            }`}
                          >
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${n.color}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[13px] font-semibold text-white truncate">{n.title}</span>
                                {n.unread && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                                )}
                              </div>
                              <p className="text-[12px] text-gray-400 mt-0.5 leading-snug">{n.body}</p>
                              <p className="text-[10px] text-gray-600 mt-1">{n.time}</p>
                            </div>
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-900 transition"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              title={darkMode ? "Light mode" : "Dark mode"}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center border border-indigo-500/30 text-xs">
              {userName.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">{children}</div>
      </main>
    </div>
  )
}

export default Layout