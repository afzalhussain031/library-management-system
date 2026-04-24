/**
 * Auth Provider Component
 * Wraps the app and provides authentication context to all children
 */

import React, { useEffect, useState } from "react";
import { authService } from "../services/apiClient";
import { AuthContext } from "./AuthContext";
import { STORAGE_KEYS } from "../constants";
import type {
  User,
  RegisterPayload,
  AuthContextType,
  AuthProviderProps,
} from "../types";

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const syncUser = (nextUser: User) => {
    setUser(nextUser);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(nextUser));
  };

  const clearUser = () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    setUser(null);
  }


  /**
   * Initialize auth state on app load
   * Restores user from localStorage or server if token exists
   */
  useEffect(() => {
    // TODO: Remove after backend sync
    setTimeout(() => {
      syncUser({
        id: 123,
        name: "mayank singh",
        first_name: "mayank",
        last_name: "singh",
        username: "mayank",
        email: "mayank@mayank.mayank",
      });
      setLoading(false)
    }, 1000);
    return;

    const initializeAuth = async () => {
      try {
        // Access token is memory-only, so page reload starts unauthenticated.
        // Try silent refresh using HttpOnly cookie.
        if (!authService.isAuthenticated()) {
          try {
            await authService.refreshToken();
          } catch {
            clearUser();
            return;
          }
        }

        const userData = await authService.getCurrentUser();
        syncUser(userData);
      } catch (err) {
        console.error("Auth initialization error:", err);
        clearUser();
      } finally {
        setLoading(false);
      }
    };

    const handleSessionExpired = () => {
      clearUser();
    };

    window.addEventListener("auth:session-expired", handleSessionExpired);

    initializeAuth();

    return () => {
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, []);

  /**
   * Login user with username and password
   */
  const login = async (username: string, password: string) => {
    await authService.login(username, password);

    // Fetch user data after successful login
    const userData = await authService.getCurrentUser();
    syncUser(userData);
  };

  /**
   * Register new user
   * Auto-logs in after successful registration
   */
  const register = async (payload: RegisterPayload) => {
    await authService.register(payload);

    // Auto-login after registration
    await login(payload.username, payload.password);
  };

  const createStaff = async (payload: RegisterPayload) => {
    await authService.createStaff(payload);
  };

  /**
   * Logout user
   * Clears tokens and user state
   */
  const logout = () => {
    authService.logout();
    clearUser();
  };

  /**
   * Refresh user data from server
   * Useful when user info changes and needs to be synced
   */
  const refreshUserData = async () => {
    try {
      if (!authService.isAuthenticated()) {
        clearUser();
        return;
      }

      const userData = await authService.getCurrentUser();
      syncUser(userData);
    } catch (err) {
      console.error("Failed to refresh user data:", err);
      // Don't throw - just log the error
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: user !== null,
    login,
    register,
    createStaff,
    logout,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
