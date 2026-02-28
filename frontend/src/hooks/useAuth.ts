/**
 * useAuth Hook
 * Custom hook for authentication logic
 * Provides login, register, logout functions and auth state
 */

import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import type { AuthContextType } from "../types";

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
