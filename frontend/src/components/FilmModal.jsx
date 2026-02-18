import React, { useEffect } from 'react';
import { X, ArrowRight, Play, Lock, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// IMDB Logo URL
const IMDB_LOGO = "https://customer-assets.emergentagent.com/job_68938027-079c-4f84-ad55-d8d458f6dee5/artifacts/34y7ru4y_IMDB_Logo_2016.svg";

const FilmModal = ({ film, isOpen, onClose }) => {
  const navigate = useNavigate();
  
  // Manage body scroll when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable body scroll when modal closes
      document.body.style.overflow = '';
    }
    
    return () => {
      // Cleanup: always re-enable scroll on unmount
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    // Handle browser back button
    const handlePopState = () => {
      // If modal is open when back is pressed, the navigation will already happen via URL change
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      window.addEventListener('popstate', handlePopState);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);

  // Handle navigation with scroll reset
  const handleNavigate = (path) => {
    // Reset body scroll before navigation
    document.body.style.overflow = '';
    onClose();
  };

  if (!isOpen || !film) return null;

  // Check if film is released
  const isReleased = film.status?.toLowerCase() === 'released';

  return (
    <div
      className="film-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
      onClick={onClose}
      style={{ animation: 'fadeIn 0.3s ease-out' }}
      data-testid="film-modal-overlay"
    >
      <div
        className="film-modal-content relative bg-black border border-gray-800 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto"
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
        <div className="flex flex-col md:flex-row p-6 md:p-8 gap-6 md:gap-8">
          {/* Poster with frame and shadow */}
          <div className="md:w-2/5 flex-shrink-0">
            <div className="relative">
              {/* Poster Frame with shadow and fade */}
              <div 
                className="relative rounded-lg overflow-hidden shadow-2xl shadow-black/50"
                style={{
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255,255,255,0.1), inset 0 0 80px rgba(0,0,0,0.3)'
                }}
              >
                {/* Vignette overlay for fade effect */}
                <div 
                  className="absolute inset-0 z-10 pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.4) 100%)'
                  }}
                />
                
                <div
                  className="relative w-full aspect-[2/3]"
                  style={{ backgroundColor: film.posterColor || '#1a1a2e' }}
                >
                  {film.posterUrl ? (
                    <img
                      src={`${process.env.REACT_APP_BACKEND_URL}${film.posterUrl}`}
                      alt={film.title}
                      className="w-full h-full object-cover"
                      data-testid="film-modal-poster"
                    />
                  ) : (
                    /* Intentional placeholder for missing poster */
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-black to-gray-900">
                      <div className="w-16 h-16 mb-4 opacity-30">
                        <svg viewBox="0 0 100 100" fill="currentColor" className="text-electric-blue">
                          <path d="M50 10L20 40L10 90L50 70L90 90L80 40L50 10Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <circle cx="35" cy="45" r="4" fill="currentColor"/>
                          <circle cx="65" cy="45" r="4" fill="currentColor"/>
                        </svg>
                      </div>
                      <h4 className="text-white text-lg font-bold text-center mb-3 px-2 font-cinzel">
                        {film.title}
                      </h4>
                      {film.status && (
                        <span className="px-3 py-1 bg-electric-blue/20 border border-electric-blue/40 text-electric-blue text-xs font-mono uppercase tracking-widest rounded-full">
                          {film.status}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content Side */}
          <div className="md:w-3/5 flex flex-col">
            {/* Status Badge - Only if status exists */}
            {film.status && (
              <div className="mb-3">
                <span className="px-4 py-2 rounded-full bg-electric-blue/20 text-electric-blue border border-electric-blue/40 text-xs font-mono uppercase tracking-widest">
                  {film.status}
                </span>
              </div>
            )}
            
            {/* Title Row with IMDB */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <h2 className="text-3xl md:text-4xl font-bold text-white font-cinzel" data-testid="film-modal-title">
                {film.title}
              </h2>
              {/* IMDB Link - Only if exists */}
              {film.imdbUrl && (
                <a
                  href={film.imdbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity"
                  title="View on IMDb"
                >
                  <img src={IMDB_LOGO} alt="IMDb" className="h-8 w-auto" />
                </a>
              )}
            </div>
            
            {/* Genres - Only if exists and has items */}
            {film.genres && film.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {film.genres.slice(0, 3).map((genre, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Tagline - Only if exists */}
            {film.tagline && (
              <p className="text-xl text-gray-300 italic leading-relaxed mb-4">
                "{film.tagline}"
              </p>
            )}

            {/* Logline - Only if exists */}
            {film.logline && (
              <div className="text-gray-400 leading-relaxed mb-6">
                {film.logline}
              </div>
            )}

            {/* Spacer */}
            <div className="flex-grow" />

            {/* CTA - Based on Film Status */}
            {isReleased ? (
              /* Released films: Watch Now button */
              <div className="space-y-3">
                {film.watchUrl ? (
                  <a
                    href={film.watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-electric-blue hover:bg-electric-blue/90 text-white px-8 py-4 rounded-full font-mono text-sm uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2"
                    data-testid="film-modal-watch-btn"
                  >
                    <Play size={18} />
                    Watch Now
                  </a>
                ) : null}
                <Link
                  to="/contact"
                  onClick={onClose}
                  className="w-full border border-gray-600 hover:border-gray-400 text-white px-8 py-4 rounded-full font-mono text-sm uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2"
                  data-testid="film-modal-contact-btn"
                >
                  <Mail size={18} />
                  Contact Us
                </Link>
              </div>
            ) : (
              /* Development/Pre-Production/etc: Studio Portal CTA */
              <div className="space-y-4">
                <div className="bg-smoke-gray border border-gray-700 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Lock size={20} className="text-electric-blue flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        This film is currently in <span className="text-white font-medium">{film.status?.toLowerCase()}</span>. 
                        To access confidential materials, financials, and project updates, request access to our Studio Portal.
                      </p>
                    </div>
                  </div>
                </div>
                <Link
                  to="/request-access"
                  onClick={onClose}
                  className="w-full bg-electric-blue hover:bg-electric-blue/90 text-white px-8 py-4 rounded-full font-mono text-sm uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2"
                  data-testid="film-modal-request-access-btn"
                >
                  Request Studio Access
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/contact"
                  onClick={onClose}
                  className="w-full border border-gray-600 hover:border-gray-400 text-white px-8 py-4 rounded-full font-mono text-sm uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2"
                  data-testid="film-modal-contact-btn"
                >
                  <Mail size={18} />
                  Contact Us
                </Link>
              </div>
            )}
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
