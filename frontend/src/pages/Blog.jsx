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

      {/* Page Header with Intro Banner */}
      <section className="page-header py-16 bg-gradient-to-br from-black via-smoke-gray to-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-electric-blue rounded-full filter blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
            The Den
          </h1>
          {/* Intro Banner - Split text */}
          <div className="max-w-2xl space-y-3">
            <p className="text-xl text-gray-400">
              Casting calls. Crew needs. Production lessons. Tools we actually use.
            </p>
            <p className="text-gray-500">
              A working blog — grounded in real studio activity, not content for content's sake.
            </p>
          </div>
        </div>
      </section>

      {/* Subscribe CTA */}
      <section className="py-6 bg-smoke-gray border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-white font-medium">Get The Producer's Playbook (Free)</p>
              <p className="text-gray-500 text-sm">A practical, step-by-step roadmap — from development through release.</p>
            </div>
            <Link
              to="/#newsletter"
              className="px-6 py-2 bg-electric-blue hover:bg-electric-blue/90 text-white rounded-full text-sm font-mono uppercase tracking-widest transition-all"
            >
              Get The Playbook
            </Link>
          </div>
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
            <div className="max-w-4xl mx-auto">
              {/* Featured Post - First featured post gets larger layout */}
              {!selectedTag && filteredPosts.find(p => p.featured) && (
                <div className="mb-12">
                  {(() => {
                    const featuredPost = filteredPosts.find(p => p.featured);
                    return (
                      <Link to={`/blog/${featuredPost.slug}`} className="group block">
                        <article className="bg-smoke-gray border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors">
                          {featuredPost.cover_image && (
                            <div className="aspect-video overflow-hidden">
                              <img 
                                src={featuredPost.cover_image.startsWith('http') ? featuredPost.cover_image : `${process.env.REACT_APP_BACKEND_URL}${featuredPost.cover_image}`}
                                alt={featuredPost.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                          )}
                          <div className="p-6">
                            <span className="text-electric-blue text-xs font-mono uppercase tracking-widest mb-3 block">Featured</span>
                            <h2 className="text-3xl font-bold text-white group-hover:text-electric-blue transition-colors mb-3" style={{ fontFamily: 'Cinzel, serif' }}>
                              {featuredPost.title}
                            </h2>
                            {featuredPost.excerpt && (
                              <p className="text-gray-400 text-lg mb-4 line-clamp-2">
                                {featuredPost.excerpt}
                              </p>
                            )}
                            <span className="text-gray-500 text-sm">{formatDate(featuredPost.published_at)}</span>
                          </div>
                        </article>
                      </Link>
                    );
                  })()}
                </div>
              )}

              {/* Regular Posts */}
              <div className="space-y-8">
              {filteredPosts.filter(post => selectedTag || !post.featured).map((post) => (
                <article 
                  key={post.id} 
                  className="group border-b border-gray-800 pb-8 last:border-0"
                >
                  <Link to={`/blog/${post.slug}`}>
                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                      {/* Thumbnail */}
                      {post.cover_image && (
                        <div className="w-full md:w-48 h-32 md:h-28 flex-shrink-0 rounded-lg overflow-hidden bg-smoke-gray">
                          <img 
                            src={post.cover_image.startsWith('http') ? post.cover_image : `${process.env.REACT_APP_BACKEND_URL}${post.cover_image}`}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
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
                      <div className="hidden md:flex items-center text-gray-600 group-hover:text-electric-blue transition-colors">
                        <ArrowRight size={20} className="transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Blog;
