import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const AdminLogin = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Store auth in session
          sessionStorage.setItem('adminAuth', 'true');
          onLogin();
          toast.success('Welcome to the Admin Panel');
          navigate('/admin/dashboard');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Invalid password');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-smoke-gray border border-gray-800 rounded-lg p-6">
          <div className="mb-6">
            <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none transition-colors pr-12"
                placeholder="Enter admin password"
                required
              />
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
          >
            {loading ? 'Authenticating...' : 'Access Panel'}
          </button>
        </form>

        <p className="text-center text-gray-600 text-xs mt-6">
          This area is restricted to authorized personnel only.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
