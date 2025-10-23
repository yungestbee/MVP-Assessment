// server/controllers/auth.controller.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("../../database/db"); // adjust path if needed

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// ✅ Create users table if not exists
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    email TEXT UNIQUE,
    password TEXT,
    resetToken TEXT,
    resetTokenExpire INTEGER,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`
).run();

const AuthController = {
  // ===============================
  // REGISTER USER
  // ===============================
  register: (req, res, next) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const existing = db
        .prepare("SELECT * FROM users WHERE email = ?")
        .get(email);
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);
      const stmt = db.prepare(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)"
      );
      const info = stmt.run(username, email, hashedPassword);

      req.user = { id: info.lastInsertRowid, username, email }; // for sendMail middleware
      next(); // call sendMail middleware
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error creating user" });
    }
  },

  // ===============================
  // LOGIN USER
  // ===============================
  login: (req, res) => {
    try {
      const { username, password } = req.body;
      console.log(username, password)
      const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const valid = bcrypt.compareSync(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: "1d",
      });

      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false, // set to true in production with HTTPS
          sameSite: "lax",
        })
        .json({
          message: "Login successful",
          user: { id: user.id, username: user.username, email: user.email },
          token,
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Login error" });
    }
  },

  // ===============================
  // FORGOT PASSWORD
  // ===============================
  forgotPassword: (req, res) => {
    try {
      const { email } = req.body;
      const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const resetToken = crypto.randomBytes(20).toString("hex");
      const expire = Date.now() + 10 * 60 * 1000; // 10 minutes

      db.prepare(
        "UPDATE users SET resetToken = ?, resetTokenExpire = ? WHERE id = ?"
      ).run(resetToken, expire, user.id);

      const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
      // You can use nodemailer here (if sendMail middleware not handling this)
      console.log("Reset link:", resetUrl);

      res.json({ message: "Password reset link sent to your email", resetUrl });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error sending password reset link" });
    }
  },

  // ===============================
  // RESET PASSWORD
  // ===============================
  resetPassword: (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const user = db
        .prepare(
          "SELECT * FROM users WHERE resetToken = ? AND resetTokenExpire > ?"
        )
        .get(token, Date.now());

      if (!user) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);
      db.prepare(
        "UPDATE users SET password = ?, resetToken = NULL, resetTokenExpire = NULL WHERE id = ?"
      ).run(hashedPassword, user.id);

      res.json({ message: "Password reset successful" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error resetting password" });
    }
  },

  // ===============================
  // LOGOUT USER
  // ===============================
  logout: (req, res) => {
    try {
      res.clearCookie("token");
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error logging out" });
    }
  },
};

module.exports = AuthController;
