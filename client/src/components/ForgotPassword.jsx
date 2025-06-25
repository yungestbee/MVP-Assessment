import React, { useState } from "react";
import "../css/login.css";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      // Send email to backend
      const response = await axios.post("http://localhost:6000/api/v1/forgot-password", {
        email,
      });

      if (response.data.success) {
        setError("");
        Swal.fire({
          icon: "success",
          title: "Reset Link Sent",
          text: "Please check your email for the reset instructions.",
          confirmButtonColor: "#4a90e2"
        });
      } else {
        setError("Email not found or failed to send reset link");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again later.");
    }
  };

  return (
    <section id="body">
      <div className="forgot-wrapper">
        <button
          type="button"
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          ←
        </button>

        <form className="group2" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
          />
          {error && <p className="error">{error}</p>}
          <div className="btn-top">
            <button type="submit" className="btn">
              Send Reset Link
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
