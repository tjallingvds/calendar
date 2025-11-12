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
      `}</style>

      <div className="min-h-screen bg-background relative">
        {/* Small corner links */}
        <div className="fixed top-6 right-6 z-10 flex items-center gap-3">
          <a
            href="https://www.linkedin.com/in/tjallingvds"
            target="_blank"
            rel="noopener noreferrer"
            className="garamond text-xs text-foreground/40 hover:text-foreground/70 transition-colors"
          >
            [linkedin]
          </a>
          <button
            onClick={() => {
              const parts = ['tjalling', 'vdschaar', 'gmail', 'com'];
              const email = `${parts[0]}${parts[1]}@${parts[2]}.${parts[3]}`;
              window.location.href = `mailto:${email}`;
            }}
            className="garamond text-xs text-foreground/40 hover:text-foreground/70 transition-colors"
          >
            [email]
          </button>
          {!showPasswordInput ? (
            <button
              onClick={() => setShowPasswordInput(true)}
              className="garamond text-xs text-foreground/40 hover:text-foreground/70 transition-colors"
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
                className="garamond text-xs text-foreground/40 hover:text-foreground/70 transition-colors"
              >
                →
              </button>
            </form>
          )}
          {error && (
            <p className="garamond text-xs text-red-500 absolute top-full right-0 mt-1">{error}</p>
          )}
        </div>

            {/* Content */}
            <div className="min-h-screen px-4 sm:px-8 py-12 sm:py-16">
              <div className="max-w-2xl mx-auto w-full" style={{ maxWidth: '42rem' }}>
            {/* Header */}
            <div className="mb-12 sm:mb-20">
              <h1 className="garamond text-2xl sm:text-3xl font-medium mb-2 tracking-tight">
                Tjalling van der Schaar
              </h1>
              <p className="garamond text-sm sm:text-base text-muted-foreground/60">
                On intentional building, learning, and growing.  
              </p>
            </div>

            {/* Notes Feed */}
            <div className="space-y-8 sm:space-y-12">
              {blogPosts.map((note) => (
                <Link to={`/blog/${note.id}`} key={note.id} className="block">
                  <article className="group cursor-pointer p-3 sm:p-4 -mx-3 sm:-mx-4 rounded-lg hover:bg-muted/30 transition-all">
                    <div className="flex items-baseline gap-2 sm:gap-3 mb-2">
                      <time className="garamond text-xs sm:text-sm text-muted-foreground/60 whitespace-nowrap">
                        {new Date(note.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </time>
                      <div className="flex-1 h-px bg-border/20"></div>
                      {postVotes[note.id] && postVotes[note.id].upvotes > 0 && (
                        <div className="flex items-center gap-1 text-muted-foreground/60">
                          <ArrowUp className="h-3 w-3" />
                          <span className="garamond text-xs">{postVotes[note.id].upvotes}</span>
                        </div>
                      )}
                    </div>
                    <h2 className="garamond text-xl sm:text-2xl font-medium mb-2 sm:mb-3 tracking-tight group-hover:text-foreground/80 transition-colors">
                      {note.title}
                    </h2>
                    <p className="garamond text-sm sm:text-base leading-relaxed text-foreground/90 group-hover:text-foreground transition-colors">
                      {note.content}
                    </p>
                  </article>
                </Link>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-12 sm:mt-20 pt-6 sm:pt-8 border-t border-border/20 text-center">
              <p className="garamond text-xs text-muted-foreground/60">
                © {new Date().getFullYear()} Tjalling van der Schaar
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

