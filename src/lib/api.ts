// In production, use relative URL (same domain). In dev, use localhost
const API_BASE = import.meta.env.VITE_API_BASE || 
  (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

// Auth helpers
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    
    // Only clear auth and reload for authenticated endpoints, not for login
    if ((response.status === 401 || response.status === 403) && response.url.includes('/auth/verify')) {
      localStorage.removeItem('auth_token');
      window.location.reload();
    }
    
    throw new Error(error.error || 'Request failed');
  }
  return response.json();
}

// Auth API
export async function login(password: string): Promise<{ success: boolean; token: string }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  return handleResponse(res);
}

export async function verifyAuth(): Promise<{ valid: boolean }> {
  const res = await fetch(`${API_BASE}/auth/verify`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

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
  recurrence_rule?: string;
  recurrence_parent_id?: number;
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
  const res = await fetch(`${API_BASE}/templates`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const getTemplate = async (id: number): Promise<Template> => {
  const res = await fetch(`${API_BASE}/templates/${id}`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const createTemplate = async (name: string): Promise<Template> => {
  const res = await fetch(`${API_BASE}/templates`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name }),
  });
  return handleResponse(res);
};

export const deleteTemplate = async (id: number): Promise<void> => {
  const res = await fetch(`${API_BASE}/templates/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const addTemplateTask = async (templateId: number, task: Omit<TemplateTask, 'id' | 'template_id'>): Promise<TemplateTask> => {
  const res = await fetch(`${API_BASE}/templates/${templateId}/tasks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(task),
  });
  return handleResponse(res);
};

export const updateTemplateTask = async (id: number, task: Partial<TemplateTask>): Promise<void> => {
  const res = await fetch(`${API_BASE}/template-tasks/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(task),
  });
  return handleResponse(res);
};

export const deleteTemplateTask = async (id: number): Promise<void> => {
  const res = await fetch(`${API_BASE}/template-tasks/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const applyTemplate = async (templateId: number, weekStartDate: string): Promise<void> => {
  const res = await fetch(`${API_BASE}/templates/${templateId}/apply`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ weekStartDate }),
  });
  return handleResponse(res);
};

// Scheduled Tasks
export const getScheduledTasks = async (startDate: string, endDate: string): Promise<ScheduledTask[]> => {
  const res = await fetch(`${API_BASE}/scheduled-tasks?startDate=${startDate}&endDate=${endDate}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const createScheduledTask = async (task: Omit<ScheduledTask, 'id' | 'is_from_template' | 'template_task_id'>): Promise<ScheduledTask> => {
  const res = await fetch(`${API_BASE}/scheduled-tasks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(task),
  });
  return handleResponse(res);
};

export const updateScheduledTask = async (id: number, task: Partial<ScheduledTask>): Promise<void> => {
  const res = await fetch(`${API_BASE}/scheduled-tasks/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(task),
  });
  return handleResponse(res);
};

export const deleteScheduledTask = async (id: number): Promise<void> => {
  const res = await fetch(`${API_BASE}/scheduled-tasks/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// Events
export const getEvents = async (startDate: string, endDate: string): Promise<Event[]> => {
  const res = await fetch(`${API_BASE}/events?startDate=${startDate}&endDate=${endDate}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const createEvent = async (event: Omit<Event, 'id'>): Promise<Event> => {
  const res = await fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(event),
  });
  return handleResponse(res);
};

export const updateEvent = async (id: number, event: Partial<Event>): Promise<void> => {
  const res = await fetch(`${API_BASE}/events/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(event),
  });
  return handleResponse(res);
};

export const deleteEvent = async (id: number): Promise<void> => {
  const res = await fetch(`${API_BASE}/events/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// Reflections
export const getReflections = async (date?: string, taskId?: number): Promise<Reflection[]> => {
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  if (taskId) params.append('taskId', taskId.toString());
  const res = await fetch(`${API_BASE}/reflections?${params}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const saveReflection = async (reflection: Omit<Reflection, 'id'>): Promise<Reflection> => {
  const res = await fetch(`${API_BASE}/reflections`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(reflection),
  });
  return handleResponse(res);
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
  const res = await fetch(`${API_BASE}/weekly-goals/${weekStart}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const createWeeklyGoal = async (text: string, weekStart: string): Promise<WeeklyGoal> => {
  const res = await fetch(`${API_BASE}/weekly-goals`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ text, week_start: weekStart, completed: false }),
  });
  return handleResponse(res);
};

export const updateWeeklyGoal = async (id: number, text: string, completed: boolean): Promise<void> => {
  const res = await fetch(`${API_BASE}/weekly-goals/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ text, completed }),
  });
  return handleResponse(res);
};

export const deleteWeeklyGoal = async (id: number): Promise<void> => {
  const res = await fetch(`${API_BASE}/weekly-goals/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// Pulse Notes (Linear-style)
export interface PulseNote {
  id: number;
  content: string;
  created_at: string;
}

export const getPulseNotes = async (limit = 50): Promise<PulseNote[]> => {
  const res = await fetch(`${API_BASE}/pulse-notes?limit=${limit}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const createPulseNote = async (content: string): Promise<PulseNote> => {
  const res = await fetch(`${API_BASE}/pulse-notes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ content }),
  });
  return handleResponse(res);
};

export const deletePulseNote = async (id: number): Promise<void> => {
  const res = await fetch(`${API_BASE}/pulse-notes/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// Blog Posts API
export interface BlogPost {
  id: string;
  title: string;
  content: string;
  full_content?: string;
  date: string;
  theme?: string;
  published: number;
  created_at: string;
  updated_at: string;
}

export async function getBlogPosts(theme?: string): Promise<BlogPost[]> {
  const url = theme ? `${API_BASE}/blog-posts?theme=${encodeURIComponent(theme)}` : `${API_BASE}/blog-posts`;
  const res = await fetch(url);
  return handleResponse(res);
}

export async function getBlogThemes(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/blog-posts/themes`);
  return handleResponse(res);
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const res = await fetch(`${API_BASE}/blog-posts-all`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export async function createBlogPost(post: Omit<BlogPost, 'created_at' | 'updated_at'>): Promise<BlogPost> {
  const res = await fetch(`${API_BASE}/blog-posts`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(post),
  });
  return handleResponse(res);
}

export async function updateBlogPost(id: string, post: Partial<Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
  const res = await fetch(`${API_BASE}/blog-posts/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(post),
  });
  return handleResponse(res);
}

export async function deleteBlogPost(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/blog-posts/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

// Blog Post Votes
export interface BlogPostVotes {
  upvotes: number;
  downvotes: number;
  total: number;
}

export async function getBlogPostVotes(postId: string): Promise<BlogPostVotes> {
  const res = await fetch(`${API_BASE}/blog-posts/${postId}/votes`);
  return handleResponse(res);
}

export async function getMyVote(postId: string): Promise<{ vote: 'upvote' | 'downvote' | null }> {
  const res = await fetch(`${API_BASE}/blog-posts/${postId}/my-vote`);
  return handleResponse(res);
}

export async function submitVote(postId: string, voteType: 'upvote' | 'downvote'): Promise<void> {
  const res = await fetch(`${API_BASE}/blog-posts/${postId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vote_type: voteType }),
  });
  return handleResponse(res);
}

export async function removeVote(postId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/blog-posts/${postId}/vote`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}

