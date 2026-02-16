import React, { useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FilmModal = ({ film, isOpen, onClose }) => {
  const navigate = useNavigate();
  
  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !film) return null;

  // Navigate to the public project overview page
  const handleViewProject = () => {
    onClose();
    // Use slug if available, otherwise use id
    const filmSlug = film.slug || film.id;
    navigate(`/films/${filmSlug}`);
  };

  return (
    <div
      className="film-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
      onClick={onClose}
      style={{ animation: 'fadeIn 0.3s ease-out' }}
      data-testid="film-modal-overlay"
    >
      <div
        className="film-modal-content relative bg-black border border-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'scaleIn 0.3s ease-out' }}
        data-testid="film-modal-content"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/80 hover:bg-electric-blue rounded-full flex items-center justify-center transition-colors border border-gray-700 hover:border-electric-blue"
          data-testid="film-modal-close-btn"
        >
          <X size={20} className="text-white" />
        </button>

        {/* Content Layout: Side by Side */}
        <div className="flex flex-col md:flex-row">
          {/* Poster - Full 2:3 ratio with object-fit: contain */}
          <div className="md:w-1/3 flex-shrink-0">
            <div
              className="relative w-full aspect-[2/3] bg-gray-900"
              style={{ backgroundColor: film.posterColor || '#1a1a2e' }}
            >
              {film.posterUrl ? (
                <img
                  src={`${process.env.REACT_APP_BACKEND_URL}${film.posterUrl}`}
                  alt={film.title}
                  className="absolute inset-0 w-full h-full object-contain bg-black"
                  data-testid="film-modal-poster"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                  <div className="w-16 h-16 mb-4 opacity-30">
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

          {/* Content Side */}
          <div className="md:w-2/3 p-6 md:p-8 flex flex-col">
            {/* Status Badge */}
            <div className="mb-3">
              <span className="px-4 py-2 rounded-full bg-electric-blue/20 text-electric-blue border border-electric-blue/40 text-xs font-mono uppercase tracking-widest">
                {film.status}
              </span>
            </div>
            
            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 font-cinzel" data-testid="film-modal-title">
              {film.title}
            </h2>
            
            {/* Genres */}
            {film.genres && film.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {film.genres.map((genre, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Tagline */}
            {film.tagline && (
              <p className="text-xl text-gray-300 italic leading-relaxed mb-4">
                "{film.tagline}"
              </p>
            )}

            {/* Logline (brief) */}
            {film.logline && (
              <div className="text-gray-400 leading-relaxed mb-6 line-clamp-4">
                {film.logline.split('\n\n')[0]}
              </div>
            )}

            {/* Secondary Links */}
            <div className="flex items-center gap-4 mb-6">
              {film.imdbUrl && (
                <a
                  href={film.imdbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-200 text-sm transition-colors inline-flex items-center gap-1"
                >
                  View on IMDb
                  <span className="text-xs">↗</span>
                </a>
              )}
              {film.watchUrl && film.watchUrlTitle && (
                <>
                  {film.imdbUrl && <span className="text-gray-600">|</span>}
                  <a
                    href={film.watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-200 text-sm transition-colors inline-flex items-center gap-1"
                  >
                    {film.watchUrlTitle}
                    <span className="text-xs">↗</span>
                  </a>
                </>
              )}
            </div>

            {/* Spacer */}
            <div className="flex-grow" />

            {/* CTA - View Project Button */}
            <button
              onClick={handleViewProject}
              className="w-full bg-electric-blue hover:bg-electric-blue/90 text-white px-8 py-4 rounded-full font-mono text-sm uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2"
              data-testid="film-modal-view-project-btn"
            >
              View Project
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .film-modal-content::-webkit-scrollbar { width: 8px; }
        .film-modal-content::-webkit-scrollbar-track { background: #1a1a1a; }
        .film-modal-content::-webkit-scrollbar-thumb { background: #233dff; border-radius: 4px; }
      `}</style>
    </div>
  );
};

export default FilmModal;
