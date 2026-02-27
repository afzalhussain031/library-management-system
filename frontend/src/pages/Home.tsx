import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";
import AuthModal, { Mode } from "../components/AuthModal";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<Mode>("login");
  const navigate = useNavigate();

  const handleSuccess = () => {
    // after login / signup we send the user to the dashboard
    navigate("/dashboard");
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
        </div>

        {authOpen && (
          <AuthModal
            isOpen={authOpen}
            initialMode={authMode}
            onClose={() => setAuthOpen(false)}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default Home;
