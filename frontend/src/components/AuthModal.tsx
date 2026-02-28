import React, { useEffect, useState } from "react";
import { authService } from "../services/apiClient";
import { handleError } from "../utils/errorHandler";
import "../styles/Modal.css";
import type { RegisterPayload } from "../types";

export type Mode = "login" | "signup";

interface Props {
  isOpen: boolean;
  initialMode?: Mode;
  onClose: () => void;
  onSuccess: () => void;
}

const AuthModal: React.FC<Props> = ({
  isOpen,
  initialMode = "login",
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [email, setEmail] = useState("");
  const [inviteCode, setInviteCode] = useState("");

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

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setPassword2("");
    setEmail("");
    setInviteCode("");
    setErrors({});
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      if (mode === "login") {
        await authService.login(username, password);
      } else {
        const payload: RegisterPayload = {
          username,
          email,
          password,
          password2,
          invite_code: inviteCode,
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
        <div className="modal-tabs">
          <button
            disabled={loading}
            className={mode === "login" ? "active" : ""}
            onClick={() => {
              setMode("login");
              setErrors({});
            }}
          >
            Login
          </button>
          <button
            disabled={loading}
            className={mode === "signup" ? "active" : ""}
            onClick={() => {
              setMode("signup");
              setErrors({});
            }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="form-group">
            <label>Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          {mode === "signup" && (
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
              <div className="form-group">
                <label>Invite code (staff only)</label>
                <input
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
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

          {mode === "signup" && (
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

          {errors.general && <p className="error">{errors.general}</p>}

          <button type="submit" disabled={loading} className="submit-button">
            {loading
              ? "Please wait…"
              : mode === "login"
                ? "Log in"
                : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
