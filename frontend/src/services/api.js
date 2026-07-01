// frontend/src/services/api.js
import client from './httpClient'

// ===================== AUTH =====================
export const auth = {
  login: async (userId, password) => {
    // userId is Enrollment Number or Employee ID
    const response = await client.post('/token/', { 
      user_id: userId,  // Send as user_id, not username
      password 
    })
    
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access)
    }
    return response.data
  },

  // Register a new student account
  register: async (formData) => {
    const response = await client.post('/register/', formData)
    return response.data
  },

  getCurrentUser: async () => {
    const response = await client.get('/me/')
    return response.data
  },
  
  logout: () =>
    client.post('/logout/', {}),
  
  refreshToken: () =>
    client.post('/token/refresh/', {})
}

// ===================== PROFILE =====================
export const profile = {
  get: () =>
    client.get('/profile/'),
  
  update: (data) =>
    client.post('/profile/', data)
}

// ===================== DASHBOARD =====================
export const dashboard = {
  getStats: () =>
    client.get('/me/dashboard/'),
  
  getBorrowedBooks: () =>
    client.get('/circulation/loans/'),
  
  getFines: () =>
    client.get('/billing/fines/'),
  
  getNotifications: () =>
    client.get('/notifications/notifications/')
}

// ===================== CATALOG =====================
export const catalog = {
  getBooks: () =>
    client.get('/catalog/books/'),
  
  getWishlist: () =>
    client.get('/catalog/wishlist/')
}

// ===================== BILLING =====================
export const billing = {
  // Fetch all fines (admins will get all, normal users get their own based on backend permissions)
  getFines: () => client.get('/billing/fines/'),
  
  // Update a fine's status (PATCH request so we only update the fields we send)
  updateFine: (id, data) => client.patch(`/billing/fines/${id}/`, data)}