import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/Dashboard.css";

/**
 * Student Dashboard Page
 * Displays content specific to student users
 * Shows book browsing and profile management options
 */
const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>📚 Student Dashboard</h1>
          <p className="welcome-text">Welcome back, {user?.first_name || user?.username}!</p>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          <span className="logout-icon">⬅</span>
          <span>Logout</span>
        </button>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-icon">📖</div>
            <h2>Browse Books</h2>
            <p>Search and view books available in the library</p>
            <button
              className="card-button"
              onClick={() => navigate("/books")}
            >
              View Books
            </button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">👤</div>
            <h2>Your Profile</h2>
            <p>Manage your profile information and preferences</p>
            <button
              className="card-button"
              onClick={() => navigate("/profile")}
            >
              Go to Profile
            </button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">📝</div>
            <h2>My Borrowings</h2>
            <p>View your borrowed books and due dates</p>
            <button className="card-button" disabled>
              Coming Soon
            </button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">⭐</div>
            <h2>Recommendations</h2>
            <p>Personalized book recommendations</p>
            <button className="card-button" disabled>
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
