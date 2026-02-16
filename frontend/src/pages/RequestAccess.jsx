import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { User, Mail, Building, MessageSquare, ChevronDown, Check, ArrowRight, Shield } from 'lucide-react';
import { toast } from 'sonner';

const ROLES = [
  { value: 'investor', label: 'Investor' },
  { value: 'director', label: 'Director' },
  { value: 'producer', label: 'Producer' },
  { value: 'executive_producer', label: 'Executive Producer (EP)' },
  { value: 'sales_agent', label: 'Sales Agent' },
  { value: 'cast', label: 'Cast' },
  { value: 'crew', label: 'Crew' },
  { value: 'talent_manager', label: 'Talent Manager' },
  { value: 'other', label: 'Other' }
];

const RequestAccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedProject = searchParams.get('project');
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: '',
    other_role_description: '',
    projects_requested: preselectedProject ? [preselectedProject] : [],
    message: '',
    agreed_to_terms: false
  });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/films`);
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRoleSelect = (roleValue) => {
    setFormData(prev => ({ ...prev, role: roleValue }));
    setRoleDropdownOpen(false);
  };

  const handleProjectToggle = (projectId) => {
    setFormData(prev => ({
      ...prev,
      projects_requested: prev.projects_requested.includes(projectId)
        ? prev.projects_requested.filter(p => p !== projectId)
        : [...prev.projects_requested, projectId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.email || !formData.role) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!formData.agreed_to_terms) {
      toast.error('You must agree to the confidentiality terms');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/studio-portal/request-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSubmitted(true);
        toast.success('Request submitted successfully');
      } else {
        toast.error(data.detail || 'Failed to submit request');
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <>
        <Helmet>
          <title>Request Submitted | Shadow Wolves Productions</title>
        </Helmet>
        <div className="min-h-screen bg-black pt-20 flex items-center justify-center px-4">
          <motion.div 
            className="max-w-md w-full text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-20 h-20 bg-electric-blue/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={40} className="text-electric-blue" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4 font-cinzel">Check Your Email</h1>
            <p className="text-gray-400 mb-8">
              We've sent a verification link to <strong className="text-white">{formData.email}</strong>. 
              Click the link to verify your email and set up your password.
            </p>
            <p className="text-gray-500 text-sm">
              Didn't receive the email? Check your spam folder or{' '}
              <button 
                onClick={() => setSubmitted(false)} 
                className="text-electric-blue hover:underline"
              >
                try again
              </button>
            </p>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Request Access | Shadow Wolves Productions</title>
        <meta name="description" content="Request access to the Shadow Wolves Productions Studio Portal" />
      </Helmet>

      <div className="min-h-screen bg-black pt-20 pb-16 px-4" data-testid="request-access-page">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header */}
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-electric-blue/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield size={32} className="text-electric-blue" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-cinzel">
                Request Access
              </h1>
              <p className="text-gray-400 max-w-lg mx-auto">
                Get access to the Shadow Wolves Productions Studio Portal — your gateway to exclusive project materials, updates, and investment opportunities.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full bg-smoke-gray border border-gray-700 rounded-lg pl-12 pr-4 py-4 text-white focus:border-electric-blue focus:outline-none transition-colors"
                    placeholder="John Smith"
                    required
                    data-testid="full-name-input"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-smoke-gray border border-gray-700 rounded-lg pl-12 pr-4 py-4 text-white focus:border-electric-blue focus:outline-none transition-colors"
                    placeholder="john@company.com"
                    required
                    data-testid="email-input"
                  />
                </div>
              </div>

              {/* Role Dropdown */}
              <div>
                <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                  Role / Reason for Access *
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                    className="w-full bg-smoke-gray border border-gray-700 rounded-lg px-4 py-4 text-left flex items-center justify-between focus:border-electric-blue focus:outline-none transition-colors"
                    data-testid="role-dropdown"
                  >
                    <span className={formData.role ? 'text-white' : 'text-gray-500'}>
                      {formData.role ? ROLES.find(r => r.value === formData.role)?.label : 'Select your role...'}
                    </span>
                    <ChevronDown size={20} className={`text-gray-500 transition-transform ${roleDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {roleDropdownOpen && (
                    <div className="absolute z-20 w-full mt-2 bg-smoke-gray border border-gray-700 rounded-lg overflow-hidden shadow-xl">
                      {ROLES.map((role) => (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => handleRoleSelect(role.value)}
                          className={`w-full px-4 py-3 text-left hover:bg-electric-blue/10 transition-colors ${
                            formData.role === role.value ? 'bg-electric-blue/20 text-electric-blue' : 'text-white'
                          }`}
                        >
                          {role.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Other Role Description */}
              {formData.role === 'other' && (
                <div>
                  <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                    Please Specify
                  </label>
                  <input
                    type="text"
                    name="other_role_description"
                    value={formData.other_role_description}
                    onChange={handleChange}
                    className="w-full bg-smoke-gray border border-gray-700 rounded-lg px-4 py-4 text-white focus:border-electric-blue focus:outline-none transition-colors"
                    placeholder="Describe your role or interest..."
                  />
                </div>
              )}

              {/* Projects of Interest */}
              {projects.length > 0 && (
                <div>
                  <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                    Projects of Interest <span className="text-gray-600">(optional)</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {projects.slice(0, 9).map((project) => (
                      <button
                        key={project.id}
                        type="button"
                        onClick={() => handleProjectToggle(project.id)}
                        className={`px-4 py-3 rounded-lg text-sm text-left transition-all ${
                          formData.projects_requested.includes(project.id)
                            ? 'bg-electric-blue text-white border border-electric-blue'
                            : 'bg-smoke-gray border border-gray-700 text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        {project.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message */}
              <div>
                <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                  Message <span className="text-gray-600">(optional)</span>
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-4 text-gray-500" size={20} />
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full bg-smoke-gray border border-gray-700 rounded-lg pl-12 pr-4 py-4 text-white focus:border-electric-blue focus:outline-none transition-colors resize-none"
                    rows={4}
                    placeholder="Tell us about yourself or your interest in our projects..."
                  />
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="bg-smoke-gray border border-gray-700 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreed_to_terms"
                    checked={formData.agreed_to_terms}
                    onChange={handleChange}
                    className="w-5 h-5 mt-0.5 rounded border-gray-600 text-electric-blue focus:ring-electric-blue"
                    data-testid="terms-checkbox"
                  />
                  <span className="text-gray-300 text-sm">
                    I agree not to share, copy, or distribute any confidential materials accessed through the Studio Portal. 
                    I understand that all documents may be watermarked and that my access may be revoked if these terms are violated.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 text-white px-8 py-4 rounded-full font-mono text-sm uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2"
                data-testid="submit-request-btn"
              >
                {loading ? 'Submitting...' : 'Request Access'}
                {!loading && <ArrowRight size={18} />}
              </button>

              {/* Login Link */}
              <p className="text-center text-gray-500 text-sm">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/studio-access/login')}
                  className="text-electric-blue hover:underline"
                >
                  Sign In
                </button>
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default RequestAccess;
