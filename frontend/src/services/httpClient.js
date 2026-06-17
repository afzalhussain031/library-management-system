// frontend/src/services/httpClient.js
import axios from 'axios'

const API_BASE = 'http://localhost:8000/api'

// Create axios instance
const client = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Sends cookies automatically
})

// Request interceptor - adds auth header to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - handles expired tokens
client.interceptors.response.use(
  (response) => response, // Return successful responses as-is
  async (error) => {
    const originalRequest = error.config

    // If token expired (401) and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        // Try to refresh token
        const refreshRes = await axios.post(
          `${API_BASE}/token/refresh/`,
          {},
          { withCredentials: true }
        )
        
        // Save new token
        localStorage.setItem('access_token', refreshRes.data.access)
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${refreshRes.data.access}`
        return client(originalRequest)
      } catch (refreshError) {
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default client