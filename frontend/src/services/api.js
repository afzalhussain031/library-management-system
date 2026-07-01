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
    client.get('/profile/').then(res => res.data),
  
  update: (data) =>
    client.post('/profile/', data).then(res => res.data)
}

// ===================== DASHBOARD =====================
export const dashboard = {
  getStats: () =>
    client.get('/me/dashboard/').then(res => res.data),
  
  getBorrowedBooks: () =>
    client.get('/loans/').then(res => res.data),
  
  getFines: () =>
    client.get('/fines/').then(res => res.data),
  
  getNotifications: () =>
    client.get('/notifications/').then(res => res.data)
}

// ===================== CATALOG =====================
export const catalog = {
  getBooks: () =>
    client.get('/books/').then(res => res.data),
  
  getWishlist: () =>
    client.get('/wishlist/').then(res => res.data)
}

// ===================== BILLING =====================
export const billing = {
  // Fetch all fines (admins will get all, normal users get their own based on backend permissions)
  getFines: () => client.get('/fines/'),
  
  // Update a fine's status (PATCH request so we only update the fields we send)
  updateFine: (id, data) => client.patch(`/fines/${id}/`, data)}
  

// ===================== CIRCULATION =====================
export const circulation = {
  // Existing ones...
  getReservations: () => client.get('/reservations/'),
  
  // New endpoints for Kanban
  updateReservationStatus: (id, status) => client.patch(`/reservations/${id}/`, { status }),
  fulfillReservation: (id) => client.post(`/reservations/${id}/fulfill/`)
}
