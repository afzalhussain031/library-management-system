import React, { useEffect, useState } from "react";
import { login, register } from "../services/api";
import "../styles/Modal.css"; // or a dedicated Modal.css

export type Mode = "login" | "signup";

interface Props {
  isOpen: boolean;
  initialMode?: Mode;
  onClose: () => void;
  onSuccess: () => void; // parent will navigate
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

  // form fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [email, setEmail] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  // lock scroll when modal open
  useEffect(() => {
    document.body.classList.toggle("modal-open", isOpen);
  }, [isOpen]);

  // close on ESC
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
        await login(username, password);
      } else {
        await register({
          username,
          email,
          password,
          password2,
          invite_code: inviteCode,
        });
      }
      resetForm();
      onSuccess();
      onClose();
    } catch (err: any) {
      // the helper in api.ts returns a text message, use it directly
      setErrors({ general: err.message || "Something went wrong" });
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
            Sign Up
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
