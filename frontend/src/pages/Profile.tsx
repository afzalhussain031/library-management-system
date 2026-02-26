import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserProfile, updateUserProfile } from "../services/api";
import "../styles/Pages.css";

interface User {
  id?: number;
  name?: string;
  email?: string;
  bio?: string;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<User>({ name: "", email: "", bio: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        setUser(profile);
        setError("");
      } catch (err) {
        setError("Failed to load user profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserProfile(user);
      setSuccess("Profile updated successfully");
      setError("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update profile");
      setSuccess("");
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="page-container">
        <div className="loader">Loading...</div>
      </div>
    );

  return (
    <div className="page-container">
      <div className="page-header">
        <Link to="/" className="back-button">
          ← Back to Home
        </Link>
        <h1>👤 Your Profile</h1>
        <p>Manage your account information</p>
      </div>
      <div className="page-content">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={user.name || ""}
              onChange={handleChange}
              placeholder="Enter your name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={user.email || ""}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="bio">Bio:</label>
            <textarea
              id="bio"
              name="bio"
              value={user.bio || ""}
              onChange={handleChange}
              placeholder="Tell us about yourself"
              rows={5}
            />
          </div>
          <button type="submit" className="submit-button">
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
