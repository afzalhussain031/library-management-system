import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { profileService } from "../services/apiClient";
import { handleError } from "../utils/errorHandler";
import "../styles/Pages.css";
import type { UserProfile } from "../types";

/**
 * Profile Page
 * Display and edit user profile information
 * Uses useAuth hook to get current user and profileService for API calls
 */
const Profile: React.FC = () => {
  const { refreshUserData } = useAuth();
  const [profileData, setProfileData] = useState<UserProfile>({
    name: "",
    email: "",
    bio: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await profileService.fetch();
        setProfileData(profile);
        setError("");
      } catch (err) {
        setError(handleError(err));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await profileService.update(profileData);
      setSuccess("Profile updated successfully");
      setError("");

      // Refresh user data in auth context
      await refreshUserData();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(handleError(err));
      setSuccess("");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profileData.name)
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
              value={profileData.name || ""}
              onChange={handleChange}
              placeholder="Enter your name"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profileData.email || ""}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="bio">Bio:</label>
            <textarea
              id="bio"
              name="bio"
              value={profileData.bio || ""}
              onChange={handleChange}
              placeholder="Tell us about yourself"
              rows={5}
              disabled={loading}
            />
          </div>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
