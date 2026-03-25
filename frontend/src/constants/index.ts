/**
 * Frontend Constants
 * Centralized location for magic strings, API endpoints, and configuration values
 */

// API Configuration
export const API_CONFIG = {
  ROOT: import.meta.env.VITE_API_URL || "http://localhost:8000",
  get BASE_URL() {
    return `${this.ROOT}/api`;
  },
};

// Storage Keys
export const STORAGE_KEYS = {
  CURRENT_USER: "currentUser",
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: "/token/",
  REGISTER: "/register/",
  STAFF_CREATE: "/staff/create/",
  REFRESH: "/token/refresh/",
  CURRENT_USER: "/me/",
  LOGOUT: "/logout/",

  // Books
  BOOKS: "/books/",
  BOOK_DETAIL: (id: number) => `/books/${id}/`,

  // Profile
  USER_PROFILE: "/profile/",
};

// Auth Invite Code (for staff registration)
export const STAFF_INVITE_CODE = "STAFF123"; // Change in production

// UI Messages
export const ERROR_MESSAGES = {
  GENERIC: "An error occurred. Please try again.",
  NETWORK: "Network error. Please check your connection.",
  INVALID_CREDENTIALS: "Invalid username or password.",
  SIGNUP_FAILED: "Sign up failed. Please check your information.",
  NO_AUTH: "You must be logged in to perform this action.",
};

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Logged in successfully!",
  LOGOUT_SUCCESS: "Logged out successfully.",
  BOOK_ADDED: "Book added successfully!",
  BOOK_DELETED: "Book deleted successfully!",
  PROFILE_UPDATED: "Profile updated successfully!",
};
