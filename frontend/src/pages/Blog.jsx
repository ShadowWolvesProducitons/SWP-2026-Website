import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, ArrowRight } from 'lucide-react';
import { Helmet } from 'react-helmet';
import PageHeader from '../components/PageHeader';

const API = process.env.REACT_APP_BACKEND_URL;

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState(null);
  const [playbookImg, setPlaybookImg] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPosts();
    // Fetch playbook mockup from assets
    fetch(`${API}/api/assets?search=playbook`)
      .then(r => r.ok ? r.json() : [])
      .then(assets => {
        const mockup = assets.find(a => a.asset_type === 'image' && a.original_name?.toLowerCase().includes('mockup'));
        if (mockup) setPlaybookImg(`${API}${mockup.file_url}`);
      }).catch(() => {});
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API}/api/blog?status=Published`);
      if (response.ok) setPosts(await response.json());
    } catch (err) { console.error('Failed to load posts:', err); }
    finally { setLoading(false); }
  };

  const allTags = [...new Set(posts.flatMap(post => post.tags || []))].sort();
  const filteredPosts = selectedTag ? posts.filter(post => post.tags?.includes(selectedTag)) : posts;
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const imgUrl = (u) => u && (u.startsWith('http') ? u : `${API}${u}`);

  return (
    <div className="blog-page pt-20 min-h-screen bg-black">
      <Helmet>
        <title>The Den | Shadow Wolves Productions</title>
        <meta name="description" content="Industry notes, studio updates, and what we're building next. Casting calls, crew needs, production lessons, and tools we actually use." />
        <link rel="canonical" href="https://shadowwolvesproductions.com/blog" />
      </Helmet>

      {/* Page Header */}
      <PageHeader page="den" title="The Den" subtitle="Casting calls. Crew needs. Production lessons. Tools we actually use." />

      {/* Subscribe CTA — Get The Playbook with image + blue glow */}
      <section className="py-4 bg-smoke-gray border-b border-gray-800 relative overflow-hidden">
        {/* Blue glow behind section */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-electric-blue/8 rounded-full filter blur-[80px]" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              {/* Playbook image with glow - larger */}
              {playbookImg && (
                <div className="relative flex-shrink-0 hidden sm:block">
                  <div className="absolute -inset-4 bg-electric-blue/15 rounded-xl filter blur-xl" />
                  <img src={playbookImg} alt="Producer's Playbook" className="relative w-32 h-auto rounded-lg shadow-lg shadow-electric-blue/20" />
                </div>
              )}
              <div>
                <p className="text-white font-medium">Get The Producer's Playbook (Free)</p>
                <p className="text-gray-500 text-sm">A practical, step-by-step roadmap — from development through release.</p>
              </div>
            </div>
            <button
              onClick={() => window.dispatchEvent(new Event('trigger-lead-magnet'))}
              className="px-6 py-2 bg-electric-blue hover:bg-electric-blue/90 text-white rounded-full text-sm font-mono uppercase tracking-widest transition-all flex-shrink-0"
              data-testid="get-the-playbook-btn"
            >
              Get The Playbook
            </button>
          </div>
        </div>
      </section>

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <section className="py-4 border-b border-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-gray-500 font-mono text-xs uppercase tracking-widest">Filter:</span>
              <button onClick={() => setSelectedTag(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest transition-all ${!selectedTag ? 'bg-electric-blue text-white' : 'bg-smoke-gray text-gray-400 hover:text-white border border-gray-700'}`}>
                All
              </button>
              {allTags.map((tag) => (
                <button key={tag} onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest transition-all ${selectedTag === tag ? 'bg-electric-blue text-white' : 'bg-smoke-gray text-gray-400 hover:text-white border border-gray-700'}`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Posts List — Compact Cards */}
      <section className="py-12">
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
            <div className="max-w-4xl mx-auto space-y-4">
              {filteredPosts.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="group block" data-testid={`blog-card-${post.id}`}>
                  <article className="flex gap-4 items-center bg-smoke-gray/50 border border-gray-800/50 rounded-lg p-3 hover:border-gray-700 transition-all">
                    {/* Cover Image — small square */}
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-gray-900 flex-shrink-0">
                      {post.cover_image_url ? (
                        <img src={imgUrl(post.cover_image_url)} alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                          <span className="text-gray-700 text-[10px] font-mono uppercase">SW</span>
                        </div>
                      )}
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {post.featured && <span className="text-electric-blue text-[10px] font-mono uppercase tracking-widest">Featured</span>}
                        {post.tags?.length > 0 && (
                          <div className="flex gap-1.5">
                            {post.tags.slice(0, 2).map((tag, i) => (
                              <span key={i} className="px-2 py-0.5 bg-white/5 text-gray-500 rounded-full text-[10px] font-mono uppercase">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <h3 className="text-white font-bold text-sm md:text-base group-hover:text-electric-blue transition-colors line-clamp-1 font-cinzel">
                        {post.title}
                      </h3>
                      {post.excerpt && <p className="text-gray-500 text-xs md:text-sm line-clamp-1 mt-0.5">{post.excerpt}</p>}
                      <span className="text-gray-600 text-xs mt-1 block">{formatDate(post.published_at)}</span>
                    </div>
                    {/* Arrow */}
                    <ArrowRight size={16} className="text-gray-600 group-hover:text-electric-blue flex-shrink-0 transition-colors" />
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Blog;
