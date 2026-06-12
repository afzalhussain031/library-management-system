import { createContext, useContext, useState, useEffect } from 'react'
import { loginUser, logoutUser, getCurrentUser, refreshToken } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check if user is logged in on app load
  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const user = await getCurrentUser()
      setCurrentUser(user)
    } catch (err) {
      console.log('Not logged in')
    } finally {
      setLoading(false)
    }
  }

  // Login function
  async function login(username, password) {
    setLoading(true)
    setError(null)
    try {
      await loginUser(username, password)
      const user = await getCurrentUser()
      setCurrentUser(user)
      return user
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  async function logout() {
    try {
      await logoutUser()
      setCurrentUser(null)
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}