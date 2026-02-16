import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ChevronDown, ChevronUp, ArrowLeft, Mail, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const FilmProject = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [film, setFilm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchFilm();
  }, [slug]);

  const fetchFilm = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/films/by-slug/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setFilm(data);
      } else if (response.status === 404) {
        setError('Film not found');
      } else {
        setError('Failed to load film');
      }
    } catch (err) {
      console.error('Failed to load film:', err);
      setError('Failed to load film');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestMaterials = () => {
    window.location.href = `mailto:admin@shadowwolvesproductions.com.au?subject=Request Materials: ${film.title}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-20">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-electric-blue animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !film) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4 font-cinzel">Project Not Found</h1>
          <p className="text-gray-400 mb-8">The project you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/films')}
            className="inline-flex items-center gap-2 text-electric-blue hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Films
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{film.title} | Shadow Wolves Productions</title>
        <meta name="description" content={film.logline || film.tagline || `${film.title} - A Shadow Wolves Productions project`} />
        <meta property="og:title" content={`${film.title} | Shadow Wolves Productions`} />
        <meta property="og:description" content={film.logline || film.tagline} />
        {film.poster_url && (
          <meta property="og:image" content={`${process.env.REACT_APP_BACKEND_URL}${film.poster_url}`} />
        )}
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="film-project-page bg-black min-h-screen pt-20" data-testid="film-project-page">
        {/* Back Navigation */}
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/films')}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
            data-testid="back-to-films-btn"
          >
            <ArrowLeft size={16} />
            Back to Films
          </button>
        </div>

        {/* Hero Section */}
        <section className="hero-section py-8 md:py-12">
          <div className="container mx-auto px-4">
            <motion.div 
              className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Poster */}
              <div className="w-full lg:w-1/3 flex-shrink-0">
                <div 
                  className="relative aspect-[2/3] rounded-lg overflow-hidden border border-gray-800 shadow-2xl shadow-electric-blue/10"
                  style={{ backgroundColor: film.poster_color || '#1a1a2e' }}
                >
                  {film.poster_url ? (
                    <img
                      src={`${process.env.REACT_APP_BACKEND_URL}${film.poster_url}`}
                      alt={film.title}
                      className="w-full h-full object-contain bg-black"
                      data-testid="film-project-poster"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                      <div className="w-20 h-20 mb-4 opacity-30">
                        <svg viewBox="0 0 100 100" fill="currentColor" className="text-electric-blue">
                          <path d="M50 10L20 40L10 90L50 70L90 90L80 40L50 10Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <circle cx="35" cy="45" r="4" fill="currentColor"/>
                          <circle cx="65" cy="45" r="4" fill="currentColor"/>
                        </svg>
                      </div>
                      <span className="text-gray-500 text-sm text-center">Poster Coming Soon</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Hero Info */}
              <div className="flex-1 lg:pt-4">
                {/* Title */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 font-cinzel" data-testid="film-project-title">
                  {film.title}
                </h1>

                {/* Genre Tags */}
                {film.genres && film.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {film.genres.map((genre, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-sm border border-white/10"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

                {/* Status Badge */}
                <div className="mb-6">
                  <span className="px-4 py-2 rounded-full bg-electric-blue/20 text-electric-blue border border-electric-blue/40 text-xs font-mono uppercase tracking-widest">
                    {film.status}
                  </span>
                </div>

                {/* Tagline */}
                {film.tagline && (
                  <p className="text-xl md:text-2xl text-gray-300 italic leading-relaxed mb-6">
                    "{film.tagline}"
                  </p>
                )}

                {/* CTA Button */}
                <button
                  onClick={handleRequestMaterials}
                  className="inline-flex items-center gap-2 bg-electric-blue hover:bg-electric-blue/90 text-white px-8 py-4 rounded-full font-mono text-sm uppercase tracking-widest transition-all"
                  data-testid="request-materials-btn"
                >
                  <Mail size={18} />
                  Request Materials
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Logline Section */}
        {film.logline && (
          <section className="logline-section py-12 border-t border-gray-800">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-xs font-mono uppercase tracking-widest text-electric-blue mb-4">Logline</h2>
                <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-4xl">
                  {film.logline}
                </p>
              </motion.div>
            </div>
          </section>
        )}

        {/* Extended Synopsis Section - Expandable */}
        {film.extended_synopsis && (
          <section className="synopsis-section py-12 border-t border-gray-800">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-mono uppercase tracking-widest text-electric-blue">Extended Synopsis</h2>
                  <button
                    onClick={() => setSynopsisExpanded(!synopsisExpanded)}
                    className="flex items-center gap-1 text-gray-400 hover:text-white text-sm transition-colors"
                    data-testid="toggle-synopsis-btn"
                  >
                    {synopsisExpanded ? (
                      <>
                        <span>Collapse</span>
                        <ChevronUp size={16} />
                      </>
                    ) : (
                      <>
                        <span>Read More</span>
                        <ChevronDown size={16} />
                      </>
                    )}
                  </button>
                </div>
                
                <motion.div
                  initial={false}
                  animate={{ height: synopsisExpanded ? 'auto' : '120px' }}
                  className="overflow-hidden relative"
                >
                  <div className="text-gray-400 leading-relaxed max-w-4xl space-y-4">
                    {film.extended_synopsis.split('\n\n').map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                  {!synopsisExpanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent" />
                  )}
                </motion.div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Tone & Style Section */}
        {(film.tone_style_text || (film.mood_images && film.mood_images.length > 0)) && (
          <section className="tone-style-section py-12 border-t border-gray-800 bg-smoke-gray/30">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-xs font-mono uppercase tracking-widest text-electric-blue mb-8">Tone & Style</h2>
                
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                  {/* Text Content */}
                  {film.tone_style_text && (
                    <div className="text-gray-400 leading-relaxed space-y-4">
                      {film.tone_style_text.split('\n\n').map((paragraph, idx) => (
                        <p key={idx}>{paragraph}</p>
                      ))}
                    </div>
                  )}

                  {/* Mood Images Grid */}
                  {film.mood_images && film.mood_images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {film.mood_images.slice(0, 6).map((imageUrl, idx) => (
                        <div 
                          key={idx} 
                          className="aspect-video rounded-lg overflow-hidden border border-gray-800"
                        >
                          <img
                            src={imageUrl.startsWith('http') ? imageUrl : `${process.env.REACT_APP_BACKEND_URL}${imageUrl}`}
                            alt={`${film.title} mood ${idx + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Project Status Section */}
        {(film.status || (film.looking_for && film.looking_for.length > 0)) && (
          <section className="project-status-section py-12 border-t border-gray-800">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-xs font-mono uppercase tracking-widest text-electric-blue mb-8">Project Status</h2>
                
                <div className="bg-smoke-gray border border-gray-800 rounded-lg p-6 md:p-8 max-w-2xl">
                  <div className="grid gap-6">
                    {/* Stage */}
                    <div>
                      <span className="text-gray-500 text-sm uppercase tracking-wide">Current Stage</span>
                      <p className="text-white text-xl font-semibold mt-1">{film.status}</p>
                    </div>

                    {/* Format */}
                    {film.format && (
                      <div>
                        <span className="text-gray-500 text-sm uppercase tracking-wide">Format</span>
                        <p className="text-white text-lg mt-1">{film.format}</p>
                      </div>
                    )}

                    {/* Looking For */}
                    {film.looking_for && film.looking_for.length > 0 && (
                      <div>
                        <span className="text-gray-500 text-sm uppercase tracking-wide">Currently Seeking</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {film.looking_for.map((item, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-full bg-electric-blue/10 text-electric-blue text-sm border border-electric-blue/30"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Final CTA Block */}
        <section className="cta-section py-16 border-t border-gray-800 bg-gradient-to-b from-black to-smoke-gray/50">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-cinzel">
                Interested in {film.title}?
              </h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                Request access to project materials including pitch deck, script excerpts, and financial projections.
              </p>
              <button
                onClick={handleRequestMaterials}
                className="inline-flex items-center gap-2 bg-electric-blue hover:bg-electric-blue/90 text-white px-10 py-4 rounded-full font-mono text-sm uppercase tracking-widest transition-all shadow-lg shadow-electric-blue/20"
                data-testid="final-cta-btn"
              >
                <Mail size={18} />
                Request Access
              </button>
            </motion.div>
          </div>
        </section>

        {/* Links Section */}
        {(film.imdb_url || film.watch_url) && (
          <section className="links-section py-8 border-t border-gray-800">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-center gap-6">
                {film.imdb_url && (
                  <a
                    href={film.imdb_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-1"
                  >
                    View on IMDb
                    <span className="text-xs">↗</span>
                  </a>
                )}
                {film.watch_url && film.watch_url_title && (
                  <a
                    href={film.watch_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-1"
                  >
                    {film.watch_url_title}
                    <span className="text-xs">↗</span>
                  </a>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default FilmProject;
