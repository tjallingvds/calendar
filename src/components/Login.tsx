import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import { getBlogPosts, getBlogPostVotes, getBlogThemes } from '@/lib/api';
import type { BlogPost, BlogPostVotes } from '@/lib/api';

interface LoginProps {
  onLogin: (password: string) => void;
  error?: string;
}

export function Login({ onLogin, error: externalError }: LoginProps) {
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(externalError || '');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [postVotes, setPostVotes] = useState<Record<string, BlogPostVotes>>({});
  const [themes, setThemes] = useState<string[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);

  // Load blog posts and their votes
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const posts = await getBlogPosts(selectedTheme || undefined);
        setBlogPosts(posts);
        
        // Load votes for each post
        const votesMap: Record<string, BlogPostVotes> = {};
        await Promise.all(
          posts.map(async (post) => {
            try {
              const votes = await getBlogPostVotes(post.id);
              votesMap[post.id] = votes;
            } catch (error) {
              console.error(`Failed to load votes for post ${post.id}:`, error);
              votesMap[post.id] = { upvotes: 0, downvotes: 0, total: 0 };
            }
          })
        );
        setPostVotes(votesMap);
      } catch (error) {
        console.error('Failed to load blog posts:', error);
      }
    };
    loadPosts();
  }, [selectedTheme]);

  // Load themes
  useEffect(() => {
    const loadThemes = async () => {
      try {
        const themesData = await getBlogThemes();
        setThemes(themesData);
      } catch (error) {
        console.error('Failed to load themes:', error);
      }
    };
    loadThemes();
  }, []);

  // Update error when external error changes
  useEffect(() => {
    if (externalError) {
      setError(externalError);
    }
  }, [externalError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }
    onLogin(password);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600&display=swap');
        html {
          scroll-behavior: smooth;
        }
        .garamond {
          font-family: 'EB Garamond', serif;
        }
        .page-border {
          border: 1px solid #f0f0f0;
          margin: 2rem;
          min-height: calc(100vh - 4rem);
          position: relative;
        }
        .title-rule {
          width: 60px;
          height: 1px;
          background: #d0d0d0;
          margin-top: 0.75rem;
        }
        .small-caps {
          font-variant: small-caps;
          letter-spacing: 0.05em;
          font-size: 0.95em;
        }
        .blog-card {
          transition: all 0.3s ease;
          border-radius: 2px;
        }
        .blog-card:hover {
          background: rgba(0,0,0,0.01);
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        @media (max-width: 640px) {
          .page-border {
            margin: 1rem;
            min-height: calc(100vh - 2rem);
          }
        }
      `}</style>

      <div className="min-h-screen bg-white relative" style={{ color: '#2a2a2a' }}>
        {/* Page border frame */}
        <div className="page-border">
        {/* Themes dropdown - top left */}
        <div className="absolute top-6 left-6 z-10">
          <div className="relative flex items-center">
            <button
              onClick={() => setShowThemeDropdown(!showThemeDropdown)}
              className="garamond text-xs hover:opacity-70 transition-opacity"
              style={{ color: '#999' }}
            >
              [{selectedTheme || 'themes'}]
            </button>
            {showThemeDropdown && themes.length > 0 && (
              <div 
                className="absolute top-full left-0 mt-1 bg-white border border-border/20 rounded shadow-md py-1 min-w-[120px]"
                style={{ zIndex: 50 }}
              >
                <button
                  onClick={() => {
                    setSelectedTheme('');
                    setShowThemeDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs garamond hover:bg-accent/10 ${!selectedTheme ? 'font-medium' : ''}`}
                  style={{ color: '#2a2a2a' }}
                >
                  All themes
                </button>
                {themes.map((theme) => (
                  <button
                    key={theme}
                    onClick={() => {
                      setSelectedTheme(theme);
                      setShowThemeDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs garamond hover:bg-accent/10 ${selectedTheme === theme ? 'font-medium' : ''}`}
                    style={{ color: '#2a2a2a' }}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Small corner links - inside the border (hidden on mobile) */}
        <div className="absolute top-6 right-6 z-10 hidden sm:flex items-center gap-3">
          <a
            href="https://www.linkedin.com/in/tjallingvds"
            target="_blank"
            rel="noopener noreferrer"
            className="garamond text-xs hover:opacity-70 transition-opacity" style={{ color: '#999' }}
          >
            [linkedin]
          </a>
          <button
            onClick={() => {
              const parts = ['tjalling', 'vdschaar', 'gmail', 'com'];
              const email = `${parts[0]}${parts[1]}@${parts[2]}.${parts[3]}`;
              window.location.href = `mailto:${email}`;
            }}
            className="garamond text-xs hover:opacity-70 transition-opacity cursor-pointer" style={{ color: '#999' }}
          >
            [email]
          </button>
          {!showPasswordInput ? (
            <button
              onClick={() => setShowPasswordInput(true)}
              className="garamond text-xs hover:opacity-70 transition-opacity cursor-pointer" style={{ color: '#999' }}
            >
              [login]
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="password"
                className="px-2 py-0.5 border border-border/20 rounded bg-background focus:outline-none focus:ring-1 focus:ring-foreground/20 garamond text-xs w-28"
                autoFocus
                onBlur={() => {
                  if (!password) {
                    setTimeout(() => setShowPasswordInput(false), 200);
                  }
                }}
              />
              <button
                type="submit"
                className="garamond text-xs" style={{ color: '#999' }}
              >
                →
              </button>
            </form>
          )}
          {error && (
            <p className="garamond text-xs text-red-500 absolute top-full right-0 mt-1">{error}</p>
          )}
        </div>
        {/* Duplicate removed - links are now outside */}

            {/* Content */}
            <div className="px-4 sm:px-8 py-12 sm:py-16">
              <div className="max-w-2xl mx-auto w-full" style={{ maxWidth: '42rem' }}>
            {/* Header */}
            <div className="mb-16 sm:mb-24">
              <h1 className="garamond text-2xl sm:text-3xl font-medium mb-2 tracking-tight">
                Tjalling van der Schaar
              </h1>
              <div className="title-rule"></div>
              <p className="garamond text-base sm:text-lg mt-4" style={{ color: '#666' }}>
                Exploration of random thoughts, ideas, and experiences.
              </p>
              <p className="garamond text-sm mt-2" style={{ color: '#999' }}>
                Currently reading: <span style={{ fontStyle: 'italic' }}>Outline</span> by Rachel Cusk
              </p>
            </div>

            {/* Notes Feed */}
            <div className="space-y-10 sm:space-y-14">
              {blogPosts.map((note) => (
                <Link to={`/blog/${note.id}`} key={note.id} className="block">
                  <article className="blog-card cursor-pointer p-4 sm:p-5 -mx-4 sm:-mx-5">
                    <div className="flex items-baseline gap-2 sm:gap-3 mb-2">
                      <time className="small-caps text-xs sm:text-sm whitespace-nowrap" style={{ fontFamily: 'Georgia, serif', color: '#999' }}>
                        {new Date(note.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </time>
                      <div className="flex-1 h-px" style={{ background: '#e5e5e5' }}></div>
                      {postVotes[note.id] && postVotes[note.id].upvotes > 0 && (
                        <div className="flex items-center gap-1" style={{ color: '#999' }}>
                          <ArrowUp className="h-3 w-3" />
                          <span className="text-xs" style={{ fontFamily: 'Georgia, serif' }}>{postVotes[note.id].upvotes}</span>
                        </div>
                      )}
                    </div>
                    <h2 className="garamond text-xl sm:text-2xl font-medium mb-2 sm:mb-3 tracking-tight" style={{ color: '#2a2a2a' }}>
                      {note.title}
                    </h2>
                    <p className="garamond text-sm sm:text-base leading-relaxed" style={{ color: '#4a4a4a', lineHeight: '1.7' }}>
                      {note.content}
                    </p>
                  </article>
                </Link>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-16 sm:mt-24 pt-8 text-center" style={{ borderTop: '1px solid #e5e5e5' }}>
              <p className="text-xs" style={{ fontFamily: 'Georgia, serif', color: '#999' }}>
                © {new Date().getFullYear()} Tjalling van der Schaar
              </p>
              
              {/* Mobile-only links (shown under copyright) */}
              <div className="flex sm:hidden items-center justify-center gap-3 mt-3">
                <a
                  href="https://www.linkedin.com/in/tjallingvds"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="garamond text-xs hover:opacity-70 transition-opacity" style={{ color: '#999' }}
                >
                  [linkedin]
                </a>
                <button
                  onClick={() => {
                    const parts = ['tjalling', 'vdschaar', 'gmail', 'com'];
                    const email = `${parts[0]}${parts[1]}@${parts[2]}.${parts[3]}`;
                    window.location.href = `mailto:${email}`;
                  }}
                  className="garamond text-xs hover:opacity-70 transition-opacity cursor-pointer" style={{ color: '#999' }}
                >
                  [email]
                </button>
                {!showPasswordInput ? (
                  <button
                    onClick={() => setShowPasswordInput(true)}
                    className="garamond text-xs hover:opacity-70 transition-opacity cursor-pointer" style={{ color: '#999' }}
                  >
                    [login]
                  </button>
                ) : (
                  <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      placeholder="password"
                      className="px-2 py-0.5 border border-border/20 rounded bg-background focus:outline-none focus:ring-1 focus:ring-foreground/20 garamond text-xs w-28"
                      autoFocus
                      onBlur={() => {
                        if (!password) {
                          setTimeout(() => setShowPasswordInput(false), 200);
                        }
                      }}
                    />
                    <button
                      type="submit"
                      className="garamond text-xs" style={{ color: '#999' }}
                    >
                      →
                    </button>
                  </form>
                )}
              </div>
              {error && (
                <p className="garamond text-xs text-red-500 mt-2 sm:hidden text-center">{error}</p>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}

