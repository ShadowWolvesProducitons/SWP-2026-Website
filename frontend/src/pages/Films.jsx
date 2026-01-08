import React, { useEffect, useState } from 'react';
import { Play, Filter, RefreshCw } from 'lucide-react';
import FilmModal from '../components/FilmModal';

const Films = () => {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [filteredFilms, setFilteredFilms] = useState([]);
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchFilms();
  }, []);

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

  useEffect(() => {
    if (selectedStatus === 'All') {
      setFilteredFilms(films);
    } else {
      setFilteredFilms(films.filter((film) => film.status === selectedStatus));
    }
  }, [selectedStatus, films]);

  const statusOptions = ['All', 'In Development', 'In Production', 'Released'];

  const handleFilmClick = (film) => {
    // Transform API data to match modal expectations
    const modalFilm = {
      ...film,
      posterColor: film.poster_color,
      imdbUrl: film.imdb_url,
      watchUrl: film.watch_url,
      posterUrl: film.poster_url
    };
    setSelectedFilm(modalFilm);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedFilm(null), 300);
  };

  return (
    <div className="films-page pt-20">
      {/* Page Header */}
      <section className="page-header py-24 bg-gradient-to-br from-black via-smoke-gray to-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-electric-blue rounded-full filter blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="md:text-7xl !font-bold !text-6xl mb-6 text-white">Films</h1>
          <p className="max-w-2xl !text-xl text-gray-400">Original screen stories — past, present, and in development.</p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="filter-section py-8 bg-smoke-gray border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Filter size={20} className="text-gray-400" />
            <span className="text-gray-400 font-mono text-sm uppercase tracking-widest">Filter by Status:</span>
            <div className="flex gap-2 flex-wrap">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-widest transition-all ${
                    selectedStatus === status
                      ? 'bg-electric-blue text-white'
                      : 'bg-black text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-700'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
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
                    className="film-card-flip group relative overflow-hidden rounded-lg aspect-[2/3] transition-all duration-300 cursor-pointer"
                  >
                    {/* Front - Poster */}
                    <div
                      className="film-poster-front absolute inset-0 transition-opacity duration-300 group-hover:opacity-0"
                      style={{ backgroundColor: film.poster_color || '#1a1a2e' }}
                    >
                      {film.poster_url && (
                        <img
                          src={`${process.env.REACT_APP_BACKEND_URL}${film.poster_url}`}
                          alt={film.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      {film.featured && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-electric-blue text-white text-xs font-mono uppercase tracking-widest rounded-full">
                          Featured
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="text-white font-bold text-sm line-clamp-2">{film.title}</h3>
                      </div>
                    </div>

                    {/* Back - Info on Hover */}
                    <div className="film-poster-back absolute inset-0 bg-electric-blue/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-center">
                      <h3 className="text-white font-bold text-base mb-2">{film.title}</h3>
                      <p className="text-white/90 text-xs mb-3 line-clamp-3 italic">{film.logline}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {film.themes?.slice(0, 2).map((theme, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-xs rounded-full bg-white/20 text-white uppercase font-mono"
                          >
                            {theme}
                          </span>
                        ))}
                      </div>
                      <div className="text-white text-xs uppercase">{film.status}</div>
                      <div className="flex items-center justify-center mt-3">
                        <Play className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {filteredFilms.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-gray-400 text-xl">No films found with this status.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Film Modal */}
      <FilmModal film={selectedFilm} isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default Films;
