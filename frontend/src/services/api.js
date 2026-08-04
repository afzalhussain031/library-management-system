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

  verifyEmail: async (token) => {
    const response = await client.get(`/verify-email/?token=${token}`)
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

// ===================== MEMBERS =====================
export const membersApi = {
  getAll: () => client.get('/members/'),
  createMember: (data) => client.post('/register/', data),
}

// ===================== DASHBOARD =====================
export const dashboard = {
  getStats: () =>
    client.get('/me/dashboard/'),
  
  getAdminStats: () =>
    client.get('/analytics/dashboard-stats/'),
  
  getBorrowedBooks: () =>
    client.get('/loans/'),
  
  getFines: () =>
    client.get('/fines/'),
  
  getNotifications: () =>
    client.get('/notifications/'),
    
  markNotificationRead: (id) =>
    client.post(`/notifications/${id}/mark_read/`)
}

// ===================== CATALOG =====================
export const catalog = {
  globalSearch: (query) =>
    client.get('/search/', { params: { q: query } }),

  getBooks: (params) =>
    client.get('/books/', { params }),

  getRecommendations: () =>
    client.get('/books/recommendations/'),
  
  addBook: (data) =>
    client.post('/books/', data),

  updateBook: (id, data) => 
    client.put(`/books/${id}/`, data),

  deleteBook: (id) => 
    client.delete(`/books/${id}/`),
    
  getCategories: () =>
    client.get('/categories/'),
    
  createCategory: (data) =>
    client.post('/categories/', data),
    
  getPublishers: () =>
    client.get('/publishers/'),
    
  createPublisher: (data) =>
    client.post('/publishers/', data),
  
  getWishlist: () =>
    client.get('/wishlist/'),

  addToWishlist: (data) =>
    client.post('/wishlist/', data),

  removeFromWishlist: (id) =>
    client.delete(`/wishlist/${id}/`),
    
  getReviews: (params) =>
    client.get('/reviews/', { params }),
    
  addReview: (data) =>
    client.post('/reviews/', data),
    
  updateReview: (id, data) =>
    client.patch(`/reviews/${id}/`, data),
    
  deleteReview: (id) =>
    client.delete(`/reviews/${id}/`)
}

// ===================== INVENTORY =====================
export const inventory = {
  getCopiesByBook: (bookId) =>
    client.get(`/copies/?book=${bookId}`),

  addBookCopy: (data) =>
    client.post('/copies/', data),

  updateCopy: (copyId, data) =>
    client.patch(`/copies/${copyId}/`, data),

  deleteCopy: (copyId) =>
    client.delete(`/copies/${copyId}/`)
}

// ===================== BILLING =====================
export const billing = {
  // Fetch all fines (admins will get all, normal users get their own based on backend permissions)
  getFines: () => client.get('/fines/'),
  
  getUserFines: (userId) => client.get(`/fines/?user_id=${userId}`),
  
  // Update a fine's status (PATCH request so we only update the fields we send)
  updateFine: (id, data) => client.patch(`/fines/${id}/`, data)
}
  

// ===================== CIRCULATION =====================
export const circulation = {
  // Existing ones...
  getReservations: () => client.get('/reservations/'),
  createReservation: (data) => client.post('/reservations/', data),
  
  // New endpoints for Kanban
  updateReservationStatus: (id, status, extraData = {}) => client.patch(`/reservations/${id}/`, { status, ...extraData }),
  fulfillReservation: (id) => client.post(`/reservations/${id}/fulfill/`),
  extendPickup: (id) => client.post(`/reservations/${id}/extend_pickup/`),
  
  // New endpoints for manual Lend/Return
  issueBook: (data) => client.post('/loans/', data),
  returnBook: (loanId, paidNow = false) => client.post(`/loans/${loanId}/return_loan/`, { paid_now: paidNow }),
  calculateFine: (loanId) => client.get(`/loans/${loanId}/calculate_fine/`),
  getUserLoans: (userId) => client.get(`/loans/?user_id=${userId}`),
  renewLoan: (loanId) => client.post(`/loans/${loanId}/renew/`)
}
