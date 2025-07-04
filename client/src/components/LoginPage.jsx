import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../css/login.css";
import { Link, Routes, Route, useNavigate } from "react-router-dom";
const API_BASE = import.meta.env.VITE_API_BASE;

export const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // const validateEmail = (email) => {
  //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   return emailRegex.test(email);
  // };

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent page refresh
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password.length > 40) {
      setError("Password must not exceed 40 characters");
      return;
    }

    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,40}$/;
    if (!passwordRegex.test(password)) {
      setError(
        "Password must contain at least one number and one special character"
      );
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE}/api/v1/login`,
        {
          username,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        Swal.fire({
          title: "Login Successful!",
          icon: "success",
          timer: 2000,
          timerProgressBar: true,
        });
        navigate("/admin");
      }

      console.log("Login success:", response.data);
      setError(""); // Clear error on success
    } catch (err) {
      console.error(err);
      setError(err.data.message);
    }
  };

  return (
    <section id="body">
      <div className="overall">
        <div>
          <p className="text1">Login</p>
        </div>
        <form className="group2" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value.trim())}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="aa">
            {/* <a className="link" href="#">Forgot Password?</a> */}
            <Link to="/forgot-password" className="link">
              Forgot Password
            </Link>
          </div>

          {error && <p className="error">{error}</p>}

          <div className="btn-top aa">
            <button className="btn" type="submit">
              Login
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
