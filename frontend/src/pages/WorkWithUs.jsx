import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Send, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

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
    if (formData.message.length > 500) {
      newErrors.message = 'Message must be under 500 characters';
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
              className="text-4xl md:text-5xl font-bold text-white mb-6"
              style={{ fontFamily: 'Cinzel, serif' }}
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
      <section className="hero-section py-24 border-b border-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-electric-blue font-mono text-sm uppercase tracking-widest mb-6">
              Submissions
            </p>
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              Work With Shadow Wolves
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              Submit with intent. Not everything gets through.
            </p>
          </div>
        </div>
      </section>

      {/* Guidelines */}
      <section className="guidelines-section py-16 border-b border-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-5xl mx-auto">
            {/* What We're Open To */}
            <div>
              <h2 
                className="text-2xl font-bold text-white mb-8"
                style={{ fontFamily: 'Cinzel, serif' }}
              >
                What We're Open To
              </h2>
              <ul className="space-y-4">
                {[
                  'Original genre scripts',
                  'Proof-of-concepts',
                  'Short films',
                  'Strategic collaborators',
                  'Select brand or IP partnerships'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-300">
                    <span className="text-electric-blue mt-1">▪</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What We're Not Open To */}
            <div>
              <h2 
                className="text-2xl font-bold text-white mb-8"
                style={{ fontFamily: 'Cinzel, serif' }}
              >
                What We're Not Open To
              </h2>
              <ul className="space-y-4">
                {[
                  'First drafts',
                  'Unfinished ideas',
                  'Mass submissions',
                  'Unrequested attachments',
                  'Off-genre projects'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-500">
                    <span className="text-red-500/60 mt-1">✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Submission Form */}
      <section className="form-section py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 
              className="text-3xl font-bold text-white mb-12 text-center"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              Submit Your Project
            </h2>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Name & Email */}
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
                    className={`w-full bg-smoke-gray border ${errors.name ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none transition-colors`}
                    placeholder="Your name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
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
                    className={`w-full bg-smoke-gray border ${errors.email ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none transition-colors`}
                    placeholder="your@email.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                  Your Role *
                </label>
                <div className="relative">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={`w-full bg-smoke-gray border ${errors.role ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none appearance-none cursor-pointer transition-colors`}
                  >
                    <option value="">Select your primary role</option>
                    {ROLES.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                </div>
                {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
              </div>

              {/* Submission Type */}
              <div>
                <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                  Submission Type *
                </label>
                <div className="relative">
                  <select
                    name="submission_type"
                    value={formData.submission_type}
                    onChange={handleChange}
                    className={`w-full bg-smoke-gray border ${errors.submission_type ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none appearance-none cursor-pointer transition-colors`}
                  >
                    <option value="">What are you submitting?</option>
                    {SUBMISSION_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                </div>
                {errors.submission_type && <p className="text-red-500 text-sm mt-1">{errors.submission_type}</p>}
              </div>

              {/* Genres */}
              <div>
                <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-3">
                  Genre(s) *
                </label>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map(genre => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => handleGenreToggle(genre)}
                      className={`px-4 py-2 rounded-full text-sm transition-all ${
                        formData.genres.includes(genre)
                          ? 'bg-electric-blue text-white'
                          : 'bg-smoke-gray border border-gray-700 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
                {errors.genres && <p className="text-red-500 text-sm mt-2">{errors.genres}</p>}
              </div>

              {/* Project Stage */}
              <div>
                <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                  Project Stage *
                </label>
                <div className="relative">
                  <select
                    name="project_stage"
                    value={formData.project_stage}
                    onChange={handleChange}
                    className={`w-full bg-smoke-gray border ${errors.project_stage ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none appearance-none cursor-pointer transition-colors`}
                  >
                    <option value="">Where is the project at?</option>
                    {PROJECT_STAGES.map(stage => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                </div>
                {errors.project_stage && <p className="text-red-500 text-sm mt-1">{errors.project_stage}</p>}
              </div>

              {/* Logline */}
              <div>
                <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                  Logline * <span className="text-gray-600">({formData.logline.length}/300)</span>
                </label>
                <textarea
                  name="logline"
                  value={formData.logline}
                  onChange={handleChange}
                  rows={3}
                  maxLength={300}
                  className={`w-full bg-smoke-gray border ${errors.logline ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none resize-none transition-colors`}
                  placeholder="A one-sentence summary of your project..."
                />
                {errors.logline && <p className="text-red-500 text-sm mt-1">{errors.logline}</p>}
              </div>

              {/* External Link */}
              <div>
                <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                  External Link <span className="text-gray-600">(Google Drive, Vimeo, Website)</span>
                </label>
                <input
                  type="url"
                  name="external_link"
                  value={formData.external_link}
                  onChange={handleChange}
                  className="w-full bg-smoke-gray border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none transition-colors"
                  placeholder="https://..."
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                  Additional Message <span className="text-gray-600">({formData.message.length}/500)</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  maxLength={500}
                  className={`w-full bg-smoke-gray border ${errors.message ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none resize-none transition-colors`}
                  placeholder="Anything else we should know? (optional)"
                />
                {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
              </div>

              {/* Submit */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-full font-mono text-sm uppercase tracking-widest transition-all"
                >
                  {submitting ? (
                    <>Processing...</>
                  ) : (
                    <>
                      Submit
                      <Send size={18} />
                    </>
                  )}
                </button>
              </div>

              {/* Disclaimer */}
              <p className="text-center text-gray-600 text-sm">
                No file uploads at this stage. We'll request materials if needed.
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WorkWithUs;
