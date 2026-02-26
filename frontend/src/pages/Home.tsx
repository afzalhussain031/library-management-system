import React from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1>📚 Welcome to Library Management System</h1>
        <p className="subtitle">Manage your university library efficiently</p>

        <div className="button-container">
          <Link to="/books" className="nav-button books-button">
            <span className="button-icon">📖</span>
            <span className="button-text">Manage Books</span>
          </Link>

          <Link to="/profile" className="nav-button profile-button">
            <span className="button-icon">👤</span>
            <span className="button-text">Your Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
