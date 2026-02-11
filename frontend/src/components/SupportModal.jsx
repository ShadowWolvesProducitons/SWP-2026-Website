import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Additional support content
const SUPPORT_CONTENT = {
  'script-coverage': {
    emoji: '📝',
    title: 'Script Coverage',
    tagline: 'Clear-eyed notes. No hand-holding.',
    body: `We provide professional script coverage focused on structure, character, pacing, and execution — not vague opinions.`,
    includes: [
      'A concise written report',
      'Strengths and weaknesses called out directly',
      'Practical suggestions for improvement',
      'Market and development context (where relevant)'
    ],
    cta: 'This is designed to give you clarity on what\'s working, what isn\'t, and what to do next.'
  },
  'development-notes': {
    emoji: '🧠',
    title: 'Development Notes',
    tagline: 'Targeted feedback for projects already in motion.',
    body: `Development notes are for scripts or concepts past the early idea stage that need sharper focus, not a full rewrite.`,
    includes: [
      'Structural and story logic notes',
      'Character clarity and motivation checks',
      'Tone and thematic alignment',
      'Specific problem-solving suggestions'
    ],
    cta: 'Focused input. Actionable direction. No endless cycles.'
  },
  'pitch-materials': {
    emoji: '🎯',
    title: 'Pitch Materials',
    tagline: 'Make the idea land before the script is read.',
    body: `We help shape pitch materials that communicate your project clearly and confidently — without overselling or noise.`,
    includes: [
      'Logline refinement',
      'One-page summaries',
      'Pitch decks and lookbooks',
      'Verbal pitch structure'
    ],
    cta: 'The goal is simple: make decision-makers understand the project quickly and take it seriously.'
  },
  'creative-consulting': {
    emoji: '🐺',
    title: 'Creative Consulting',
    tagline: 'A second brain when it matters.',
    body: `Creative consulting is strategic support for filmmakers, producers, or teams navigating key decisions.`,
    includes: [
      'Development strategy',
      'Creative problem-solving',
      'Project positioning',
      'Directional feedback at critical moments'
    ],
    cta: 'It\'s not ongoing management. It\'s clarity when you need it most.'
  }
};

const SupportModal = ({ open, onClose, supportKey }) => {
  const navigate = useNavigate();
  
  const content = SUPPORT_CONTENT[supportKey];

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

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleEnquire = () => {
    onClose();
    navigate(`/contact?service=${supportKey}`);
  };

  if (!content) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
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
            tabIndex={-1}
            className="relative w-full max-w-[550px] max-h-[90vh] overflow-y-auto rounded-[22px] bg-[#0f0f0f] border border-gray-800 shadow-2xl focus:outline-none"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ 
              duration: 0.18, 
              ease: [0.16, 1, 0.3, 1] 
            }}
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#0f0f0f] border-b border-gray-800 px-6 py-5 flex items-start justify-between z-10">
              <div>
                <h2 
                  className="text-xl md:text-2xl font-bold text-white flex items-center gap-3 font-cinzel"
                >
                  <span className="text-2xl">{content.emoji}</span>
                  {content.title}
                </h2>
                <p className="text-gray-400 text-sm mt-1 italic">
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
            <div className="p-6">
              {/* Body Text */}
              <p className="text-gray-300 text-base leading-relaxed mb-6">
                {content.body}
              </p>

              {/* You'll receive / This includes */}
              {content.includes && content.includes.length > 0 && (
                <div className="mb-6">
                  <p className="text-gray-400 text-sm mb-3">You'll receive:</p>
                  <ul className="space-y-2">
                    {content.includes.map((item, idx) => (
                      <li key={idx} className="text-gray-300 flex items-start gap-3 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-electric-blue mt-1.5 flex-shrink-0"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA Statement */}
              {content.cta && (
                <p className="text-gray-500 text-sm italic mb-8">{content.cta}</p>
              )}

              {/* Enquire Button */}
              <button
                onClick={handleEnquire}
                className="w-full px-6 py-4 bg-electric-blue hover:bg-electric-blue/90 text-white rounded-full font-mono text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                Enquire about {content.title}
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SupportModal;
