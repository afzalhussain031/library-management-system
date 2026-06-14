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

// Get user profile details
export async function getUserProfile() {
  const res = await fetch(`${API_BASE}/profile/`, {
    headers: getAuthHeader(),
    credentials: 'include'
  })
  
  if (!res.ok) throw new Error('Failed to fetch profile')

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

// ======================= DASHBOARD ENDPOINTS ======================

// Get dashboard statistics (borrowed count, fines, etc)
export async function getDashboard() {
  const res = await fetch(`${API_BASE}/me/dashboard/`, {
    headers: getAuthHeader(),
    credentials: 'include'
  })

  if (!res.ok) throw new Error('Failed to fetch dashboard')
    return res.json()
}

// Get borrowed books ( active loans)
export async function getBorrowedBooks() {
  const res = await fetch(`${API_BASE}/circulation/loans/`, {
    headers: getAuthHeader(),
    credentials: 'include'
  })

  if (!res.ok) throw new Error('Failed to fetch borrowed books')
    return res.json()
}

// Get user's fines
export async function getUserFines() {
  const res = await fetch(`${API_BASE}/billing/fines/`, {
    headers: getAuthHeader(),
    credentials: 'include'
  })

  if (!res.ok) throw new Error('Failed to fetch fines')
    return res.json()
}

// Get user notification
export async function getNotifications() {
  const res = await fetch(`${API_BASE}/notifications/notifications/`, {
    headers: getAuthHeader(),
    credentials:'include'
  })

  if (!res.ok) throw new Error('Failed to fetch notifications')
    return res.json()
}

// Get all books (for recommendations)
export async function getBooks() {
  const res = await fetch(`${API_BASE}/catalog/books/`, {
    headers: getAuthHeader(),
    credentials: 'include'
  })

  if (!res.ok) throw new Error('Failed to fetch books')
    return res.json()
}

// Get user's wishlist
export async function getWishlist() {
  const res = await fetch(`${API_BASE}/catalog/wishlist/`, {
    headers: getAuthHeader(),
    credentials: 'include'
  })

  if (!res.ok) throw new Error('Failed to fetch wishlist')
    return res.json()
}