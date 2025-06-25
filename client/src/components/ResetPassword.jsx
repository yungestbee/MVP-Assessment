import React, { useState } from "react";
import "../css/login.css";

export const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!newPassword || !confirmPassword) {
      setError("Both fields are required");
      setSuccess("");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setSuccess("");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      setSuccess("");
      return;
    }

    setError("");
    setSuccess("Password successfully reset!");
    // Submit newPassword to the server here
  };

  return (
    <div className="reset-container">
      <div className="reset-wrapper">
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              className="reset-input"
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="input-group">
            <input
              className="reset-input"
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div>
            <label>
              <input
                type="checkbox"
                onChange={() => setShowPassword(!showPassword)}
              />
              Show Password
            </label>
          </div>

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}

          <button type="submit" className="reset-btn">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};
