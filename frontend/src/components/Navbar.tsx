import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/Navbar.css";

/**
 * Navbar Component
 * Displays user welcome message, staff badge, and logout button
 * Uses useAuth hook to access auth state (no props needed)
 */
const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h2 className="navbar-title">📚 Library Management</h2>
      </div>

      <div className="navbar-right">
        {isAuthenticated && user ? (
          <div className="navbar-user">
            <span className="welcome-text">
              Welcome, <strong>{user.username || user.name || "User"}</strong>
            </span>
            {user.is_staff && <span className="staff-badge">Staff</span>}
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <div className="navbar-auth">
            <p>Not logged in</p>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
