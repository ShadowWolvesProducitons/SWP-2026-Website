import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Helmet } from 'react-helmet';

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/blog/slug/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setPost(data);
      } else if (response.status === 404) {
        setError('Post not found');
      } else {
        setError('Failed to load post');
      }
    } catch (err) {
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-AU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Simple markdown parser
  const renderContent = (content) => {
    if (!content) return null;
    
    // Check if content is HTML (from rich text editor)
    const isHtml = content.includes('<p>') || content.includes('<h1>') || content.includes('<h2>') || 
                   content.includes('<strong>') || content.includes('<ul>') || content.includes('<ol>');
    
    if (isHtml) {
      // Render HTML content from rich text editor
      return (
        <div 
          className="prose-content"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }
    
    // Fallback: Simple markdown parser for legacy content
    const paragraphs = content.split('\n\n');
    
    return paragraphs.map((para, idx) => {
      // Check for headers
      if (para.startsWith('# ')) {
        return <h2 key={idx} className="text-2xl font-bold text-white mt-8 mb-4">{para.slice(2)}</h2>;
      }
      if (para.startsWith('## ')) {
        return <h3 key={idx} className="text-xl font-bold text-white mt-6 mb-3">{para.slice(3)}</h3>;
      }
      if (para.startsWith('### ')) {
        return <h4 key={idx} className="text-lg font-bold text-white mt-4 mb-2">{para.slice(4)}</h4>;
      }
      
      // Check for list
      if (para.startsWith('- ')) {
        const items = para.split('\n').filter(line => line.startsWith('- '));
        return (
          <ul key={idx} className="list-disc list-inside space-y-2 my-4 text-gray-300">
            {items.map((item, i) => (
              <li key={i}>{processInlineFormatting(item.slice(2))}</li>
            ))}
          </ul>
        );
      }
      
      // Regular paragraph with inline formatting
      return (
        <p key={idx} className="text-gray-300 leading-relaxed mb-4">
          {processInlineFormatting(para)}
        </p>
      );
    });
  };

  const processInlineFormatting = (text) => {
    // Process bold
    let result = text.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
    // Process italic
    result = result.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');
    // Process links
    result = result.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-electric-blue hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');
    
    return <span dangerouslySetInnerHTML={{ __html: result }} />;
  };

  const getMetaDescription = () => {
    if (post?.seo_description) return post.seo_description;
    if (post?.excerpt) return post.excerpt;
    if (post?.content) return post.content.slice(0, 160).replace(/[#*\[\]<>]/g, '').replace(/&nbsp;/g, ' ') + '...';
    return 'Read this article from Shadow Wolves Productions.';
  };

  const getMetaTitle = () => {
    return post?.seo_title || `${post?.title} | Shadow Wolves Productions`;
  };

  const getOgImage = () => {
    if (post?.og_image_url) return `${process.env.REACT_APP_BACKEND_URL}${post.og_image_url}`;
    if (post?.cover_image_url) return `${process.env.REACT_APP_BACKEND_URL}${post.cover_image_url}`;
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-electric-blue animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-black pt-20">
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Post Not Found</h1>
          <p className="text-gray-400 mb-8">The post you're looking for doesn't exist or has been removed.</p>
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 text-electric-blue hover:underline"
          >
            <ArrowLeft size={18} />
            Back to The Den
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-post-page pt-20 min-h-screen bg-black">
      <Helmet>
        <title>{post.title} | Shadow Wolves Productions</title>
        <meta name="description" content={getMetaDescription()} />
        {post.cover_image_url && (
          <meta property="og:image" content={`${process.env.REACT_APP_BACKEND_URL}${post.cover_image_url}`} />
        )}
        <meta property="og:title" content={`${post.title} | Shadow Wolves Productions`} />
        <meta property="og:description" content={getMetaDescription()} />
        <meta property="og:type" content="article" />
      </Helmet>

      <article className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Back Link */}
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft size={18} />
            Back to The Den
          </Link>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Cinzel, serif' }}>
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 mb-8 text-sm">
            <span className="text-gray-500">{formatDate(post.published_at)}</span>
            {post.tags?.length > 0 && (
              <div className="flex gap-2">
                {post.tags.map((tag, idx) => (
                  <span 
                    key={idx}
                    className="px-2 py-0.5 bg-white/5 text-gray-400 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Cover Image */}
          {post.cover_image_url && (
            <div className="mb-10 rounded-lg overflow-hidden">
              <img 
                src={`${process.env.REACT_APP_BACKEND_URL}${post.cover_image_url}`}
                alt={post.title}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            {renderContent(post.content)}
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 pt-8 border-t border-gray-800">
            <p className="text-gray-400 text-sm">
              Partnership / collaboration enquiries →{' '}
              <Link to="/contact" className="text-electric-blue hover:underline">
                Contact
              </Link>
            </p>
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogPost;
