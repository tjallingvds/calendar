import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../calendar.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Check if user_id column exists in scheduled_tasks, if not add it
  const columns = db.pragma('table_info(scheduled_tasks)');
  const hasUserId = columns.some((col: any) => col.name === 'user_id');
  
  // Scheduled tasks
  db.exec(`
    CREATE TABLE IF NOT EXISTS scheduled_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER${hasUserId ? '' : ' DEFAULT 1'},
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      color TEXT DEFAULT '#3b82f6',
      completed INTEGER DEFAULT 0,
      completed_at TEXT,
      not_completed_reason TEXT,
      reflection_notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP${hasUserId ? '' : ',\n      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE'}
    )
  `);

  // Add user_id column if it doesn't exist
  if (!hasUserId) {
    try {
      db.exec(`ALTER TABLE scheduled_tasks ADD COLUMN user_id INTEGER DEFAULT 1`);
    } catch (e) {
      // Column might already exist
    }
  }

  // Events
  const eventsColumns = db.pragma('table_info(events)');
  const eventsHasUserId = eventsColumns.some((col: any) => col.name === 'user_id');
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER${eventsHasUserId ? '' : ' DEFAULT 1'},
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      type TEXT DEFAULT 'event',
      color TEXT DEFAULT '#ef4444',
      completed INTEGER DEFAULT 0,
      completed_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP${eventsHasUserId ? '' : ',\n      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE'}
    )
  `);

  if (!eventsHasUserId) {
    try {
      db.exec(`ALTER TABLE events ADD COLUMN user_id INTEGER DEFAULT 1`);
    } catch (e) {
      // Column might already exist
    }
  }

  // Templates
  const templatesColumns = db.pragma('table_info(templates)');
  const templatesHasUserId = templatesColumns.some((col: any) => col.name === 'user_id');
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER${templatesHasUserId ? '' : ' DEFAULT 1'},
      name TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP${templatesHasUserId ? '' : ',\n      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE'}
    )
  `);

  if (!templatesHasUserId) {
    try {
      db.exec(`ALTER TABLE templates ADD COLUMN user_id INTEGER DEFAULT 1`);
    } catch (e) {
      // Column might already exist
    }
  }

  // Template Tasks
  db.exec(`
    CREATE TABLE IF NOT EXISTS template_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      template_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      day_of_week INTEGER NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      color TEXT DEFAULT '#3b82f6',
      FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
    )
  `);

  // Weekly Goals
  db.exec(`
    CREATE TABLE IF NOT EXISTS weekly_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      week_start TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Pulse Notes (Linear-style)
  db.exec(`
    CREATE TABLE IF NOT EXISTS pulse_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('SQLite database initialized at:', dbPath);
}

export default db;


