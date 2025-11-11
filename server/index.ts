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
  AuthRequest 
} from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for Railway/production
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Security headerss
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Database is initialized in db.ts

// ===== AUTHENTICATION =====

app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

  console.log('Login attempt received. Password provided:', !!password);

  // Rate limiting check
  const rateCheck = checkRateLimit(clientIp);
  if (!rateCheck.allowed) {
    console.log('Rate limit exceeded for IP:', clientIp);
    return res.status(429).json({ error: rateCheck.message });
  }

  // Verify password
  const isValid = verifyPassword(password);
  console.log('Password verification result:', isValid);
  
  if (!password || !isValid) {
    console.log('Login failed - Invalid password');
    return res.status(401).json({ error: 'Invalid password' });
  }

  // Reset rate limit on successful login
  resetRateLimit(clientIp);

  // Generate JWT token
  const token = generateToken();
  console.log('Login successful - Token generated');
  
  res.json({ 
    success: true, 
    token,
    expiresIn: '7d'
  });
});

// Verify token endpoint
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ valid: true });
});

// ===== SCHEDULED TASKS ===== (Protected)

app.get('/api/scheduled-tasks', authenticateToken, async (req, res) => {
  const { startDate, endDate } = req.query;
  const tasks = await query('SELECT * FROM scheduled_tasks WHERE date >= ? AND date <= ? ORDER BY date, start_time', [startDate, endDate]);
  // Ensure completed is boolean, not integer
  const normalizedTasks = tasks.map(t => ({ ...t, completed: Boolean(t.completed) }));
  res.json(normalizedTasks);
});

app.post('/api/scheduled-tasks', authenticateToken, async (req, res) => {
  const { title, description, date, start_time, end_time, color } = req.body;
  const result = await run('INSERT INTO scheduled_tasks (title, description, date, start_time, end_time, color) VALUES (?, ?, ?, ?, ?, ?)', [title, description || null, date, start_time, end_time, color || '#3b82f6']);
  res.json({ id: result.lastInsertRowid, ...req.body });
});

app.put('/api/scheduled-tasks/:id', authenticateToken, async (req, res) => {
  const updates = [];
  const values = [];
  
  Object.entries(req.body).forEach(([key, value]) => {
    if (key === 'completed') {
      updates.push(`${key} = ?`);
      values.push(value ? 1 : 0);
    } else {
      updates.push(`${key} = ?`);
      values.push(value);
    }
  });
  
  values.push(req.params.id);
  await run(`UPDATE scheduled_tasks SET ${updates.join(', ')} WHERE id = ?`, values);
  res.json({ success: true });
});

