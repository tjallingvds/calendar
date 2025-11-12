import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowUp } from 'lucide-react';
import { getBlogPosts, getBlogPostVotes, getMyVote, submitVote, removeVote } from '@/lib/api';
import type { BlogPost as BlogPostType, BlogPostVotes } from '@/lib/api';

export function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [votes, setVotes] = useState<BlogPostVotes>({ upvotes: 0, downvotes: 0, total: 0 });
  const [myVote, setMyVote] = useState<'upvote' | 'downvote' | null>(null);

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
          margin-right: 0.1em;
          margin-top: 0.05em;
          font-weight: 500;
          color: #2a2a2a;
        }
        .blog-blockquote {
          border-left: 2px solid #d0d0d0;
          padding-left: 1.5rem;
          margin-left: 0;
          font-style: italic;
          color: #4a4a4a;
        }
        @media (max-width: 640px) {
          .page-border {
            margin: 1rem;
            min-height: calc(100vh - 2rem);
          }
          .dropcap::first-letter {
            font-size: 2.5em;
          }
        }
      `}</style>

      <div className="min-h-screen bg-white relative" style={{ color: '#2a2a2a' }}>
        {/* Page border frame */}
        <div className="page-border">
        {/* Small corner links (hidden on mobile) */}
        <div className="absolute top-6 right-6 z-10 hidden sm:flex items-center gap-3">
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
          <Link
            to="/"
            className="garamond text-xs" style={{ color: '#999' }}
          >
            [login]
          </Link>
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
              <time className="small-caps garamond text-xs sm:text-sm text-muted-foreground/60 block mb-2 sm:mb-3">
                {new Date(post.date).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </time>
              <h1 className="garamond text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight leading-tight">
                {post.title}
              </h1>
            </header>

            {/* Content */}
            <div className="garamond text-base sm:text-lg leading-relaxed text-foreground/90 space-y-4 sm:space-y-6">
                {(post.full_content || post.content).split('\n\n').map((paragraph: string, i: number) => {
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
                
                // Regular paragraph (with dropcap on first paragraph)
                if (i === 0) {
                  return <p key={i} className="dropcap">{paragraph}</p>;
                }
                return <p key={i}>{paragraph}</p>;
              })}
            </div>

            {/* Voting */}
            <div className="mt-12 sm:mt-16 pt-8 border-t border-border/20">
              <div className="flex items-center justify-between">
                <p className="garamond text-sm text-muted-foreground/70">Thoughts?</p>
                <button
                  onClick={() => handleVote('upvote')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                    myVote === 'upvote'
                      ? 'bg-foreground/10 text-foreground'
                      : 'hover:bg-foreground/5 text-muted-foreground/60 hover:text-foreground/80'
                  }`}
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                  <span className="garamond text-sm">{votes.upvotes}</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 sm:mt-20 pt-6 sm:pt-8 text-center" style={{ borderTop: '1px solid #e5e5e5' }}>
              <p className="text-xs" style={{ fontFamily: 'Georgia, serif', color: '#999' }}>
                © {new Date().getFullYear()} Tjalling van der Schaar
              </p>
              
              {/* Mobile-only links (shown under copyright) */}
              <div className="flex sm:hidden items-center justify-center gap-3 mt-3">
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
                <Link
                  to="/"
                  className="garamond text-xs" style={{ color: '#999' }}
                >
                  [login]
                </Link>
              </div>
            </div>
          </article>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}

