import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  Shield, Lock, Download, FileText, Calendar, Mail, 
  Building, DollarSign, Target, Film, Users, AlertTriangle,
  CheckCircle, RefreshCw, ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const StudioAccess = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [film, setFilm] = useState(null);
  const [user, setUser] = useState(null);
  const [ndaAgreed, setNdaAgreed] = useState(false);
  const [confidentialityAgreed, setConfidentialityAgreed] = useState(false);
  const [showNdaModal, setShowNdaModal] = useState(false);
  const [scriptAccessGranted, setScriptAccessGranted] = useState(false);
  const [downloadingDeck, setDownloadingDeck] = useState(false);
  const [downloadingScript, setDownloadingScript] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Access token required');
      setLoading(false);
      return;
    }
    verifyAccess();
  }, [slug, token]);

  const verifyAccess = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/studio-access/verify/${slug}?token=${token}`
      );
      
      const data = await response.json();
      
      if (response.ok) {
        setFilm(data.film);
        setUser(data.user);
      } else {
        setError(data.detail || 'Access denied');
      }
    } catch (err) {
      console.error('Verification failed:', err);
      setError('Failed to verify access');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDeck = async () => {
    if (!film?.pitch_deck_url) {
      toast.error('Pitch deck not available');
      return;
    }
    
    setDownloadingDeck(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/studio-access/watermark/${slug}/pitch_deck?token=${token}`,
        { method: 'POST' }
      );
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${film.title}_Pitch_Deck_CONFIDENTIAL.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast.success('Pitch deck downloaded');
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || 'Download failed');
      }
    } catch (err) {
      toast.error('Failed to download pitch deck');
    } finally {
      setDownloadingDeck(false);
    }
  };

  const handleNdaSubmit = async () => {
    if (!ndaAgreed || !confidentialityAgreed) {
      toast.error('Please agree to all terms');
      return;
    }
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/studio-access/nda-confirm/${slug}?token=${token}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nda_agreed: true, confidentiality_agreed: true })
        }
      );
      
      if (response.ok) {
        setScriptAccessGranted(true);
        setShowNdaModal(false);
        toast.success('Script access granted');
      } else {
        toast.error('Failed to confirm NDA');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  const handleDownloadScript = async () => {
    if (!film?.script_url) {
      toast.error('Script not available');
      return;
    }
    
    if (!scriptAccessGranted) {
      setShowNdaModal(true);
      return;
    }
    
    setDownloadingScript(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/studio-access/watermark/${slug}/script?token=${token}`,
        { method: 'POST' }
      );
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${film.title}_Script_CONFIDENTIAL.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast.success('Script downloaded');
      } else {
        toast.error('Download failed');
      }
    } catch (err) {
      toast.error('Failed to download script');
    } finally {
      setDownloadingScript(false);
    }
  };

  const handleScheduleCall = () => {
    window.location.href = `mailto:admin@shadowwolvesproductions.com.au?subject=Schedule Call: ${film?.title}&body=Hi,%0D%0A%0D%0AI would like to schedule a call to discuss ${film?.title}.%0D%0A%0D%0ABest regards,%0D%0A${user?.name}%0D%0A${user?.company || ''}`;
  };

  const handleExpressInterest = () => {
    window.location.href = `mailto:admin@shadowwolvesproductions.com.au?subject=Expression of Interest: ${film?.title}&body=Hi,%0D%0A%0D%0AI am writing to express my interest in ${film?.title}.%0D%0A%0D%0A[Please describe your interest, background, and any specific questions]%0D%0A%0D%0ABest regards,%0D%0A${user?.name}%0D%0A${user?.company || ''}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-electric-blue animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Lock className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4 font-cinzel">Access Denied</h1>
          <p className="text-gray-400 mb-8">{error}</p>
          <p className="text-gray-500 text-sm">
            If you believe this is an error, please contact us at{' '}
            <a href="mailto:admin@shadowwolvesproductions.com.au" className="text-electric-blue hover:underline">
              admin@shadowwolvesproductions.com.au
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{film?.title} | Studio Access | Shadow Wolves Productions</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="studio-access-page min-h-screen bg-black" data-testid="studio-access-page">
        {/* Confidential Banner */}
        <div className="bg-yellow-500/10 border-b border-yellow-500/30">
          <div className="container mx-auto px-4 py-3 flex items-center justify-center gap-3">
            <Shield className="w-5 h-5 text-yellow-500" />
            <span className="text-yellow-500 text-sm font-mono uppercase tracking-wider">
              Confidential — For {user?.name} Only
            </span>
          </div>
        </div>

        {/* Header */}
        <header className="py-8 border-b border-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-white font-cinzel" data-testid="studio-access-title">
                    {film?.title}
                  </h1>
                  <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-mono uppercase rounded-full border border-red-500/30">
                    Confidential
                  </span>
                </div>
                <p className="text-gray-400">Studio Access Portal</p>
              </div>
              <div className="text-right hidden md:block">
                <p className="text-gray-500 text-sm">Viewing as:</p>
                <p className="text-white">{user?.name}</p>
                {user?.company && <p className="text-gray-400 text-sm">{user?.company}</p>}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Left Column - Project Snapshot */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Project Snapshot */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-smoke-gray border border-gray-800 rounded-lg p-6"
                >
                  <h2 className="text-xs font-mono uppercase tracking-widest text-electric-blue mb-6">
                    Project Snapshot
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Genre */}
                    {film?.genres?.length > 0 && (
                      <div className="flex items-start gap-3">
                        <Film className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                          <span className="text-gray-500 text-sm uppercase">Genre</span>
                          <p className="text-white">{film.genres.join(', ')}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Format */}
                    {film?.format && (
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                          <span className="text-gray-500 text-sm uppercase">Format</span>
                          <p className="text-white">{film.format}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Target Budget */}
                    {film?.target_budget_range && (
                      <div className="flex items-start gap-3">
                        <DollarSign className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                          <span className="text-gray-500 text-sm uppercase">Target Budget</span>
                          <p className="text-white">{film.target_budget_range}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Status */}
                    <div className="flex items-start gap-3">
                      <Target className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <span className="text-gray-500 text-sm uppercase">Status</span>
                        <p className="text-white">{film?.status}</p>
                      </div>
                    </div>
                    
                    {/* Target Audience */}
                    {film?.target_audience && (
                      <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                          <span className="text-gray-500 text-sm uppercase">Target Audience</span>
                          <p className="text-white">{film.target_audience}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Comparables */}
                    {film?.comparables && (
                      <div className="flex items-start gap-3">
                        <Building className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                          <span className="text-gray-500 text-sm uppercase">Comparables</span>
                          <p className="text-white">{film.comparables}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.section>

                {/* Pitch Deck Section */}
                {film?.pitch_deck_url && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-smoke-gray border border-gray-800 rounded-lg p-6"
                  >
                    <h2 className="text-xs font-mono uppercase tracking-widest text-electric-blue mb-4">
                      Pitch Deck
                    </h2>
                    <p className="text-gray-400 mb-6">
                      Download the project pitch deck. Document will be watermarked with your information for tracking purposes.
                    </p>
                    <button
                      onClick={handleDownloadDeck}
                      disabled={downloadingDeck}
                      className="inline-flex items-center gap-2 bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 text-white px-6 py-3 rounded-full font-mono text-sm uppercase tracking-widest transition-all"
                      data-testid="download-deck-btn"
                    >
                      {downloadingDeck ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      {downloadingDeck ? 'Preparing...' : 'Download Pitch Deck'}
                    </button>
                  </motion.section>
                )}

                {/* Financial Overview */}
                {(film?.financing_structure || film?.incentives) && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-smoke-gray border border-gray-800 rounded-lg p-6"
                  >
                    <h2 className="text-xs font-mono uppercase tracking-widest text-electric-blue mb-4">
                      Financial Overview
                    </h2>
                    <div className="space-y-4">
                      {film?.target_budget_range && (
                        <div>
                          <span className="text-gray-500 text-sm">Target Budget Range:</span>
                          <p className="text-white text-lg">{film.target_budget_range}</p>
                        </div>
                      )}
                      {film?.financing_structure && (
                        <div>
                          <span className="text-gray-500 text-sm">Financing Structure:</span>
                          <p className="text-gray-300">{film.financing_structure}</p>
                        </div>
                      )}
                      {film?.incentives && (
                        <div>
                          <span className="text-gray-500 text-sm">Tax Incentives / Rebates:</span>
                          <p className="text-gray-300">{film.incentives}</p>
                        </div>
                      )}
                    </div>
                  </motion.section>
                )}

                {/* Script Access */}
                {film?.script_url && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-smoke-gray border border-gray-800 rounded-lg p-6"
                  >
                    <h2 className="text-xs font-mono uppercase tracking-widest text-electric-blue mb-4">
                      Script Access
                    </h2>
                    <div className="flex items-start gap-4 mb-6 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300 text-sm">
                        Script access requires agreement to confidentiality terms. The downloaded document will be watermarked with your information.
                      </p>
                    </div>
                    
                    {scriptAccessGranted ? (
                      <button
                        onClick={handleDownloadScript}
                        disabled={downloadingScript}
                        className="inline-flex items-center gap-2 bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 text-white px-6 py-3 rounded-full font-mono text-sm uppercase tracking-widest transition-all"
                        data-testid="download-script-btn"
                      >
                        {downloadingScript ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        {downloadingScript ? 'Preparing...' : 'Download Script'}
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowNdaModal(true)}
                        className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-full font-mono text-sm uppercase tracking-widest transition-all"
                        data-testid="request-script-btn"
                      >
                        <Lock className="w-4 h-4" />
                        Request Script Access
                      </button>
                    )}
                  </motion.section>
                )}
              </div>

              {/* Right Column - CTAs */}
              <div className="space-y-6">
                {/* Contact Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-smoke-gray border border-gray-800 rounded-lg p-6"
                >
                  <h3 className="text-lg font-bold text-white mb-4">Next Steps</h3>
                  <div className="space-y-3">
                    <button
                      onClick={handleScheduleCall}
                      className="w-full flex items-center justify-center gap-2 bg-electric-blue hover:bg-electric-blue/90 text-white px-6 py-3 rounded-full font-mono text-sm uppercase tracking-widest transition-all"
                      data-testid="schedule-call-btn"
                    >
                      <Calendar className="w-4 h-4" />
                      Schedule Call
                    </button>
                    <button
                      onClick={handleExpressInterest}
                      className="w-full flex items-center justify-center gap-2 border border-gray-700 hover:border-gray-500 text-white px-6 py-3 rounded-full font-mono text-sm uppercase tracking-widest transition-all"
                      data-testid="express-interest-btn"
                    >
                      <Mail className="w-4 h-4" />
                      Express Interest
                    </button>
                  </div>
                </motion.div>

                {/* Looking For */}
                {film?.looking_for?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-smoke-gray border border-gray-800 rounded-lg p-6"
                  >
                    <h3 className="text-xs font-mono uppercase tracking-widest text-electric-blue mb-4">
                      Currently Seeking
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {film.looking_for.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-electric-blue/10 text-electric-blue text-sm rounded-full border border-electric-blue/30"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Public Page Link */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <a
                    href={`/films/${slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Public Project Page
                  </a>
                </motion.div>
              </div>
            </div>
          </div>
        </main>

        {/* NDA Modal */}
        {showNdaModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-smoke-gray border border-gray-800 rounded-lg max-w-lg w-full p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-8 h-8 text-electric-blue" />
                <div>
                  <h2 className="text-xl font-bold text-white">Confidentiality Agreement</h2>
                  <p className="text-gray-400 text-sm">Script access requires agreement to the following terms</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ndaAgreed}
                    onChange={(e) => setNdaAgreed(e.target.checked)}
                    className="w-5 h-5 mt-0.5 rounded border-gray-600 text-electric-blue focus:ring-electric-blue"
                  />
                  <span className="text-gray-300 text-sm">
                    I understand that this script is the intellectual property of Shadow Wolves Productions and is shared for evaluation purposes only. I will not copy, distribute, or share this material with any third party.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confidentialityAgreed}
                    onChange={(e) => setConfidentialityAgreed(e.target.checked)}
                    className="w-5 h-5 mt-0.5 rounded border-gray-600 text-electric-blue focus:ring-electric-blue"
                  />
                  <span className="text-gray-300 text-sm">
                    I agree to maintain strict confidentiality regarding all information contained in this script, including but not limited to plot details, character names, dialogue, and creative elements.
                  </span>
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowNdaModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-700 text-gray-400 rounded-full hover:bg-gray-800 transition-colors font-mono text-sm uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNdaSubmit}
                  disabled={!ndaAgreed || !confidentialityAgreed}
                  className="flex-1 px-6 py-3 bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-full transition-colors font-mono text-sm uppercase tracking-widest"
                  data-testid="confirm-nda-btn"
                >
                  I Agree
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Footer */}
        <footer className="py-8 border-t border-gray-800">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-500 text-sm">
              This portal and all materials are confidential and intended solely for {user?.name}.
              Unauthorized distribution is prohibited.
            </p>
            <p className="text-gray-600 text-xs mt-2">
              © {new Date().getFullYear()} Shadow Wolves Productions. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default StudioAccess;
