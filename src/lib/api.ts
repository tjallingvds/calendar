const API_BASE = 'http://localhost:3001/api';

export interface Template {
  id: number;
  name: string;
  created_at: string;
  tasks?: TemplateTask[];
}

export interface TemplateTask {
  id: number;
  template_id: number;
  title: string;
  description?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  color: string;
}

export interface ScheduledTask {
  id: number;
  title: string;
  description?: string;
  date: string;
  start_time: string;
  end_time: string;
  color: string;
  is_from_template: boolean;
  template_task_id?: number;
  completed: boolean;
  completed_at?: string;
  not_completed_reason?: string;
  reflection_notes?: string;
}

export interface Event {
  id: number;
  title: string;
  description?: string;
  date: string;
  start_time?: string;
  end_time?: string;
  type: 'deadline' | 'meeting' | 'event';
  color: string;
  completed?: boolean;
  completed_at?: string;
}

export interface Reflection {
  id: number;
  scheduled_task_id?: number;
  date: string;
  notes?: string;
  rating_productivity?: number;
  rating_energy?: number;
  rating_focus?: number;
  rating_satisfaction?: number;
}

// Templates
export const getTemplates = async (): Promise<Template[]> => {
  const res = await fetch(`${API_BASE}/templates`);
  return res.json();
};

export const getTemplate = async (id: number): Promise<Template> => {
  const res = await fetch(`${API_BASE}/templates/${id}`);
  return res.json();
};

export const createTemplate = async (name: string): Promise<Template> => {
  const res = await fetch(`${API_BASE}/templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  return res.json();
};

export const deleteTemplate = async (id: number): Promise<void> => {
  await fetch(`${API_BASE}/templates/${id}`, { method: 'DELETE' });
};

export const addTemplateTask = async (templateId: number, task: Omit<TemplateTask, 'id' | 'template_id'>): Promise<TemplateTask> => {
  const res = await fetch(`${API_BASE}/templates/${templateId}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });
  return res.json();
};

export const updateTemplateTask = async (id: number, task: Partial<TemplateTask>): Promise<void> => {
  await fetch(`${API_BASE}/template-tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });
};

export const deleteTemplateTask = async (id: number): Promise<void> => {
  await fetch(`${API_BASE}/template-tasks/${id}`, { method: 'DELETE' });
};

export const applyTemplate = async (templateId: number, weekStartDate: string): Promise<void> => {
  await fetch(`${API_BASE}/templates/${templateId}/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ weekStartDate }),
  });
};

// Scheduled Tasks
export const getScheduledTasks = async (startDate: string, endDate: string): Promise<ScheduledTask[]> => {
  const res = await fetch(`${API_BASE}/scheduled-tasks?startDate=${startDate}&endDate=${endDate}`);
  return res.json();
};

export const createScheduledTask = async (task: Omit<ScheduledTask, 'id' | 'is_from_template' | 'template_task_id'>): Promise<ScheduledTask> => {
  const res = await fetch(`${API_BASE}/scheduled-tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });
  return res.json();
};

export const updateScheduledTask = async (id: number, task: Partial<ScheduledTask>): Promise<void> => {
  await fetch(`${API_BASE}/scheduled-tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });
};

export const deleteScheduledTask = async (id: number): Promise<void> => {
  await fetch(`${API_BASE}/scheduled-tasks/${id}`, { method: 'DELETE' });
};

// Events
export const getEvents = async (startDate: string, endDate: string): Promise<Event[]> => {
  const res = await fetch(`${API_BASE}/events?startDate=${startDate}&endDate=${endDate}`);
  return res.json();
};

export const createEvent = async (event: Omit<Event, 'id'>): Promise<Event> => {
  const res = await fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });
  return res.json();
};

export const updateEvent = async (id: number, event: Partial<Event>): Promise<void> => {
  const res = await fetch(`${API_BASE}/events/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });
  return res.json();
};

export const deleteEvent = async (id: number): Promise<void> => {
  await fetch(`${API_BASE}/events/${id}`, { method: 'DELETE' });
};

// Reflections
export const getReflections = async (date?: string, taskId?: number): Promise<Reflection[]> => {
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  if (taskId) params.append('taskId', taskId.toString());
  const res = await fetch(`${API_BASE}/reflections?${params}`);
  return res.json();
};

export const saveReflection = async (reflection: Omit<Reflection, 'id'>): Promise<Reflection> => {
  const res = await fetch(`${API_BASE}/reflections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reflection),
  });
  return res.json();
};

// Weekly Goals
export interface WeeklyGoal {
  id: number;
  text: string;
  completed: boolean;
  week_start: string;
  created_at: string;
}

export const getWeeklyGoals = async (weekStart: string): Promise<WeeklyGoal[]> => {
  const res = await fetch(`${API_BASE}/weekly-goals/${weekStart}`);
  return res.json();
};

export const createWeeklyGoal = async (text: string, weekStart: string): Promise<WeeklyGoal> => {
  const res = await fetch(`${API_BASE}/weekly-goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, week_start: weekStart, completed: false }),
  });
  return res.json();
};

export const updateWeeklyGoal = async (id: number, text: string, completed: boolean): Promise<void> => {
  await fetch(`${API_BASE}/weekly-goals/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, completed }),
  });
};

export const deleteWeeklyGoal = async (id: number): Promise<void> => {
  await fetch(`${API_BASE}/weekly-goals/${id}`, { method: 'DELETE' });
};

// Pulse Notes (Linear-style)
export interface PulseNote {
  id: number;
  content: string;
  created_at: string;
}

export const getPulseNotes = async (limit = 50): Promise<PulseNote[]> => {
  const res = await fetch(`${API_BASE}/pulse-notes?limit=${limit}`);
  return res.json();
};

export const createPulseNote = async (content: string): Promise<PulseNote> => {
  const res = await fetch(`${API_BASE}/pulse-notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  return res.json();
};

export const deletePulseNote = async (id: number): Promise<void> => {
  await fetch(`${API_BASE}/pulse-notes/${id}`, { method: 'DELETE' });
};


