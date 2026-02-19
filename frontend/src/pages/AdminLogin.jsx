import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, ArrowLeft, Mail, User, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;

const AdminLogin = ({ onLogin }) => {
  const [mode, setMode] = useState('login'); // 'login' or 'request'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requestSent, setRequestSent] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Try email-based login first
      const response = await fetch(`${API}/api/admin-auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          sessionStorage.setItem('adminAuth', 'true');
          sessionStorage.setItem('adminToken', data.token);
          sessionStorage.setItem('adminUser', JSON.stringify(data.user));
          onLogin();
          toast.success(`Welcome, ${data.user.name}`);
          navigate('/admin/dashboard');
          return;
        }
      }

      const errorData = await response.json();
      setError(errorData.detail || 'Invalid credentials');
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API}/api/admin-auth/request-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      });

      const data = await response.json();

      if (response.ok) {
        setRequestSent(true);
        toast.success('Check your email for the setup link');
      } else {
        setError(data.detail || 'Failed to request access');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (requestSent) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Check Your Email</h1>
          <p className="text-gray-400 mb-6">
            We've sent a setup link to <span className="text-white font-medium">{email}</span>. 
            Click the link in the email to create your password and access the admin panel.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            The link will expire in 24 hours.
          </p>
          <button
            onClick={() => {
              setRequestSent(false);
              setMode('login');
            }}
            className="text-electric-blue hover:underline text-sm"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Website */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          data-testid="back-to-website"
        >
          <ArrowLeft size={18} />
          <span className="font-mono text-sm">Back to Website</span>
        </Link>

        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-electric-blue/20 rounded-full mb-4">
            <Lock className="w-8 h-8 text-electric-blue" />
          </div>
          <h1 className="text-2xl font-bold text-white font-cinzel">
            Admin Access
          </h1>
          <p className="text-gray-500 text-sm mt-2">Shadow Wolves Productions</p>
        </div>

        {mode === 'login' ? (
          /* Login Form */
          <form onSubmit={handleLogin} className="bg-smoke-gray border border-gray-800 rounded-lg p-6">
            <div className="mb-4">
              <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-electric-blue focus:outline-none transition-colors"
                  placeholder="your@email.com"
                  required
                  data-testid="admin-email-input"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded-lg pl-10 pr-12 py-3 text-white focus:border-electric-blue focus:outline-none transition-colors"
                  placeholder="Enter your password"
                  required
                  data-testid="admin-password-input"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full font-mono text-sm uppercase tracking-widest transition-all"
              data-testid="admin-login-btn"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        ) : (
          /* Request Access Form */
          <form onSubmit={handleRequestAccess} className="bg-smoke-gray border border-gray-800 rounded-lg p-6">
            <div className="mb-4">
              <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                Your Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-electric-blue focus:outline-none transition-colors"
                  placeholder="Full name"
                  required
                  data-testid="admin-name-input"
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-electric-blue focus:outline-none transition-colors"
                  placeholder="your@email.com"
                  required
                  data-testid="admin-request-email-input"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full font-mono text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              data-testid="admin-request-btn"
            >
              {loading ? (
                'Sending...'
              ) : (
                <>
                  <Send size={16} />
                  Send Setup Link
                </>
              )}
            </button>
          </form>
        )}

        {/* Toggle between modes */}
        <div className="text-center mt-6">
          {mode === 'login' ? (
            <button
              onClick={() => {
                setMode('request');
                setError('');
              }}
              className="text-gray-400 hover:text-electric-blue transition-colors text-sm"
              data-testid="request-access-link"
            >
              Request Access
            </button>
          ) : (
            <button
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className="text-gray-400 hover:text-electric-blue transition-colors text-sm"
            >
              Already have an account? Sign In
            </button>
          )}
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          This area is restricted to authorized personnel only.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
