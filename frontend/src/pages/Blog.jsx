import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, ArrowRight } from 'lucide-react';
import { Helmet } from 'react-helmet';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/blog?status=Published`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get unique tags
  const allTags = [...new Set(posts.flatMap(post => post.tags || []))].sort();

  const filteredPosts = selectedTag
    ? posts.filter(post => post.tags?.includes(selectedTag))
    : posts;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-AU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className="blog-page pt-20 min-h-screen bg-black">
      <Helmet>
        <title>The Den | Shadow Wolves Productions</title>
        <meta name="description" content="Industry notes, studio updates, and what we're building next." />
      </Helmet>

      {/* Page Header */}
      <section className="page-header py-24 bg-gradient-to-br from-black via-smoke-gray to-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-electric-blue rounded-full filter blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6" style={{ fontFamily: 'Cinzel, serif' }}>
            The Den
          </h1>
          <p className="max-w-2xl text-xl text-gray-400">
            Field notes from the studio — no fluff.
          </p>
        </div>
      </section>

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <section className="py-6 border-b border-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-gray-500 font-mono text-xs uppercase tracking-widest">Filter:</span>
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-widest transition-all ${
                  !selectedTag
                    ? 'bg-electric-blue text-white'
                    : 'bg-smoke-gray text-gray-400 hover:text-white border border-gray-700'
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-widest transition-all ${
                    selectedTag === tag
                      ? 'bg-electric-blue text-white'
                      : 'bg-smoke-gray text-gray-400 hover:text-white border border-gray-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Posts List */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-16">
              <RefreshCw className="w-8 h-8 text-electric-blue animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading posts...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-xl">No posts published yet.</p>
            </div>
          ) : (
            <div className="space-y-8 max-w-3xl mx-auto">
              {filteredPosts.map((post) => (
                <article 
                  key={post.id} 
                  className="group border-b border-gray-800 pb-8 last:border-0"
                >
                  <Link to={`/blog/${post.slug}`}>
                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                      {/* Content */}
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white group-hover:text-electric-blue transition-colors mb-3">
                          {post.title}
                        </h2>
                        {post.excerpt && (
                          <p className="text-gray-400 mb-4 line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500">{formatDate(post.published_at)}</span>
                          {post.tags?.length > 0 && (
                            <div className="flex gap-2">
                              {post.tags.slice(0, 3).map((tag, idx) => (
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
                      </div>
                      {/* Arrow */}
                      <div className="flex items-center text-gray-600 group-hover:text-electric-blue transition-colors">
                        <ArrowRight size={20} className="transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Blog;
