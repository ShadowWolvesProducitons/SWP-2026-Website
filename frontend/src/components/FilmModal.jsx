import React, { useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';

const FilmModal = ({ film, isOpen, onClose }) => {
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

  // Get CTA based on status
  const getCTA = () => {
    // For Development stages
    if (['Development', 'Packaging', 'Pre-Production'].includes(film.status)) {
      return {
        text: 'Partnership & Development Enquiries',
        action: () => window.location.href = 'mailto:admin@shadowwolvesproductions.com.au?subject=Partnership Enquiry: ' + film.title
      };
    }
    // For Production stages
    if (['Filming', 'Post-Production', 'Marketing'].includes(film.status)) {
      return {
        text: 'Festival & Distribution Enquiries',
        action: () => window.location.href = 'mailto:admin@shadowwolvesproductions.com.au?subject=Festival Enquiry: ' + film.title
      };
    }
    // For Released
    if (film.status === 'Released') {
      if (film.watchUrl) {
        return {
          text: film.watchUrlTitle || 'Watch Now',
          action: () => window.open(film.watchUrl, '_blank')
        };
      }
      return {
        text: 'Screening Enquiries',
        action: () => window.location.href = 'mailto:admin@shadowwolvesproductions.com.au?subject=Screening Enquiry: ' + film.title
      };
    }
    return null;
  };

  const cta = getCTA();

  return (
    <div
      className="film-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
      onClick={onClose}
      style={{ animation: 'fadeIn 0.3s ease-out' }}
    >
      <div
        className="film-modal-content relative bg-black border border-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'scaleIn 0.3s ease-out' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/80 hover:bg-electric-blue rounded-full flex items-center justify-center transition-colors border border-gray-700 hover:border-electric-blue"
        >
          <X size={20} className="text-white" />
        </button>

        {/* Hero Image */}
        <div
          className="modal-hero relative h-80 bg-gradient-to-br from-black to-gray-900"
          style={{ backgroundColor: film.posterColor || '#1a1a2e' }}
        >
          {film.posterUrl && (
            <img
              src={`${process.env.REACT_APP_BACKEND_URL}${film.posterUrl}`}
              alt={film.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="mb-3">
              <span className="px-4 py-2 rounded-full bg-electric-blue/20 text-electric-blue border border-electric-blue/40 text-xs font-mono uppercase tracking-widest">
                {film.status}
              </span>
            </div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-5xl font-bold text-white mb-3 font-cinzel">
                  {film.title}
                </h2>
                {/* Genres - Under Title */}
                {film.genres && film.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2">
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
              </div>
              {/* Secondary Links */}
              <div className="flex items-center gap-4 mb-2 shrink-0">
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
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="modal-body p-8 space-y-8">
          {/* Tagline */}
          {film.tagline && (
            <div className="tagline">
              <p className="text-2xl text-gray-300 italic leading-relaxed">
                "{film.tagline}"
              </p>
            </div>
          )}

          {/* Logline */}
          {film.logline && (
            <div className="logline space-y-4">
              {film.logline.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="text-gray-400 text-lg leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          )}

          {/* CTA */}
          {cta && (
            <div className="cta pt-4">
              <button
                onClick={cta.action}
                className="w-full bg-electric-blue hover:bg-electric-blue/90 text-white px-8 py-4 rounded-full font-mono text-sm uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2"
              >
                {cta.text}
                <ArrowRight size={18} />
              </button>
            </div>
          )}
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
