import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import type { BlogPost } from '@/lib/api';
import { getAllBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost } from '@/lib/api';

export function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    content: '',
    full_content: '',
    date: new Date().toISOString().split('T')[0],
    theme: '',
    published: 1,
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const data = await getAllBlogPosts();
    setPosts(data);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingPost(null);
    setFormData({
      id: '',
      title: '',
      content: '',
      full_content: '',
      date: new Date().toISOString().split('T')[0],
      theme: '',
      published: 1,
    });
  };

  const handleEdit = (post: BlogPost) => {
    setIsCreating(false);
    setEditingPost(post);
    setFormData({
      id: post.id,
      title: post.title,
      content: post.content,
      full_content: post.full_content || '',
      date: post.date,
      theme: post.theme || '',
      published: post.published,
    });
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content || !formData.id) {
      alert('Please fill in all required fields (ID, title, and excerpt)');
      return;
    }

    try {
      if (isCreating) {
        await createBlogPost(formData);
      } else if (editingPost) {
        await updateBlogPost(editingPost.id, {
          title: formData.title,
          content: formData.content,
          full_content: formData.full_content,
          date: formData.date,
          theme: formData.theme,
          published: formData.published,
        });
      }
      await loadPosts();
      setIsCreating(false);
      setEditingPost(null);
      setFormData({
        id: '',
        title: '',
        content: '',
        full_content: '',
        date: new Date().toISOString().split('T')[0],
        theme: '',
        published: 1,
      });
    } catch (error: any) {
      alert(error.message || 'Failed to save post');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    await deleteBlogPost(id);
    await loadPosts();
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingPost(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Blog Posts</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your blog content</p>
        </div>
        <Button onClick={handleCreate} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      {(isCreating || editingPost) && (
        <div className="rounded-xl border border-border/40 bg-card shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold">
            {isCreating ? 'Create New Post' : 'Edit Post'}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Post ID (URL slug) *
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                placeholder="building-in-public"
                disabled={!isCreating}
                className="w-full px-3 py-2 border border-border/40 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 text-sm disabled:opacity-50"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This will be the URL: /blog/{formData.id || 'your-post-id'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="My awesome post"
                className="w-full px-3 py-2 border border-border/40 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-border/40 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Theme (optional)</label>
              <input
                type="text"
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                placeholder="e.g., Philosophy, Technology, Travel"
                className="w-full px-3 py-2 border border-border/40 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Group posts by theme for easy filtering
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Excerpt (shows on homepage) *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="A short preview of your post..."
                rows={3}
                className="w-full px-3 py-2 border border-border/40 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 text-sm resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Full Content (optional - markdown supported)
              </label>
              <textarea
                value={formData.full_content}
                onChange={(e) => setFormData({ ...formData, full_content: e.target.value })}
                placeholder="Full post content with markdown formatting..."
                rows={15}
                className="w-full px-3 py-2 border border-border/40 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20 text-sm font-mono resize-y"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Markdown: ## headers, **bold**, - bullets, 1. numbered lists
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published"
                checked={formData.published === 1}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked ? 1 : 0 })}
                className="rounded"
              />
              <label htmlFor="published" className="text-sm">
                Published (visible on website)
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} size="sm">
                Save Post
              </Button>
              <Button onClick={handleCancel} size="sm" variant="ghost">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="rounded-xl border border-border/40 bg-card shadow-sm p-4 flex items-start justify-between group hover:shadow-md transition-shadow"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{post.title}</h3>
                {post.published === 0 && (
                  <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    Draft
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
              <p className="text-xs text-muted-foreground/60 mt-2">
                {post.date} • /blog/{post.id}
              </p>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleEdit(post)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(post.id)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {posts.length === 0 && !isCreating && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="mb-4">No blog posts yet</p>
            <Button onClick={handleCreate} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create your first post
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

