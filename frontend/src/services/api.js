// frontend/src/services/api.js
import client from './httpClient'

// ===================== AUTH =====================
export const auth = {
  login: async (username, password) => {
    const response = await client.post('/token/', { username, password })

    const token = response.data.access || response.data.token
    if (token) {
      localStorage.setItem('access_token', response.data.access)
    }
    return response.data
  },

  logout: () =>
    client.post('/logout/', {}),
  
  getCurrentUser: () =>
    client.get('/me/'),
  
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