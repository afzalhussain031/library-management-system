import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { handleError, parseAuthFieldErrors } from "../utils/errorHandler";
import "../styles/AuthModalNew.css";
import type {
  AuthFieldErrors,
  AuthFieldTouched,
  AuthFormValues,
  RegisterPayload,
  TabMode,
  UserMode,
  AuthModalProps,
} from "../types";
import {
  getPasswordGuidance, 
  getPasswordStrength,
  hasFieldErrors,
  validateEmail,
  validateLoginForm,
  validatePasswordConfirmation,
  validatePasswordRequired,
  validateSignupForm,
  validateUsername,
} from "../utils/validators"

type FormMode = "login" | "signup";

const EMPTY_VALUES: AuthFormValues = {
  username: "",
  email: "",
  password: "",
  password2: "",
};

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialUserMode = "student",
  initialTab = "login",
  onClose,
  onSuccess,
}) => {
  const [userMode, setUserMode] = useState<UserMode>(initialUserMode);
  const [tab, setTab] = useState<TabMode>(initialTab);
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState<AuthFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [touched, setTouched] = useState<AuthFieldTouched>({});
  const { login, register } = useAuth();
  const staffContactEmail = "admin@library.local";
  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const password2Ref = useRef<HTMLInputElement>(null);

  const isStaffSignupBlocked = userMode === "staff" && tab === "signup";
  const formMode: FormMode = tab === "login" ? "login" : "signup";

  useEffect(() => {
    document.body.classList.toggle("modal-open", isOpen);
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    // reset sub-tab when switching user mode
    setTab("login");
    setErrors({});
    setTouched({});
  }, [userMode]);

  const getFormErrors = (
    nextValues: AuthFormValues,
    mode: FormMode,
  ): AuthFieldErrors => {
    return mode === "login" 
      ? validateLoginForm(nextValues)
      : validateSignupForm(nextValues);
  };


  const validateField = (
    field: keyof AuthFormValues,
    nextValues: AuthFormValues,
    mode: FormMode,
  ) : string | undefined => {
    if (mode === "login") {
      if (field === "username") return validateUsername(nextValues.username);
      if (field === "password") return validatePasswordRequired(nextValues.password);
      return undefined;
    }

    if (field === "username") return validateUsername(nextValues.username);
    if (field === "email") return validateEmail(nextValues.email);
    if (field === "password") return validatePasswordRequired(nextValues.password);
    if (field === "password2") {
      return validatePasswordConfirmation(nextValues.password, nextValues.password2);
    }

    return undefined;
  }

  const markAllVisibleFieldsTouched = (mode: FormMode) => {
    if (mode === "login") {
      setTouched({ username: true, password: true });
      return;
    }

    setTouched({
      username: true,
      email: true,
      password: true,
      password2: true, 
    });
  };

  const focusFirstInvalidField = (fieldErrors: AuthFieldErrors, mode: FormMode) => {
    const fieldOrder: (keyof AuthFormValues)[] = 
      mode === "login"
        ?["username", "password"]
        :["username", "email", "password", "password2"]

    for (const field of fieldOrder) {
      if (!fieldErrors[field]) {
        continue;
      }

      if (field === "username") usernameRef.current?.focus();
      if (field === "email") emailRef.current?.focus();
      if (field === "password") passwordRef.current?.focus();
      if (field === "password2") password2Ref.current?.focus();
      break;
    }
  }

  const updateField = (field: keyof AuthFormValues, value: string) => {
    setValues((prev) => {
      const nextValues = {...prev, [field]: value};

      if (touched[field] || (field === "password" && touched.password2)) {
        setErrors((prevErrors) => {
          const nextErrors: AuthFieldErrors = {
            ...prevErrors,
            general: undefined,
            [field]: validateField(field, nextValues, formMode),
          };

          if (formMode === "signup" && field === "password" && touched.password2) {
            nextErrors.password2 = validatePasswordConfirmation(
              nextValues.password,
              nextValues.password2,
            );
          }
          return nextErrors;
        });
      }
      return nextValues;
    })
  }


  const handleFieldBlur = (field: keyof AuthFormValues) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({
      ...prev,
      [field]: validateField(field, values, formMode),
      general: undefined,
    }));
  };

  const resetForm = () => {
    setValues(EMPTY_VALUES);
    setErrors({});
    setTouched({});
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    

    if (isStaffSignupBlocked) {
      return;
    }

    const clientErrors = getFormErrors(values, formMode);
    if (hasFieldErrors(clientErrors)) {
      setErrors(clientErrors);
      markAllVisibleFieldsTouched(formMode);
      focusFirstInvalidField(clientErrors, formMode);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      if (tab === "login") {
        await login(values.username.trim(), values.password);
      } else {
        // Only allow signup for students. Staff signup is NOT available here.
        const payload: RegisterPayload = {
          username: values.username.trim(),
          email: values.email.trim() || undefined,
          password: values.password,
          password2: values.password2,
        };
        await register(payload);
      }

      resetForm();
      onSuccess();
      onClose();
    } catch (err) {
      const parsed = parseAuthFieldErrors(err);

      if (hasFieldErrors(parsed) || parsed.general) {
        setErrors(parsed);
        setTouched((prev) => ({
          ...prev,
          username: prev.username || Boolean(parsed.username),
          email: prev.email || Boolean(parsed.email),
          password: prev.password || Boolean(parsed.password),
          password2: prev.password2 || Boolean(parsed.password2),
        }));
      } else {
        setErrors({ general: handleError(err) });
      }
    } finally {
      setLoading(false);
    }
  };

  const usernameError = touched.username ? errors.username : undefined;
  const emailError = touched.email ? errors.email : undefined;
  const passwordError = touched.password ? errors.password : undefined;
  const password2Error = touched.password2 ? errors.password2 : undefined;
  const passwordStrength = useMemo(
    () => getPasswordStrength(values.password),
    [values.password],
  );
  const passwordGuidance = useMemo(
    () => getPasswordGuidance(values.password),
    [values.password],
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <button className="close-button" onClick={onClose}>
          ×
        </button>

        <div className="modal-role-tabs">
          <button
            disabled={loading}
            className={userMode === "student" ? "active" : ""}
            onClick={() => setUserMode("student")}
          >
            Student
          </button>
          <button
            disabled={loading}
            className={userMode === "staff" ? "active" : ""}
            onClick={() => setUserMode("staff")}
          >
            Staff / Admin
          </button>
        </div>

        {/* Shared tabs for both student and staff modes */}
        <div className="modal-tabs">
          <button
            disabled={loading}
            className={tab === "login" ? "active" : ""}
            onClick={() => {
              setTab("login");
              setErrors({});
              setTouched({});
            }}
          >
            Login
          </button>
          <button
            disabled={loading}
            className={tab === "signup" ? "active" : ""}
            onClick={() => {
              setTab("signup");
              setErrors({});
              setTouched({});
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Single content area for login/signup/staff states */}
        <div className="page">
          <div className="hero">
            <div className="card">
              <div className="card-header">
                {userMode === "staff"
                  ? "Staff / Admin Access"
                  : tab === "login"
                    ? "Login"
                    : "Sign Up"}
              </div>

              <form onSubmit={submit} className="form">
                {!isStaffSignupBlocked && (
                  <div className="field-group">
                    <input
                      id="auth-username"
                      ref={usernameRef}
                      className={`input ${usernameError ? "input-error" : ""}`}
                      type="text"
                      name="username"
                      placeholder="Enrollment Number / Faculty Email ID"
                      value={values.username}
                      onChange={(e) => updateField("username", e.target.value)}
                      onBlur={() => handleFieldBlur("username")}
                      disabled={loading}
                      required
                      aria-invalid={Boolean(usernameError)}
                      aria-describedby="auth-username-help"
                    />
                    <p id="auth-username-help" className={usernameError ? "input-error-text" : "input-helper"}>
                      {usernameError || "Use your enrollment number or faculty username."}
                    </p>
                  </div>
                )}
                {userMode === "student" && tab === "signup" && (
                  <div className="field-group">
                    <input
                      id="auth-email"
                      ref={emailRef}
                      className={`input ${emailError ? "input-error" : ""}`}
                      type="email"
                      name="email"
                      placeholder="Email (optional)"
                      value={values.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      onBlur={() => handleFieldBlur("email")}
                      disabled={loading}
                      aria-invalid={Boolean(emailError)}
                      aria-describedby="auth-email-help"
                    />
                    <p id="auth-email-help" className={emailError ? "input-error-text" : "input-helper"}>
                      {emailError || "Optional, but useful for account recovery later."}
                    </p>
                  </div>
                )}
                {!isStaffSignupBlocked && (
                  <div className="field-group">
                    <input
                      id="auth-password"
                      ref={passwordRef}
                      className={`input ${passwordError ? "input-error" : ""}`}
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={values.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      onBlur={() => handleFieldBlur("password")}
                      disabled={loading}
                      required
                      aria-invalid={Boolean(passwordError)}
                      aria-describedby="auth-password-help"
                    />
                    <p id="auth-password-help" className={passwordError ? "input-error-text" : "input-helper"}>
                      {passwordError || (tab === "signup" ? "Use a strong password for better account safety." : "Enter your account password.")}
                    </p>
                    {tab === "signup" && (
                      <div className="password-guidance">
                        <span className={`strength-badge strength-${passwordStrength.label.toLowerCase().replace(" ", "-")}`}>
                          Strength: {passwordStrength.label}
                        </span>
                        {passwordGuidance.length > 0 && (
                          <p className="input-helper">
                            Tips: {passwordGuidance.slice(0, 2).join(" • ")}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {userMode === "student" && tab === "signup" && (
                  <div className="field-group">
                    <input
                      id="auth-password2"
                      ref={password2Ref}
                      className={`input ${password2Error ? "input-error" : ""}`}
                      type="password"
                      name="password2"
                      placeholder="Confirm Password"
                      value={values.password2}
                      onChange={(e) => updateField("password2", e.target.value)}
                      onBlur={() => handleFieldBlur("password2")}
                      disabled={loading}
                      required
                      aria-invalid={Boolean(password2Error)}
                      aria-describedby="auth-password2-help"
                    />
                    <p id="auth-password2-help" className={password2Error ? "input-error-text" : "input-helper"}>
                      {password2Error || "Re-enter your password exactly as above."}
                    </p>
                  </div>
                )}

                {/* Staff mode: signup is replaced with informational message */}
                {userMode === "staff" && tab === "signup" && (
                  <div className="staff-contact">
                    <p className="info">
                      Staff accounts are created by administrators. Please
                      contact admin for staff registration.
                    </p>
                    <a className="contact-admin-link" href={`mailto:${staffContactEmail}`}>
                      Contact Admin
                    </a>
                  </div>
                )}

                {errors.general && <p className="error">{errors.general}</p>}

                {isStaffSignupBlocked ? null : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="button"
                  >
                    {loading
                      ? tab === "login"
                        ? "Signing in..."
                        : "Creating account..."
                      : tab === "login"
                        ? "Login"
                        : "Register"}
                  </button>
                )}
              </form>

              {tab === "login" && userMode === "student" && (
                <div className="login-note">
                  Don't have an account?{" "}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setTab("signup");
                      setErrors({});
                      setTouched({});
                    }}
                    className="login-link"
                  >
                    Sign Up
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
