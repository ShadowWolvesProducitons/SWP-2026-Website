import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { films } from '../mock';
import { ArrowLeft, Play, Calendar, Clock, Award, User } from 'lucide-react';

const FilmDetail = () => {
  const { id } = useParams();
  const [film, setFilm] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const foundFilm = films.find(f => f.id === parseInt(id));
    setFilm(foundFilm);
  }, [id]);

  if (!film) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-xl">Film not found</p>
      </div>
    );
  }

  return (
    <div className="film-detail-page pt-20 bg-black">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <Link
          to="/films"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-mono text-sm uppercase tracking-widest">Back to Films</span>
        </Link>
      </div>

      {/* Film Header */}
      <section className="film-header-section relative">
        <div
          className="film-hero h-[60vh] relative"
          style={{
            background: `linear-gradient(to bottom, transparent, black), ${film.posterColor}`
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="container mx-auto px-4 h-full flex items-end relative z-10 pb-12">
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                {film.genre.map((g, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 text-xs rounded-full bg-gold-accent text-black uppercase tracking-wide font-mono"
                  >
                    {g}
                  </span>
                ))}
              </div>
              <h1 className="text-6xl md:text-7xl font-bold text-white mb-4">{film.title}</h1>
              <p className="text-2xl text-gray-300 italic mb-6">{film.tagline}</p>
              <div className="flex flex-wrap gap-6 text-gray-300">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-crimson-red" />
                  <span>{film.year}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-crimson-red" />
                  <span>{film.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={18} className="text-crimson-red" />
                  <span>{film.rating}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Film Content */}
      <section className="film-content-section py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Trailer */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <Play className="text-crimson-red" />
                  Watch Trailer
                </h2>
                <div className="aspect-video bg-smoke-gray rounded-lg overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    src={film.trailerUrl}
                    title="Film Trailer"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>

              {/* Synopsis */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-white mb-6">Synopsis</h2>
                <p className="text-gray-300 text-lg leading-relaxed">{film.synopsis}</p>
              </div>

              {/* Cast */}
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">Cast</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {film.cast.map((actor, idx) => (
                    <div
                      key={idx}
                      className="cast-card bg-smoke-gray p-4 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-crimson-red/20 border-2 border-crimson-red flex items-center justify-center flex-shrink-0">
                          <User size={24} className="text-crimson-red" />
                        </div>
                        <div>
                          <div className="text-white font-bold">{actor.name}</div>
                          <div className="text-gray-400 text-sm">{actor.role}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Crew */}
              <div className="bg-smoke-gray p-6 rounded-lg mb-8">
                <h3 className="text-2xl font-bold text-white mb-6">Crew</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-gray-400 text-sm uppercase tracking-wide mb-1">Director</div>
                    <div className="text-white font-bold">{film.director}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm uppercase tracking-wide mb-1">Producer</div>
                    <div className="text-white font-bold">{film.producer}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm uppercase tracking-wide mb-1">Writer</div>
                    <div className="text-white font-bold">{film.writer}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm uppercase tracking-wide mb-1">Cinematographer</div>
                    <div className="text-white font-bold">{film.cinematographer}</div>
                  </div>
                </div>
              </div>

              {/* Film Details */}
              <div className="bg-smoke-gray p-6 rounded-lg">
                <h3 className="text-2xl font-bold text-white mb-6">Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Release Year</span>
                    <span className="text-white font-bold">{film.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Runtime</span>
                    <span className="text-white font-bold">{film.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rating</span>
                    <span className="text-white font-bold">{film.rating}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-700">
                    <span className="text-gray-400 block mb-2">Genres</span>
                    <div className="flex flex-wrap gap-2">
                      {film.genre.map((g, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 text-xs rounded-full bg-gold-accent/20 text-gold-accent border border-gold-accent/30 uppercase tracking-wide font-mono"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FilmDetail;