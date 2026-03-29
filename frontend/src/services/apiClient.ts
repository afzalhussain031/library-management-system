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
  withCredentials: true,
});

let refreshInFlight: Promise<string> | null = null;

const applyAccessToken = (access: string) => {
  TokenManager.setAccessToken(access);
  api.defaults.headers.common["Authorization"] = `Bearer ${access}`
}

const clearAccessTokenState = () => {
  TokenManager.clearTokens();
  delete api.defaults.headers.common["Authorization"];
}

const requestAccessTokenRefresh = async (): Promise<string> => {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    const response = await api.post<{access: string}> (API_ENDPOINTS.REFRESH, {});
    const { access } = response.data;
    applyAccessToken(access);
    return access;
  }) ();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
};


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
    const originalRequest = error.config as
      | (typeof error.config & { _retry?: boolean })
      | undefined;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !String(originalRequest?.url || "").includes(API_ENDPOINTS.REFRESH)
    ) {
      originalRequest._retry = true;

      try {
        await requestAccessTokenRefresh();

        return api(originalRequest);
      } catch (refreshError) {
        clearAccessTokenState();
        window.dispatchEvent(new Event("auth:session-expired"));
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
 * Returns: { access: string }
 */
export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse> (API_ENDPOINTS.LOGIN, {
      username, 
      password,
    });
    const { access } = response.data;

    applyAccessToken(access);
    return response.data;
  },

  async register(payload: RegisterPayload): Promise<User> {
    const response = await api.post<User> (API_ENDPOINTS.REGISTER, payload);
    return response.data;
  },



  async createStaff(payload: RegisterPayload): Promise<User> {
    const response = await api.post<User>(API_ENDPOINTS.STAFF_CREATE, payload);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>(API_ENDPOINTS.CURRENT_USER);
    return response.data;
  },

  async refreshToken(): Promise<string> {
    return requestAccessTokenRefresh();
  },

  logout(): void {
    // best-effort server-side cookie clear
    api.post(API_ENDPOINTS.LOGOUT).catch(() => undefined);

    clearAccessTokenState();
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