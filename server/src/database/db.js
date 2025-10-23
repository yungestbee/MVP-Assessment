// src/database/db.js
const path = require("path");
const Database = require("better-sqlite3");

// create or open a local SQLite database file
const dbPath = path.join(__dirname, "database.sqlite");
const db = new Database(dbPath, { verbose: console.log });

// 🧱 Create Users table if it doesn’t exist
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT,
    lastName TEXT,
    email TEXT UNIQUE,
    username TEXT,
    password TEXT,
    tempPassword TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`
).run();

// 🧱 Create Students table if it doesn’t exist
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    grade TEXT NOT NULL,
    score TEXT,
    school TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`
).run();

console.log("✅ SQLite Database initialized successfully!");

module.exports = db;
