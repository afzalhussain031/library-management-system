import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// ── Mock users for demo ────────────────────────────────────────────────────
const MOCK_USERS = {
  user: {
    id: 1,
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    role: 'user',
    avatar: 'RS',
  },
  admin: {
    id: 2,
    name: 'Priya Singh',
    email: 'priya@example.com',
    role: 'admin',
    avatar: 'PS',
  },
  superadmin: {
    id: 3,
    name: 'Amit Kumar',
    email: 'amit@example.com',
    role: 'superadmin',
    avatar: 'AK',
  },
}

export function AuthProvider({ children }) {
  // Default to 'user' for demo — change to null in production (redirect to login)
  const [currentUser, setCurrentUser] = useState(MOCK_USERS.user)

  // Demo helper: switch roles without a real login
  const switchRole = (role) => {
    setCurrentUser(MOCK_USERS[role])
  }
  const logout = () => setCurrentUser(null)

  return (
    <AuthContext.Provider value={{ currentUser, switchRole, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}