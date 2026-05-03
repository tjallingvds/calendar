import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, get, run } from './db.js';
import {
  verifyPassword,
  generateToken,
  authenticateToken,
  checkRateLimit,
  resetRateLimit,
} from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.set('trust proxy', 1);

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Database is initialized in db.ts. We keep all existing tables intact —
// blog_posts data lives in production and must not be dropped.

// Add theme column migration if it doesn't exist
(async () => {
  try {
    const columns = await query(
      process.env.DATABASE_URL
        ? `SELECT column_name FROM information_schema.columns WHERE table_name = 'blog_posts' AND column_name = 'theme'`
        : `PRAGMA table_info(blog_posts)`,
      []
    );

    const hasThemeColumn = process.env.DATABASE_URL
      ? columns.length > 0
      : columns.some((col: any) => col.name === 'theme');

    if (!hasThemeColumn) {
      console.log('Adding theme column to blog_posts table...');
      await run('ALTER TABLE blog_posts ADD COLUMN theme TEXT', []);
      console.log('Theme column added successfully');
    }
  } catch (error) {
    console.log('Theme column migration check:', error);
  }
})();

// ===== AUTHENTICATION =====

app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

  const rateCheck = checkRateLimit(clientIp);
  if (!rateCheck.allowed) {
    return res.status(429).json({ error: rateCheck.message });
  }

  const isValid = verifyPassword(password);

  if (!password || !isValid) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  resetRateLimit(clientIp);

  const token = generateToken();

  res.json({
    success: true,
    token,
    expiresIn: '7d'
  });
});

app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ valid: true });
});

// ===== BLOG POSTS =====

app.get('/api/blog-posts', async (req, res) => {
  const { theme } = req.query;
  let sql = 'SELECT * FROM blog_posts WHERE published = 1';
  const params: any[] = [];

  if (theme) {
    sql += ' AND theme = ?';
    params.push(theme);
  }

  sql += ' ORDER BY date DESC';
  const posts = await query(sql, params);
  res.json(posts);
});

app.get('/api/blog-posts/themes', async (req, res) => {
  const themes = await query('SELECT DISTINCT theme FROM blog_posts WHERE published = 1 AND theme IS NOT NULL ORDER BY theme', []);
  res.json(themes.map((row: any) => row.theme));
});

app.get('/api/blog-posts/:id', async (req, res) => {
  const post = await get('SELECT * FROM blog_posts WHERE id = ? AND published = 1', [req.params.id]);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
});

app.get('/api/blog-posts-all', authenticateToken, async (req, res) => {
  const posts = await query('SELECT * FROM blog_posts ORDER BY date DESC', []);
  res.json(posts);
});

app.post('/api/blog-posts', authenticateToken, async (req, res) => {
  const { id, title, content, full_content, date, theme, published } = req.body;
  await run(
    'INSERT INTO blog_posts (id, title, content, full_content, date, theme, published) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, title, content, full_content || null, date, theme || null, published ? 1 : 0]
  );
  const newPost = await get('SELECT * FROM blog_posts WHERE id = ?', [id]);
  res.json(newPost);
});

app.put('/api/blog-posts/:id', authenticateToken, async (req, res) => {
  const { title, content, full_content, date, theme, published } = req.body;
  const updateValues: any[] = [title, content, full_content || null, date, theme || null, published ? 1 : 0, req.params.id];
  await run(
    `UPDATE blog_posts
     SET title = ?, content = ?, full_content = ?, date = ?, theme = ?, published = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    updateValues
  );
  res.json({ success: true });
});

app.delete('/api/blog-posts/:id', authenticateToken, async (req, res) => {
  await run('DELETE FROM blog_posts WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// ===== BLOG POST VOTES =====

app.get('/api/blog-posts/:id/votes', async (req, res) => {
  const upvotes = await get(
    'SELECT COUNT(*) as count FROM blog_post_votes WHERE post_id = ? AND vote_type = ?',
    [req.params.id, 'upvote']
  );
  const downvotes = await get(
    'SELECT COUNT(*) as count FROM blog_post_votes WHERE post_id = ? AND vote_type = ?',
    [req.params.id, 'downvote']
  );

  res.json({
    upvotes: upvotes?.count || 0,
    downvotes: downvotes?.count || 0,
    total: (upvotes?.count || 0) - (downvotes?.count || 0)
  });
});

app.get('/api/blog-posts/:id/my-vote', async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const vote = await get(
    'SELECT vote_type FROM blog_post_votes WHERE post_id = ? AND ip_address = ?',
    [req.params.id, ip]
  );
  res.json({ vote: vote?.vote_type || null });
});

app.post('/api/blog-posts/:id/vote', async (req, res) => {
  const { vote_type } = req.body;
  const ip = req.ip || req.connection.remoteAddress || 'unknown';

  if (!vote_type || !['upvote', 'downvote'].includes(vote_type)) {
    return res.status(400).json({ error: 'Invalid vote type' });
  }

  try {
    const existing = await get(
      'SELECT id FROM blog_post_votes WHERE post_id = ? AND ip_address = ?',
      [req.params.id, ip]
    );

    if (existing) {
      await run(
        'UPDATE blog_post_votes SET vote_type = ?, created_at = CURRENT_TIMESTAMP WHERE post_id = ? AND ip_address = ?',
        [vote_type, req.params.id, ip]
      );
    } else {
      await run(
        'INSERT INTO blog_post_votes (post_id, ip_address, vote_type) VALUES (?, ?, ?)',
        [req.params.id, ip, vote_type]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ error: 'Failed to record vote' });
  }
});

app.delete('/api/blog-posts/:id/vote', async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const result = await run('DELETE FROM blog_post_votes WHERE post_id = ? AND ip_address = ?', [req.params.id, ip]);
  res.json({ success: true, deleted: result.changes });
});

// ===== EMAIL SUBSCRIBERS =====

app.post('/api/subscribe', async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    await run('INSERT INTO email_subscribers (email) VALUES (?)', [email.toLowerCase().trim()]);
    res.json({ success: true });
  } catch (error: any) {
    if (error.message?.includes('UNIQUE') || error.code === '23505') {
      return res.status(409).json({ error: 'Email already subscribed' });
    }
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

app.get('/api/subscribers', authenticateToken, async (req, res) => {
  const subscribers = await query('SELECT * FROM email_subscribers ORDER BY created_at DESC', []);
  res.json(subscribers);
});

app.delete('/api/subscribers/:id', authenticateToken, async (req, res) => {
  await run('DELETE FROM email_subscribers WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// Serve static frontend files in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));

  app.use((req, res, next) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    } else {
      next();
    }
  });
}

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    const { pool } = await import('./db.js');
    if (pool) {
      await pool.end();
      console.log('Database pool closed');
    }
    process.exit(0);
  });
});
