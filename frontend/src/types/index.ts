/**
 * Frontend TypeScript Type Definitions
 * Centralized location for all interfaces and types used across the app
 */

// User-related types
export interface User {
  id: number;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  is_staff?: boolean;
  name?: string;
}

export interface UserProfile {
  id?: number;
  name?: string;
  email?: string;
  bio?: string;
}

// Book-related types
export interface Book {
  id?: number;
  title: string;
  author: string;
  isbn: string;
  published_date?: string;
}

// API Response types
export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface RegisterPayload {
  username: string;
  email?: string;
  password: string;
  password2: string;
  invite_code?: string;
}

// Auth Context types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
}

// Form validation types
export interface FormErrors {
  [key: string]: string;
}
