import axios from "axios";

const ROOT = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_URL = `${ROOT}/api`;

// Type definitions
interface Book {
  id?: number;
  title: string;
  author: string;
  isbn: string;
  published_date?: string;
}

interface UserProfile {
  id?: number;
  name?: string;
  email?: string;
  bio?: string;
}

interface User {
  id: number;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  is_staff?: boolean;
}

export const api = axios.create({
  baseURL: API_URL,
});

// Register
export async function register(payload: {
  username: string;
  email?: string;
  password: string;
  password2: string;
  invite_code?: string;
}) {
  try {
    const res = await api.post("/register/", payload);
    // optionally auto-login: call login() after successful register
    return res.data;
  } catch (err) {
    throw new Error("Signup failed: " + handleError(err));
  }
}

// set token on api (call after login or on app init)
export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("accessToken", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("accessToken");
  }
}

// login: returns { access, refresh }
export async function login(username: string, password: string) {
  const res = await api.post("/token/", { username, password });
  const { access, refresh } = res.data;
  setAuthToken(access);
  localStorage.setItem("refreshToken", refresh);
  // fetch current user and store small copy locally
  try {
    const user = await getCurrentUser();
    localStorage.setItem("currentUser", JSON.stringify(user));
  } catch (err) {
    // ignore user fetch failure; token is set so subsequent calls can succeed
  }
  return res.data;
}

// refresh access token
export async function refreshToken() {
  const refresh = localStorage.getItem("refreshToken");
  if (!refresh) throw new Error("No refresh token");
  const res = await api.post("/token/refresh/", { refresh });
  const { access } = res.data;
  setAuthToken(access);
  return access;
}

// logout
export function logout() {
  setAuthToken(null);
  localStorage.removeItem("refreshToken");
}

const handleError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    return (
      (data && (data.detail || data.message || JSON.stringify(data))) ||
      error.message
    );
  }
  return error instanceof Error ? error.message : "An unknown error occurred";
};

// Book API endpoints (use api instance)
export const fetchBooks = async (): Promise<Book[]> => {
  try {
    const response = await api.get<Book[]>("/books/");
    return response.data;
  } catch (error) {
    throw new Error("Error fetching books: " + handleError(error));
  }
};

export const addBook = async (bookData: Book): Promise<Book> => {
  try {
    const response = await api.post<Book>("/books/", bookData);
    return response.data;
  } catch (error) {
    throw new Error("Error adding book: " + handleError(error));
  }
};

export const updateBook = async (
  bookId: number,
  bookData: Book,
): Promise<Book> => {
  try {
    const response = await api.put<Book>(`/books/${bookId}/`, bookData);
    return response.data;
  } catch (error) {
    throw new Error("Error updating book: " + handleError(error));
  }
};

export const deleteBook = async (bookId: number): Promise<void> => {
  try {
    await api.delete(`/books/${bookId}/`);
  } catch (error) {
    throw new Error("Error deleting book: " + handleError(error));
  }
};

// User API endpoints
export const fetchUserProfile = async (
  userId: number,
): Promise<UserProfile> => {
  try {
    const response = await api.get<UserProfile>(`/users/${userId}/`);
    return response.data;
  } catch (error) {
    throw new Error("Error fetching user profile: " + handleError(error));
  }
};

export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await api.get<UserProfile>("/profile/");
    return response.data;
  } catch (error) {
    throw new Error("Error fetching user profile: " + handleError(error));
  }
};

// fetch brief current user info (includes is_staff)
export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await api.get<User>("/me/");
    return response.data;
  } catch (error) {
    throw new Error("Error fetching current user: " + handleError(error));
  }
};

export const updateUserProfile = async (
  profileData: UserProfile,
): Promise<UserProfile> => {
  try {
    const response = await api.patch<UserProfile>("/profile/", profileData);
    return response.data;
  } catch (error) {
    throw new Error("Error updating user profile: " + handleError(error));
  }
};

// initialize auth header if token exists
const existingToken = localStorage.getItem("accessToken");
if (existingToken) setAuthToken(existingToken);
