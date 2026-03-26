import React, { useState, useEffect } from "react";
import { authService } from "../services/apiClient";
import { handleError } from "../utils/errorHandler";
import "../styles/Modal.css";
import type { StaffCreateModalProps } from "../types";

const StaffCreateModal: React.FC<StaffCreateModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.classList.toggle("modal-open", isOpen);
  }, [isOpen]);

  const reset = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setPassword2("");
    setError("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== password2) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await authService.createStaff({ username, email, password, password2 });
      reset();
      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      setError(handleError(err));
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
            <label>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} disabled={loading} />
          </div>
          <div className="form-group">
            <label>Email (optional)</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
          </div>
          <div className="form-group">
            <label>Confirm password</label>
            <input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} disabled={loading} />
          </div>
          {error && <p className="error">{error}</p>}
          <button className="submit-button" type="submit" disabled={loading}>Create Staff</button>
        </form>
      </div>
    </div>
  );
};

export default StaffCreateModal;
