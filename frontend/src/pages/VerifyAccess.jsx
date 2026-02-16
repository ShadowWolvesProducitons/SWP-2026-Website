import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const VerifyAccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid verification link');
      setVerifying(false);
      return;
    }
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/studio-portal/verify-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setVerified(true);
        setUserData(data);
      } else {
        setError(data.detail || 'Invalid or expired verification link');
      }
    } catch (err) {
      setError('Failed to verify. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/studio-portal/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirm_password: confirmPassword })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Store token and redirect
        localStorage.setItem('studio_token', data.token);
        localStorage.setItem('studio_user', JSON.stringify(data.user));
        toast.success('Account activated successfully!');
        navigate('/studio-access');
      } else {
        toast.error(data.detail || 'Failed to set password');
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-electric-blue animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Verifying your email...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>Verification Failed | Shadow Wolves Productions</title>
        </Helmet>
        <div className="min-h-screen bg-black pt-20 flex items-center justify-center px-4">
          <motion.div 
            className="max-w-md w-full text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} className="text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4 font-cinzel">Verification Failed</h1>
            <p className="text-gray-400 mb-8">{error}</p>
            <button
              onClick={() => navigate('/request-access')}
              className="inline-flex items-center gap-2 bg-electric-blue hover:bg-electric-blue/90 text-white px-8 py-4 rounded-full font-mono text-sm uppercase tracking-widest transition-all"
            >
              Request New Link
            </button>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Set Your Password | Shadow Wolves Productions</title>
      </Helmet>

      <div className="min-h-screen bg-black pt-20 pb-16 flex items-center justify-center px-4">
        <motion.div 
          className="max-w-md w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-electric-blue/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={32} className="text-electric-blue" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 font-cinzel">Email Verified!</h1>
            <p className="text-gray-400">
              Welcome, <strong className="text-white">{userData?.full_name}</strong>. 
              Set your password to complete account setup.
            </p>
          </div>

          {/* Password Form */}
          <form onSubmit={handleSetPassword} className="space-y-6">
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
                  placeholder="Create a strong password"
                  required
                  minLength={8}
                  data-testid="password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-gray-600 text-xs mt-1">Minimum 8 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-smoke-gray border border-gray-700 rounded-lg pl-12 pr-12 py-4 text-white focus:border-electric-blue focus:outline-none transition-colors"
                  placeholder="Confirm your password"
                  required
                  data-testid="confirm-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 text-white px-8 py-4 rounded-full font-mono text-sm uppercase tracking-widest transition-all"
              data-testid="set-password-btn"
            >
              {submitting ? 'Setting Up...' : 'Complete Setup'}
            </button>
          </form>
        </motion.div>
      </div>
    </>
  );
};

export default VerifyAccess;
