import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Send, CheckCircle, ChevronDown, Mail, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '../components/PageHeader';

// ============ CONSTANTS ============
const ROLES = ['Writer', 'Director', 'Producer', 'Actor', 'Cinematographer', 'Editor', 'Composer', 'Other'];
const SUBMISSION_TYPES = ['Script', 'Concept', 'Proof-of-Concept', 'Collaboration', 'Brand/IP Partnership'];
const FORMATS = ['Short', 'Feature', 'Series', 'Documentary', 'Other'];
const GENRES = ['Horror', 'Thriller', 'Psychological', 'Supernatural', 'Slasher', 'Drama', 'Action', 'Sci-Fi', 'Dark Comedy'];
const PROJECT_STAGES = ['Idea', 'First Draft', 'Polished Draft', 'Proof-of-Concept', 'In Development'];
const ENQUIRY_TOPICS = ['General Question', 'Investment Opportunities', 'Distribution', 'Press/Media', 'Partnership', 'Other'];

// ============ FAQ DATA ============
const FAQ_ITEMS = [
  {
    question: "What kind of projects are you looking for?",
    answer: "We develop and produce bold, genre-driven stories with teeth. Horror, thriller, psychological, slasher, supernatural, crime, true-crime and war-leaning drama are in our wheelhouse. If it's safe, predictable, or trying to please everyone, it's probably not us."
  },
  {
    question: "Do you accept unsolicited scripts or attachments?",
    answer: "Not upfront. We don't accept unsolicited attachments for legal and confidentiality reasons. If there's alignment, we'll request materials securely."
  },
  {
    question: "What should I submit first?",
    answer: "Start with a strong logline and a link to your pitch materials (deck, lookbook, or teaser). Keep it lean. If it hooks us, we'll ask for the next layer."
  },
  {
    question: "What formats do you work with?",
    answer: "Short films, feature films, series, and documentaries (selectively). Choose the format that best serves the story, not the one that feels easiest to \"get made.\""
  },
  {
    question: "I'm cast/crew. How do I get into your database?",
    answer: "CineConnect is our upcoming cast & crew network. Register your interest and we'll notify you when it opens.",
    link: { text: "CineConnect", url: "https://www.cognitoforms.com/ShadowWolvesProductions/CastCrewHub" }
  },
  {
    question: "Do you work with investors and partners?",
    answer: "Yes, through our Studio Access Portal. Public info is designed to intrigue. If there's alignment, we open the vault on everything. If you're interested in investment, you can",
    link: { text: "REQUEST ACCESS", url: "/request-access" }
  },
  {
    question: "How long does it take to hear back?",
    answer: "If it's a fit, you'll hear from us. If it's not, you probably won't. We keep our focus tight so we can actually build."
  },
  {
    question: "Can I submit multiple projects?",
    answer: "Submit your best one first. If it connects, we'll open the door to more."
  },
  {
    question: "Aside from films, what else do you do?",
    answer: "We build more than projects. We're developing a studio ecosystem — tools, resources, and platforms designed to support independent creators. That includes production infrastructure, development systems, and creator-focused software under The Armory."
  },
  {
    question: "What is The Den?",
    answer: "The Den is our working studio journal. It includes casting calls, crew intel, production lessons, industry news, and tools we actually use. Think of it like a blog with teeth."
  },
  {
    question: "What is The Armory?",
    answer: "The Armory is our creative arsenal — premium apps, templates, and resources built from real-world production experience. These are tools we use ourselves, now available to other filmmakers."
  },
  {
    question: "Is Shadow Wolves just horror?",
    answer: "No. Genre is our backbone, but not our limit. We prioritise bold, commercially viable stories across film and series. If it's taboo then it's probably worth telling."
  }
];

// Generate FAQ JSON-LD Schema
const generateFAQSchema = () => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": FAQ_ITEMS.map(item => ({
    "@type": "Question",
    "name": item.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": item.answer + (item.link ? ` ${item.link.text}: ${item.link.url}` : '')
    }
  }))
});

// ============ CINECONNECT CARD ============
const CineConnectCard = () => {
  const handleRegisterClick = () => {
    window.open('https://www.cognitoforms.com/ShadowWolvesProductions/CastCrewHub', '_blank');
  };

  return (
    <div className="bg-electric-blue/5 border border-electric-blue/20 rounded-lg p-5" data-testid="cineconnect-section">
      <h4 className="text-white font-bold mb-2 font-cinzel">CineConnect</h4>
      <p className="text-gray-400 text-sm mb-3">Cast & Crew Network (Coming Soon)</p>
      <p className="text-gray-500 text-xs mb-4">
        Fill out the form to join our talent database. When CineConnect launches, you'll already be in the system.
      </p>
      <button
        onClick={handleRegisterClick}
        className="px-5 py-2.5 bg-electric-blue hover:bg-electric-blue/90 text-white rounded-full text-xs font-mono uppercase tracking-widest transition-all"
        data-testid="cineconnect-register-btn"
      >
        Join the Database
      </button>
    </div>
  );
};

