import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Lock, Key, ArrowRight, Shield, Mail } from 'lucide-react';
import { toast } from 'sonner';

const InvestorLogin = ({ onLogin }) => {
  const [step, setStep] = useState('login');
  const [loginType, setLoginType] = useState('email'); // 'email', 'password', 'code'
  const [email, setEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [password, setPassword] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [portalStatus, setPortalStatus] = useState({ enabled: true, require_code: false });
  const [ndaAccepted, setNdaAccepted] = useState(false);
  const [riskAccepted, setRiskAccepted] = useState(false);
  const [pendingAuth, setPendingAuth] = useState(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/investors/portal-status`);
        if (res.ok) { const s = await res.json(); setPortalStatus(s); if (s.require_code) setLoginType('code'); }
      } catch { /* silent */ }
    };
    checkStatus();
  }, []);

  // Email/password login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/investors/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: emailPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setPendingAuth({ success: true, investor_name: data.investor?.name, investor_id: data.investor?.id, accountData: data.investor });
        setStep('nda');
      } else {
        toast.error(data.detail || 'Invalid credentials');
      }
    } catch { toast.error('Network error'); }
    finally { setLoading(false); }
  };

  // Legacy password/access code login
  const handleLegacyLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/investors/auth`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: loginType === 'password' ? password : null, access_code: loginType === 'code' ? accessCode : null })
      });
      const data = await res.json();
      if (data.success) { setPendingAuth(data); setStep('nda'); }
      else toast.error(data.message || 'Invalid credentials');
    } catch { toast.error('Network error'); }
    finally { setLoading(false); }
  };

  const handleNdaAccept = () => {
    if (!ndaAccepted || !riskAccepted) { toast.error('Please accept both agreements'); return; }
    sessionStorage.setItem('investorAuth', 'true');
    sessionStorage.setItem('ndaAccepted', new Date().toISOString());
    if (pendingAuth?.investor_name) sessionStorage.setItem('investorName', pendingAuth.investor_name);
    if (pendingAuth?.investor_id) sessionStorage.setItem('investorId', pendingAuth.investor_id);
    if (pendingAuth?.accountData) sessionStorage.setItem('investorAccount', JSON.stringify(pendingAuth.accountData));
    onLogin();
  };

  if (!portalStatus.enabled) return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Helmet><title>Investor Portal | Shadow Wolves Productions</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="text-center">
        <Lock className="w-16 h-16 text-gray-700 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-white mb-4 font-cinzel">Portal Unavailable</h1>
        <p className="text-gray-500">The investor portal is currently closed.</p>
      </div>
    </div>
  );

  // NDA Step
  if (step === 'nda') return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Helmet><title>Confidentiality Agreement | Shadow Wolves Productions</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-smoke-gray rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-800">
            <Shield className="w-8 h-8 text-electric-blue" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 font-cinzel">Confidentiality Agreement</h1>
          <p className="text-gray-500">Please review and accept before accessing the portal</p>
        </div>
        <div className="bg-smoke-gray border border-gray-800 rounded-xl p-6 space-y-6">
          <div className="bg-black/50 rounded-lg p-4 max-h-40 overflow-y-auto text-sm text-gray-400">
            <h4 className="text-white font-medium mb-2">Non-Disclosure Agreement</h4>
            <p className="mb-2">By accessing this portal, you agree that all information contained herein is confidential and proprietary to Shadow Wolves Productions.</p>
            <p className="mb-2">You agree not to disclose, copy, distribute, or use any information from this portal for any purpose other than evaluating potential investment opportunities.</p>
            <p>Unauthorized disclosure may result in legal action.</p>
          </div>
          <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={ndaAccepted} onChange={e => setNdaAccepted(e.target.checked)} className="mt-1 rounded" /><span className="text-gray-300 text-sm">I have read and agree to the <span className="text-electric-blue">Confidentiality Agreement</span>.</span></label>
          <div className="bg-black/50 rounded-lg p-4 max-h-40 overflow-y-auto text-sm text-gray-400">
            <h4 className="text-white font-medium mb-2">General Risk Disclaimer</h4>
            <p className="mb-2">Investment in film and entertainment projects involves substantial risk. Past performance is not indicative of future results.</p>
            <p>You should consult with qualified professionals before making any investment decisions.</p>
          </div>
          <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={riskAccepted} onChange={e => setRiskAccepted(e.target.checked)} className="mt-1 rounded" /><span className="text-gray-300 text-sm">I understand the <span className="text-electric-blue">risks associated with investment</span>.</span></label>
          <button onClick={handleNdaAccept} disabled={!ndaAccepted || !riskAccepted} className="w-full bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 text-white py-4 rounded-lg font-mono text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2">Enter Portal <ArrowRight size={18} /></button>
        </div>
      </div>
    </div>
  );

  // Login Form
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4" data-testid="investor-login-page">
      <Helmet><title>Investor Portal | Shadow Wolves Productions</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-smoke-gray rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-800">
            <Lock className="w-8 h-8 text-electric-blue" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 font-cinzel">Investor Portal</h1>
          <p className="text-gray-500 text-sm">Shadow Wolves Productions</p>
        </div>

        <div className="bg-smoke-gray border border-gray-800 rounded-xl p-8">
          {/* Login Type Tabs */}
          <div className="flex gap-1 mb-8 bg-black rounded-lg p-1">
            {[{ id: 'email', label: 'Email', icon: Mail }, { id: 'password', label: 'Password', icon: Lock }, { id: 'code', label: 'Code', icon: Key }].map(t => (
              <button key={t.id} type="button" onClick={() => setLoginType(t.id)}
                className={`flex-1 py-2 px-3 rounded-md text-xs font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${loginType === t.id ? 'bg-electric-blue text-white' : 'text-gray-500 hover:text-white'}`}>
                <t.icon size={14} /> {t.label}
              </button>
            ))}
          </div>

          {/* Email Login */}
          {loginType === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-xs font-mono uppercase tracking-widest mb-2">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none" placeholder="you@email.com" required data-testid="login-email" />
              </div>
              <div>
                <label className="block text-gray-400 text-xs font-mono uppercase tracking-widest mb-2">Password</label>
                <input type="password" value={emailPassword} onChange={e => setEmailPassword(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none" placeholder="Your password" required data-testid="login-password" />
              </div>
              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 text-white rounded-lg font-mono text-sm uppercase tracking-widest transition-all" data-testid="login-submit">
                {loading ? 'Signing in...' : 'Sign In'} {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          )}

          {/* Legacy Password */}
          {loginType === 'password' && (
            <form onSubmit={handleLegacyLogin} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-xs font-mono uppercase tracking-widest mb-2">Portal Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none" placeholder="Enter password" required />
              </div>
              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 text-white rounded-lg font-mono text-sm uppercase tracking-widest transition-all">
                {loading ? 'Verifying...' : 'Enter Portal'} {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          )}

          {/* Access Code */}
          {loginType === 'code' && (
            <form onSubmit={handleLegacyLogin} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-xs font-mono uppercase tracking-widest mb-2">Access Code</label>
                <input type="text" value={accessCode} onChange={e => setAccessCode(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white font-mono focus:border-electric-blue focus:outline-none" placeholder="Enter your access code" required />
              </div>
              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 text-white rounded-lg font-mono text-sm uppercase tracking-widest transition-all">
                {loading ? 'Verifying...' : 'Enter Portal'} {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          )}

          <p className="text-center text-gray-600 text-xs mt-6">This is a private portal for authorized investors only.</p>
        </div>

        <p className="text-center mt-6 text-gray-600 text-sm">
          Don't have access? <Link to="/investors" className="text-electric-blue hover:underline">Request access here</Link>
        </p>
      </div>
    </div>
  );
};

export default InvestorLogin;
