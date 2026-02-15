import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Shield, BarChart3, FileText, Lock, Mail, ChevronRight, Users, Briefcase, TrendingUp, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '../components/PageHeader';

const BUDGET_TIERS = [
  { label: 'Seed', range: 'Under $10K', desc: 'Proof-of-concepts, shorts, development tests' },
  { label: 'Micro-Budget', range: '$50K–$250K', desc: 'Proof-of-concepts, shorts, micro productions' },
  { label: 'Low Budget', range: '$250K–$2M', desc: 'Feature films' },
  { label: 'Mid Budget', range: '$2M–$5M', desc: 'Elevated genre projects' },
  { label: 'High Budget', range: '$5M+', desc: 'Premium genre projects / larger-scale productions' },
];

const PORTAL_BENEFITS = [
  'Full development slate overview',
  'Investor-only studio updates',
  'Watermarked confidential documents',
  'Controlled material requests',
  'Confidential communication channel',
];

const INVESTOR_TYPES = ['Individual', 'Family Office', 'Venture Capital', 'Strategic Partner', 'Other'];
const INTEREST_AREAS = ['Single Project', 'Slate Investment', 'Strategic Partnership', 'Advisory Role', 'Other'];

const InvestorsPublic = () => {
  const [form, setForm] = useState({ name: '', email: '', investor_type: 'Individual', area_of_interest: 'Single Project', message: '', confidentiality_ack: false, risk_ack: false });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) { toast.error('Name and email are required'); return; }
    if (!form.confidentiality_ack || !form.risk_ack) { toast.error('Please acknowledge both disclaimers'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/investors/request-access`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) { setSubmitted(true); toast.success(data.message); }
      else toast.error(data.detail || 'Failed to submit');
    } catch { toast.error('Network error. Please try again.'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-black pt-20" data-testid="investors-public-page">
      <Helmet>
        <title>Investors | Shadow Wolves Productions</title>
        <meta name="description" content="Development-first genre storytelling. Structured investment pathways. Request investor portal access." />
      </Helmet>

      {/* HERO */}
      <PageHeader page="investors" title="Investors" subtitle="Development-first genre storytelling. Structured investment pathways.">
        <div className="flex flex-wrap gap-4 mt-6">
          <a href="#request-access" className="px-6 py-2.5 bg-electric-blue hover:bg-electric-blue/90 text-white rounded-full font-mono text-sm uppercase tracking-widest transition-all" data-testid="cta-request-access">Request Investor Access</a>
          <a href="#investment-model" className="px-6 py-2.5 border border-gray-700 text-white rounded-full font-mono text-sm uppercase tracking-widest hover:bg-white/5 transition-all" data-testid="cta-view-model">View Investment Model</a>
        </div>
      </PageHeader>

      {/* STUDIO OVERVIEW */}
      <section className="container mx-auto px-4 py-16 border-t border-gray-800/50">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold text-white mb-6 font-cinzel">The Studio</h2>
          <p className="text-gray-400 leading-relaxed mb-4">Shadow Wolves Productions develops and produces bold, genre-driven content designed for global audiences. Our slate spans feature films, series, and digital properties — each project built on strong IP, clear market positioning, and experienced creative teams.</p>
          <p className="text-gray-400 leading-relaxed">We operate a development-first model: projects are packaged with talent, market strategy, and distribution pathways before financing is sought. This reduces risk and increases the speed to market.</p>
        </div>
      </section>

      {/* INVESTMENT MODEL */}
      <section id="investment-model" className="py-16 bg-smoke-gray/30 border-t border-gray-800/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-8 font-cinzel">Investment Model</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            <div className="bg-black border border-gray-800 rounded-xl p-6">
              <div className="w-10 h-10 bg-electric-blue/10 rounded-lg flex items-center justify-center mb-4">
                <Briefcase size={20} className="text-electric-blue" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2 font-cinzel">Project-by-Project</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Invest in individual titles across development, production, or gap financing stages. Clear entry and exit points with defined risk profiles per project.</p>
            </div>
            <div className="bg-black border border-gray-800 rounded-xl p-6">
              <div className="w-10 h-10 bg-electric-blue/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp size={20} className="text-electric-blue" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2 font-cinzel">Slate Investment</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Portfolio approach across multiple projects. Diversification, first-look rights, and strategic positioning across the studio's development pipeline.</p>
            </div>
          </div>
        </div>
      </section>

      {/* BUDGET TIERS */}
      <section className="container mx-auto px-4 py-16 border-t border-gray-800/50">
        <h2 className="text-2xl font-bold text-white mb-8 font-cinzel">Budget Ranges</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl">
          {BUDGET_TIERS.map((tier, i) => (
            <div key={i} className="bg-smoke-gray border border-gray-800 rounded-lg p-4 text-center" data-testid={`budget-tier-${i}`}>
              <p className="text-electric-blue text-xs font-mono uppercase tracking-widest mb-1">{tier.label}</p>
              <p className="text-white text-lg font-bold mb-2">{tier.range}</p>
              <p className="text-gray-500 text-xs leading-relaxed">{tier.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-gray-600 text-xs mt-6 max-w-3xl italic">Not an offer to sell securities. For qualified investors only. All investment opportunities are subject to individual project terms and applicable regulations.</p>
      </section>

      {/* PORTAL BENEFITS */}
      <section className="py-16 bg-smoke-gray/30 border-t border-gray-800/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-6 font-cinzel">What You Get With Portal Access</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
            {PORTAL_BENEFITS.map((benefit, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-black border border-gray-800 rounded-lg">
                <CheckCircle size={18} className="text-electric-blue mt-0.5 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REQUEST ACCESS FORM */}
      <section id="request-access" className="container mx-auto px-4 py-20 border-t border-gray-800/50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-2 font-cinzel text-center" data-testid="request-access-title">Request Investor Access</h2>
          <p className="text-gray-500 text-center mb-10">Complete the form below to receive your personal investor portal access link.</p>

          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 bg-smoke-gray border border-green-500/20 rounded-xl" data-testid="request-success">
              <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
              <h3 className="text-white text-xl font-bold mb-2">Thank You</h3>
              <p className="text-gray-400 max-w-md mx-auto">Your personal investor access link has been emailed to you. Check your inbox to create your account.</p>
              <p className="text-gray-600 text-sm mt-4">The link expires in 7 days.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" data-testid="request-access-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Full Name *</label>
                  <input type="text" required value={form.name} onChange={e => setForm(s => ({ ...s, name: e.target.value }))} className="w-full bg-smoke-gray border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none" placeholder="Your name" data-testid="investor-name-input" />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Email *</label>
                  <input type="email" required value={form.email} onChange={e => setForm(s => ({ ...s, email: e.target.value }))} className="w-full bg-smoke-gray border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none" placeholder="you@email.com" data-testid="investor-email-input" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Investor Type</label>
                  <select value={form.investor_type} onChange={e => setForm(s => ({ ...s, investor_type: e.target.value }))} className="w-full bg-smoke-gray border border-gray-700 rounded-lg px-4 py-3 text-white">
                    {INVESTOR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Area of Interest</label>
                  <select value={form.area_of_interest} onChange={e => setForm(s => ({ ...s, area_of_interest: e.target.value }))} className="w-full bg-smoke-gray border border-gray-700 rounded-lg px-4 py-3 text-white">
                    {INTEREST_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Message (optional)</label>
                <textarea value={form.message} onChange={e => setForm(s => ({ ...s, message: e.target.value }))} rows={3} className="w-full bg-smoke-gray border border-gray-700 rounded-lg px-4 py-3 text-white resize-none focus:border-electric-blue focus:outline-none" placeholder="Anything you'd like us to know..." />
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-3 text-gray-400 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.confidentiality_ack} onChange={e => setForm(s => ({ ...s, confidentiality_ack: e.target.checked }))} className="mt-1 rounded" data-testid="confidentiality-ack" />
                  <span>I acknowledge that all information shared through the Investor Portal is confidential and for my personal evaluation only.</span>
                </label>
                <label className="flex items-start gap-3 text-gray-400 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.risk_ack} onChange={e => setForm(s => ({ ...s, risk_ack: e.target.checked }))} className="mt-1 rounded" data-testid="risk-ack" />
                  <span>I understand that investing in film and media involves risk, and past performance is not indicative of future results.</span>
                </label>
              </div>

              <button type="submit" disabled={submitting} className="w-full py-4 bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 text-white rounded-full font-mono text-sm uppercase tracking-widest transition-all" data-testid="submit-request-btn">
                {submitting ? 'Submitting...' : 'Request Investor Access'}
              </button>
            </form>
          )}

          <p className="text-center mt-8 text-gray-600 text-sm">
            Already have access? <Link to="/investors/login" className="text-electric-blue hover:underline" data-testid="login-link">Sign in here</Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default InvestorsPublic;
