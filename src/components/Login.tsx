import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import { getBlogPosts, getBlogPostVotes } from '@/lib/api';
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

  // Load blog posts and their votes
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const posts = await getBlogPosts();
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
        .garamond {
          font-family: 'EB Garamond', serif;
        }
        .page-border {
          border: 1px solid #f0f0f0;
          margin: 2rem;
          min-height: calc(100vh - 4rem);
          position: relative;
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
        {/* Small corner links - inside the border */}
        <div className="absolute top-6 right-6 z-10 flex items-center gap-3">
          <a
            href="https://www.linkedin.com/in/tjallingvds"
            target="_blank"
            rel="noopener noreferrer"
            className="garamond text-xs" style={{ color: '#999' }}
          >
            [linkedin]
          </a>
          <button
            onClick={() => {
              const parts = ['tjalling', 'vdschaar', 'gmail', 'com'];
              const email = `${parts[0]}${parts[1]}@${parts[2]}.${parts[3]}`;
              window.location.href = `mailto:${email}`;
            }}
            className="garamond text-xs" style={{ color: '#999' }}
          >
            [email]
          </button>
          {!showPasswordInput ? (
            <button
              onClick={() => setShowPasswordInput(true)}
              className="garamond text-xs" style={{ color: '#999' }}
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
            <div className="mb-20 sm:mb-28 text-center">
              <h1 className="garamond text-4xl sm:text-5xl font-medium mb-5 tracking-tight" style={{ letterSpacing: '0.01em' }}>
                Tjalling van der Schaar
              </h1>
              <p className="garamond text-lg" style={{ color: '#666', fontStyle: 'italic' }}>
                Notes on living
              </p>
            </div>

            {/* Notes Feed */}
            <div className="space-y-10 sm:space-y-14">
              {blogPosts.map((note) => (
                <Link to={`/blog/${note.id}`} key={note.id} className="block">
                  <article className="group cursor-pointer p-4 sm:p-5 -mx-4 sm:-mx-5 transition-all hover:shadow-md" style={{ boxShadow: '0 0 0 0 rgba(0,0,0,0)', transition: 'box-shadow 0.2s ease' }}>
                    <div className="flex items-baseline gap-2 sm:gap-3 mb-2">
                      <time className="text-xs sm:text-sm whitespace-nowrap" style={{ fontFamily: 'Georgia, serif', color: '#999' }}>
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
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}