// ============ SUBMIT PROJECT FORM ============
const SubmitProjectForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    submission_type: '',
    format: '',
    genres: [],
    project_stage: '',
    logline: '',
    external_link: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmOriginal, setConfirmOriginal] = useState(false);
  const [confirmNoAttachments, setConfirmNoAttachments] = useState(false);

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
    if (!formData.format) newErrors.format = 'Please select format';
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
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleGenreToggle = (genre) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
    if (errors.genres) setErrors(prev => ({ ...prev, genres: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }
    if (!confirmOriginal || !confirmNoAttachments) {
      toast.error('Please confirm the required acknowledgements');
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, submission_type_tag: 'project' })
      });
      if (response.ok) {
        onSuccess();
        toast.success('Submission received');
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Submission failed. Please try again.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" data-testid="submit-project-form">
      {/* Name */}
      <div>
        <label className="block text-gray-400 text-sm uppercase tracking-wide mb-2">Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full bg-smoke-gray border ${errors.name ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none`}
          placeholder="Your name"
          data-testid="project-name-input"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-gray-400 text-sm uppercase tracking-wide mb-2">Email *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full bg-smoke-gray border ${errors.email ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none`}
          placeholder="your@email.com"
          data-testid="project-email-input"
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>

      {/* Role & Submission Type - Same Line */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-400 text-sm uppercase tracking-wide mb-2">Your Role *</label>
          <div className="relative">
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`w-full bg-smoke-gray border ${errors.role ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none appearance-none cursor-pointer`}
              data-testid="project-role-select"
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
              data-testid="project-type-select"
            >
              <option value="">Select type</option>
              {SUBMISSION_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
          </div>
          {errors.submission_type && <p className="text-red-500 text-xs mt-1">{errors.submission_type}</p>}
        </div>
      </div>

      {/* Format & Project Stage - Same Line */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-400 text-sm uppercase tracking-wide mb-2">Format *</label>
          <div className="relative">
            <select
              name="format"
              value={formData.format}
              onChange={handleChange}
              className={`w-full bg-smoke-gray border ${errors.format ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none appearance-none cursor-pointer`}
              data-testid="project-format-select"
            >
              <option value="">Select format</option>
              {FORMATS.map(format => <option key={format} value={format}>{format}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
          </div>
          {errors.format && <p className="text-red-500 text-xs mt-1">{errors.format}</p>}
        </div>

        <div>
          <label className="block text-gray-400 text-sm uppercase tracking-wide mb-2">Project Stage *</label>
          <div className="relative">
            <select
              name="project_stage"
              value={formData.project_stage}
              onChange={handleChange}
              className={`w-full bg-smoke-gray border ${errors.project_stage ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none appearance-none cursor-pointer`}
              data-testid="project-stage-select"
            >
              <option value="">Where is the project at?</option>
              {PROJECT_STAGES.map(stage => <option key={stage} value={stage}>{stage}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
          </div>
          {errors.project_stage && <p className="text-red-500 text-xs mt-1">{errors.project_stage}</p>}
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
              data-testid={`genre-chip-${genre.toLowerCase()}`}
            >
              {genre}
            </button>
          ))}
        </div>
        {errors.genres && <p className="text-red-500 text-xs mt-1">{errors.genres}</p>}
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
          data-testid="project-logline-input"
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
          data-testid="project-link-input"
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
          data-testid="project-message-input"
        />
      </div>

      {/* Quiet Note */}
      <p className="text-gray-600 text-xs">
        We do not accept unsolicited attachments. If there's alignment, materials will be requested securely.
      </p>

      {/* Legal Acknowledgements */}
      <div className="space-y-3 pt-4 border-t border-gray-800">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={confirmOriginal}
            onChange={(e) => setConfirmOriginal(e.target.checked)}
            className="mt-1 rounded border-gray-600 bg-smoke-gray text-electric-blue focus:ring-electric-blue"
            data-testid="confirm-original-checkbox"
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
            data-testid="confirm-attachments-checkbox"
          />
          <span className="text-gray-400 text-sm group-hover:text-gray-300">
            I understand unsolicited attachments cannot be accepted. *
          </span>
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-full font-mono text-sm uppercase tracking-widest transition-all"
        data-testid="submit-project-btn"
      >
        {submitting ? 'Processing...' : <><Send size={16} /> Submit Project</>}
      </button>
    </form>
  );
};

// ============ GENERAL ENQUIRY FORM ============
const GeneralEnquiryForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    topic: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.topic) newErrors.topic = 'Please select a topic';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          service: formData.topic,
          submission_type_tag: 'enquiry' 
        })
      });
      if (response.ok) {
        onSuccess();
        toast.success('Message sent successfully');
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to send. Please try again.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" data-testid="general-enquiry-form">
      {/* Full Name */}
      <div>
        <label className="block text-gray-400 text-sm uppercase tracking-wide mb-2">Full Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full bg-smoke-gray border ${errors.name ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none`}
          placeholder="John Doe"
          data-testid="enquiry-name-input"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-gray-400 text-sm uppercase tracking-wide mb-2">Email Address *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full bg-smoke-gray border ${errors.email ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none`}
          placeholder="john@example.com"
          data-testid="enquiry-email-input"
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-gray-400 text-sm uppercase tracking-wide mb-2">
          Phone Number <span className="text-gray-600 normal-case">(optional)</span>
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full bg-smoke-gray border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none"
          placeholder="+61 XXX XXX XXX"
          data-testid="enquiry-phone-input"
        />
      </div>

      {/* Topic */}
      <div>
        <label className="block text-gray-400 text-sm uppercase tracking-wide mb-2">What can we help with? *</label>
        <div className="relative">
          <select
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            className={`w-full bg-smoke-gray border ${errors.topic ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none appearance-none cursor-pointer`}
            data-testid="enquiry-topic-select"
          >
            <option value="">Select a topic</option>
            {ENQUIRY_TOPICS.map(topic => <option key={topic} value={topic}>{topic}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
        </div>
        {errors.topic && <p className="text-red-500 text-xs mt-1">{errors.topic}</p>}
      </div>

      {/* Message */}
      <div>
        <label className="block text-gray-400 text-sm uppercase tracking-wide mb-2">Message *</label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={5}
          className={`w-full bg-smoke-gray border ${errors.message ? 'border-red-500' : 'border-gray-700'} rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none resize-none`}
          placeholder="Tell us about your enquiry..."
          data-testid="enquiry-message-input"
        />
        {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-full font-mono text-sm uppercase tracking-widest transition-all"
        data-testid="submit-enquiry-btn"
      >
        {submitting ? 'Sending...' : <><Mail size={16} /> Send Message</>}
      </button>
    </form>
  );
};

// ============ NEWSLETTER SECTION ============
const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'work_with_us_page' })
      });
      if (response.ok) {
        setSubscribed(true);
        toast.success('Welcome to the pack!');
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to subscribe');
      }
    } catch {
      toast.error('Connection error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-navy-dark via-black to-navy-dark relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-electric-blue rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-electric-blue rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white font-cinzel">Join the Pack</h2>
        <p className="max-w-2xl text-lg mb-8 mx-auto text-gray-300">
          Inside access to casting calls, industry updates, and the tools, apps, and templates we actually use.
        </p>
        
        <div className="max-w-md mx-auto">
          {subscribed ? (
            <div className="flex items-center justify-center gap-3 text-green-400" data-testid="newsletter-success">
              <CheckCircle size={24} />
              <span>You're in. Welcome to the pack.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3" data-testid="newsletter-form">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-6 py-4 rounded-full bg-smoke-gray border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-electric-blue transition-colors"
                data-testid="newsletter-email-input"
              />
              <button
                type="submit"
                disabled={submitting}
                className="bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 text-white px-8 py-4 rounded-full font-mono text-sm uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2"
                data-testid="newsletter-submit-btn"
              >
                {submitting ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          )}
          <p className="text-gray-500 text-xs mt-4">
            No spam. Unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </div>
    </section>
  );
};

// ============ FAQ ACCORDION SECTION ============
const FAQSection = () => {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (index) => {
    setOpenItems(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <section className="py-12 bg-black" data-testid="faq-section">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-2xl font-bold text-white mb-8 font-cinzel">FAQ</h2>
        <div className="space-y-2">
          {FAQ_ITEMS.map((item, index) => (
            <div 
              key={index} 
              className="border border-gray-800 rounded-lg overflow-hidden"
              data-testid={`faq-item-${index}`}
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full flex items-center justify-between px-5 py-4 text-left bg-smoke-gray/50 hover:bg-smoke-gray/70 transition-colors"
                aria-expanded={openItems[index]}
              >
                <span className="text-white text-sm font-medium pr-4">{item.question}</span>
                {openItems[index] ? (
                  <Minus size={18} className="text-electric-blue flex-shrink-0" />
                ) : (
                  <Plus size={18} className="text-gray-500 flex-shrink-0" />
                )}
              </button>
              {openItems[index] && (
                <div className="px-5 py-4 bg-black border-t border-gray-800">
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {item.answer}
                    {item.link && (
                      <>
                        {' '}
                        <a 
                          href={item.link.url} 
                          target={item.link.url.startsWith('http') ? '_blank' : undefined}
                          rel={item.link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="text-electric-blue hover:underline"
                        >
                          {item.link.text}
                        </a>
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============ SUCCESS STATE ============
const SuccessState = ({ type, onReset }) => (
  <div className="text-center py-12" data-testid={`${type}-success`}>
    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
    <h3 className="text-2xl font-bold text-white mb-4 font-cinzel">
      {type === 'project' ? 'Thanks for your submission.' : 'Message sent.'}
    </h3>
    <p className="text-gray-400 mb-6">
      {type === 'project' 
        ? 'If the project aligns with our current development slate, we\'ll be in touch.'
        : 'We\'ll get back to you as soon as possible.'}
    </p>
    <button
      onClick={onReset}
      className="text-electric-blue hover:underline text-sm"
      data-testid="submit-another-btn"
    >
      Submit another {type === 'project' ? 'project' : 'enquiry'}
    </button>
  </div>
);

// ============ MAIN COMPONENT ============
const WorkWithUs = () => {
  const [activeLane, setActiveLane] = useState(null); // null, 'project', or 'enquiry'
  const [projectSubmitted, setProjectSubmitted] = useState(false);
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleProjectSuccess = () => setProjectSubmitted(true);
  const handleEnquirySuccess = () => setEnquirySubmitted(true);

  const resetProjectForm = () => {
    setProjectSubmitted(false);
    setActiveLane('project');
  };

  const resetEnquiryForm = () => {
    setEnquirySubmitted(false);
    setActiveLane('enquiry');
  };

  return (
    <div className="work-with-us-page pt-20 min-h-screen bg-black">
      <Helmet>
        <title>Work With Us | Shadow Wolves Productions</title>
        <meta name="description" content="Submit your project or get in touch with Shadow Wolves Productions. We're selectively open to original genre scripts, proof-of-concepts, and strategic collaborations." />
        <link rel="canonical" href="https://shadowwolvesproductions.com/work-with-us" />
      </Helmet>
      
      {/* FAQ JSON-LD Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateFAQSchema()) }}
      />

      {/* Hero Section */}
      <PageHeader 
        page="workwithus" 
        title="Work With Us" 
        subtitle="Choose your lane. Submit with intent." 
      />

      {/* Main Content */}
      <section className="py-12 bg-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: Forms Area (2 columns) */}
            <div className="lg:col-span-2">
              {/* Lane Toggle Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={() => setActiveLane(activeLane === 'project' ? null : 'project')}
                  className={`flex-1 py-4 px-6 rounded-lg font-mono text-sm uppercase tracking-widest transition-all border-2 ${
                    activeLane === 'project'
                      ? 'bg-electric-blue border-electric-blue text-white'
                      : 'bg-transparent border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
                  }`}
                  data-testid="submit-project-toggle"
                >
                  Submit a Project
                </button>
                <button
                  onClick={() => setActiveLane(activeLane === 'enquiry' ? null : 'enquiry')}
                  className={`flex-1 py-4 px-6 rounded-lg font-mono text-sm uppercase tracking-widest transition-all border-2 ${
                    activeLane === 'enquiry'
                      ? 'bg-electric-blue border-electric-blue text-white'
                      : 'bg-transparent border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
                  }`}
                  data-testid="general-enquiry-toggle"
                >
                  General Enquiry
                </button>
              </div>

              {/* Project Submission Lane */}
              {activeLane === 'project' && (
                <div className="bg-smoke-gray/30 border border-gray-800 rounded-xl p-6 md:p-8" data-testid="project-lane">
                  <h2 className="text-2xl font-bold text-white mb-6 font-cinzel">Submit Your Project</h2>
                  {projectSubmitted ? (
                    <SuccessState type="project" onReset={resetProjectForm} />
                  ) : (
                    <SubmitProjectForm onSuccess={handleProjectSuccess} />
                  )}
                </div>
              )}

              {/* General Enquiry Lane */}
              {activeLane === 'enquiry' && (
                <div className="bg-smoke-gray/30 border border-gray-800 rounded-xl p-6 md:p-8" data-testid="enquiry-lane">
                  <h2 className="text-2xl font-bold text-white mb-6 font-cinzel">General Enquiry</h2>
                  {enquirySubmitted ? (
                    <SuccessState type="enquiry" onReset={resetEnquiryForm} />
                  ) : (
                    <GeneralEnquiryForm onSuccess={handleEnquirySuccess} />
                  )}
                </div>
              )}

              {/* Default state - no form selected */}
              {!activeLane && (
                <div className="text-center py-16 text-gray-400">
                  <p className="text-lg font-bold">Select an option above to get started.</p>
                </div>
              )}
            </div>

            {/* Right: CineConnect Card */}
            <div className="lg:col-span-1">
              <CineConnectCard />
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Newsletter Section */}
      <NewsletterSection />
    </div>
  );
};

export default WorkWithUs;
