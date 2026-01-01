import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { films } from '../mock';
import { Play, Filter } from 'lucide-react';

const Films = () => {
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [filteredFilms, setFilteredFilms] = useState(films);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (selectedGenre === 'All') {
      setFilteredFilms(films);
    } else {
      setFilteredFilms(films.filter(film => film.genre.includes(selectedGenre)));
    }
  }, [selectedGenre]);

  const allGenres = ['All', ...new Set(films.flatMap(film => film.genre))];

  return (
    <div className="films-page pt-20">
      {/* Page Header */}
      <section className="page-header py-24 bg-gradient-to-br from-black via-smoke-gray to-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-electric-blue rounded-full filter blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">Our Films</h1>
          <p className="text-xl text-gray-400 max-w-2xl">Explore our collection of award-winning productions that push the boundaries of storytelling</p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="filter-section py-8 bg-smoke-gray border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Filter size={20} className="text-gray-400" />
            <span className="text-gray-400 font-mono text-sm uppercase tracking-widest">Filter by Genre:</span>
            <div className="flex gap-2 flex-wrap">
              {allGenres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-widest transition-all ${
                    selectedGenre === genre
                      ? 'bg-electric-blue text-white'
                      : 'bg-black text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-700'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Films Grid */}
      <section className="films-grid-section py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFilms.map((film) => (
              <Link
                key={film.id}
                to={`/films/${film.id}`}
                className="film-card group relative overflow-hidden rounded-lg bg-smoke-gray hover:transform hover:-translate-y-2 transition-all duration-300"
              >
                <div
                  className="film-poster aspect-[2/3] relative"
                  style={{ backgroundColor: film.posterColor }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-16 h-16 text-white" />
                  </div>
                  {film.featured && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-electric-blue text-black text-xs font-mono uppercase tracking-widest rounded-full">
                      Featured
                    </div>
                  )}
                </div>

                <div className="film-info p-6">
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-electric-blue transition-colors">
                    {film.title}
                  </h3>
                  <p className="text-gray-400 mb-3 italic">{film.tagline}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {film.genre.map((g, idx) => (
                      <span
                        key={idx}
                        className="genre-tag px-3 py-1 text-xs rounded-full bg-electric-blue/20 text-electric-blue border border-electric-blue/30 uppercase tracking-wide font-mono"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-gray-500">
                    {film.year} • {film.duration} • {film.rating}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredFilms.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-400 text-xl">No films found in this genre.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Films;