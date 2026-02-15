import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Send, CheckCircle, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '../components/PageHeader';

const CineConnectSection = () => {
  const [showForm, setShowForm] = useState(false);
  const [ccData, setCcData] = useState({ name: '', email: '' });
  const [submittingCC, setSubmittingCC] = useState(false);
  const [ccSubmitted, setCcSubmitted] = useState(false);

  const handleCCSubmit = async (e) => {
    e.preventDefault();
    if (!ccData.name.trim() || !ccData.email.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setSubmittingCC(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/contact/cineconnect-interest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ccData)
      });
      if (response.ok) {
        setCcSubmitted(true);
        toast.success('Interest registered! We\'ll notify you when CineConnect launches.');
      } else {
        toast.error('Failed to register. Please try again.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmittingCC(false);
    }
  };

  if (ccSubmitted) {
    return (
      <div className="mt-10 bg-green-500/5 border border-green-500/20 rounded-lg p-5" data-testid="cineconnect-section">
        <h4 className="text-white font-bold mb-2 font-cinzel">CineConnect</h4>
        <p className="text-green-400 text-sm">You're on the list. We'll be in touch when CineConnect launches.</p>
      </div>
    );
  }

  return (
    <div className="mt-10 bg-electric-blue/5 border border-electric-blue/20 rounded-lg p-5" data-testid="cineconnect-section">
      <h4 className="text-white font-bold mb-2 font-cinzel">CineConnect</h4>
      <p className="text-gray-400 text-sm mb-3">Cast & Crew Network (Coming Soon)</p>
      <p className="text-gray-500 text-xs mb-4">
        A curated database for production talent. Register your interest to be notified when we launch.
      </p>
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="px-5 py-2.5 bg-electric-blue hover:bg-electric-blue/90 text-white rounded-full text-xs font-mono uppercase tracking-widest transition-all"
          data-testid="cineconnect-register-btn"
        >
          Register Interest
        </button>
      ) : (
        <form onSubmit={handleCCSubmit} className="space-y-3">
          <input
            type="text"
            value={ccData.name}
            onChange={(e) => setCcData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Your name"
            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:border-electric-blue focus:outline-none"
            data-testid="cineconnect-name-input"
          />
          <input
            type="email"
            value={ccData.email}
            onChange={(e) => setCcData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="Your email"
            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:border-electric-blue focus:outline-none"
            data-testid="cineconnect-email-input"
          />
          <button
            type="submit"
            disabled={submittingCC}
            className="w-full px-5 py-2.5 bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 text-white rounded-full text-xs font-mono uppercase tracking-widest transition-all"
            data-testid="cineconnect-submit-btn"
          >
            {submittingCC ? 'Registering...' : 'Register Interest'}
          </button>
        </form>
      )}
    </div>
  );
};

const ROLES = ['Writer', 'Director', 'Producer', 'Actor', 'Cinematographer', 'Editor', 'Composer', 'Other'];
const SUBMISSION_TYPES = ['Script', 'Concept', 'Proof-of-Concept', 'Collaboration', 'Brand/IP Partnership'];
const GENRES = ['Horror', 'Thriller', 'Psychological', 'Supernatural', 'Slasher', 'Drama', 'Action', 'Sci-Fi', 'Dark Comedy'];
const PROJECT_STAGES = ['Idea', 'First Draft', 'Polished Draft', 'Proof-of-Concept', 'In Development'];

const WorkWithUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    submission_type: '',
    genres: [],
    project_stage: '',
    logline: '',
    external_link: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmOriginal, setConfirmOriginal] = useState(false);
  const [confirmNoAttachments, setConfirmNoAttachments] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.role) newErrors.role = 'Please select your role';
    if (!formData.submission_type) newErrors.submission_type = 'Please select submission type';
    if (formData.genres.length === 0) newErrors.genres = 'Select at least one genre';
    if (!formData.project_stage) newErrors.project_stage = 'Please select project stage';
    if (!formData.logline.trim()) {
      newErrors.logline = 'Logline is required';
    } else if (formData.logline.length > 300) {
      newErrors.logline = 'Logline must be under 300 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleGenreToggle = (genre) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
    if (errors.genres) {
      setErrors(prev => ({ ...prev, genres: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    // Validate legal checkboxes
    if (!confirmOriginal || !confirmNoAttachments) {
      toast.error('Please confirm the required acknowledgements');
      return;
    }

    setSubmitting(true);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitted(true);
        toast.success('Submission received');
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Submission failed. Please try again.');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="work-with-us-page pt-20 min-h-screen bg-black">
        <Helmet>
          <title>Submission Received | Shadow Wolves Productions</title>
        </Helmet>
        
        <div className="container mx-auto px-4 py-32">
          <div className="max-w-2xl mx-auto text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-8" />
            <h1 
              className="text-4xl md:text-5xl font-bold text-white mb-6 font-cinzel"
            >
              Thanks for your submission.
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed mb-4">
              If the project aligns with our current development slate, we'll be in touch.
            </p>
            <p className="text-gray-500">
              Due to volume, we're unable to respond to every submission.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="work-with-us-page pt-20 min-h-screen bg-black">
      <Helmet>
        <title>Work With Us | Shadow Wolves Productions</title>
        <meta name="description" content="Submit your project to Shadow Wolves Productions. We're selectively open to original genre scripts, proof-of-concepts, and strategic collaborations." />
      </Helmet>

      {/* Hero Section */}
      <PageHeader page="workwithus" title="Work With Us" subtitle="Submit with intent. Not everything gets through." />

      {/* Two Column Layout */}
      <section className="py-12 bg-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Left: Form */}
            <div>
              <h2 
                className="text-3xl font-bold text-white mb-8 font-cinzel"
              >
                Submit Your Project
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm uppercase tracking-wide mb-2">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full bg-smoke-gray border ${errors.name ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none`}
                      placeholder="Your name"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm uppercase tracking-wide mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full bg-smoke-gray border ${errors.email ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none`}
                      placeholder="your@email.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                </div>

                {/* Role & Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm uppercase tracking-wide mb-2">Your Role *</label>
                    <div className="relative">
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className={`w-full bg-smoke-gray border ${errors.role ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none appearance-none cursor-pointer`}
                      >
                        <option value="">Select role</option>
                        {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                    </div>
                    {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm uppercase tracking-wide mb-2">Submission Type *</label>
                    <div className="relative">
                      <select
                        name="submission_type"
                        value={formData.submission_type}
                        onChange={handleChange}
                        className={`w-full bg-smoke-gray border ${errors.submission_type ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none appearance-none cursor-pointer`}
                      >
                        <option value="">Select type</option>
                        {SUBMISSION_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                    </div>
                    {errors.submission_type && <p className="text-red-500 text-xs mt-1">{errors.submission_type}</p>}
                  </div>
                </div>

                {/* Genres */}
                <div>
                  <label className="block text-gray-400 text-sm uppercase tracking-wide mb-2">Genre(s) *</label>
                  <div className="flex flex-wrap gap-2">
                    {GENRES.map(genre => (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => handleGenreToggle(genre)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                          formData.genres.includes(genre)
                            ? 'bg-electric-blue text-white'
                            : 'bg-smoke-gray border border-gray-700 text-gray-400 hover:border-gray-500'
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                  {errors.genres && <p className="text-red-500 text-xs mt-1">{errors.genres}</p>}
                </div>

                {/* Project Stage */}
                <div>
                  <label className="block text-gray-400 text-sm uppercase tracking-wide mb-2">Project Stage *</label>
                  <div className="relative">
                    <select
                      name="project_stage"
                      value={formData.project_stage}
                      onChange={handleChange}
                      className={`w-full bg-smoke-gray border ${errors.project_stage ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none appearance-none cursor-pointer`}
                    >
                      <option value="">Where is the project at?</option>
                      {PROJECT_STAGES.map(stage => <option key={stage} value={stage}>{stage}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                  </div>
                  {errors.project_stage && <p className="text-red-500 text-xs mt-1">{errors.project_stage}</p>}
                </div>

                {/* Logline */}
                <div>
                  <label className="block text-gray-400 text-sm uppercase tracking-wide mb-2">
                    Logline * <span className="text-gray-600 normal-case">({formData.logline.length}/300)</span>
                  </label>
                  <textarea
                    name="logline"
                    value={formData.logline}
                    onChange={handleChange}
                    rows={2}
                    maxLength={300}
                    className={`w-full bg-smoke-gray border ${errors.logline ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none resize-none`}
                    placeholder="A one-sentence summary..."
                  />
                  {errors.logline && <p className="text-red-500 text-xs mt-1">{errors.logline}</p>}
                </div>

                {/* External Link */}
                <div>
                  <label className="block text-gray-400 text-sm uppercase tracking-wide mb-2">
                    Link <span className="text-gray-600 normal-case">(Drive, Vimeo, Website)</span>
                  </label>
                  <input
                    type="url"
                    name="external_link"
                    value={formData.external_link}
                    onChange={handleChange}
                    className="w-full bg-smoke-gray border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none"
                    placeholder="https://..."
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-gray-400 text-sm uppercase tracking-wide mb-2">
                    Message <span className="text-gray-600 normal-case">(optional)</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={3}
                    maxLength={500}
                    className="w-full bg-smoke-gray border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none resize-none"
                    placeholder="Anything else?"
                  />
                </div>

                {/* Legal Acknowledgements */}
                <div className="space-y-3 pt-4 border-t border-gray-800">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={confirmOriginal}
                      onChange={(e) => setConfirmOriginal(e.target.checked)}
                      className="mt-1 rounded border-gray-600 bg-smoke-gray text-electric-blue focus:ring-electric-blue"
                    />
                    <span className="text-gray-400 text-sm group-hover:text-gray-300">
                      I confirm this project is original or I control the rights to submit it. *
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={confirmNoAttachments}
                      onChange={(e) => setConfirmNoAttachments(e.target.checked)}
                      className="mt-1 rounded border-gray-600 bg-smoke-gray text-electric-blue focus:ring-electric-blue"
                    />
                    <span className="text-gray-400 text-sm group-hover:text-gray-300">
                      I understand Shadow Wolves Productions cannot accept unsolicited attachments. *
                    </span>
                  </label>
                  <p className="text-gray-600 text-xs pl-6">
                    If accepted, we will request materials securely.
                  </p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-full font-mono text-sm uppercase tracking-widest transition-all"
                >
                  {submitting ? 'Processing...' : <><Send size={16} /> Submit</>}
                </button>

                <p className="text-center text-gray-600 text-xs">
                  No file uploads at this stage. We'll request materials if needed.
                </p>
              </form>
            </div>

            {/* Right: Guidelines */}
            <div className="lg:pl-8">
              {/* What We're Open To */}
              <div className="mb-10">
                <h3 
                  className="text-2xl font-bold text-white mb-6 font-cinzel"
                >
                  What We're Open To
                </h3>
                <ul className="space-y-3">
                  {[
                    'Original genre scripts',
                    'Proof-of-concepts',
                    'Short films',
                    'Strategic collaborators',
                    'Select brand or IP partnerships'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-electric-blue mt-2 flex-shrink-0"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* What We're Not Open To */}
              <div className="mb-10">
                <h3 
                  className="text-2xl font-bold text-white mb-6 font-cinzel"
                >
                  What We're Not Open To
                </h3>
                <ul className="space-y-3">
                  {[
                    'First drafts',
                    'Unfinished ideas',
                    'Mass submissions',
                    'Unrequested attachments',
                    'Off-genre projects'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-500">
                      <span className="text-red-500/60 mt-0.5">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Note */}
              <div className="bg-smoke-gray/50 border border-gray-800 rounded-lg p-5">
                <p className="text-gray-400 text-sm leading-relaxed">
                  We review submissions on an ongoing basis. If your project aligns with our slate, expect to hear back within 2-4 weeks.
                </p>
              </div>

              {/* CineConnect - Coming Soon */}
              <CineConnectSection />
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default WorkWithUs;
