// server/db/embedded.js
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

// Ensure data directory
const dataDir = path.join(__dirname, "../../data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const db = new Database(path.join(dataDir, "tca.db"));

// Initialize schema if not exists
db.exec(`
CREATE TABLE IF NOT EXISTS results (
  id TEXT PRIMARY KEY,
  firstName TEXT,
  lastName TEXT,
  grade TEXT,
  score INTEGER,
  timeSubmitted TEXT,
  synced INTEGER DEFAULT 0
);
`);

const insertOrUpdateResult = (result) => {
  const stmt = db.prepare(`
    INSERT INTO results (id, firstName, lastName, grade, score, timeSubmitted, synced)
    VALUES (@id, @firstName, @lastName, @grade, @score, @timeSubmitted, 0)
    ON CONFLICT(id) DO UPDATE SET
      firstName=excluded.firstName,
      lastName=excluded.lastName,
      grade=excluded.grade,
      score=excluded.score,
      timeSubmitted=excluded.timeSubmitted
  `);
  stmt.run(result);
};

const getAllResults = () => {
  return db.prepare("SELECT * FROM results").all();
};

const getUnsyncedResults = () => {
  return db.prepare("SELECT * FROM results WHERE synced = 0").all();
};

const markAsSynced = (ids = []) => {
  const stmt = db.prepare("UPDATE results SET synced = 1 WHERE id = ?");
  const tr = db.transaction((arr) => {
    for (const id of arr) stmt.run(id);
  });
  tr(ids);
};

module.exports = {
  insertOrUpdateResult,
  getAllResults,
  getUnsyncedResults,
  markAsSynced,
};
