import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, X, RefreshCw } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import FilmModal from '../components/FilmModal';
import PageHeader from '../components/PageHeader';

// Status options for filter chips
const STATUS_OPTIONS = ['All', 'Development', 'Packaging', 'Pre-Production', 'Filming', 'Post-Production', 'Marketing', 'Released'];

const Films = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [filteredFilms, setFilteredFilms] = useState([]);
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const genreDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);
  const scrollPositionRef = useRef(null);

  useEffect(() => {
    if (!slug) {
      window.scrollTo(0, 0);
    }
    fetchFilms();
  }, []);

  // Handle slug changes - open/close modal based on URL
  useEffect(() => {
    if (slug && films.length > 0) {
      const film = films.find(f => f.slug === slug || f.id === slug);
      if (film) {
        // Save scroll position before opening modal
        scrollPositionRef.current = window.scrollY;
        document.body.style.overflow = 'hidden';
        
        const modalFilm = {
          ...film,
          posterColor: film.poster_color,
          imdbUrl: film.imdb_url,
          watchUrl: film.watch_url,
          watchUrlTitle: film.watch_url_title,
          posterUrl: film.poster_url,
          slug: film.slug || film.id
        };
        setSelectedFilm(modalFilm);
      }
    } else if (!slug) {
      // Restore scroll position when modal closes
      document.body.style.overflow = 'unset';
      setSelectedFilm(null);
      if (scrollPositionRef.current > 0) {
        window.scrollTo(0, scrollPositionRef.current);
      }
    }
  }, [slug, films]);

  const fetchFilms = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/films`);
      if (response.ok) {
        const data = await response.json();
        setFilms(data);
        setFilteredFilms(data);
      }
    } catch (err) {
      console.error('Failed to load films:', err);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique genres from all films
  const genreOptions = useMemo(() => {
    const allGenres = films.flatMap(film => film.genres || []);
    const uniqueGenres = [...new Set(allGenres)].sort();
    return ['All', ...uniqueGenres];
  }, [films]);

  // Filter films by genre AND status (independently)
  useEffect(() => {
    let result = films;
    
    if (selectedGenre !== 'All') {
      result = result.filter((film) => 
        film.genres && film.genres.includes(selectedGenre)
      );
    }
    
    if (selectedStatus !== 'All') {
      result = result.filter((film) => film.status === selectedStatus);
    }
    
    setFilteredFilms(result);
  }, [selectedGenre, selectedStatus, films]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (genreDropdownRef.current && !genreDropdownRef.current.contains(event.target)) {
        setIsGenreDropdownOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setIsStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGenreSelect = (genre) => {
    setSelectedGenre(genre);
    setIsGenreDropdownOpen(false);
  };

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
    setIsStatusDropdownOpen(false);
  };

  const handleFilmClick = (film) => {
    // Navigate to film route - this will trigger the useEffect to open modal
    const filmSlug = film.slug || film.id;
    navigate(`/films/${filmSlug}`);
  };

  const closeModal = () => {
    // Navigate back to /films - this will trigger the useEffect to close modal
    navigate('/films');
  };

  // Generate Movie schema for selected film
  const generateMovieSchema = (film) => {
    if (!film) return null;
    return {
      "@context": "https://schema.org",
      "@type": "Movie",
      "name": film.title,
      "description": film.logline || film.synopsis || '',
      "image": film.posterUrl ? `${process.env.REACT_APP_BACKEND_URL}${film.posterUrl}` : '',
      "genre": film.genres || [],
      "productionCompany": {
        "@type": "Organization",
        "name": "Shadow Wolves Productions"
      },
      "url": `https://shadowwolvesproductions.com/films/${film.slug || film.id}`
    };
  };

  return (
    <div className="films-page pt-20">
      {/* SEO Meta for film detail route */}
      {selectedFilm ? (
        <Helmet encodeSpecialCharacters={false}>
          <title>{selectedFilm.title} | Shadow Wolves Productions</title>
          {selectedFilm.logline && (
            <meta name="description" content={selectedFilm.logline.substring(0, 160)} />
          )}
          <link rel="canonical" href={`https://shadowwolvesproductions.com/films/${selectedFilm.slug || selectedFilm.id}`} />
          <script type="application/ld+json">
            {JSON.stringify(generateMovieSchema(selectedFilm))}
          </script>
        </Helmet>
      ) : (
        <Helmet>
          <title>Films | Shadow Wolves Productions</title>
          <meta name="description" content="Explore original screen stories from Shadow Wolves Productions — past, present, and in development." />
          <link rel="canonical" href="https://shadowwolvesproductions.com/films" />
        </Helmet>
      )}

      {/* Page Header */}
      <PageHeader page="films" title="Films" subtitle="Original screen stories — past, present, and in development." />

      {/* Filter Section - Genre & Status Dropdowns */}
      <section className="filter-section py-6 bg-smoke-gray border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Genre Dropdown */}
              <div className="relative" ref={genreDropdownRef}>
                <button
                  onClick={() => { setIsGenreDropdownOpen(!isGenreDropdownOpen); setIsStatusDropdownOpen(false); }}
                  className="flex items-center gap-2 px-4 py-2 bg-black border border-gray-700 rounded-lg text-white hover:border-gray-500 transition-colors"
                  data-testid="genre-filter-btn"
                >
                  <span className="font-mono text-sm uppercase tracking-widest">Browse by Genre</span>
                  <ChevronDown size={16} className={`transition-transform ${isGenreDropdownOpen ? 'rotate-180' : ''}`} />
                  {selectedGenre !== 'All' && (
                    <span className="ml-2 px-2 py-0.5 bg-electric-blue text-white text-xs rounded-full">
                      {selectedGenre}
                    </span>
                  )}
                </button>

                {/* Genre Desktop Popover */}
                {isGenreDropdownOpen && (
                  <>
                    {/* Desktop view */}
                    <div className="hidden md:block absolute top-full left-0 mt-2 bg-smoke-gray border border-gray-700 rounded-lg p-4 shadow-xl z-50 min-w-[300px]">
                      <div className="flex flex-wrap gap-2">
                        {genreOptions.map((genre) => (
                          <button
                            key={genre}
                            onClick={() => handleGenreSelect(genre)}
                            className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest transition-all ${
                              selectedGenre === genre
                                ? 'bg-electric-blue text-white'
                                : 'bg-black text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-700'
                            }`}
                            data-testid={`genre-chip-${genre.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            {genre}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Genre Mobile Bottom Sheet */}
                    <div className="md:hidden fixed inset-0 z-50">
                      <div className="absolute inset-0 bg-black/80" onClick={() => setIsGenreDropdownOpen(false)} />
                      <div className="absolute bottom-0 left-0 right-0 bg-smoke-gray border-t border-gray-700 rounded-t-2xl p-6 max-h-[70vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-white font-bold">Select Genre</h3>
                          <button onClick={() => setIsGenreDropdownOpen(false)} className="p-2 text-gray-400">
                            <X size={20} />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {genreOptions.map((genre) => (
                            <button
                              key={genre}
                              onClick={() => handleGenreSelect(genre)}
                              className={`px-4 py-2 rounded-full text-sm font-mono uppercase tracking-widest transition-all ${
                                selectedGenre === genre
                                  ? 'bg-electric-blue text-white'
                                  : 'bg-black text-gray-400 border border-gray-700'
                              }`}
                            >
                              {genre}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setSelectedGenre('All'); setIsGenreDropdownOpen(false); }}
                            className="flex-1 py-3 border border-gray-700 text-gray-400 rounded-lg font-mono text-sm uppercase"
                          >
                            Reset
                          </button>
                          <button
                            onClick={() => setIsGenreDropdownOpen(false)}
                            className="flex-1 py-3 bg-electric-blue text-white rounded-lg font-mono text-sm uppercase"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Status Dropdown */}
              <div className="relative" ref={statusDropdownRef}>
                <button
                  onClick={() => { setIsStatusDropdownOpen(!isStatusDropdownOpen); setIsGenreDropdownOpen(false); }}
                  className="flex items-center gap-2 px-4 py-2 bg-black border border-gray-700 rounded-lg text-white hover:border-gray-500 transition-colors"
                  data-testid="status-filter-btn"
                >
                  <span className="font-mono text-sm uppercase tracking-widest">Browse by Stage</span>
                  <ChevronDown size={16} className={`transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                  {selectedStatus !== 'All' && (
                    <span className="ml-2 px-2 py-0.5 bg-amber-500 text-black text-xs rounded-full">
                      {selectedStatus}
                    </span>
                  )}
                </button>

                {/* Status Desktop Popover */}
                {isStatusDropdownOpen && (
                  <>
                    {/* Desktop view */}
                    <div className="hidden md:block absolute top-full left-0 mt-2 bg-smoke-gray border border-gray-700 rounded-lg p-4 shadow-xl z-50 min-w-[340px]">
                      <div className="flex flex-wrap gap-2">
                        {STATUS_OPTIONS.map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusSelect(status)}
                            className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest transition-all ${
                              selectedStatus === status
                                ? 'bg-amber-500 text-black'
                                : 'bg-black text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-700'
                            }`}
                            data-testid={`status-chip-${status.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Status Mobile Bottom Sheet */}
                    <div className="md:hidden fixed inset-0 z-50">
                      <div className="absolute inset-0 bg-black/80" onClick={() => setIsStatusDropdownOpen(false)} />
                      <div className="absolute bottom-0 left-0 right-0 bg-smoke-gray border-t border-gray-700 rounded-t-2xl p-6 max-h-[70vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-white font-bold">Select Project Stage</h3>
                          <button onClick={() => setIsStatusDropdownOpen(false)} className="p-2 text-gray-400">
                            <X size={20} />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {STATUS_OPTIONS.map((status) => (
                            <button
                              key={status}
                              onClick={() => handleStatusSelect(status)}
                              className={`px-4 py-2 rounded-full text-sm font-mono uppercase tracking-widest transition-all ${
                                selectedStatus === status
                                  ? 'bg-amber-500 text-black'
                                  : 'bg-black text-gray-400 border border-gray-700'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setSelectedStatus('All'); setIsStatusDropdownOpen(false); }}
                            className="flex-1 py-3 border border-gray-700 text-gray-400 rounded-lg font-mono text-sm uppercase"
                          >
                            Reset
                          </button>
                          <button
                            onClick={() => setIsStatusDropdownOpen(false)}
                            className="flex-1 py-3 bg-amber-500 text-black rounded-lg font-mono text-sm uppercase"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Clear All Filters */}
              {(selectedGenre !== 'All' || selectedStatus !== 'All') && (
                <button
                  onClick={() => { setSelectedGenre('All'); setSelectedStatus('All'); }}
                  className="flex items-center gap-1 px-3 py-2 text-gray-400 hover:text-white text-sm transition-colors"
                  data-testid="clear-filters-btn"
                >
                  <X size={14} />
                  Clear filters
                </button>
              )}
            </div>
            <p className="text-gray-600 text-sm">Select a genre or stage to explore projects across our slate.</p>
          </div>
        </div>
      </section>

      {/* Films Grid */}
      <section className="films-grid-section py-16 bg-black">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-16">
              <RefreshCw className="w-8 h-8 text-electric-blue animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading films...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredFilms.map((film) => (
                  <button
                    key={film.id}
                    onClick={() => handleFilmClick(film)}
                    className="film-card group relative overflow-hidden rounded-lg aspect-[2/3] cursor-pointer border-2 border-transparent hover:border-white/30 transition-all duration-300"
                    data-testid="film-card"
                  >
                    {/* Poster / Placeholder */}
                    <div
                      className="absolute inset-0"
                      style={{ backgroundColor: film.poster_color || '#1a1a2e' }}
                    >
                      {film.poster_url ? (
                        <img
                          src={`${process.env.REACT_APP_BACKEND_URL}${film.poster_url}`}
                          alt={film.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        /* Designed placeholder - intentional, not error */
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
                          {/* Wolf Mark */}
                          <div className="w-12 h-12 mb-4 opacity-30">
                            <svg viewBox="0 0 100 100" fill="currentColor" className="text-electric-blue">
                              <path d="M50 10L20 40L10 90L50 70L90 90L80 40L50 10Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                              <circle cx="35" cy="45" r="4" fill="currentColor"/>
                              <circle cx="65" cy="45" r="4" fill="currentColor"/>
                            </svg>
                          </div>
                          {/* Film Title */}
                          <h4 className="text-white text-sm font-bold text-center mb-3 px-2 font-cinzel">
                            {film.title}
                          </h4>
                          {/* Status Badge */}
                          <span className="px-3 py-1 bg-electric-blue/20 border border-electric-blue/40 text-electric-blue text-[9px] font-mono uppercase tracking-widest rounded-full">
                            {film.status === 'Development' || film.status === 'Script' ? 'In Development' : 'Poster In Production'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Default State - Simple gradient with title */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-0">
                      {film.featured && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-electric-blue text-white text-[10px] font-mono uppercase tracking-widest rounded">
                          Featured
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="text-white font-bold text-sm line-clamp-2">{film.title}</h3>
                      </div>
                    </div>

                    {/* Hover State - Cinematic Lower-Third */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                      {/* Status Pill - Top Left */}
                      <div>
                        <span className="inline-block px-2 py-1 text-[10px] font-mono uppercase tracking-wider bg-white/10 text-white/80 rounded">
                          {film.status}
                        </span>
                      </div>
                      
                      {/* Lower Third Content */}
                      <div>
                        <h3 className="text-white font-bold text-sm mb-1">{film.title}</h3>
                        {film.tagline && (
                          <p className="text-gray-300 text-xs line-clamp-1 mb-2">{film.tagline}</p>
                        )}
                        <div className="flex items-end justify-between">
                          {/* Genre Tags */}
                          <div className="flex flex-wrap gap-1">
                            {film.genres?.slice(0, 3).map((genre, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 text-[10px] rounded bg-white/10 text-white/70"
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                          {/* View Cue */}
                          <span className="text-white/60 text-xs shrink-0 ml-2">
                            View →
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {filteredFilms.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-gray-400 text-xl">
                    {selectedGenre !== 'All' && selectedStatus !== 'All' 
                      ? `No ${selectedStatus} films found in ${selectedGenre}.`
                      : selectedGenre !== 'All'
                        ? `No films found in ${selectedGenre}.`
                        : selectedStatus !== 'All'
                          ? `No ${selectedStatus} films found.`
                          : 'No films found.'}
                  </p>
                  {(selectedGenre !== 'All' || selectedStatus !== 'All') && (
                    <button 
                      onClick={() => { setSelectedGenre('All'); setSelectedStatus('All'); }}
                      className="mt-4 text-electric-blue hover:underline"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Film Modal - opens via URL route */}
      <FilmModal film={selectedFilm} isOpen={!!selectedFilm} onClose={closeModal} />
    </div>
  );
};

export default Films;
