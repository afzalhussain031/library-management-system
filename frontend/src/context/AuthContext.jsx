import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on app load
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      let token = localStorage.getItem("access_token");

      // Only try cookie refresh if this browser previously had a login session
      if (!token) {
        if (localStorage.getItem("auth_session") !== "1") {
          setCurrentUser(null);
          return;
        }

        try {
          const refreshRes = await auth.refreshToken();
          token = refreshRes.data?.access;
          if (token) {
            localStorage.setItem("access_token", token);
          }
        } catch {
          localStorage.removeItem("auth_session");
          setCurrentUser(null);
          return;
        }
      }

      const user = await auth.getCurrentUser();
      setCurrentUser(user);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("auth_session");
      } else if (status !== 403) {
        console.error("Auth check failed:", err);
      }
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }

  // Login function
  async function login(username, password) {
    setError(null);
    try {
      await auth.login(username, password);
      const user = await auth.getCurrentUser();
      setCurrentUser(user);
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  // Logout function
  async function logout() {
    try {
      await auth.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("auth_session");
      setCurrentUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{ currentUser, login, logout, loading, error }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
