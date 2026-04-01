import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useProfileForm, useUnsavedChanges } from "../hooks";
import { profileService } from "../services/apiClient";
import { handleError } from "../utils/errorHandler";
import "../styles/Pages.css";
import type { UserProfile } from "../types";

/**
 * Profile Page
 * Display and edit user profile information
 * Features:
 * - Client-side validation with per-field error display
 * - Unsaved changes warning
 * - Loading/saving state management
 * - Error recovery with input preservation
 */
const Profile: React.FC = () => {
  const { refreshUserData } = useAuth();
  const [initialProfileData, setInitialProfileData] = React.useState<UserProfile | null>(null);
  const [isLoadingInitial, setIsLoadingInitial] = React.useState(true);

  // Default profile for initial state
  const defaultProfile: UserProfile = {
    id: 0,
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    bio: "",
  };

  const form = useProfileForm(initialProfileData || defaultProfile);

  // Load profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await profileService.fetch();
        setInitialProfileData(profile);
        form.resetForm(profile);
      } catch (err) {
        form.setGeneralError(handleError(err));
        console.error(err);
      } finally {
        setIsLoadingInitial(false);
      }
    };

    fetchProfile();
  }, [])

  // Setup unsaved changes warning
  useUnsavedChanges(form.isDirty, form.isSubmitting);

  // Handle form submission with validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate before submission
    if (!form.validateForm()) {
      // Errors already set by validateForm
      return;
    }

    form.setSubmitting(true);
    form.setGeneralError("");

    try {
      const updatePayload ={
        email: form.data.email,
        first_name: form.data.first_name,
        last_name: form.data.last_name,
        bio: form.data.bio,
      };

      await profileService.update(updatePayload);

      // Update initial data to reset dirty state
      setInitialProfileData({
        ...initialProfileData!,
        ...updatePayload,
      });

      form.setSuccess("Profile updated successfully");
      form.setSubmitting(false);

      // Refresh auth context
      try {
        await refreshUserData();
      } catch (refreshErr) {
        console.error("Failed to refresh user data", refreshErr);
        // Don't block on refresh failure, profile was already saved
      }

      // Clear success message after 3 seconds
      setTimeout(() => form.setSuccess(""), 3000);
    } catch (err) {
      form.setGeneralError(handleError(err));
      form.setSubmitting(false);
      console.error(err);
    }
  };

  // Show loading state while initial profile is being fetched
  if (isLoadingInitial) {
    return (
      <div className="page-container">
        <div className="loader">Loading profile...</div>
      </div>
    );
  }

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
        {/* Top-level error summary */}
        {form.generalError && (
          <div className="error-summary" role="alert" aria-live="polite">
            <strong>⚠️ Unable to update profile:</strong>
            <p>{form.generalError}</p>
            {form.isSubmitting ? (
              <p className="retry-info">Retrying...</p>
            ) : (
              <p className="retry-info">Please fix the errors below and try again.</p>
            )}
          </div>
        )}

        {/* Success message */}
        {form.success && (
          <div className="success-summary" role="status" aria-live="polite">
            ✓ {form.success}
          </div>
        )}

        {/* Unsaved changes indicator */}
        {form.isDirty && !form.isSubmitting && (
          <div className="unsaved-indicator" role="status">
            💾 You have unsaved changes
          </div>
        )}

        {/* Main form */}
        <form onSubmit={handleSubmit} className="profile-form" noValidate>
          {/* First Name Field */}
          <div className="form-group">
            <label htmlFor="first_name">
              First Name: <span className="required">*</span>
            </label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={form.data.first_name || ""}
              onChange={form.handleChange}
              placeholder="Enter your first name"
              disabled={form.isSubmitting}
              className={form.getFieldError("first_name") ? "input-error" : ""}
              aria-describedby={
                form.getFieldError("first_name")
                  ? "first_name-error"
                  : undefined
              }
              required
            />
            {form.getFieldError("first_name") && (
              <span
                id="first_name-error"
                className="field-error"
                role="alert"
                aria-live="polite"
              >
                {form.getFieldError("first_name")}
              </span>
            )}
          </div>

          {/* Last Name Field */}
          <div className="form-group">
            <label htmlFor="last_name">
              Last Name: <span className="required">*</span>
            </label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={form.data.last_name || ""}
              onChange={form.handleChange}
              placeholder="Enter your last name"
              disabled={form.isSubmitting}
              className={form.getFieldError("last_name") ? "input-error" : ""}
              aria-describedby={
                form.getFieldError("last_name") ? "last_name-error" : undefined
              }
              required
            />
            {form.getFieldError("last_name") && (
              <span
                id="last_name-error"
                className="field-error"
                role="alert"
                aria-live="polite"
              >
                {form.getFieldError("last_name")}
              </span>
            )}
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">
              Email: <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.data.email || ""}
              onChange={form.handleChange}
              placeholder="Enter your email"
              disabled={form.isSubmitting}
              className={form.getFieldError("email") ? "input-error" : ""}
              aria-describedby={
                form.getFieldError("email") ? "email-error" : undefined
              }
              required
            />
            {form.getFieldError("email") && (
              <span
                id="email-error"
                className="field-error"
                role="alert"
                aria-live="polite"
              >
                {form.getFieldError("email")}
              </span>
            )}
          </div>

          {/* Bio Field */}
          <div className="form-group">
            <label htmlFor="bio">
              Bio: <span className="optional">(Optional)</span>
            </label>
            <textarea
              id="bio"
              name="bio"
              value={form.data.bio || ""}
              onChange={form.handleChange}
              placeholder="Tell us about yourself (max 500 characters)"
              rows={5}
              disabled={form.isSubmitting}
              className={form.getFieldError("bio") ? "input-error" : ""}
              maxLength={500}
              aria-describedby={
                form.getFieldError("bio") ? "bio-error" : "bio-counter"
              }
            />
            <div id="bio-counter" className="field-counter">
              {form.data.bio?.length || 0}/500 characters
            </div>
            {form.getFieldError("bio") && (
              <span
                id="bio-error"
                className="field-error"
                role="alert"
                aria-live="polite"
              >
                {form.getFieldError("bio")}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-button"
            disabled={form.isSubmitting}
            aria-busy={form.isSubmitting}
          >
            {form.isSubmitting ? (
              <>
                <span className="spinner" aria-hidden="true"></span>
                Updating...
              </>
            ) : form.isDirty ? (
              "Save Changes"
            ) : (
              "No changes"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
