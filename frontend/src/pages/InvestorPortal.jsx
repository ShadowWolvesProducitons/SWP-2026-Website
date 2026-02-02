import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  LogOut, FileText, Briefcase, TrendingUp, Award, Download, 
  Mail, ChevronRight, ExternalLink, RefreshCw, Send, CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

const INVESTOR_TYPES = ['Individual', 'Family Office', 'Venture Capital', 'Strategic Partner', 'Other'];
const INTEREST_AREAS = ['Single Project', 'Slate Investment', 'Strategic Partnership', 'Advisory Role'];

const InvestorPortal = ({ onLogout }) => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [projects, setProjects] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const investorName = sessionStorage.getItem('investorName') || 'Investor';
  const investorId = sessionStorage.getItem('investorId');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projectsRes, docsRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/investors/projects`),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/investors/documents`)
      ]);
      
      if (projectsRes.ok) {
        setProjects(await projectsRes.json());
      }
      if (docsRes.ok) {
        setDocuments(await docsRes.json());
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

  const handleDownload = async (doc) => {
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/investors/documents/${doc.id}/download?investor_id=${investorId || ''}`, {
        method: 'POST'
      });
      window.open(doc.file_url, '_blank');
    } catch (err) {
      window.open(doc.file_url, '_blank');
    }
  };

  const sections = [
    { id: 'overview', label: 'Overview', icon: Briefcase },
    { id: 'slate', label: 'Development Slate', icon: FileText },
    { id: 'investment', label: 'Investment Model', icon: TrendingUp },
    { id: 'track-record', label: 'Track Record', icon: Award },
    { id: 'documents', label: 'Documents', icon: Download },
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
          <div>
            <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Cinzel, serif' }}>
              Investor Portal
            </h1>
            <p className="text-gray-500 text-sm">Welcome, {investorName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm">Exit</span>
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
                {activeSection === 'slate' && <SlateSection projects={projects} />}
                {activeSection === 'investment' && <InvestmentSection />}
                {activeSection === 'track-record' && <TrackRecordSection />}
                {activeSection === 'documents' && <DocumentsSection documents={documents} onDownload={handleDownload} />}
                {activeSection === 'interest' && <InterestSection />}
              </>
            )}
          </main>
        </div>
      </div>
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
          and track record. All information is confidential and intended for qualified investors only.
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
const SlateSection = ({ projects }) => (
  <div>
    <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
      Development Slate
    </h2>
    <p className="text-gray-500 mb-8">Current projects in various stages of development.</p>

    {projects.length === 0 ? (
      <div className="text-center py-16 bg-smoke-gray border border-gray-800 rounded-lg">
        <FileText className="w-12 h-12 text-gray-700 mx-auto mb-4" />
        <p className="text-gray-500">No projects currently available to view.</p>
      </div>
    ) : (
      <div className="space-y-6">
        {projects.map((project) => (
          <div 
            key={project.id}
            className="bg-smoke-gray border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors"
          >
            <div className="flex flex-col md:flex-row">
              {/* Poster */}
              <div className="md:w-48 h-48 md:h-auto bg-gray-900 flex-shrink-0">
                {project.poster_url ? (
                  <img 
                    src={`${process.env.REACT_APP_BACKEND_URL}${project.poster_url}`}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="w-12 h-12 text-gray-700" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-white">{project.title}</h3>
                    <p className="text-electric-blue text-sm">{project.genre}</p>
                  </div>
                  <span className="px-3 py-1 bg-black text-gray-400 text-xs font-mono uppercase rounded-full">
                    {project.status}
                  </span>
                </div>
                
                <p className="text-white font-medium mb-3 italic">"{project.hook}"</p>
                <p className="text-gray-400 leading-relaxed">{project.description}</p>
                
                {project.budget_range && (
                  <p className="text-gray-500 text-sm mt-4">
                    Budget Range: <span className="text-gray-300">{project.budget_range}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

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

// Track Record Section
const TrackRecordSection = () => (
  <div className="space-y-8">
    <div>
      <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
        Track Record
      </h2>
      <p className="text-gray-500 mb-8">Completed works and industry recognition.</p>
    </div>

    <div className="bg-smoke-gray border border-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-4">Completed Works</h3>
      <p className="text-gray-400">
        Detailed information about completed projects, festival selections, and distribution 
        outcomes is available in our downloadable materials.
      </p>
    </div>

    <div className="bg-smoke-gray border border-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-4">Key Achievements</h3>
      <ul className="space-y-3 text-gray-400">
        <li className="flex items-start gap-3">
          <Award className="w-5 h-5 text-electric-blue flex-shrink-0 mt-0.5" />
          <span>Multiple proof-of-concepts completed demonstrating production capability</span>
        </li>
        <li className="flex items-start gap-3">
          <Award className="w-5 h-5 text-electric-blue flex-shrink-0 mt-0.5" />
          <span>Established network of trusted creative collaborators</span>
        </li>
        <li className="flex items-start gap-3">
          <Award className="w-5 h-5 text-electric-blue flex-shrink-0 mt-0.5" />
          <span>Active development slate with multiple projects at various stages</span>
        </li>
      </ul>
    </div>
  </div>
);

// Documents Section
const DocumentsSection = ({ documents, onDownload }) => {
  const groupedDocs = documents.reduce((acc, doc) => {
    const type = doc.doc_type || 'Other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(doc);
    return acc;
  }, {});

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
        Documents
      </h2>
      <p className="text-gray-500 mb-8">Secure downloads for qualified investors.</p>

      {documents.length === 0 ? (
        <div className="text-center py-16 bg-smoke-gray border border-gray-800 rounded-lg">
          <Download className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500">No documents currently available.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedDocs).map(([type, docs]) => (
            <div key={type}>
              <h3 className="text-lg font-bold text-white mb-4">{type}</h3>
              <div className="space-y-3">
                {docs.map((doc) => (
                  <div 
                    key={doc.id}
                    className="bg-smoke-gray border border-gray-800 rounded-lg p-4 flex items-center justify-between hover:border-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-electric-blue" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{doc.title}</h4>
                        {doc.description && (
                          <p className="text-gray-500 text-sm">{doc.description}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => onDownload(doc)}
                      className="flex items-center gap-2 px-4 py-2 bg-electric-blue/20 text-electric-blue rounded-lg hover:bg-electric-blue/30 transition-colors"
                    >
                      <Download size={16} />
                      <span className="text-sm">Download</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-gray-600 text-sm mt-6">
        All downloads are logged for security purposes. Documents may be watermarked.
      </p>
    </div>
  );
};

// Expression of Interest Section
const InterestSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    investor_type: '',
    area_of_interest: '',
    message: ''
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

      <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
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
          >
            <option value="">Select area</option>
            {INTEREST_AREAS.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>

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
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 text-white rounded-lg font-mono text-sm uppercase tracking-widest transition-all"
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
