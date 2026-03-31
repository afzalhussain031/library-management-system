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
    id: 0,
    username: "",
    email: "",
    first_name: "",
    last_name: "",
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
      const updatePayload = {
        email: profileData.email,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        bio: profileData.bio,
      };

      await profileService.update(updatePayload);
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

  if (loading && !profileData.username)
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
            <label htmlFor="first_name">First Name:</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={profileData.first_name || ""}
              onChange={handleChange}
              placeholder="Enter your first name"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="last_name">Last Name:</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={profileData.last_name || ""}
              onChange={handleChange}
              placeholder="Enter your last name"
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
