// In production, use relative URL (same domain). In dev, use localhost
const API_BASE = import.meta.env.VITE_API_BASE ||
  (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

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

    if ((response.status === 401 || response.status === 403) && response.url.includes('/auth/verify')) {
      localStorage.removeItem('auth_token');
      window.location.reload();
    }

    throw new Error(error.error || 'Request failed');
  }
  return response.json();
}

// Auth
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

// Blog Posts
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

// Email Subscribers
export async function subscribeToNewsletter(email: string): Promise<void> {
  const res = await fetch(`${API_BASE}/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return handleResponse(res);
}

export interface EmailSubscriber {
  id: number;
  email: string;
  created_at: string;
}

export async function getSubscribers(): Promise<EmailSubscriber[]> {
  const res = await fetch(`${API_BASE}/subscribers`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export async function deleteSubscriber(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/subscribers/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}
