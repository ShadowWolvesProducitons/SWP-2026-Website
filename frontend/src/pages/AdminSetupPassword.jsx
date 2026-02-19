import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;

const AdminSetupPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setVerifying(false);
        return;
      }

      try {
        const response = await fetch(`${API}/api/admin-auth/verify-token/${token}`);
        const data = await response.json();

        if (response.ok && data.valid) {
          setTokenValid(true);
          setUserInfo({ email: data.email, name: data.name });
        } else {
          setError(data.detail || 'Invalid or expired token');
        }
      } catch (err) {
        setError('Failed to verify token');
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API}/api/admin-auth/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        toast.success('Password set successfully!');
      } else {
        setError(data.detail || 'Failed to set password');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (verifying) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-electric-blue animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Verifying your access link...</p>
        </div>
      </div>
    );
  }

  // No token provided
  if (!token) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Invalid Link</h1>
          <p className="text-gray-400 mb-6">
            This page requires a valid setup token. Please use the link from your email.
          </p>
          <Link
            to="/admin"
            className="text-electric-blue hover:underline"
          >
            Go to Admin Login
          </Link>
        </div>
      </div>
    );
  }

  // Token invalid or expired
  if (!tokenValid && !verifying) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Link Expired</h1>
          <p className="text-gray-400 mb-6">
            {error || 'This setup link has expired or is invalid. Please request a new one.'}
          </p>
          <Link
            to="/admin"
            className="text-electric-blue hover:underline"
          >
            Request New Access Link
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Password Set!</h1>
          <p className="text-gray-400 mb-6">
            Your admin account is now active. You can sign in with your email and password.
          </p>
          <button
            onClick={() => navigate('/admin')}
            className="bg-electric-blue hover:bg-electric-blue/90 text-white px-8 py-3 rounded-full font-mono text-sm uppercase tracking-widest transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Password setup form
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          <span className="font-mono text-sm">Back to Login</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-electric-blue/20 rounded-full mb-4">
            <Lock className="w-8 h-8 text-electric-blue" />
          </div>
          <h1 className="text-2xl font-bold text-white font-cinzel">
            Set Your Password
          </h1>
          {userInfo && (
            <p className="text-gray-500 text-sm mt-2">
              Setting up access for <span className="text-white">{userInfo.email}</span>
            </p>
          )}
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="bg-smoke-gray border border-gray-800 rounded-lg p-6">
          <div className="mb-4">
            <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-gray-700 rounded-lg pl-10 pr-12 py-3 text-white focus:border-electric-blue focus:outline-none transition-colors"
                placeholder="Minimum 8 characters"
                required
                minLength={8}
                data-testid="new-password-input"
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

          <div className="mb-6">
            <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-black border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-electric-blue focus:outline-none transition-colors"
                placeholder="Re-enter your password"
                required
                data-testid="confirm-password-input"
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
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
            data-testid="set-password-btn"
          >
            {loading ? 'Setting Password...' : 'Set Password & Activate'}
          </button>
        </form>

        <p className="text-center text-gray-600 text-xs mt-6">
          Your password will be securely encrypted.
        </p>
      </div>
    </div>
  );
};

export default AdminSetupPassword;
