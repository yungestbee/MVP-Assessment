// Student.js
const { app } = require("electron");
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

// Use Electron's userData path for persistence
const dbFile = path.join(app.getPath("userData"), "students.db");

// Ensure folder exists
if (!fs.existsSync(path.dirname(dbFile))) {
  fs.mkdirSync(path.dirname(dbFile), { recursive: true });
}

// Connect to DB
const db = new Database(dbFile);

// Create table if it doesn't exist
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    grade TEXT NOT NULL,
    score TEXT DEFAULT '{}',
    school TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
  )
`
).run();

const Student = {
  create: (data) => {
    const { firstName, lastName, grade, score = {}, school = null } = data;
    const stmt = db.prepare(`
      INSERT INTO students (firstName, lastName, grade, score, school)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      firstName,
      lastName,
      grade,
      JSON.stringify(score),
      school
    );
    return Student.getById(result.lastInsertRowid);
  },

  getAll: () => db.prepare("SELECT * FROM students ORDER BY id DESC").all(),
  getById: (id) => db.prepare("SELECT * FROM students WHERE id = ?").get(id),

  update: (id, data) => {
    const { firstName, lastName, grade, score, school } = data;
    const stmt = db.prepare(`
      UPDATE students
      SET
        firstName = COALESCE(?, firstName),
        lastName = COALESCE(?, lastName),
        grade = COALESCE(?, grade),
        score = COALESCE(?, score),
        school = COALESCE(?, school),
        updatedAt = datetime('now')
      WHERE id = ?
    `);
    stmt.run(
      firstName,
      lastName,
      grade,
      score ? JSON.stringify(score) : undefined,
      school,
      id
    );
    return Student.getById(id);
  },

  delete: (id) => {
    const stmt = db.prepare("DELETE FROM students WHERE id = ?");
    const result = stmt.run(id);
    return result.changes > 0;
  },
};

module.exports = Student;
