import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import { useUser, setUser } from './store/auth'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import NewInterview from './pages/NewInterview'
import VoiceInterview from './pages/VoiceInterview'
import InterviewDetail from './pages/InterviewDetail'
import Admin from './pages/Admin'

function Protected({ children }: { children: JSX.Element }) {
  const u = useUser()
  if (!u) return <Navigate to="/auth" replace />
  return children
}

function Nav() {
  const u = useUser()
  const nav = useNavigate()
  if (!u) return null
  return (
    <header className="glass sticky top-0 z-50 px-6 py-3 flex items-center gap-6">
      <Link to="/" className="font-bold text-brand-500">AI Interview</Link>
      <Link to="/">Dashboard</Link>
      <Link to="/new">New Interview</Link>
      {u.role === 'admin' && <Link to="/admin">Admin</Link>}
      <div className="ml-auto flex items-center gap-3 text-sm">
        <span className="text-slate-400">{u.full_name || u.email}</span>
        <button className="text-red-400" onClick={() => { setUser(null); nav('/auth') }}>Sign out</button>
      </div>
    </header>
  )
}

export default function App() {
  return (
    <div className="min-h-screen">
      <Nav />
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<Protected><Dashboard /></Protected>} />
        <Route path="/new" element={<Protected><NewInterview /></Protected>} />
        <Route path="/interview/:id/voice" element={<Protected><VoiceInterview /></Protected>} />
        <Route path="/interview/:id" element={<Protected><InterviewDetail /></Protected>} />
        <Route path="/admin" element={<Protected><Admin /></Protected>} />
      </Routes>
    </div>
  )
}
