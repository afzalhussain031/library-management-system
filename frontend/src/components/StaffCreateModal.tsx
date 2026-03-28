import React, { useState, useEffect } from "react";
import { authService } from "../services/apiClient";
import { handleError, parseAuthFieldErrors } from "../utils/errorHandler";
import "../styles/Modal.css";
import {
  getPasswordGuidance,
  getPasswordStrength,
  hasFieldErrors,
  validateStaffCreateForm,
} from "../utils/validators";
import type {
  AuthFieldErrors,
  AuthFieldTouched,
  AuthFormValues,
  StaffCreateModalProps,
} from "../types";

const EMPTY_VALUES: AuthFormValues = {
  username: "",
  email: "",
  password: "",
  password2: "",
};

const StaffCreateModal: React.FC<StaffCreateModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [values, setValues] = useState<AuthFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [touched, setTouched] = useState<AuthFieldTouched>({});
  const [loading, setLoading] = useState(false);

  const passwordStrength = getPasswordStrength(values.password);
  const passwordGuidance = getPasswordGuidance(values.password);

  useEffect(() => {
    document.body.classList.toggle("modal-open", isOpen);
  }, [isOpen]);

  const reset = () => {
    setValues(EMPTY_VALUES);
    setErrors({});
    setTouched({});
  };

  const validateOneField = (
    field: keyof AuthFormValues,
    nextValues: AuthFormValues,
  ): string | undefined => {
    const nextErrors = validateStaffCreateForm(nextValues);
    return nextErrors[field];
  };

  const updateField = (field: keyof AuthFormValues, value: string) => {
    setValues((prev) => {
      const nextValues = { ...prev, [field]: value };

      if (touched[field] || (field === "password" && touched.password2)) {
        setErrors((prevErrors) => {
          const nextErrors: AuthFieldErrors = {
            ...prevErrors,
            general: undefined,
            [field]: validateOneField(field, nextValues),
          };

          if (field === "password" && touched.password2) {
            nextErrors.password2 = validateOneField("password2", nextValues);
          }

          return nextErrors;
        });
      }

      return nextValues;
    });
  };

  const handleBlur = (field: keyof AuthFormValues) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({
      ...prev,
      general: undefined,
      [field]: validateOneField(field, values),
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const clientErrors = validateStaffCreateForm(values);
    if (hasFieldErrors(clientErrors)) {
      setErrors(clientErrors);
      setTouched({ username: true, email: true, password: true, password2: true });
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      await authService.createStaff({
        username: values.username.trim(),
        email: values.email.trim() || undefined,
        password: values.password,
        password2: values.password2,
      });
      reset();
      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      const parsed = parseAuthFieldErrors(err);
      if (hasFieldErrors(parsed) || parsed.general) {
        setErrors(parsed);
        setTouched({ username: true, email: true, password: true, password2: true });
      } else {
        setErrors({ general: handleError(err) });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} role="dialog">
        <button className="close-button" onClick={onClose}>×</button>
        <h3>Create Staff Account</h3>
        <form onSubmit={submit}>
          <div className="form-group">
            <label htmlFor="staff-username">Username</label>
            <input
              id="staff-username"
              className={errors.username && touched.username ? "input-error" : ""}
              value={values.username}
              onChange={(e) => updateField("username", e.target.value)}
              onBlur={() => handleBlur("username")}
              disabled={loading}
              required
            />
            {touched.username && errors.username ? (
              <p className="input-error-text">{errors.username}</p>
            ) : (
              <p className="input-helper">Use a unique username with no spaces.</p>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="staff-email">Email (optional)</label>
            <input
              id="staff-email"
              type="email"
              className={errors.email && touched.email ? "input-error" : ""}
              value={values.email}
              onChange={(e) => updateField("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              disabled={loading}
            />
            {touched.email && errors.email ? (
              <p className="input-error-text">{errors.email}</p>
            ) : (
              <p className="input-helper">Optional, but recommended for account recovery.</p>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="staff-password">Password</label>
            <input
              id="staff-password"
              type="password"
              className={errors.password && touched.password ? "input-error" : ""}
              value={values.password}
              onChange={(e) => updateField("password", e.target.value)}
              onBlur={() => handleBlur("password")}
              disabled={loading}
              required
            />
            {touched.password && errors.password ? (
              <p className="input-error-text">{errors.password}</p>
            ) : (
              <p className="input-helper">Provide a strong password for this staff account.</p>
            )}
            <div className="password-guidance">
              <span className={`strength-badge strength-${passwordStrength.label.toLowerCase().replace(" ", "-")}`}>
                Strength: {passwordStrength.label}
              </span>
              {passwordGuidance.length > 0 && (
                <p className="input-helper">Tips: {passwordGuidance.slice(0, 2).join(" • ")}</p>
              )}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="staff-password2">Confirm password</label>
            <input
              id="staff-password2"
              type="password"
              className={errors.password2 && touched.password2 ? "input-error" : ""}
              value={values.password2}
              onChange={(e) => updateField("password2", e.target.value)}
              onBlur={() => handleBlur("password2")}
              disabled={loading}
              required
            />
            {touched.password2 && errors.password2 ? (
              <p className="input-error-text">{errors.password2}</p>
            ) : (
              <p className="input-helper">Re-enter the same password to confirm.</p>
            )}
          </div>
          {errors.general && <p className="error">{errors.general}</p>}
          <button className="submit-button" type="submit" disabled={loading}>
            {loading ? "Creating staff..." : "Create Staff"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StaffCreateModal;
