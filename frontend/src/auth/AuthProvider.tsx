/**
 * Auth Provider Component
 * Wraps the app and provides authentication context to all children
 */

import React, { useEffect, useState } from "react";
import { authService } from "../services/apiClient";
import { TokenManager } from "../utils/tokenManager";
import { handleError } from "../utils/errorHandler";
import { AuthContext } from "./AuthContext";
import { STORAGE_KEYS } from "../constants";
import type { User, RegisterPayload, AuthContextType } from "../types";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Initialize auth state on app load
   * Restores user from localStorage or server if token exists
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          // Try to get user from localStorage first (faster)
          const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            // Fetch from server if not in localStorage
            try {
              const userData = await authService.getCurrentUser();
              setUser(userData);
              localStorage.setItem(
                STORAGE_KEYS.CURRENT_USER,
                JSON.stringify(userData),
              );
            } catch (err) {
              console.error("Failed to fetch current user:", err);
              TokenManager.clearTokens();
              setUser(null);
            }
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login user with username and password
   */
  const login = async (username: string, password: string) => {
    try {
      const { access } = await authService.login(username, password);

      // Fetch user data after successful login
      const userData = await authService.getCurrentUser();
      setUser(userData);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userData));
    } catch (err) {
      const errorMsg = handleError(err);
      throw new Error(errorMsg);
    }
  };

  /**
   * Register new user
   * Auto-logs in after successful registration
   */
  const register = async (payload: RegisterPayload) => {
    try {
      await authService.register(payload);

      // Auto-login after registration
      await login(payload.username, payload.password);
    } catch (err) {
      const errorMsg = handleError(err);
      throw new Error(errorMsg);
    }
  };

  /**
   * Logout user
   * Clears tokens and user state
   */
  const logout = () => {
    authService.logout();
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    setUser(null);
  };

  /**
   * Refresh user data from server
   * Useful when user info changes and needs to be synced
   */
  const refreshUserData = async () => {
    try {
      if (!authService.isAuthenticated()) {
        setUser(null);
        return;
      }

      const userData = await authService.getCurrentUser();
      setUser(userData);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userData));
    } catch (err) {
      console.error("Failed to refresh user data:", err);
      // Don't throw - just log the error
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: authService.isAuthenticated(),
    login,
    register,
    logout,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
