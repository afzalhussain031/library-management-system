import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/Home.css";
import AuthModal, { Mode } from "../components/AuthModal";

/**
 * Home Page
 * Landing page with navigation and auth modal
 * Uses useAuth hook to check if user is logged in
 */
const Home: React.FC = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<Mode>("login");
  const navigate = useNavigate();
  const { user, refreshUserData } = useAuth();

  const handleAuthSuccess = async () => {
    setAuthOpen(false);
    await refreshUserData();
    // Auto-navigate after successful login
    setTimeout(() => {
      navigate("/books");
    }, 500);
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>📚 Welcome to Library Management System</h1>
        <p className="subtitle">Manage your university library efficiently</p>

        <div className="button-container">
          <button
            className="nav-button books-button"
            onClick={() => navigate("/books")}
          >
            <span className="button-icon">📖</span>
            <span className="button-text">Manage Books</span>
          </button>

          <button
            className="nav-button profile-button"
            onClick={() => navigate("/profile")}
          >
            <span className="button-icon">👤</span>
            <span className="button-text">Your Profile</span>
          </button>

          {!user && (
            <>
              <button
                className="nav-button login-button"
                onClick={() => {
                  setAuthMode("login");
                  setAuthOpen(true);
                }}
              >
                <span className="button-icon">🔐</span>
                <span className="button-text">Sign In</span>
              </button>

              <button
                className="nav-button signup-button"
                onClick={() => {
                  setAuthMode("signup");
                  setAuthOpen(true);
                }}
              >
                <span className="button-icon">📝</span>
                <span className="button-text">Register</span>
              </button>
            </>
          )}
        </div>

        {authOpen && (
          <AuthModal
            isOpen={authOpen}
            initialMode={authMode}
            onClose={() => setAuthOpen(false)}
            onSuccess={handleAuthSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default Home;
