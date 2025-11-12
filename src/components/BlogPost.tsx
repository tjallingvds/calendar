import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { getBlogPosts } from '@/lib/api';
import type { BlogPost as BlogPostType } from '@/lib/api';

export function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);

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
      `}</style>

      <div className="min-h-screen bg-background relative">
        {/* Small corner link */}
        <div className="fixed top-6 right-6 z-10">
          <a
            href="https://www.linkedin.com/in/tjallingvds"
            target="_blank"
            rel="noopener noreferrer"
            className="garamond text-xs text-foreground/40 hover:text-foreground/70 transition-colors"
          >
            [linkedin]
          </a>
        </div>

        <div className="max-w-2xl mx-auto px-8 py-16">
          {/* Back button */}
          <Link 
            to="/" 
            className="garamond inline-flex items-center gap-2 text-base text-foreground/60 hover:text-foreground transition-colors mb-12"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          {/* Article */}
          <article>
            {/* Header */}
            <header className="mb-12">
              <time className="garamond text-sm text-muted-foreground/60 block mb-3">
                {new Date(post.date).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </time>
              <h1 className="garamond text-5xl font-medium tracking-tight">
                {post.title}
              </h1>
            </header>

            {/* Content */}
            <div className="garamond text-lg leading-relaxed text-foreground/90 space-y-6">
              {(post.full_content || post.content).split('\n\n').map((paragraph: string, i: number) => {
                // Handle markdown-style headers
                if (paragraph.startsWith('## ')) {
                  return (
                    <h2 key={i} className="text-2xl font-medium mt-12 mb-6 tracking-tight">
                      {paragraph.replace('## ', '')}
                    </h2>
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
                // Regular paragraph
                return <p key={i}>{paragraph}</p>;
              })}
            </div>
          </article>
        </div>
      </div>
    </>
  );
}

