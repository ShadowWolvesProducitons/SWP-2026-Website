import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Download, FileText, Film, DollarSign, Users, Target,
  RefreshCw, ChevronDown, ChevronUp, Lock, Calendar
} from 'lucide-react';
import { toast } from 'sonner';

const StudioProjectDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);
  const [downloadingDeck, setDownloadingDeck] = useState(false);
  const [downloadingScript, setDownloadingScript] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [slug]);

  const fetchProject = async () => {
    const token = localStorage.getItem('studio_token');
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/studio-portal/projects/${slug}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProject(data);
      } else {
        const err = await response.json();
        setError(err.detail || 'Failed to load project');
      }
    } catch (err) {
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (docType) => {
    const token = localStorage.getItem('studio_token');
    const setDownloading = docType === 'pitch_deck' ? setDownloadingDeck : setDownloadingScript;
    
    setDownloading(true);
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/studio-portal/projects/${slug}/download/${docType}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.project.title}_${docType === 'pitch_deck' ? 'Pitch_Deck' : 'Script'}_CONFIDENTIAL.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast.success('Document downloaded');
      } else {
        const err = await response.json();
        toast.error(err.detail || 'Download failed');
      }
    } catch (err) {
      toast.error('Download failed');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-electric-blue animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <button
          onClick={() => navigate('/studio-access/projects')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Projects
        </button>
        <div className="bg-smoke-gray border border-gray-800 rounded-lg p-8 text-center">
          <Lock size={48} className="text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl text-white mb-2">Access Denied</h2>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  const p = project?.project;
  const permissions = project?.permissions;
  const financials = project?.financials;
  const updates = project?.updates;
  const assets = project?.assets;

  return (
    <div className="p-6 lg:p-8" data-testid="studio-project-detail">
      {/* Back Button */}
      <button
        onClick={() => navigate('/studio-access/projects')}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Projects
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row gap-8 mb-8"
      >
        {/* Poster */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="aspect-[2/3] bg-gray-900 rounded-lg overflow-hidden">
            {p?.poster_url ? (
              <img
                src={`${process.env.REACT_APP_BACKEND_URL}${p.poster_url}`}
                alt={p.title}
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Film size={48} className="text-gray-700" />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-3xl lg:text-4xl font-bold text-white font-cinzel">{p?.title}</h1>
            <span className="px-4 py-2 bg-electric-blue/20 text-electric-blue text-xs font-mono uppercase rounded-full border border-electric-blue/40">
              {p?.status}
            </span>
          </div>

          {p?.genres?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {p.genres.map((genre, idx) => (
                <span key={idx} className="px-3 py-1 bg-white/10 text-white/80 text-sm rounded-full">
                  {genre}
                </span>
              ))}
            </div>
          )}

          {p?.tagline && (
            <p className="text-xl text-gray-300 italic mb-4">"{p.tagline}"</p>
          )}

          {/* Quick Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {p?.format && (
              <div>
                <span className="text-gray-500 text-xs uppercase">Format</span>
                <p className="text-white">{p.format}</p>
              </div>
            )}
            {p?.target_audience && (
              <div>
                <span className="text-gray-500 text-xs uppercase">Audience</span>
                <p className="text-white">{p.target_audience}</p>
              </div>
            )}
            {p?.comparables && (
              <div className="col-span-2">
                <span className="text-gray-500 text-xs uppercase">Comparables</span>
                <p className="text-white">{p.comparables}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Content Sections */}
      <div className="space-y-8">
        {/* Logline & Synopsis */}
        {(p?.logline || p?.extended_synopsis) && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-smoke-gray border border-gray-800 rounded-lg p-6"
          >
            <h2 className="text-xs font-mono uppercase tracking-widest text-electric-blue mb-4">Overview</h2>
            
            {p?.logline && (
              <p className="text-gray-300 leading-relaxed mb-4">{p.logline}</p>
            )}
            
            {p?.extended_synopsis && (
              <div>
                <button
                  onClick={() => setSynopsisExpanded(!synopsisExpanded)}
                  className="flex items-center gap-1 text-gray-500 hover:text-white text-sm mb-2 transition-colors"
                >
                  {synopsisExpanded ? 'Hide' : 'Show'} Extended Synopsis
                  {synopsisExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {synopsisExpanded && (
                  <div className="text-gray-400 leading-relaxed space-y-4 pt-2 border-t border-gray-700">
                    {p.extended_synopsis.split('\n\n').map((para, idx) => (
                      <p key={idx}>{para}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.section>
        )}

        {/* Documents */}
        {(project?.has_pitch_deck || project?.has_script) && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-smoke-gray border border-gray-800 rounded-lg p-6"
          >
            <h2 className="text-xs font-mono uppercase tracking-widest text-electric-blue mb-4">Documents</h2>
            <p className="text-gray-500 text-sm mb-4">
              All downloaded documents are watermarked with your information for tracking.
            </p>
            
            <div className="flex flex-wrap gap-4">
              {project?.has_pitch_deck && (
                <button
                  onClick={() => handleDownload('pitch_deck')}
                  disabled={downloadingDeck}
                  className="flex items-center gap-2 bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 text-white px-6 py-3 rounded-full font-mono text-sm uppercase tracking-widest transition-all"
                >
                  {downloadingDeck ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download size={18} />
                  )}
                  {downloadingDeck ? 'Preparing...' : 'Pitch Deck'}
                </button>
              )}
              
              {project?.has_script && (
                <button
                  onClick={() => handleDownload('script')}
                  disabled={downloadingScript}
                  className="flex items-center gap-2 bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 text-white px-6 py-3 rounded-full font-mono text-sm uppercase tracking-widest transition-all"
                >
                  {downloadingScript ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download size={18} />
                  )}
                  {downloadingScript ? 'Preparing...' : 'Script'}
                </button>
              )}
            </div>
          </motion.section>
        )}

        {/* Financial Overview - Only if user has permission */}
        {permissions?.financials && financials && (financials.target_budget_range || financials.financing_structure || financials.incentives) && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-smoke-gray border border-gray-800 rounded-lg p-6"
          >
            <h2 className="text-xs font-mono uppercase tracking-widest text-electric-blue mb-4 flex items-center gap-2">
              <DollarSign size={16} />
              Financial Overview
            </h2>
            
            <div className="space-y-4">
              {financials.target_budget_range && (
                <div>
                  <span className="text-gray-500 text-sm">Target Budget Range</span>
                  <p className="text-white text-xl font-semibold">{financials.target_budget_range}</p>
                </div>
              )}
              {financials.financing_structure && (
                <div>
                  <span className="text-gray-500 text-sm">Financing Structure</span>
                  <p className="text-gray-300">{financials.financing_structure}</p>
                </div>
              )}
              {financials.incentives && (
                <div>
                  <span className="text-gray-500 text-sm">Tax Incentives / Rebates</span>
                  <p className="text-gray-300">{financials.incentives}</p>
                </div>
              )}
            </div>
          </motion.section>
        )}

        {/* Project Updates */}
        {updates?.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-smoke-gray border border-gray-800 rounded-lg p-6"
          >
            <h2 className="text-xs font-mono uppercase tracking-widest text-electric-blue mb-4 flex items-center gap-2">
              <Calendar size={16} />
              Project Updates
            </h2>
            
            <div className="space-y-4">
              {updates.map((update) => (
                <div key={update.id} className="border-l-2 border-electric-blue/30 pl-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-white font-medium">{update.title}</h3>
                    <span className="text-gray-600 text-xs whitespace-nowrap">
                      {new Date(update.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">
                    {update.body?.replace(/<[^>]*>/g, '').substring(0, 200)}...
                  </p>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Project Assets */}
        {assets?.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-smoke-gray border border-gray-800 rounded-lg p-6"
          >
            <h2 className="text-xs font-mono uppercase tracking-widest text-electric-blue mb-4 flex items-center gap-2">
              <FileText size={16} />
              Project Assets
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assets.map((asset) => (
                <div key={asset.id} className="bg-black border border-gray-800 rounded-lg p-4">
                  <FileText size={24} className="text-electric-blue mb-2" />
                  <h3 className="text-white font-medium">{asset.name}</h3>
                  <p className="text-gray-600 text-xs capitalize mb-3">{asset.asset_type?.replace('_', ' ')}</p>
                  <Link
                    to={`/studio-access/assets?id=${asset.id}`}
                    className="text-electric-blue text-sm hover:underline"
                  >
                    View / Download →
                  </Link>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
};

export default StudioProjectDetail;
