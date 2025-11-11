import express from 'express';
import cors from 'cors';
import db, { initDatabase } from './database.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initDatabase();

// ===== SCHEDULED TASKS =====

app.get('/api/scheduled-tasks', (req, res) => {
  const { startDate, endDate } = req.query;
  const tasks = db.prepare('SELECT * FROM scheduled_tasks WHERE date >= ? AND date <= ? ORDER BY date, start_time').all(startDate, endDate);
  res.json(tasks);
});

app.post('/api/scheduled-tasks', (req, res) => {
  const { title, description, date, start_time, end_time, color } = req.body;
  const result = db.prepare('INSERT INTO scheduled_tasks (title, description, date, start_time, end_time, color) VALUES (?, ?, ?, ?, ?, ?)').run(title, description || null, date, start_time, end_time, color || '#3b82f6');
  res.json({ id: result.lastInsertRowid, ...req.body });
});

app.put('/api/scheduled-tasks/:id', (req, res) => {
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
  db.prepare(`UPDATE scheduled_tasks SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  res.json({ success: true });
});

app.delete('/api/scheduled-tasks/:id', (req, res) => {
  db.prepare('DELETE FROM scheduled_tasks WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ===== EVENTS =====

app.get('/api/events', (req, res) => {
  const { startDate, endDate } = req.query;
  const events = db.prepare('SELECT * FROM events WHERE date >= ? AND date <= ? ORDER BY date, start_time').all(startDate, endDate);
  res.json(events);
});

app.post('/api/events', (req, res) => {
  const { title, description, date, start_time, end_time, type, color } = req.body;
  const result = db.prepare('INSERT INTO events (title, description, date, start_time, end_time, type, color) VALUES (?, ?, ?, ?, ?, ?, ?)').run(title, description || null, date, start_time || null, end_time || null, type || 'event', color || '#ef4444');
  res.json({ id: result.lastInsertRowid, ...req.body });
});

app.put('/api/events/:id', (req, res) => {
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
    db.prepare(`UPDATE events SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }
  res.json({ success: true });
});

app.delete('/api/events/:id', (req, res) => {
  db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ===== WEEKLY GOALS =====

app.get('/api/weekly-goals/:weekStart', (req, res) => {
  const goals = db.prepare('SELECT * FROM weekly_goals WHERE week_start = ? ORDER BY created_at').all(req.params.weekStart);
  res.json(goals);
});

app.post('/api/weekly-goals', (req, res) => {
  const { text, week_start, completed } = req.body;
  const result = db.prepare('INSERT INTO weekly_goals (text, week_start, completed) VALUES (?, ?, ?)').run(text, week_start, completed || 0);
  res.json({ id: result.lastInsertRowid, ...req.body });
});

app.put('/api/weekly-goals/:id', (req, res) => {
  const { text, completed } = req.body;
  db.prepare('UPDATE weekly_goals SET text = ?, completed = ? WHERE id = ?').run(text, completed ? 1 : 0, req.params.id);
  res.json({ success: true });
});

app.delete('/api/weekly-goals/:id', (req, res) => {
  db.prepare('DELETE FROM weekly_goals WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ===== PULSE NOTES (Linear-style) =====

app.get('/api/pulse-notes', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const notes = db.prepare('SELECT * FROM pulse_notes ORDER BY created_at DESC LIMIT ?').all(limit);
  res.json(notes);
});

app.post('/api/pulse-notes', (req, res) => {
  const { content } = req.body;
  const result = db.prepare('INSERT INTO pulse_notes (content) VALUES (?)').run(content);
  const newNote = db.prepare('SELECT * FROM pulse_notes WHERE id = ?').get(result.lastInsertRowid);
  res.json(newNote);
});

app.delete('/api/pulse-notes/:id', (req, res) => {
  db.prepare('DELETE FROM pulse_notes WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ===== TEMPLATES =====

app.get('/api/templates', (req, res) => {
  const templates = db.prepare('SELECT * FROM templates ORDER BY created_at DESC').all();
  res.json(templates);
});

// Get template with tasks
app.get('/api/templates/:id', (req, res) => {
  const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(req.params.id);
  if (!template) return res.status(404).json({ error: 'Template not found' });
  
  const tasks = db.prepare('SELECT * FROM template_tasks WHERE template_id = ? ORDER BY day_of_week, start_time').all(req.params.id);
  res.json({ ...template, tasks });
});

// Create template
app.post('/api/templates', (req, res) => {
  const { name } = req.body;
  const result = db.prepare('INSERT INTO templates (name) VALUES (?)').run(name);
  res.json({ id: result.lastInsertRowid, name });
});

// Delete template
app.delete('/api/templates/:id', (req, res) => {
  db.prepare('DELETE FROM template_tasks WHERE template_id = ?').run(req.params.id);
  db.prepare('DELETE FROM templates WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Add task to template
app.post('/api/templates/:id/tasks', (req, res) => {
  const { title, description, day_of_week, start_time, end_time, color } = req.body;
  const result = db.prepare(`
    INSERT INTO template_tasks (template_id, title, description, day_of_week, start_time, end_time, color)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(req.params.id, title, description || null, day_of_week, start_time, end_time, color || '#3b82f6');
  
  res.json({ id: result.lastInsertRowid, ...req.body });
});

// Update template task
app.put('/api/template-tasks/:id', (req, res) => {
  const { title, description, day_of_week, start_time, end_time, color } = req.body;
  db.prepare(`
    UPDATE template_tasks 
    SET title = ?, description = ?, day_of_week = ?, start_time = ?, end_time = ?, color = ?
    WHERE id = ?
  `).run(title, description, day_of_week, start_time, end_time, color, req.params.id);
  
  res.json({ success: true });
});

// Delete template task
app.delete('/api/template-tasks/:id', (req, res) => {
  db.prepare('DELETE FROM template_tasks WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Apply template to a specific week
app.post('/api/templates/:id/apply', (req, res) => {
  const { weekStartDate } = req.body; // YYYY-MM-DD format (should be a Sunday)
  
  const tasks = db.prepare('SELECT * FROM template_tasks WHERE template_id = ?').all(req.params.id);
  const insertStmt = db.prepare(`
    INSERT INTO scheduled_tasks (title, description, date, start_time, end_time, color)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const startDate = new Date(weekStartDate);
  const insertedTasks = [];
  
  for (const task of tasks as any[]) {
    const taskDate = new Date(startDate);
    taskDate.setDate(taskDate.getDate() + task.day_of_week);
    const dateStr = taskDate.toISOString().split('T')[0];
    
    const result = insertStmt.run(
      task.title,
      task.description,
      dateStr,
      task.start_time,
      task.end_time,
      task.color
    );
    
    insertedTasks.push({ id: result.lastInsertRowid, ...task, date: dateStr });
  }
  
  res.json({ success: true, tasks: insertedTasks });
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


