import { Routes, Route } from "react-router-dom"

import Landing from "./pages/Landing"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Dashboard from "./pages/Dashboard"
import Interview from "./pages/Interview"
import Prep from "./pages/Prep"
import ProtectedRoute from "./components/ProtectedRoute"
import History from "./pages/History"
import Layout from "./components/Layout"
import InterviewPreparation from "./pages/InterviewPreparation"

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/signin" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected app */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview"
        element={
          <ProtectedRoute>
            <Layout>
              <Interview />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/prep"
        element={
          <ProtectedRoute>
            <Layout>
              <Prep />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <Layout>
              <History />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview-preparation"
        element={
          <ProtectedRoute>
            <Layout>
              <InterviewPreparation />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App