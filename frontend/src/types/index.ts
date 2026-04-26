/**
 * Frontend TypeScript Type Definitions
 * Centralized location for all interfaces and types used across the app
 */

import type { ReactNode } from "react";

// User-related types
export interface User {
  id: number;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  is_staff?: boolean;
  date_joined?: string;
  name?: string;
}

export interface UserProfile {
  id: number;
  username: string;
  is_staff?: boolean;
  date_joined?: string;
  email: string;
  first_name: string;
  last_name: string;
  bio: string;
}

export type UserProfileUpdatePayload = Partial<
  Pick<UserProfile, "email" | "first_name" | "last_name" | "bio">
>;

// Category type
export interface Category {
  id: number;
  name: string;
  description: string;
}

// Publisher type
export interface Publisher {
  id: number;
  name: string;
  address: string;
}

// Book-related types
export interface Book {
  id?: number;
  title: string;
  author: string;
  isbn: string;
  published_date?: string;
  category?: Category | null;
  publisher?: Publisher | null;
  added_by?: number;
}

// API Response types
export interface LoginResponse {
  access: string;
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
  createStaff: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
}

// Form validation types
export interface FormErrors {
  [key: string]: string;
}

export type ProfileFormErrors = Partial<
  Record<"first_name" | "last_name" | "email" | "bio", string>
>;

export type AuthFieldKey = "username" | "email" | "password" | "password2";

export type AuthFieldTouched = Partial<Record<AuthFieldKey,boolean>>;

export interface AuthFormValues {
  username: string;
  email: string;
  password: string;
  password2: string;
}

export interface AuthFieldErrors {
  username?: string;
  email?: string;
  password?: string;
  password2?: string;
  general?: string;
}

// Auth modal UI modes
export type TabMode = "login" | "signup";
export type UserMode = "student" | "staff";

// Component props types
export interface AuthProviderProps {
  children: ReactNode;
}

export interface AuthModalProps {
  isOpen: boolean;
  initialUserMode?: UserMode;
  initialTab?: TabMode;
  onClose: () => void;
  onSuccess: () => void;
}

export interface StaffCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

// For form submission (send just IDs for category and publisher)
export type BookFormData = Pick<Book, "title" | "author" | "isbn"> & {
  category_id?: number | null;
  publisher_id?: number | null;
  published_date?: string;
};

export interface BookFormProps {
  onSubmit: (data: BookFormData) => void;
  initialData?: BookFormData;
}

// Hook state types
export interface UseBooksState {
  books: Book[];
  loading: boolean;
  error: string | null;
}
