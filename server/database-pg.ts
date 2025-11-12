import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false, // Railway internal connection doesn't need SSL
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return error after 2 seconds if no connection available
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export async function initDatabase() {
  const client = await pool.connect();
  
  try {
    // Scheduled tasks
    await client.query(`
      CREATE TABLE IF NOT EXISTS scheduled_tasks (
        id SERIAL PRIMARY KEY,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Events
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        start_time TEXT,
        end_time TEXT,
        type TEXT DEFAULT 'event',
        color TEXT DEFAULT '#ef4444',
        completed INTEGER DEFAULT 0,
        completed_at TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Templates
    await client.query(`
      CREATE TABLE IF NOT EXISTS templates (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Template Tasks
    await client.query(`
      CREATE TABLE IF NOT EXISTS template_tasks (
        id SERIAL PRIMARY KEY,
        template_id INTEGER NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        day_of_week INTEGER NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        color TEXT DEFAULT '#3b82f6'
      )
    `);

    // Weekly Goals
    await client.query(`
      CREATE TABLE IF NOT EXISTS weekly_goals (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        week_start TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Pulse Notes
    await client.query(`
      CREATE TABLE IF NOT EXISTS pulse_notes (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Blog Posts
    await client.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        full_content TEXT,
        date TEXT NOT NULL,
        published INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('PostgreSQL database initialized');
  } finally {
    client.release();
  }
}

export default pool;

