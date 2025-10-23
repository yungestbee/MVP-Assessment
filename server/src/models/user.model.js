// server/models/user.model.js
const db = require("../database/db");
const bcrypt = require("bcryptjs");

// ✅ Create users table if it doesn't exist
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`
).run();

const User = {
  // ✅ Create a new user
  create: ({ username, email, password, role }) => {
    const hash = bcrypt.hashSync(password, 10);
    const stmt = db.prepare(`
      INSERT INTO users (username, email, password, role)
      VALUES (?, ?, ?, ?)
    `);
    const info = stmt.run(username, email, hash, role || "user");
    return { id: info.lastInsertRowid, username, email, role: role || "user" };
  },

  // ✅ Find user by email
  findByEmail: (email) => {
    return db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  },

  // ✅ Find user by ID
  findById: (id) => {
    return db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  },

  // ✅ Get all users
  findAll: () => {
    return db
      .prepare("SELECT id, username, email, role, createdAt FROM users")
      .all();
  },
};

module.exports = User;
