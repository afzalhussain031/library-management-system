import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/Home.css";
import AuthModal from "../components/AuthModal";

/**
 * Home Page
 * Landing page with role-based content
 * - Unauthenticated users: Shows only Login & Register buttons
 * - Authenticated users: Shows dashboard based on user type (Student/Staff)
 */
const Home: React.FC = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const [initialUserMode, setInitialUserMode] = useState<"student" | "staff">(
    "student",
  );
  const [initialTab, setInitialTab] = useState<"login" | "signup">("login");
  const navigate = useNavigate();
  const { user, loading, refreshUserData } = useAuth();

  // Redirect authenticated users to appropriate dashboard
  useEffect(() => {
    if (!loading && user) {
      const redirectPath = user.is_staff
        ? "/staff-dashboard"
        : "/student-dashboard";
      navigate(redirectPath, { replace: true });
    }
  }, [user, loading, navigate]);

  const handleAuthSuccess = async () => {
    setAuthOpen(false);
    await refreshUserData();
    // Redirect will be handled by the useEffect above
  };

  // Show loading state
  if (loading) {
    return (
      <div className="home-container">
        <div className="home-content">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  // Unauthenticated view
  if (!user) {
    return (
      <div className="home-container">
        <div className="home-content">
          <h1>📚 Welcome to Library Management System</h1>
          <p className="subtitle">Manage your university library efficiently</p>

          <div className="button-container">
            <button
              className="nav-button login-button"
              onClick={() => {
                setInitialUserMode("student");
                setInitialTab("login");
                setAuthOpen(true);
              }}
            >
              <span className="button-icon">🔐</span>
              <span className="button-text">Sign In</span>
            </button>

            <button
              className="nav-button signup-button"
              onClick={() => {
                setInitialUserMode("student");
                setInitialTab("signup");
                setAuthOpen(true);
              }}
            >
              <span className="button-icon">📝</span>
              <span className="button-text">Register</span>
            </button>
          </div>

          {authOpen && (
            <AuthModal
              isOpen={authOpen}
              initialUserMode={initialUserMode}
              initialTab={initialTab}
              onClose={() => setAuthOpen(false)}
              onSuccess={handleAuthSuccess}
            />
          )}
        </div>
      </div>
    );
  }

  // User is authenticated, redirect will happen via useEffect
  return null;
};

export default Home;
