import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const InvestorSignup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [validating, setValidating] = useState(true);
  const [tokenData, setTokenData] = useState(null);
  const [tokenError, setTokenError] = useState(null);
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', name: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) { setTokenError('No invite token provided'); setValidating(false); return; }
    const validate = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/investors/validate-token/${token}`);
        if (res.ok) {
          const data = await res.json();
          setTokenData(data);
          setForm(s => ({ ...s, email: data.email, name: data.name || '' }));
        } else {
          const err = await res.json().catch(() => ({}));
          setTokenError(err.detail || 'Invalid invite link');
        }
      } catch { setTokenError('Unable to validate invite link'); }
      finally { setValidating(false); }
    };
    validate();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/investors/signup`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email: form.email, password: form.password, name: form.name })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Account created! Redirecting to portal...');
        sessionStorage.setItem('investorAccount', JSON.stringify(data.investor));
        setTimeout(() => navigate('/investors/portal'), 1500);
      } else {
        toast.error(data.detail || 'Signup failed');
      }
    } catch { toast.error('Network error'); }
    finally { setSubmitting(false); }
  };

  if (validating) return (
    <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
      <RefreshCw className="w-10 h-10 text-electric-blue animate-spin" />
    </div>
  );

  if (tokenError) return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 py-24 text-center max-w-lg">
        <AlertTriangle size={48} className="text-red-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2 font-cinzel">Invalid Invite Link</h1>
        <p className="text-gray-400 mb-8">{tokenError}</p>
        <Link to="/investors" className="px-8 py-3 bg-electric-blue text-white rounded-full font-mono text-sm uppercase tracking-widest" data-testid="request-new-link">Request New Access</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black pt-20" data-testid="investor-signup-page">
      <div className="container mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-electric-blue/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield size={28} className="text-electric-blue" />
            </div>
            <h1 className="text-2xl font-bold text-white font-cinzel">Create Your Investor Account</h1>
            <p className="text-gray-500 text-sm mt-2">Set up your credentials to access the investor portal.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-smoke-gray border border-gray-800 rounded-xl p-6 space-y-4" data-testid="signup-form">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Name</label>
              <input type="text" value={form.name} onChange={e => setForm(s => ({ ...s, name: e.target.value }))} className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none" data-testid="signup-name" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Email</label>
              <input type="email" value={form.email} disabled className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-gray-400 cursor-not-allowed" data-testid="signup-email" />
              <p className="text-gray-600 text-xs mt-1">Must match the invited email</p>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Password *</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm(s => ({ ...s, password: e.target.value }))} className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white pr-12 focus:border-electric-blue focus:outline-none" placeholder="Min 6 characters" required data-testid="signup-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-500 hover:text-white">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Confirm Password *</label>
              <input type="password" value={form.confirmPassword} onChange={e => setForm(s => ({ ...s, confirmPassword: e.target.value }))} className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none" placeholder="Re-enter password" required data-testid="signup-confirm" />
            </div>
            <button type="submit" disabled={submitting} className="w-full py-3.5 bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 text-white rounded-full font-mono text-sm uppercase tracking-widest transition-all mt-2" data-testid="signup-submit">
              {submitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-600 text-sm">
            Already have an account? <Link to="/investors/login" className="text-electric-blue hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default InvestorSignup;
