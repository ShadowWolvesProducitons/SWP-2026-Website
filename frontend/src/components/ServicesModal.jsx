import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ArrowRight } from 'lucide-react';
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

// Additional support content
const ADDITIONAL_SUPPORT = {
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

const ServicesModal = ({ open, onClose, serviceKey }) => {
  const [expandedSupport, setExpandedSupport] = useState(null);
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

  const toggleSupport = (key) => {
    setExpandedSupport(expandedSupport === key ? null : key);
  };

  const handleEnquire = (service) => {
    onClose();
    navigate(`/contact?service=${service}`);
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
            className="relative w-full max-w-[950px] max-h-[90vh] overflow-y-auto rounded-[22px] bg-[#0f0f0f] border border-gray-800 shadow-2xl focus:outline-none"
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

            {/* Body - Two Column Layout */}
            <div className="p-6 md:p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Content - Left */}
                <div className="flex-1">
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
                    <p className="text-gray-500 text-sm italic">{content.focus}</p>
                  )}
                </div>

                {/* Additional Support Panel - Right */}
                <div className="lg:w-[320px] lg:flex-shrink-0">
                  <div className="bg-black/50 border border-gray-800 rounded-xl p-5">
                    <h3 className="text-white font-semibold text-lg mb-2">Additional Support</h3>
                    <p className="text-gray-500 text-xs mb-5">
                      Targeted support without long-term commitments.
                    </p>

                    {/* Support Chips / Accordions */}
                    <div className="space-y-2">
                      {Object.entries(ADDITIONAL_SUPPORT).map(([key, support]) => (
                        <div key={key} className="overflow-hidden rounded-lg">
                          {/* Chip Button */}
                          <button
                            onClick={() => toggleSupport(key)}
                            className={`w-full px-4 py-3 flex items-center justify-between text-left transition-all rounded-lg border ${
                              expandedSupport === key
                                ? 'bg-electric-blue/10 border-electric-blue/40 text-white'
                                : 'bg-black/30 border-gray-700 text-gray-300 hover:border-gray-600 hover:text-white'
                            }`}
                          >
                            <span className="flex items-center gap-2 text-sm font-medium">
                              <span>{support.emoji}</span>
                              {support.title}
                            </span>
                            <ChevronDown 
                              size={16} 
                              className={`transition-transform ${expandedSupport === key ? 'rotate-180' : ''}`}
                            />
                          </button>

                          {/* Expanded Content */}
                          <AnimatePresence>
                            {expandedSupport === key && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 py-4 bg-black/20 border-x border-b border-gray-800 rounded-b-lg">
                                  <p className="text-white text-sm font-medium mb-1">{support.tagline}</p>
                                  <p className="text-gray-400 text-xs mb-3">{support.body}</p>
                                  
                                  {support.includes && support.includes.length > 0 && (
                                    <ul className="space-y-1 mb-3">
                                      {support.includes.map((item, idx) => (
                                        <li key={idx} className="text-gray-400 text-xs flex items-start gap-2">
                                          <span className="w-1 h-1 rounded-full bg-electric-blue mt-1.5 flex-shrink-0"></span>
                                          {item}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                  
                                  {support.cta && (
                                    <p className="text-gray-500 text-xs italic mb-3">{support.cta}</p>
                                  )}
                                  
                                  <button
                                    onClick={() => handleEnquire(key)}
                                    className="w-full mt-2 px-4 py-2 bg-electric-blue/20 hover:bg-electric-blue/30 text-electric-blue text-xs font-mono uppercase tracking-widest rounded-full transition-colors flex items-center justify-center gap-2"
                                  >
                                    Enquire
                                    <ArrowRight size={12} />
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ServicesModal;
