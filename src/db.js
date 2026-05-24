const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'digest.db');

// Make sure the data folder exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS links (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    url         TEXT NOT NULL,
    author      TEXT NOT NULL,
    channel     TEXT NOT NULL,
    message_id  TEXT NOT NULL UNIQUE,
    posted_at   INTEGER NOT NULL,
    digested    INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS events (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id    TEXT NOT NULL UNIQUE,
    title       TEXT NOT NULL,
    description TEXT,
    start_time  TEXT,
    author      TEXT NOT NULL,
    digested    INTEGER NOT NULL DEFAULT 0
  );
`);

// ── Links ──────────────────────────────────────────────────────────────────

function insertLink({ url, author, channel, messageId, postedAt }) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO links (url, author, channel, message_id, posted_at)
    VALUES (@url, @author, @channel, @messageId, @postedAt)
  `);
  return stmt.run({ url, author, channel, messageId, postedAt });
}

function getPendingLinks() {
  return db.prepare(`
    SELECT * FROM links WHERE digested = 0 ORDER BY posted_at ASC
  `).all();
}

function markLinksDigested(ids) {
  if (!ids.length) return;
  const placeholders = ids.map(() => '?').join(', ');
  db.prepare(`
    UPDATE links SET digested = 1 WHERE id IN (${placeholders})
  `).run(...ids);
}

// ── Events ─────────────────────────────────────────────────────────────────

function insertEvent({ eventId, title, description, startTime, author }) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO events (event_id, title, description, start_time, author)
    VALUES (@eventId, @title, @description, @startTime, @author)
  `);
  return stmt.run({ eventId, title, description, startTime, author });
}

function getPendingEvents() {
  return db.prepare(`
    SELECT * FROM events WHERE digested = 0 ORDER BY start_time ASC
  `).all();
}

function markEventsDigested(ids) {
  if (!ids.length) return;
  const placeholders = ids.map(() => '?').join(', ');
  db.prepare(`
    UPDATE events SET digested = 1 WHERE id IN (${placeholders})
  `).run(...ids);
}

module.exports = {
  insertLink,
  getPendingLinks,
  markLinksDigested,
  insertEvent,
  getPendingEvents,
  markEventsDigested,
};