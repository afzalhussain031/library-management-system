/**
 * API Service
 * Centralized HTTP client for all backend communication
 * Uses axios and handles JWT token injection
 */

import axios from "axios";
import { API_CONFIG, API_ENDPOINTS } from "../constants";
import { handleError } from "../utils/errorHandler";
import { TokenManager } from "../utils/tokenManager";
import type {
  Book,
  User,
  UserProfile,
  LoginResponse,
  RegisterPayload,
} from "../types";

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
});

// Axios interceptor: inject JWT token on every request
api.interceptors.request.use(
  (config) => {
    const token = TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Axios interceptor: handle token refresh on 401 response
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and haven't already tried to refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      TokenManager.hasRefreshToken()
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = TokenManager.getRefreshToken();
        const response = await api.post<{ access: string }>(
          API_ENDPOINTS.REFRESH,
          { refresh: refreshToken },
        );

        const { access } = response.data;
        TokenManager.setAccessToken(access);
        api.defaults.headers.common["Authorization"] = `Bearer ${access}`;

        // Retry original request with new token
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, user needs to login again
        TokenManager.clearTokens();
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// ============================================================================
// AUTH ENDPOINTS
// ============================================================================

/**
 * Login user with username and password
 * Returns: { access: string, refresh: string }
 */
export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>(API_ENDPOINTS.LOGIN, {
        username,
        password,
      });
      const { access, refresh } = response.data;

      // Store tokens
      TokenManager.setTokens(access, refresh);

      // Set authorization header for subsequent requests
      api.defaults.headers.common["Authorization"] = `Bearer ${access}`;

      return response.data;
    } catch (error) {
      throw new Error("Login failed: " + handleError(error));
    }
  },

  async register(payload: RegisterPayload): Promise<User> {
    try {
      const response = await api.post<User>(API_ENDPOINTS.REGISTER, payload);
      return response.data;
    } catch (error) {
      throw new Error("Registration failed: " + handleError(error));
    }
  },

  async createStaff(payload: RegisterPayload): Promise<User> {
    try {
      const response = await api.post<User>(API_ENDPOINTS.STAFF_CREATE, payload);
      return response.data;
    } catch (error) {
      throw new Error("Create staff failed: " + handleError(error));
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<User>(API_ENDPOINTS.CURRENT_USER);
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch user: " + handleError(error));
    }
  },

  async refreshToken(): Promise<string> {
    const refresh = TokenManager.getRefreshToken();
    if (!refresh) throw new Error("No refresh token available");

    try {
      const response = await api.post<{ access: string }>(
        API_ENDPOINTS.REFRESH,
        {
          refresh,
        },
      );

      const { access } = response.data;
      TokenManager.setAccessToken(access);
      return access;
    } catch (error) {
      throw new Error("Token refresh failed: " + handleError(error));
    }
  },

  logout(): void {
    TokenManager.clearTokens();
    delete api.defaults.headers.common["Authorization"];
  },

  isAuthenticated(): boolean {
    return TokenManager.hasAccessToken();
  },
};

// ============================================================================
// BOOK ENDPOINTS
// ============================================================================

export const bookService = {
  async fetchAll(): Promise<Book[]> {
    try {
      const response = await api.get<Book[]>(API_ENDPOINTS.BOOKS);
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch books: " + handleError(error));
    }
  },

  async create(bookData: Book): Promise<Book> {
    try {
      const response = await api.post<Book>(API_ENDPOINTS.BOOKS, bookData);
      return response.data;
    } catch (error) {
      throw new Error("Failed to add book: " + handleError(error));
    }
  },

  async update(bookId: number, bookData: Partial<Book>): Promise<Book> {
    try {
      const response = await api.put<Book>(
        API_ENDPOINTS.BOOK_DETAIL(bookId),
        bookData,
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to update book: " + handleError(error));
    }
  },

  async delete(bookId: number): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.BOOK_DETAIL(bookId));
    } catch (error) {
      throw new Error("Failed to delete book: " + handleError(error));
    }
  },
};

// ============================================================================
// PROFILE ENDPOINTS
// ============================================================================

export const profileService = {
  async fetch(): Promise<UserProfile> {
    try {
      const response = await api.get<UserProfile>(API_ENDPOINTS.USER_PROFILE);
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch profile: " + handleError(error));
    }
  },

  async update(profileData: UserProfile): Promise<UserProfile> {
    try {
      const response = await api.patch<UserProfile>(
        API_ENDPOINTS.USER_PROFILE,
        profileData,
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to update profile: " + handleError(error));
    }
  },
};

// Initialize: restore authorization header if token exists
const existingToken = TokenManager.getAccessToken();
if (existingToken) {
  api.defaults.headers.common["Authorization"] = `Bearer ${existingToken}`;
}
