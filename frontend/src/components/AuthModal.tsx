import React, { useEffect, useState } from "react";
import { authService } from "../services/apiClient";
import { handleError } from "../utils/errorHandler";
import "../styles/Modal.css";
import type { RegisterPayload } from "../types";

export type TabMode = "login" | "signup";
export type UserMode = "student" | "staff";

interface Props {
  isOpen: boolean;
  initialUserMode?: UserMode;
  initialTab?: TabMode;
  onClose: () => void;
  onSuccess: () => void;
}

const AuthModal: React.FC<Props> = ({
  isOpen,
  initialUserMode = "student",
  initialTab = "login",
  onClose,
  onSuccess,
}) => {
  const [userMode, setUserMode] = useState<UserMode>(initialUserMode);
  const [tab, setTab] = useState<TabMode>(initialTab);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [email, setEmail] = useState("");

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
  }, [userMode]);

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setPassword2("");
    setEmail("");
    setErrors({});
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      if (tab === "login") {
        await authService.login(username, password);
      } else {
        // Only allow signup for students. Staff signup is NOT available here.
        const payload: RegisterPayload = {
          username,
          email,
          password,
          password2,
        };
        await authService.register(payload);
        await authService.login(username, password);
      }

      resetForm();
      onSuccess();
      onClose();
    } catch (err) {
      setErrors({ general: handleError(err) });
    } finally {
      setLoading(false);
    }
  };

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

        {/* Inner tabs for student mode */}
        {userMode === "student" && (
          <div className="modal-tabs">
            <button
              disabled={loading}
              className={tab === "login" ? "active" : ""}
              onClick={() => {
                setTab("login");
                setErrors({});
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
              }}
            >
              Sign Up
            </button>
          </div>
        )}

        <form onSubmit={submit}>
          <div className="form-group">
            <label>Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* In student signup allow email and confirm password */}
          {userMode === "student" && tab === "signup" && (
            <>
              <div className="form-group">
                <label>Email (optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {userMode === "student" && tab === "signup" && (
            <div className="form-group">
              <label>Confirm password</label>
              <input
                type="password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          {/* Staff mode: signup is replaced with informational message */}
          {userMode === "staff" && tab === "signup" && (
            <p className="info">
              Staff accounts are created by administrators. Please contact an
              existing staff/admin for registration.
            </p>
          )}

          {errors.general && <p className="error">{errors.general}</p>}

          <button
            type="submit"
            disabled={loading || (userMode === "staff" && tab === "signup")}
            className="submit-button"
          >
            {loading
              ? "Please wait…"
              : tab === "login"
                ? "Log in"
                : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
