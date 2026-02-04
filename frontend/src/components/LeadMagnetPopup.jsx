import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const LeadMagnetPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Check if popup should show
  const shouldShowPopup = useCallback(() => {
    // Never show if already subscribed
    if (localStorage.getItem('swp_subscribed') === 'true') return false;
    
    // Don't show if dismissed within last 7 days
    const dismissedAt = localStorage.getItem('swp_popup_dismissed');
    if (dismissedAt) {
      const dismissedDate = new Date(dismissedAt);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) return false;
    }

    // Only show on specific pages
    const allowedPaths = ['/', '/about', '/blog'];
    const currentPath = window.location.pathname;
    const isBlogPost = currentPath.startsWith('/blog/');
    
    if (!allowedPaths.includes(currentPath) && !isBlogPost) return false;

    return true;
  }, []);

  useEffect(() => {
    if (!shouldShowPopup()) return;

    let triggered = false;
    let timeoutId;
    let scrollTriggered = false;

    // Timer trigger (45 seconds)
    timeoutId = setTimeout(() => {
      if (!triggered && shouldShowPopup()) {
        triggered = true;
        setIsVisible(true);
      }
    }, 45000);

    // Scroll trigger (50%)
    const handleScroll = () => {
      if (scrollTriggered || triggered) return;
      
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent >= 50 && shouldShowPopup()) {
        scrollTriggered = true;
        triggered = true;
        setIsVisible(true);
      }
    };

    // Exit intent trigger (desktop only)
    const handleMouseLeave = (e) => {
      if (triggered) return;
      if (e.clientY <= 0 && shouldShowPopup()) {
        triggered = true;
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [shouldShowPopup]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('swp_popup_dismissed', new Date().toISOString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          source: 'lead_magnet_popup',
          lead_magnet: 'producers_playbook'
        })
      });

      if (response.ok) {
        toast.success("You're in! Check your email for the Producer's Playbook.");
        localStorage.setItem('swp_subscribed', 'true');
        setIsVisible(false);
      } else {
        const error = await response.json();
        if (error.detail?.includes('already subscribed')) {
          toast.info("You're already in the pack! Check your email.");
          localStorage.setItem('swp_subscribed', 'true');
          setIsVisible(false);
        } else {
          toast.error(error.detail || 'Something went wrong');
        }
      }
    } catch (err) {
      toast.error('Connection error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleDismiss}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md bg-[#0a0a0a] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/5 z-10"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* Content */}
            <div className="p-8">
              {/* Mockup Image */}
              <div className="mb-6">
                <img 
                  src="https://customer-assets.emergentagent.com/job_04afc1ac-41b6-4e3d-938f-409263bdaadd/artifacts/i8yb09b1_The%20Producer-s%20Playbook%20Mockup.png"
                  alt="The Producer's Playbook"
                  className="w-48 h-auto mx-auto"
                />
              </div>

              {/* Heading */}
              <h2 
                className="text-2xl font-bold text-white text-center mb-2"
                style={{ fontFamily: 'Cinzel, serif' }}
              >
                Producer's Playbook
              </h2>
              <p className="text-electric-blue text-sm text-center mb-4 font-mono uppercase tracking-widest">
                Free Download
              </p>

              {/* Description */}
              <p className="text-gray-400 text-center text-sm mb-6 leading-relaxed">
                Get the step-by-step filmmaking checklist we use on every production — from development to distribution.
                <br /><br />
                No chaos. No guesswork. Just a clean production roadmap.
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-5 py-4 rounded-xl bg-black border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-electric-blue transition-colors"
                  disabled={submitting}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-6 py-4 bg-electric-blue hover:bg-electric-blue/90 disabled:bg-electric-blue/50 text-white rounded-xl font-mono text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>Get the Playbook</>
                  )}
                </button>
              </form>

              {/* Footer - Newsletter mention */}
              <p className="text-gray-600 text-xs text-center mt-4">
                You'll also join our newsletter for industry updates. Unsubscribe anytime.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LeadMagnetPopup;
