const Database = require("better-sqlite3");
const path = require("path");

// ✅ Connect to your SQLite database file
const dbPath = path.join(__dirname, "../../database"); // adjust if needed
const db = new Database(dbPath);

// ✅ Create students table if not exists
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

// ✅ Student Model
const Student = {
  // CREATE
  create: (data) => {
    const { firstName, lastName, grade, score = "{}", school = null } = data;
    const stmt = db.prepare(`
      INSERT INTO students (firstName, lastName, grade, score, school)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(firstName, lastName, grade, score, school);
    return Student.getById(result.lastInsertRowid);
  },

  // READ ALL
  getAll: () => {
    return db.prepare("SELECT * FROM students ORDER BY id DESC").all();
  },

  // READ ONE
  getById: (id) => {
    return db.prepare("SELECT * FROM students WHERE id = ?").get(id);
  },

  // UPDATE
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

    stmt.run(firstName, lastName, grade, score, school, id);
    return Student.getById(id);
  },

  // DELETE
  delete: (id) => {
    const stmt = db.prepare("DELETE FROM students WHERE id = ?");
    return stmt.run(id);
  },
};

module.exports = Student;
