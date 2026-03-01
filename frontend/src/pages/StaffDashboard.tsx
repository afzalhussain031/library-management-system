import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/Dashboard.css";

/**
 * Staff Dashboard Page
 * Displays content specific to staff/admin users
 * Shows book management, user management, and analytics options
 */
const StaffDashboard: React.FC = () => {
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
          <h1>📚 Staff Dashboard</h1>
          <p className="welcome-text">Welcome, {user?.first_name || user?.username}!</p>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          <span className="logout-icon">⬅</span>
          <span>Logout</span>
        </button>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-grid">
          <div className="dashboard-card staff-card">
            <div className="card-icon">📖</div>
            <h2>Manage Books</h2>
            <p>Add, edit, or remove books from the library catalog</p>
            <button
              className="card-button"
              onClick={() => navigate("/books")}
            >
              Manage Books
            </button>
          </div>

          <div className="dashboard-card staff-card">
            <div className="card-icon">👥</div>
            <h2>User Management</h2>
            <p>View and manage student and staff accounts</p>
            <button className="card-button" disabled>
              Coming Soon
            </button>
          </div>

          <div className="dashboard-card staff-card">
            <div className="card-icon">📊</div>
            <h2>Analytics</h2>
            <p>View library statistics and usage reports</p>
            <button className="card-button" disabled>
              Coming Soon
            </button>
          </div>

          <div className="dashboard-card staff-card">
            <div className="card-icon">⚙️</div>
            <h2>Settings</h2>
            <p>Configure library system settings and policies</p>
            <button className="card-button" disabled>
              Coming Soon
            </button>
          </div>

          <div className="dashboard-card staff-card">
            <div className="card-icon">🔍</div>
            <h2>Audit Log</h2>
            <p>View system activities and changes</p>
            <button className="card-button" disabled>
              Coming Soon
            </button>
          </div>

          <div className="dashboard-card staff-card">
            <div className="card-icon">👤</div>
            <h2>Your Profile</h2>
            <p>Manage your account information</p>
            <button
              className="card-button"
              onClick={() => navigate("/profile")}
            >
              Go to Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
