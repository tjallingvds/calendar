import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowUp } from 'lucide-react';
import { getBlogPosts, getBlogPostVotes, getMyVote, submitVote, removeVote, login, getBlogThemes } from '@/lib/api';
import type { BlogPost as BlogPostType, BlogPostVotes } from '@/lib/api';

export function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [votes, setVotes] = useState<BlogPostVotes>({ upvotes: 0, downvotes: 0, total: 0 });
  const [myVote, setMyVote] = useState<'upvote' | 'downvote' | null>(null);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [themes, setThemes] = useState<string[]>([]);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const posts = await getBlogPosts();
        const foundPost = posts.find(p => p.id === id);
        setPost(foundPost || null);
      } catch (error) {
        console.error('Failed to load post:', error);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) loadPost();
  }, [id]);

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

  useEffect(() => {
    const loadVotes = async () => {
      if (!id) return;
      try {
        const [votesData, myVoteData] = await Promise.all([
          getBlogPostVotes(id),
          getMyVote(id),
        ]);
        setVotes(votesData);
        setMyVote(myVoteData.vote);
      } catch (error) {
        console.error('Failed to load votes:', error);
      }
    };
    if (id) loadVotes();
  }, [id]);

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!id) return;
    
    try {
      if (myVote === voteType) {
        // Remove vote if clicking same button
        await removeVote(id);
        setMyVote(null);
      } else {
        // Submit new vote
        await submitVote(id, voteType);
        setMyVote(voteType);
      }
      
      // Reload votes
      const votesData = await getBlogPostVotes(id);
      setVotes(votesData);
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setLoginError('Please enter a password');
      return;
    }

    try {
      const { token } = await login(password);
      localStorage.setItem('auth_token', token);
      navigate('/dashboard');
    } catch (error: any) {
      setLoginError(error.message || 'Invalid password');
    }
  };

  const calculateReadingTime = (content: string): number => {
    const words = content.trim().split(/\s+/).length;
    const wordsPerMinute = 200;
    return Math.ceil(words / wordsPerMinute);
  };

  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600&display=swap');
          .garamond {
            font-family: 'EB Garamond', serif;
          }
        `}</style>
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
          <div className="text-center">
            <p className="garamond text-lg text-muted-foreground">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600&display=swap');
          .garamond {
            font-family: 'EB Garamond', serif;
          }
        `}</style>
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
          <div className="text-center">
            <h1 className="garamond text-3xl font-medium mb-4">Post not found</h1>
            <Link to="/" className="garamond text-lg text-foreground/60 hover:text-foreground transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </>
    );
  }

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
        .small-caps {
          font-variant: small-caps;
          letter-spacing: 0.05em;
          font-size: 0.95em;
        }
        .dropcap::first-letter {
          float: left;
          font-size: 3.5em;
          line-height: 0.85;
          margin-right: 0.15em;
          margin-top: 0.08em;
          font-weight: 500;
          color: #1a1a1a;
        }
        .blog-blockquote {
          border-left: 2px solid #d0d0d0;
          padding-left: 1.5rem;
          margin-left: 0;
          font-style: italic;
          color: #4a4a4a;
        }
        .blog-content {
          line-height: 1.8;
          color: #1a1a1a;
        }
        .footnote {
          font-size: 0.85em;
          vertical-align: super;
          color: #666;
          text-decoration: none;
          margin: 0 0.1em;
        }
        .footnote:hover {
          color: #2a2a2a;
        }
        .footnotes-section {
          border-top: 1px solid #e5e5e5;
          margin-top: 3rem;
          padding-top: 2rem;
          font-size: 0.9em;
          color: #666;
        }
        .ai-statement {
          background: rgba(0,0,0,0.02);
          border-left: 2px solid #999;
          padding: 1rem 1.5rem;
          font-size: 0.9em;
          color: #666;
          font-style: italic;
        }
        .shoutout {
          background: rgba(0,0,0,0.015);
          border-radius: 3px;
          padding: 0.1em 0.3em;
          font-weight: 500;
        }
        .back-to-top {
          position: fixed;
          bottom: 3rem;
          right: 3rem;
          background: white;
          border: 1px solid #e5e5e5;
          width: 28px;
          height: 28px;
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0;
          transition: all 0.3s ease;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          color: #bbb;
          z-index: 50;
        }
        .back-to-top.visible {
          opacity: 1;
        }
        .back-to-top:hover {
          background: rgba(0,0,0,0.015);
          color: #888;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        @media (max-width: 640px) {
          .page-border {
            margin: 1rem;
            min-height: calc(100vh - 2rem);
          }
          .dropcap::first-letter {
            font-size: 2.5em;
            margin-right: 0.12em;
          }
          .back-to-top {
            display: none; /* Hide on mobile */
          }
        }
      `}</style>

      <div className="min-h-screen bg-white relative" style={{ color: '#2a2a2a' }}>
        {/* Page border frame */}
        <div className="page-border">
        {/* Themes dropdown - top left (hidden on mobile) */}
        <div className="absolute top-6 left-6 z-10 hidden sm:block">
          <div className="relative flex items-center">
            <button
              onClick={() => setShowThemeDropdown(!showThemeDropdown)}
              className="garamond text-xs hover:opacity-70 transition-opacity"
              style={{ color: '#999' }}
            >
              [topics]
            </button>
            {showThemeDropdown && themes.length > 0 && (
              <div 
                className="absolute top-full left-0 mt-1 bg-white border border-border/20 rounded shadow-md py-1 min-w-[120px]"
                style={{ zIndex: 50 }}
              >
                <Link
                  to="/"
                  onClick={() => setShowThemeDropdown(false)}
                  className="block w-full text-left px-3 py-1.5 text-xs garamond hover:bg-accent/10"
                  style={{ color: '#2a2a2a' }}
                >
                  All themes
                </Link>
                {themes.map((theme) => (
                  <Link
                    key={theme}
                    to={`/?theme=${encodeURIComponent(theme)}`}
                    onClick={() => setShowThemeDropdown(false)}
                    className={`block w-full text-left px-3 py-1.5 text-xs garamond hover:bg-accent/10 ${post?.theme === theme ? 'font-medium' : ''}`}
                    style={{ color: '#2a2a2a' }}
                  >
                    {theme}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Small corner links (hidden on mobile) */}
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
            <form onSubmit={handleLogin} className="flex items-center gap-1.5">
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setLoginError('');
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
          {loginError && (
            <p className="garamond text-xs text-red-500 absolute top-full right-0 mt-1">{loginError}</p>
          )}
        </div>

        <div className="px-4 sm:px-8 py-12 sm:py-16">
          <div className="max-w-2xl mx-auto w-full" style={{ maxWidth: '42rem' }}>
          {/* Back button */}
          <Link 
            to="/" 
            className="garamond inline-flex items-center gap-2 text-sm sm:text-base text-foreground/60 hover:text-foreground transition-colors mb-8 sm:mb-12"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          {/* Article */}
          <article>
            {/* Header */}
            <header className="mb-8 sm:mb-12">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground/60 mb-2 sm:mb-3">
                <time className="small-caps garamond">
                  {new Date(post.date).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </time>
                <span style={{ color: '#d0d0d0' }}>•</span>
                <span className="garamond">
                  {calculateReadingTime(post.full_content || post.content)} min read
                </span>
                {post.theme && (
                  <>
                    <span style={{ color: '#d0d0d0' }}>•</span>
                    <span className="garamond" style={{ color: '#999' }}>
                      {post.theme}
                    </span>
                  </>
                )}
              </div>
              <h1 className="garamond text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight leading-tight">
                {post.title}
              </h1>
            </header>

            {/* Content */}
            <div className="blog-content garamond text-base sm:text-lg space-y-4 sm:space-y-6">
                {(post.full_content || post.content).split('\n\n').map((paragraph: string, i: number) => {
                  // Handle AI statement (lines starting with "[AI]")
                  if (paragraph.trim().startsWith('[AI]')) {
                    return (
                      <div key={i} className="ai-statement">
                        {paragraph.replace(/^\[AI\]\s*/, '')}
                      </div>
                    );
                  }
                  
                  // Handle footnotes section (lines starting with "[^1]:")
                  if (paragraph.trim().match(/^\[\^\d+\]:/)) {
                    const footnotes = paragraph.split('\n').filter(line => line.trim().match(/^\[\^\d+\]:/));
                    return (
                      <div key={i} className="footnotes-section">
                        <h4 className="text-sm font-medium mb-3">Notes</h4>
                        {footnotes.map((note, idx) => {
                          const match = note.match(/^\[\^(\d+)\]:\s*(.+)/);
                          if (match) {
                            return (
                              <p key={idx} id={`fn-${match[1]}`} className="mb-2">
                                <a href={`#fnref-${match[1]}`} className="footnote">[{match[1]}]</a> {match[2]}
                              </p>
                            );
                          }
                          return null;
                        })}
                      </div>
                    );
                  }
                  
                  // Handle blockquotes (lines starting with "> ")
                  if (paragraph.trim().startsWith('> ')) {
                    return (
                      <blockquote key={i} className="blog-blockquote">
                        {paragraph.split('\n').map((line, idx) => (
                          <p key={idx}>{line.replace(/^>\s*/, '')}</p>
                        ))}
                      </blockquote>
                    );
                  }
                  
                  // Handle markdown-style headers (with or without space after #)
                  if (paragraph.startsWith('### ') || paragraph.startsWith('###')) {
                    return (
                      <h3 key={i} className="text-lg sm:text-xl font-medium mt-6 sm:mt-8 mb-3 sm:mb-4 tracking-tight">
                        {paragraph.replace(/^###\s*/, '')}
                      </h3>
                    );
                  }
                  
                  if (paragraph.startsWith('## ') || paragraph.startsWith('##')) {
                    return (
                      <h2 key={i} className="text-xl sm:text-2xl font-medium mt-8 sm:mt-12 mb-4 sm:mb-6 tracking-tight">
                        {paragraph.replace(/^##\s*/, '')}
                      </h2>
                    );
                  }
                
                // Handle bullet lists (lines starting with "- ")
                const bulletLines = paragraph.split('\n').filter(line => line.trim().startsWith('- '));
                if (bulletLines.length > 0 && paragraph.trim().startsWith('- ')) {
                  return (
                    <ul key={i} className="list-none space-y-2 ml-4 sm:ml-6">
                      {paragraph.split('\n').map((line, idx) => {
                        if (line.trim().startsWith('- ')) {
                          return (
                            <li key={idx} className="flex items-start gap-3">
                              <span className="text-foreground/60 mt-1">•</span>
                              <span>{line.trim().substring(2)}</span>
                            </li>
                          );
                        }
                        return null;
                      })}
                    </ul>
                  );
                }
                
                // Handle numbered lists (lines starting with "1. ", "2. ", etc.)
                const numberedLines = paragraph.split('\n').filter(line => /^\d+\.\s/.test(line.trim()));
                if (numberedLines.length > 0 && /^\d+\.\s/.test(paragraph.trim())) {
                  return (
                    <ol key={i} className="list-none space-y-2 ml-4 sm:ml-6">
                      {paragraph.split('\n').map((line, idx) => {
                        const match = line.trim().match(/^(\d+)\.\s(.+)/);
                        if (match) {
                          return (
                            <li key={idx} className="flex items-start gap-3">
                              <span className="text-foreground/60 mt-1 font-medium min-w-[1.5rem]">{match[1]}.</span>
                              <span>{match[2]}</span>
                            </li>
                          );
                        }
                        return null;
                      })}
                    </ol>
                  );
                }
                
                // Handle bold text
                if (paragraph.startsWith('**') && paragraph.includes(':**')) {
                  const parts = paragraph.split('**');
                  return (
                    <p key={i}>
                      <strong className="font-medium">{parts[1]}</strong>
                      {parts[2]}
                    </p>
                  );
                }
                
                // Process inline footnotes [^1] and shoutouts @name
                const processInlineMarkdown = (text: string) => {
                  const parts = [];
                  let lastIndex = 0;
                  
                  // Match footnotes [^1] and shoutouts @name
                  const regex = /(\[\^(\d+)\])|(@\w+)/g;
                  let match;
                  
                  while ((match = regex.exec(text)) !== null) {
                    // Add text before match
                    if (match.index > lastIndex) {
                      parts.push(text.substring(lastIndex, match.index));
                    }
                    
                    if (match[1]) {
                      // Footnote reference
                      parts.push(
                        <a key={match.index} href={`#fn-${match[2]}`} id={`fnref-${match[2]}`} className="footnote">
                          [{match[2]}]
                        </a>
                      );
                    } else if (match[3]) {
                      // Shoutout @name
                      parts.push(
                        <span key={match.index} className="shoutout">{match[3]}</span>
                      );
                    }
                    
                    lastIndex = regex.lastIndex;
                  }
                  
                  // Add remaining text
                  if (lastIndex < text.length) {
                    parts.push(text.substring(lastIndex));
                  }
                  
                  return parts.length > 0 ? parts : text;
                };
                
                // Regular paragraph (with dropcap on first paragraph)
                const processedContent = processInlineMarkdown(paragraph);
                if (i === 0) {
                  return <p key={i} className="dropcap">{processedContent}</p>;
                }
                return <p key={i}>{processedContent}</p>;
              })}
            </div>

            {/* Voting */}
            <div className="mt-12 sm:mt-16 pt-8 border-t border-border/20">
              <div className="flex items-center justify-end">
                <button
                  onClick={() => handleVote('upvote')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm transition-all ${
                    myVote === 'upvote'
                      ? 'bg-foreground/8 text-foreground border border-foreground/10'
                      : 'hover:bg-foreground/5 text-muted-foreground/60 hover:text-foreground/80'
                  }`}
                >
                  <ArrowUp className={`h-3.5 w-3.5 ${myVote === 'upvote' ? 'stroke-[2]' : ''}`} />
                  <span className="garamond text-sm">{votes.upvotes}</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 sm:mt-20 pt-6 sm:pt-8 text-center" style={{ borderTop: '1px solid #e5e5e5' }}>
              <p className="text-xs" style={{ fontFamily: 'Georgia, serif', color: '#999' }}>
                © {new Date().getFullYear()} Tjalling van der Schaar
              </p>
              
              {/* Mobile-only navigation */}
              <div className="sm:hidden mt-3">
                {/* Themes dropdown on mobile */}
                <div className="flex items-center justify-center mb-2">
                  <div className="relative flex items-center">
                    <button
                      onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                      className="garamond text-xs hover:opacity-70 transition-opacity"
                      style={{ color: '#999' }}
                    >
                      [topics]
                    </button>
                    {showThemeDropdown && themes.length > 0 && (
                      <div 
                        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 bg-white border border-border/20 rounded shadow-md py-1 min-w-[120px]"
                        style={{ zIndex: 50 }}
                      >
                        <Link
                          to="/"
                          onClick={() => setShowThemeDropdown(false)}
                          className="block w-full text-left px-3 py-1.5 text-xs garamond hover:bg-accent/10"
                          style={{ color: '#2a2a2a' }}
                        >
                          All topics
                        </Link>
                        {themes.map((theme) => (
                          <Link
                            key={theme}
                            to={`/?theme=${encodeURIComponent(theme)}`}
                            onClick={() => setShowThemeDropdown(false)}
                            className={`block w-full text-left px-3 py-1.5 text-xs garamond hover:bg-accent/10 ${post?.theme === theme ? 'font-medium' : ''}`}
                            style={{ color: '#2a2a2a' }}
                          >
                            {theme}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Links */}
                <div className="flex items-center justify-center gap-3">
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
                    <form onSubmit={handleLogin} className="flex items-center gap-1.5">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setLoginError('');
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
              </div>
              {loginError && (
                <p className="garamond text-xs text-red-500 mt-2 sm:hidden text-center">{loginError}</p>
              )}
            </div>
          </article>
          </div>
        </div>
        </div>
        
        {/* Back to top button */}
        <button
          onClick={scrollToTop}
          className={`back-to-top ${showBackToTop ? 'visible' : ''}`}
          aria-label="Back to top"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 12L8 4M8 4L4 8M8 4L12 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </>
  );
}

