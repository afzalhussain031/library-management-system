const API_BASE = 'http://localhost:8000/api'

// Helper function to add auth header
function getAuthHeader() {
  const token = localStorage.getItem('access_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Login endpoint
export async function loginUser(username, password) {
  const res = await fetch(`${API_BASE}/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Important: sends refresh cookie
    body: JSON.stringify({ username, password }),
  })
  
  if (!res.ok) throw new Error('Login failed')
  const data = await res.json()
  
  // Save access token to memory
  localStorage.setItem('access_token', data.access)
  return data
}

// Logout endpoint
export async function logoutUser() {
    await fetch(`${API_BASE}/logout/`, {
        method: 'POST',
        credentials: 'include',
    })
    localStorage.removeItem('access_token')
}

// Get current user info
export async function getCurrentUser() {
    const res = await fetch(`${API_BASE}/me/`, {
        headers: getAuthHeader(),
        credentials: 'include'
    })

    if (res.status === 401) return null // Not logged in
    if (!res.ok) throw new Error('Failed to fetch user')
    
    return res.json()
}

// Auto-refresh expired token
export async function refreshToken() {
  const res = await fetch(`${API_BASE}/token/refresh/`, {
    method: 'POST',
    credentials: 'include', // Sends refresh cookie automatically
  })
  
  if (!res.ok) throw new Error('Refresh failed')
  const data = await res.json()
  
  localStorage.setItem('access_token', data.access)
  return data.access
}