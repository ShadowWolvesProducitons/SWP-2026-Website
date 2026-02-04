import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Services content data
const SERVICES_CONTENT = {
  development: {
    title: 'Development',
    tagline: 'This is where projects are won or quietly fall apart.',
    body: `We work at the foundation — concept, script, and structure.

From early ideas to production-ready drafts, we help shape stories that hold up under pressure and resonate on screen.`,
    includes: [
      'Script development (features, shorts, series)',
      'Story consultation and concept refinement',
      'Structural and character work',
      'Creative direction during early development'
    ],
    focus: 'Focus: clarity, intent, long-term viability.'
  },
  preproduction: {
    title: 'Pre-Production',
    tagline: 'Strong films are built before the camera rolls.',
    body: `We handle planning, breakdowns, casting support, and logistics so productions move with purpose — not panic.`,
    includes: [
      'Script breakdowns and planning',
      'Casting support and creative input',
      'Scheduling and readiness reviews',
      'Development-to-production handover'
    ],
    focus: 'Priorities: clarity, efficiency, readiness.'
  },
  postproduction: {
    title: 'Post-Production',
    tagline: 'Final shape. Final impact.',
    body: `Editing, colour, sound, and mix are narrative decisions. We collaborate closely through post to ensure the finished film delivers on its promise — emotionally and technically.`,
    includes: [],
    priorities: [
      'Narrative cohesion',
      'Technical polish',
      'Emotional impact'
    ],
    focus: ''
  }
};

const ServicesModal = ({ open, onClose, serviceKey }) => {
  const navigate = useNavigate();
  
  const content = SERVICES_CONTENT[serviceKey];

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  // Focus trap
  useEffect(() => {
    if (open) {
      const modal = document.getElementById('services-modal');
      if (modal) {
        modal.focus();
      }
    }
  }, [open]);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleEnquire = () => {
    onClose();
    navigate(`/contact?service=${serviceKey}`);
  };

  if (!content) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="services-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
          onClick={handleOverlayClick}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
        >
          {/* Modal Container */}
          <motion.div
            id="services-modal"
            tabIndex={-1}
            className="relative w-full max-w-[700px] max-h-[90vh] overflow-y-auto rounded-[22px] bg-[#0f0f0f] border border-gray-800 shadow-2xl focus:outline-none"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ 
              duration: 0.18, 
              ease: [0.16, 1, 0.3, 1] 
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#0f0f0f] border-b border-gray-800 px-6 md:px-8 py-5 flex items-start justify-between z-10">
              <div>
                <h2 
                  id="modal-title" 
                  className="text-2xl md:text-3xl font-bold text-white"
                  style={{ fontFamily: 'Cinzel, serif' }}
                >
                  {content.title}
                </h2>
                <p className="text-gray-400 text-sm md:text-base mt-1 italic">
                  {content.tagline}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 md:p-8">
              {/* Body Text */}
              <div className="text-gray-300 text-base md:text-lg leading-relaxed whitespace-pre-line mb-6">
                {content.body}
              </div>

              {/* Includes List */}
              {content.includes && content.includes.length > 0 && (
                <div className="mb-6">
                  <p className="text-gray-400 text-sm mb-4">This includes:</p>
                  <ul className="space-y-3">
                    {content.includes.map((item, idx) => (
                      <li key={idx} className="text-gray-300 flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-electric-blue mt-2 flex-shrink-0"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Priorities (for post-production) */}
              {content.priorities && content.priorities.length > 0 && (
                <div className="mb-6">
                  <p className="text-gray-400 text-sm mb-4">We prioritise:</p>
                  <ul className="space-y-3">
                    {content.priorities.map((item, idx) => (
                      <li key={idx} className="text-gray-300 flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-electric-blue mt-2 flex-shrink-0"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Focus Statement */}
              {content.focus && (
                <p className="text-gray-500 text-sm italic mb-8">{content.focus}</p>
              )}

              {/* Enquire Button */}
              <button
                onClick={handleEnquire}
                className="w-full px-6 py-4 bg-electric-blue hover:bg-electric-blue/90 text-white rounded-full font-mono text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                Enquire
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ServicesModal;
