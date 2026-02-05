import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  LogOut, FileText, Briefcase, TrendingUp, Mail, 
  ChevronRight, RefreshCw, Send, CheckCircle, X,
  Film, FileVideo, BookOpen, Presentation, Home
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const INVESTOR_TYPES = ['Individual', 'Family Office', 'Venture Capital', 'Strategic Partner', 'Other'];
const INTEREST_AREAS = ['Single Project', 'Slate Investment', 'Strategic Partnership', 'Advisory Role'];

const DOC_TYPE_ICONS = {
  'Pitch Deck': Presentation,
  'Screener': FileVideo,
  'Script': BookOpen,
  'Lookbook': FileText,
};

const InvestorPortal = ({ onLogout }) => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const investorName = sessionStorage.getItem('investorName') || 'Investor';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const projectsRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/investors/projects`);
      if (projectsRes.ok) {
        setProjects(await projectsRes.json());
      }
    } catch (err) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('investorAuth');
    sessionStorage.removeItem('investorName');
    sessionStorage.removeItem('investorId');
    onLogout();
    navigate('/investors');
  };

  const sections = [
    { id: 'overview', label: 'Overview', icon: Briefcase },
    { id: 'slate', label: 'Development Slate', icon: Film },
    { id: 'investment', label: 'Investment Model', icon: TrendingUp },
    { id: 'interest', label: 'Expression of Interest', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-black">
      <Helmet>
        <title>Investor Portal | Shadow Wolves Productions</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Header */}
      <header className="bg-smoke-gray border-b border-gray-800 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to="/"
              className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-electric-blue transition-colors border border-gray-700 hover:border-electric-blue rounded-lg"
              data-testid="home-btn"
            >
              <Home size={16} />
              <span className="text-sm">Back to Site</span>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Cinzel, serif' }}>
                Investor Portal
              </h1>
              <p className="text-gray-500 text-sm">Welcome, {investorName}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
            data-testid="logout-btn"
          >
            <LogOut size={18} />
            <span className="text-sm">Exit Portal</span>
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <nav className="lg:w-64 flex-shrink-0">
            <div className="bg-smoke-gray border border-gray-800 rounded-lg p-2 sticky top-24">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                      activeSection === section.id
                        ? 'bg-electric-blue/20 text-electric-blue'
                        : 'text-gray-400 hover:text-white hover:bg-black/30'
                    }`}
                    data-testid={`nav-${section.id}`}
                  >
                    <Icon size={18} />
                    <span className="text-sm">{section.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="text-center py-20">
                <RefreshCw className="w-8 h-8 text-electric-blue animate-spin mx-auto mb-4" />
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : (
              <>
                {activeSection === 'overview' && <OverviewSection />}
                {activeSection === 'slate' && (
                  <SlateSection 
                    projects={projects} 
                    selectedProject={selectedProject}
                    setSelectedProject={setSelectedProject}
                  />
                )}
                {activeSection === 'investment' && <InvestmentSection />}
                {activeSection === 'interest' && <InterestSection projects={projects} />}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectDetailModal 
            project={selectedProject} 
            onClose={() => setSelectedProject(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Overview Section
const OverviewSection = () => (
  <div className="space-y-8">
    <div>
      <h2 className="text-3xl font-bold text-white mb-6" style={{ fontFamily: 'Cinzel, serif' }}>
        Welcome to Shadow Wolves
      </h2>
      <div className="prose-content text-gray-300 space-y-4 leading-relaxed">
        <p>
          Shadow Wolves Productions is a development-first production company focused on bold, 
          genre-driven storytelling. We specialize in horror, thriller, and psychological narratives 
          that challenge audiences while delivering commercial viability.
        </p>
        <p>
          Our approach is disciplined: we develop projects thoroughly before seeking production 
          financing, ensuring every project that moves forward has been rigorously tested and refined.
        </p>
        <p>
          This portal provides an overview of our current development slate, investment structure, 
          and opportunities. All information is confidential and intended for qualified investors only.
        </p>
      </div>
    </div>

    <div className="bg-smoke-gray border border-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-4">Our Philosophy</h3>
      <ul className="space-y-3 text-gray-400">
        <li className="flex items-start gap-3">
          <span className="text-electric-blue mt-1">▪</span>
          <span><strong className="text-white">Development-First:</strong> We don't rush to production. Every project is developed with intention.</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-electric-blue mt-1">▪</span>
          <span><strong className="text-white">Genre Expertise:</strong> We understand the commercial and creative mechanics of genre filmmaking.</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-electric-blue mt-1">▪</span>
          <span><strong className="text-white">Risk-Aware:</strong> We structure investments to manage downside while maximizing upside potential.</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-electric-blue mt-1">▪</span>
          <span><strong className="text-white">Creator-Led:</strong> Projects are driven by creative vision, not committee decisions.</span>
        </li>
      </ul>
    </div>
  </div>
);

// Development Slate Section
const SlateSection = ({ projects, selectedProject, setSelectedProject }) => (
  <div>
    <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
      Development Slate
    </h2>
    <p className="text-gray-500 mb-8">Current projects in various stages of development. Click on a project to view details and request materials.</p>

    {projects.length === 0 ? (
      <div className="text-center py-16 bg-smoke-gray border border-gray-800 rounded-lg">
        <FileText className="w-12 h-12 text-gray-700 mx-auto mb-4" />
        <p className="text-gray-500">No projects currently available to view.</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <motion.div 
            key={project.id}
            whileHover={{ scale: 1.02 }}
            className="bg-smoke-gray border border-gray-800 rounded-lg overflow-hidden cursor-pointer hover:border-electric-blue/50 transition-colors"
            onClick={() => setSelectedProject(project)}
            data-testid={`project-card-${project.id}`}
          >
            {/* Poster */}
            <div className="h-48 bg-gray-900">
              {project.poster_url ? (
                <img 
                  src={`${process.env.REACT_APP_BACKEND_URL}${project.poster_url}`}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Film className="w-12 h-12 text-gray-700" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-lg font-bold text-white">{project.title}</h3>
                <span className="px-2 py-1 bg-black text-gray-400 text-xs font-mono uppercase rounded-full whitespace-nowrap">
                  {project.status}
                </span>
              </div>
              <p className="text-electric-blue text-sm mb-2">{project.genre}</p>
              <p className="text-gray-400 text-sm line-clamp-2">"{project.hook}"</p>
              
              <div className="mt-4 flex items-center text-electric-blue text-sm">
                <span>View Details & Request Materials</span>
                <ChevronRight size={16} className="ml-1" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    )}
  </div>
);

// Project Detail Modal
const ProjectDetailModal = ({ project, onClose }) => {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState(null);
  const [downloading, setDownloading] = useState(null);
  
  // Check if user has personal access code (vs global password)
  const investorId = sessionStorage.getItem('investorId');
  const investorName = sessionStorage.getItem('investorName');
  const hasPersonalAccess = investorId && investorId !== 'null' && investorName !== 'Investor';
  
  const docTypes = ['Pitch Deck', 'Screener', 'Script'];

  // Direct download for personal access code users
  const handleDirectDownload = async (docType) => {
    setDownloading(docType);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/investors/documents/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: project.id,
          doc_type: docType,
          investor_id: investorId
        })
      });

      if (!response.ok) {
        try {
          const error = await response.json();
          toast.error(error.detail || 'Document not available for this project yet');
        } catch {
          toast.error('Document not available for this project yet');
        }
        return;
      }

      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/pdf')) {
        // It's a PDF file - download it
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.title}_${docType}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast.success(`${docType} downloaded with your watermark`);
      } else {
        // It's a URL response
        const data = await response.json();
        if (data.file_url) {
          window.open(data.file_url, '_blank');
          toast.success('Download logged');
        }
      }
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Connection error. Please check your internet.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-smoke-gray border border-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto my-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors z-10"
          data-testid="close-project-modal"
        >
          <X size={24} />
        </button>

        {/* Poster Header */}
        <div className="h-64 bg-gray-900 relative">
          {project.poster_url ? (
            <img 
              src={`${process.env.REACT_APP_BACKEND_URL}${project.poster_url}`}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Film className="w-16 h-16 text-gray-700" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-smoke-gray to-transparent" />
        </div>

        {/* Content */}
        <div className="p-6 -mt-16 relative">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Cinzel, serif' }}>
                {project.title}
              </h2>
              <p className="text-electric-blue">{project.genre}</p>
            </div>
            <span className="px-3 py-1 bg-black text-gray-400 text-xs font-mono uppercase rounded-full border border-gray-700">
              {project.status}
            </span>
          </div>

          <p className="text-white font-medium mb-4 italic text-lg">"{project.hook}"</p>
          <p className="text-gray-400 leading-relaxed mb-6">{project.description}</p>

          {project.budget_range && (
            <p className="text-gray-500 text-sm mb-6">
              Budget Range: <span className="text-gray-300">{project.budget_range}</span>
            </p>
          )}

          {/* Request Materials Section */}
          <div className="border-t border-gray-800 pt-6">
            <h3 className="text-lg font-bold text-white mb-2">
              {hasPersonalAccess ? 'Download Materials' : 'Request Materials'}
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              {hasPersonalAccess 
                ? `Downloads will be watermarked with your name (${investorName}) and logged for security.`
                : 'Provide your details to access materials. Documents will be watermarked for security.'
              }
            </p>

            {!showRequestForm ? (
              <div className="flex flex-wrap gap-3">
                {docTypes.map((docType) => {
                  const Icon = DOC_TYPE_ICONS[docType] || FileText;
                  const isDownloading = downloading === docType;
                  
                  return (
                    <button
                      key={docType}
                      onClick={() => {
                        if (hasPersonalAccess) {
                          handleDirectDownload(docType);
                        } else {
                          setSelectedDocType(docType);
                          setShowRequestForm(true);
                        }
                      }}
                      disabled={isDownloading}
                      className="flex items-center gap-2 px-4 py-2 bg-black border border-gray-700 rounded-lg text-gray-300 hover:border-electric-blue hover:text-electric-blue transition-all disabled:opacity-50"
                      data-testid={`request-${docType.toLowerCase().replace(' ', '-')}`}
                    >
                      {isDownloading ? (
                        <RefreshCw size={16} className="animate-spin" />
                      ) : (
                        <Icon size={16} />
                      )}
                      <span className="text-sm">
                        {hasPersonalAccess ? `Download ${docType}` : `Request ${docType}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <DocumentRequestForm 
                project={project}
                docType={selectedDocType}
                onCancel={() => {
                  setShowRequestForm(false);
                  setSelectedDocType(null);
                }}
                onSuccess={() => {
                  setShowRequestForm(false);
                  setSelectedDocType(null);
                }}
              />
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Document Request Form - For global password users
const DocumentRequestForm = ({ project, docType, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Use the smart download endpoint that handles both logging and file serving
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/investors/documents/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: project.id,
          doc_type: docType,
          investor_id: null,  // Global password user
          ...formData
        })
      });

      const contentType = response.headers.get('content-type');

      if (!response.ok) {
        // Handle error responses
        try {
          const error = await response.json();
          toast.error(error.detail || 'Document not available for this project yet');
        } catch {
          toast.error('Document not available for this project yet');
        }
        return;
      }
      
      if (contentType && contentType.includes('application/pdf')) {
        // It's a PDF file - download it
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.title}_${docType}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        
        setSubmitted(true);
        toast.success(`${docType} downloaded successfully`);
        setTimeout(() => onSuccess(), 2000);
      } else {
        // JSON response - might be external URL or success message
        const data = await response.json();
        if (data.file_url) {
          window.open(data.file_url, '_blank');
          setSubmitted(true);
          toast.success('Download started');
          setTimeout(() => onSuccess(), 2000);
        } else {
          toast.info('Request submitted. We\'ll send you the materials shortly.');
          setSubmitted(true);
          setTimeout(() => onSuccess(), 2000);
        }
      }
    } catch (err) {
      console.error('Document request error:', err);
      toast.error('Connection error. Please check your internet and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8 bg-black/50 rounded-lg border border-gray-800">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h4 className="text-white font-bold mb-2">Download Complete</h4>
        <p className="text-gray-400 text-sm">
          Your download has been logged and watermarked with your details.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-black/50 rounded-lg border border-gray-800 p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="px-3 py-1 bg-electric-blue/20 text-electric-blue text-xs font-mono uppercase rounded-full">
          {docType}
        </span>
        <span className="text-gray-500">for</span>
        <span className="text-white font-medium">{project.title}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-400 text-xs font-mono uppercase tracking-widest mb-1">
            Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-electric-blue focus:outline-none"
            required
            data-testid="request-name-input"
          />
        </div>
        <div>
          <label className="block text-gray-400 text-xs font-mono uppercase tracking-widest mb-1">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-electric-blue focus:outline-none"
            required
            data-testid="request-email-input"
          />
        </div>
        <div>
          <label className="block text-gray-400 text-xs font-mono uppercase tracking-widest mb-1">
            Company
          </label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-electric-blue focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-400 text-xs font-mono uppercase tracking-widest mb-1">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-electric-blue focus:outline-none"
          />
        </div>
      </div>

      <p className="text-gray-600 text-xs mb-4">
        Your details will be used for tracking and security purposes. Documents may be watermarked.
      </p>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-700 text-gray-400 rounded-lg hover:bg-gray-800 transition-colors text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 px-4 py-2 bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 text-white rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
          data-testid="submit-request-btn"
        >
          {submitting ? 'Submitting...' : 'Submit Request'}
          {!submitting && <Send size={14} />}
        </button>
      </div>
    </form>
  );
};

// Investment Model Section
const InvestmentSection = () => (
  <div className="space-y-8">
    <div>
      <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
        Investment Model
      </h2>
      <p className="text-gray-500 mb-8">How we structure investment opportunities.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-smoke-gray border border-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Project-by-Project</h3>
        <p className="text-gray-400 mb-4">
          Invest in individual projects at various stages of development. This allows for 
          targeted investment in specific stories that align with your interests.
        </p>
        <ul className="space-y-2 text-gray-500 text-sm">
          <li>• Development funding</li>
          <li>• Production financing</li>
          <li>• Gap financing</li>
        </ul>
      </div>

      <div className="bg-smoke-gray border border-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Slate Investment</h3>
        <p className="text-gray-400 mb-4">
          Invest across multiple projects to diversify risk and participate in the broader 
          success of the studio's development pipeline.
        </p>
        <ul className="space-y-2 text-gray-500 text-sm">
          <li>• Portfolio approach</li>
          <li>• Risk diversification</li>
          <li>• First-look opportunities</li>
        </ul>
      </div>
    </div>

    <div className="bg-smoke-gray border border-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-4">Budget Ranges</h3>
      <p className="text-gray-400 mb-4">
        Our projects typically fall within these budget categories:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-black rounded-lg p-4">
          <p className="text-electric-blue font-mono text-sm uppercase mb-1">Micro-Budget</p>
          <p className="text-white font-bold">$50K - $250K</p>
          <p className="text-gray-500 text-xs mt-1">Proof-of-concepts, shorts</p>
        </div>
        <div className="bg-black rounded-lg p-4">
          <p className="text-electric-blue font-mono text-sm uppercase mb-1">Low Budget</p>
          <p className="text-white font-bold">$250K - $2M</p>
          <p className="text-gray-500 text-xs mt-1">Feature films</p>
        </div>
        <div className="bg-black rounded-lg p-4">
          <p className="text-electric-blue font-mono text-sm uppercase mb-1">Mid Budget</p>
          <p className="text-white font-bold">$2M - $10M</p>
          <p className="text-gray-500 text-xs mt-1">Elevated genre projects</p>
        </div>
      </div>
    </div>

    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
      <p className="text-yellow-400 text-sm">
        <strong>Note:</strong> All investment opportunities are subject to regulatory requirements and 
        are available only to qualified investors. This is not an offer to sell securities.
      </p>
    </div>
  </div>
);

// Expression of Interest Section
const InterestSection = ({ projects }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    investor_type: '',
    area_of_interest: '',
    selected_project_id: '',
    selected_project_title: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Reset project selection if area of interest changes from Single Project
      if (name === 'area_of_interest' && value !== 'Single Project') {
        updated.selected_project_id = '';
        updated.selected_project_title = '';
      }
      
      // Set project title when project is selected
      if (name === 'selected_project_id') {
        const project = projects.find(p => p.id === value);
        updated.selected_project_title = project ? project.title : '';
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/investors/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitted(true);
        toast.success('Interest submitted successfully');
      } else {
        toast.error('Failed to submit. Please try again.');
      }
    } catch (err) {
      toast.error('Connection error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-16">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
          Thank You
        </h2>
        <p className="text-gray-400">
          We've received your expression of interest and will be in touch if there's alignment.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
        Expression of Interest
      </h2>
      <p className="text-gray-500 mb-8">
        Interested in exploring investment opportunities? Let us know.
      </p>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-6" data-testid="interest-form">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-smoke-gray border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none"
              required
              data-testid="interest-name-input"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-smoke-gray border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none"
              required
              data-testid="interest-email-input"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
            Investor Type *
          </label>
          <select
            name="investor_type"
            value={formData.investor_type}
            onChange={handleChange}
            className="w-full bg-smoke-gray border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none"
            required
            data-testid="investor-type-select"
          >
            <option value="">Select type</option>
            {INVESTOR_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
            Area of Interest *
          </label>
          <select
            name="area_of_interest"
            value={formData.area_of_interest}
            onChange={handleChange}
            className="w-full bg-smoke-gray border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none"
            required
            data-testid="area-of-interest-select"
          >
            <option value="">Select area</option>
            {INTEREST_AREAS.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>

        {/* Project Selection - Only shown when Single Project is selected */}
        {formData.area_of_interest === 'Single Project' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
              Select Project *
            </label>
            <select
              name="selected_project_id"
              value={formData.selected_project_id}
              onChange={handleChange}
              className="w-full bg-smoke-gray border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none"
              required={formData.area_of_interest === 'Single Project'}
              data-testid="project-select"
            >
              <option value="">Select a project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.title} ({project.genre})
                </option>
              ))}
            </select>
          </motion.div>
        )}

        <div>
          <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
            Message
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            className="w-full bg-smoke-gray border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none resize-none"
            placeholder="Any additional context (optional)"
            data-testid="interest-message-input"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 text-white rounded-lg font-mono text-sm uppercase tracking-widest transition-all"
          data-testid="submit-interest-btn"
        >
          {submitting ? 'Submitting...' : 'Submit Interest'}
          {!submitting && <Send size={18} />}
        </button>
      </form>

      <p className="text-gray-600 text-sm mt-8">
        All inquiries are confidential. We will only contact you if there is potential alignment.
      </p>
    </div>
  );
};

export default InvestorPortal;
