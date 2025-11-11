// Unified database interface - uses PostgreSQL in production, SQLite locally

const USE_POSTGRES = !!process.env.DATABASE_URL;

let db: any;
let pool: any;

if (USE_POSTGRES) {
  console.log('Using PostgreSQL');
  const { default: pgPool, initDatabase } = await import('./database-pg.js');
  pool = pgPool;
  await initDatabase();
} else {
  console.log('Using SQLite');
  const { default: sqliteDb, initDatabase } = await import('./database.js');
  db = sqliteDb;
  initDatabase();
}

// Query wrapper - returns rows
export async function query(sql: string, params: any[] = []): Promise<any[]> {
  if (USE_POSTGRES) {
    // PostgreSQL uses $1, $2 placeholders
    const pgSql = sql.replace(/\?/g, (_, index) => `$${params.findIndex((_, i) => i === index) + 1}`);
    let paramIndex = 1;
    const pgSqlFixed = sql.replace(/\?/g, () => `$${paramIndex++}`);
    const result = await pool.query(pgSqlFixed, params);
    return result.rows;
  } else {
    // SQLite
    const stmt = db.prepare(sql);
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      return stmt.all(...params);
    } else {
      const result = stmt.run(...params);
      return [{ id: result.lastInsertRowid, changes: result.changes }];
    }
  }
}

// Get single row
export async function get(sql: string, params: any[] = []): Promise<any> {
  if (USE_POSTGRES) {
    let paramIndex = 1;
    const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
    const result = await pool.query(pgSql, params);
    return result.rows[0];
  } else {
    const stmt = db.prepare(sql);
    return stmt.get(...params);
  }
}

// Run INSERT/UPDATE/DELETE - returns lastInsertRowid
export async function run(sql: string, params: any[] = []): Promise<{ lastInsertRowid: number; changes: number }> {
  if (USE_POSTGRES) {
    let paramIndex = 1;
    const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
    
    // Add RETURNING id for INSERT statements
    const isInsert = sql.trim().toUpperCase().startsWith('INSERT');
    const finalSql = isInsert && !pgSql.includes('RETURNING') ? pgSql + ' RETURNING id' : pgSql;
    
    const result = await pool.query(finalSql, params);
    return {
      lastInsertRowid: result.rows[0]?.id || 0,
      changes: result.rowCount || 0
    };
  } else {
    const stmt = db.prepare(sql);
    const result = stmt.run(...params);
    return {
      lastInsertRowid: result.lastInsertRowid as number,
      changes: result.changes
    };
  }
}

export { db, pool };

