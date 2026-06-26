import { createContext, useContext, useState, useEffect } from 'react'
import { auth } from '../services/api'

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
      const response = await auth.getCurrentUser()
      const user = response?.data || response
      setCurrentUser(user)
    } catch (err) {
      console.log('Not logged in')
    } finally {
      setLoading(false)
    }
  }

  // Login function
  async function login(username, password) {
    setError(null)
    try {
      await auth.login(username, password)
      const response = await auth.getCurrentUser()
      const user = response?.data || response
      setCurrentUser(user)
      return user
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message
      setError(errorMessage)
      throw err
    }
  }

  // Logout function
  async function logout() {
    try {
      await auth.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem('access_token')
      setCurrentUser(null)
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