app.delete('/api/scheduled-tasks/:id', authenticateToken, async (req, res) => {
  await run('DELETE FROM scheduled_tasks WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// ===== EVENTS ===== (Protected)

app.get('/api/events', authenticateToken, async (req, res) => {
  const { startDate, endDate } = req.query;
  const events = await query('SELECT * FROM events WHERE date >= ? AND date <= ? ORDER BY date, start_time', [startDate, endDate]);
  // Ensure completed is boolean, not integer
  const normalizedEvents = events.map(e => ({ ...e, completed: Boolean(e.completed) }));
  res.json(normalizedEvents);
});

app.post('/api/events', authenticateToken, async (req, res) => {
  const { title, description, date, start_time, end_time, type, color } = req.body;
  const result = await run('INSERT INTO events (title, description, date, start_time, end_time, type, color) VALUES (?, ?, ?, ?, ?, ?, ?)', [title, description || null, date, start_time || null, end_time || null, type || 'event', color || '#ef4444']);
  res.json({ id: result.lastInsertRowid, ...req.body });
});

app.put('/api/events/:id', authenticateToken, async (req, res) => {
  const updates = [];
  const values = [];
  
  Object.entries(req.body).forEach(([key, value]) => {
    if (key === 'completed') {
      updates.push(`${key} = ?`);
      values.push(value ? 1 : 0);
    } else {
      updates.push(`${key} = ?`);
      values.push(value);
    }
  });
  
  values.push(req.params.id);
  if (updates.length > 0) {
    await run(`UPDATE events SET ${updates.join(', ')} WHERE id = ?`, values);
  }
  res.json({ success: true });
});

app.delete('/api/events/:id', authenticateToken, async (req, res) => {
  await run('DELETE FROM events WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// ===== WEEKLY GOALS ===== (Protected)

app.get('/api/weekly-goals/:weekStart', authenticateToken, async (req, res) => {
  const goals = await query('SELECT * FROM weekly_goals WHERE week_start = ? ORDER BY created_at', [req.params.weekStart]);
  res.json(goals);
});

app.post('/api/weekly-goals', authenticateToken, async (req, res) => {
  const { text, week_start, completed } = req.body;
  const result = await run('INSERT INTO weekly_goals (text, week_start, completed) VALUES (?, ?, ?)', [text, week_start, completed || 0]);
  res.json({ id: result.lastInsertRowid, ...req.body });
});

app.put('/api/weekly-goals/:id', authenticateToken, async (req, res) => {
  const { text, completed } = req.body;
  await run('UPDATE weekly_goals SET text = ?, completed = ? WHERE id = ?', [text, completed ? 1 : 0, req.params.id]);
  res.json({ success: true });
});

app.delete('/api/weekly-goals/:id', authenticateToken, async (req, res) => {
  await run('DELETE FROM weekly_goals WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// ===== PULSE NOTES ===== (Protected)

app.get('/api/pulse-notes', authenticateToken, async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const notes = await query('SELECT * FROM pulse_notes ORDER BY created_at DESC LIMIT ?', [limit]);
  res.json(notes);
});

app.post('/api/pulse-notes', authenticateToken, async (req, res) => {
  const { content } = req.body;
  const result = await run('INSERT INTO pulse_notes (content) VALUES (?)', [content]);
  const newNote = await get('SELECT * FROM pulse_notes WHERE id = ?', [result.lastInsertRowid]);
  res.json(newNote);
});

app.delete('/api/pulse-notes/:id', authenticateToken, async (req, res) => {
  await run('DELETE FROM pulse_notes WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// ===== TEMPLATES ===== (Protected)

app.get('/api/templates', authenticateToken, async (req, res) => {
  const templates = await query('SELECT * FROM templates ORDER BY created_at DESC', []);
  res.json(templates);
});

// Get template with tasks
app.get('/api/templates/:id', authenticateToken, async (req, res) => {
  const template = await get('SELECT * FROM templates WHERE id = ?', [req.params.id]);
  if (!template) return res.status(404).json({ error: 'Template not found' });
  
  const tasks = await query('SELECT * FROM template_tasks WHERE template_id = ? ORDER BY day_of_week, start_time', [req.params.id]);
  res.json({ ...template, tasks });
});

// Create template
app.post('/api/templates', authenticateToken, async (req, res) => {
  const { name } = req.body;
  const result = await run('INSERT INTO templates (name) VALUES (?)', [name]);
  res.json({ id: result.lastInsertRowid, name });
});

// Delete template
app.delete('/api/templates/:id', authenticateToken, async (req, res) => {
  await run('DELETE FROM template_tasks WHERE template_id = ?', [req.params.id]);
  await run('DELETE FROM templates WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// Add task to template
app.post('/api/templates/:id/tasks', authenticateToken, async (req, res) => {
  const { title, description, day_of_week, start_time, end_time, color } = req.body;
  const result = await run(`
    INSERT INTO template_tasks (template_id, title, description, day_of_week, start_time, end_time, color)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [req.params.id, title, description || null, day_of_week, start_time, end_time, color || '#3b82f6']);
  
  res.json({ id: result.lastInsertRowid, ...req.body });
});

// Update template task
app.put('/api/template-tasks/:id', authenticateToken, async (req, res) => {
  const { title, description, day_of_week, start_time, end_time, color } = req.body;
  await run(`
    UPDATE template_tasks 
    SET title = ?, description = ?, day_of_week = ?, start_time = ?, end_time = ?, color = ?
    WHERE id = ?
  `, [title, description, day_of_week, start_time, end_time, color, req.params.id]);
  
  res.json({ success: true });
});

// Delete template task
app.delete('/api/template-tasks/:id', authenticateToken, async (req, res) => {
  await run('DELETE FROM template_tasks WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// Apply template to a specific week
app.post('/api/templates/:id/apply', authenticateToken, async (req, res) => {
  const { weekStartDate } = req.body; // YYYY-MM-DD format (should be a Sunday)
  
  const tasks = await query('SELECT * FROM template_tasks WHERE template_id = ?', [req.params.id]);
  
  const startDate = new Date(weekStartDate);
  const insertedTasks = [];
  
  for (const task of tasks as any[]) {
    const taskDate = new Date(startDate);
    taskDate.setDate(taskDate.getDate() + task.day_of_week);
    const dateStr = taskDate.toISOString().split('T')[0];
    
    const result = await run(`
      INSERT INTO scheduled_tasks (title, description, date, start_time, end_time, color)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [task.title, task.description, dateStr, task.start_time, task.end_time, task.color]);
    
    insertedTasks.push({ id: result.lastInsertRowid, ...task, date: dateStr });
  }
  
  res.json({ success: true, tasks: insertedTasks });
});

// Serve static frontend files in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  
  // Catch-all: serve index.html for any non-API routes
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    } else {
      next();
    }
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


