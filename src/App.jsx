import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { hasKey } from './store/cryptoStore'
import AppLayout from './components/AppLayout'

import Welcome from './pages/Welcome'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import MnemonicDisplay from './pages/MnemonicDisplay'
import MnemonicVerify from './pages/MnemonicVerify'
import PhraseEntry from './pages/PhraseEntry'
import Home from './pages/Home'
import EntryNew from './pages/EntryNew'
import EntryEdit from './pages/EntryEdit'
import EntryView from './pages/EntryView'
import CalendarView from './pages/CalendarView'
import Settings from './pages/Settings'
import MoodCheckIn from './pages/MoodCheckIn'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/" replace />
  if (!hasKey()) return <Navigate to="/phrase" replace />
  return children
}

function AuthedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/mnemonic" element={<AuthedRoute><MnemonicDisplay /></AuthedRoute>} />
        <Route path="/verify" element={<AuthedRoute><MnemonicVerify /></AuthedRoute>} />
        <Route path="/phrase" element={<AuthedRoute><PhraseEntry /></AuthedRoute>} />
        <Route path="/home" element={<ProtectedRoute><AppLayout><Home /></AppLayout></ProtectedRoute>} />
        <Route path="/new" element={<ProtectedRoute><AppLayout><EntryNew /></AppLayout></ProtectedRoute>} />
        <Route path="/edit/:id" element={<ProtectedRoute><AppLayout><EntryEdit /></AppLayout></ProtectedRoute>} />
        <Route path="/entry/:id" element={<ProtectedRoute><AppLayout><EntryView /></AppLayout></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><AppLayout><CalendarView /></AppLayout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
        <Route path="/mood" element={<ProtectedRoute><AppLayout><MoodCheckIn /></AppLayout></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
