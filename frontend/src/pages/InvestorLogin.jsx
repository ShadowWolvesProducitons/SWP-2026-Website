import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Lock, Key, AlertCircle, ArrowRight, Shield, FileText } from 'lucide-react';
import { toast } from 'sonner';

const InvestorLogin = ({ onLogin }) => {
  const [step, setStep] = useState('login'); // 'login' or 'nda'
  const [loginType, setLoginType] = useState('password'); // 'password' or 'code'
  const [password, setPassword] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [portalStatus, setPortalStatus] = useState({ enabled: true, require_code: false });
  const [ndaAccepted, setNdaAccepted] = useState(false);
  const [riskAccepted, setRiskAccepted] = useState(false);
  const [pendingAuth, setPendingAuth] = useState(null);

  useEffect(() => {
    checkPortalStatus();
  }, []);

  const checkPortalStatus = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/investors/portal-status`);
      if (response.ok) {
        const status = await response.json();
        setPortalStatus(status);
        if (status.require_code) {
          setLoginType('code');
        }
      }
    } catch (err) {
      console.error('Failed to check portal status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/investors/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: loginType === 'password' ? password : null,
          access_code: loginType === 'code' ? accessCode : null
        })
      });

      const data = await response.json();

      if (data.success) {
        // Store pending auth and show NDA step
        setPendingAuth(data);
        setStep('nda');
      } else {
        toast.error(data.message || 'Invalid credentials');
      }
    } catch (err) {
      toast.error('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNdaAccept = () => {
    if (!ndaAccepted || !riskAccepted) {
      toast.error('Please accept both agreements to continue');
      return;
    }

    // Complete the login
    sessionStorage.setItem('investorAuth', 'true');
    sessionStorage.setItem('ndaAccepted', new Date().toISOString());
    if (pendingAuth.investor_name) {
      sessionStorage.setItem('investorName', pendingAuth.investor_name);
    }
    if (pendingAuth.investor_id) {
      sessionStorage.setItem('investorId', pendingAuth.investor_id);
    }
    onLogin();
  };

  if (!portalStatus.enabled) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Helmet>
          <title>Investor Portal | Shadow Wolves Productions</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="text-center">
          <Lock className="w-16 h-16 text-gray-700 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
            Portal Unavailable
          </h1>
          <p className="text-gray-500">The investor portal is currently closed.</p>
        </div>
      </div>
    );
  }

  // NDA Acceptance Step
  if (step === 'nda') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Helmet>
          <title>Confidentiality Agreement | Shadow Wolves Productions</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>

        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-smoke-gray rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-800">
              <Shield className="w-8 h-8 text-electric-blue" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
              Confidentiality Agreement
            </h1>
            <p className="text-gray-500">Please review and accept before accessing the portal</p>
          </div>

          <div className="bg-smoke-gray border border-gray-800 rounded-xl p-6 space-y-6">
            {/* NDA Section */}
            <div className="bg-black/50 rounded-lg p-4 max-h-40 overflow-y-auto text-sm text-gray-400">
              <h4 className="text-white font-medium mb-2">Non-Disclosure Agreement</h4>
              <p className="mb-2">
                By accessing this portal, you agree that all information contained herein is confidential 
                and proprietary to Shadow Wolves Productions.
              </p>
              <p className="mb-2">
                You agree not to disclose, copy, distribute, or use any information from this portal 
                for any purpose other than evaluating potential investment opportunities.
              </p>
              <p>
                Unauthorized disclosure may result in legal action.
              </p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={ndaAccepted}
                onChange={(e) => setNdaAccepted(e.target.checked)}
                className="mt-1 rounded border-gray-600 bg-black text-electric-blue focus:ring-electric-blue"
              />
              <span className="text-gray-300 text-sm">
                I have read and agree to the <span className="text-electric-blue">Confidentiality Agreement</span> above.
              </span>
            </label>

            {/* Risk Disclaimer Section */}
            <div className="bg-black/50 rounded-lg p-4 max-h-40 overflow-y-auto text-sm text-gray-400">
              <h4 className="text-white font-medium mb-2">General Risk Disclaimer</h4>
              <p className="mb-2">
                Investment in film and entertainment projects involves substantial risk. 
                Past performance is not indicative of future results.
              </p>
              <p className="mb-2">
                The information in this portal is for informational purposes only and does not 
                constitute legal, tax, or investment advice.
              </p>
              <p>
                You should consult with qualified professionals before making any investment decisions.
              </p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={riskAccepted}
                onChange={(e) => setRiskAccepted(e.target.checked)}
                className="mt-1 rounded border-gray-600 bg-black text-electric-blue focus:ring-electric-blue"
              />
              <span className="text-gray-300 text-sm">
                I understand the <span className="text-electric-blue">risks associated with investment</span> and acknowledge this is not financial advice.
              </span>
            </label>

            <button
              onClick={handleNdaAccept}
              disabled={!ndaAccepted || !riskAccepted}
              className="w-full bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-4 rounded-lg font-mono text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              Enter Portal
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Helmet>
        <title>Investor Portal | Shadow Wolves Productions</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-smoke-gray rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-800">
            <Lock className="w-8 h-8 text-electric-blue" />
          </div>
          <h1 
            className="text-3xl font-bold text-white mb-2"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            Investor Portal
          </h1>
          <p className="text-gray-500 text-sm">
            Shadow Wolves Productions
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-smoke-gray border border-gray-800 rounded-lg p-8">
          {/* Toggle if both options available */}
          {!portalStatus.require_code && (
            <div className="flex gap-2 mb-8">
              <button
                type="button"
                onClick={() => setLoginType('password')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-mono uppercase tracking-widest transition-all ${
                  loginType === 'password'
                    ? 'bg-electric-blue text-white'
                    : 'bg-black text-gray-500 hover:text-white'
                }`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => setLoginType('code')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-mono uppercase tracking-widest transition-all ${
                  loginType === 'code'
                    ? 'bg-electric-blue text-white'
                    : 'bg-black text-gray-500 hover:text-white'
                }`}
              >
                Access Code
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {loginType === 'password' ? (
              <div className="mb-6">
                <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white focus:border-electric-blue focus:outline-none"
                    placeholder="Enter password"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                  Access Code
                </label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                  <input
                    type="text"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="w-full bg-black border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white focus:border-electric-blue focus:outline-none font-mono"
                    placeholder="Enter your access code"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 text-white rounded-lg font-mono text-sm uppercase tracking-widest transition-all"
            >
              {loading ? 'Verifying...' : 'Enter Portal'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="text-center text-gray-600 text-xs mt-6">
            This is a private portal for authorized investors only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvestorLogin;
