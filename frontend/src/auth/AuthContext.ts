/**
 * Auth Context
 * Manages global authentication state across the application
 * Replaces prop-drilling pattern with context API
 */

import { createContext } from "react";
import type { AuthContextType } from "../types";

// Create the context with undefined as default
// This forces consumers to use AuthProvider
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

AuthContext.displayName = "AuthContext";
