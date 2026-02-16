import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';
import { toast } from 'sonner';

const StudioLogin = () => {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/studio-portal/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('studio_token', data.token);
        localStorage.setItem('studio_user', JSON.stringify(data.user));
        toast.success('Welcome back!');
        navigate('/studio-access');
      } else {
        toast.error(data.detail || 'Login failed');
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!forgotEmail) {
      toast.error('Please enter your email');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/studio-portal/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      
      if (response.ok) {
        setForgotSent(true);
        toast.success('If an account exists, a reset link has been sent');
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Studio Portal Login | Shadow Wolves Productions</title>
      </Helmet>

      <div className="min-h-screen bg-black flex items-center justify-center px-4" data-testid="studio-login-page">
        <motion.div 
          className="max-w-md w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-electric-blue/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield size={32} className="text-electric-blue" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 font-cinzel">Studio Portal</h1>
            <p className="text-gray-400">Sign in to access your portal</p>
          </div>

          {!showForgotPassword ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-smoke-gray border border-gray-700 rounded-lg pl-12 pr-4 py-4 text-white focus:border-electric-blue focus:outline-none transition-colors"
                    placeholder="your@email.com"
                    required
                    data-testid="login-email-input"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-smoke-gray border border-gray-700 rounded-lg pl-12 pr-12 py-4 text-white focus:border-electric-blue focus:outline-none transition-colors"
                    placeholder="Enter your password"
                    required
                    data-testid="login-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-gray-500 text-sm hover:text-electric-blue transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 text-white px-8 py-4 rounded-full font-mono text-sm uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2"
                data-testid="login-submit-btn"
              >
                {loading ? 'Signing In...' : 'Sign In'}
                {!loading && <ArrowRight size={18} />}
              </button>

              {/* Request Access Link */}
              <p className="text-center text-gray-500 text-sm">
                Don't have an account?{' '}
                <Link to="/request-access" className="text-electric-blue hover:underline">
                  Request Access
                </Link>
              </p>
            </form>
          ) : (
            /* Forgot Password Form */
            <>
              {forgotSent ? (
                <div className="text-center">
                  <p className="text-gray-400 mb-6">
                    If an account exists with <strong className="text-white">{forgotEmail}</strong>, 
                    a password reset link has been sent.
                  </p>
                  <button
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotSent(false);
                      setForgotEmail('');
                    }}
                    className="text-electric-blue hover:underline"
                  >
                    Back to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-6">
                  <p className="text-gray-400 text-center mb-4">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                  
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full bg-smoke-gray border border-gray-700 rounded-lg pl-12 pr-4 py-4 text-white focus:border-electric-blue focus:outline-none transition-colors"
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 text-white px-8 py-4 rounded-full font-mono text-sm uppercase tracking-widest transition-all"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="w-full text-gray-500 hover:text-white text-sm transition-colors"
                  >
                    Back to Login
                  </button>
                </form>
              )}
            </>
          )}

          {/* Back to Website */}
          <div className="mt-8 text-center">
            <Link to="/" className="text-gray-600 text-sm hover:text-gray-400 transition-colors">
              ← Back to Website
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default StudioLogin;
