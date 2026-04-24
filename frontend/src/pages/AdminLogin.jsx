import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_d237abdd-72c8-4f34-8f42-33e3f6f9671f/artifacts/duqz4qct_SWP_Full_Transparent_Logo_2026.png";

const inputStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '0.5px solid rgba(255,255,255,0.1)',
  borderRadius: '2px',
  padding: '13px 16px 13px 42px',
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  fontWeight: 300,
  color: 'var(--swp-white)',
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.2s',
};

const labelStyle = {
  fontFamily: 'var(--font-mono)',
  fontSize: '9px',
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'rgba(238,240,242,0.35)',
  display: 'block',
  marginBottom: '8px',
};

const AdminLogin = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('login'); // login | forgot | forgot-sent
  const [forgotEmail, setForgotEmail] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin-auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        sessionStorage.setItem('adminAuth', 'true');
        sessionStorage.setItem('adminToken', data.token);
        sessionStorage.setItem('adminUser', JSON.stringify(data.user));
        onLogin();
        toast.success('Access granted');
      } else {
        toast.error(data.detail || 'Invalid credentials');
      }
    } catch {
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) { toast.error('Please enter your email'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin-auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      if (res.ok) {
        setView('forgot-sent');
      }
    } catch {
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--swp-black)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-body)',
      backgroundImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(106,157,190,0.04) 0%, transparent 70%)',
    }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '0 24px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <img src={LOGO_URL} alt="Shadow Wolves Productions" style={{ height: '52px', width: 'auto', margin: '0 auto 16px' }} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(238,240,242,0.3)' }}>
            Admin Access
          </div>
        </div>

        {/* Login Form */}
        {view === 'login' && (
          <div style={{ background: 'rgba(13,15,20,0.88)', backdropFilter: 'blur(28px)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: '3px', padding: '36px 32px' }}>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={labelStyle}>Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(238,240,242,0.25)', pointerEvents: 'none' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    autoFocus
                    style={inputStyle}
                    data-testid="admin-email-input"
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(238,240,242,0.25)', pointerEvents: 'none' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    style={{ ...inputStyle, paddingRight: '44px' }}
                    data-testid="admin-password-input"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(238,240,242,0.3)', transition: 'color 0.2s' }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <button type="button" onClick={() => { setView('forgot'); setForgotEmail(email); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.12em', color: 'rgba(238,240,242,0.3)', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = 'rgba(106,157,190,0.7)'}
                  onMouseLeave={e => e.target.style.color = 'rgba(238,240,242,0.3)'}>
                  Forgot password?
                </button>
              </div>
              <button type="submit" disabled={loading} data-testid="admin-login-btn"
                className="btn-swp btn-swp-primary" style={{ justifyContent: 'center', opacity: loading ? 0.6 : 1, marginTop: '4px' }}>
                {loading ? 'Verifying...' : <> Sign In <ArrowRight size={14} /></>}
              </button>
            </form>
          </div>
        )}

        {/* Forgot Password Form */}
        {view === 'forgot' && (
          <div style={{ background: 'rgba(13,15,20,0.88)', backdropFilter: 'blur(28px)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: '3px', padding: '36px 32px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--swp-white)', marginBottom: '8px' }}>Reset Password</h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 300, color: 'rgba(238,240,242,0.4)', marginBottom: '24px' }}>
              Enter your admin email and we'll send a reset link.
            </p>
            <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(238,240,242,0.25)', pointerEvents: 'none' }} />
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  autoFocus
                  style={inputStyle}
                />
              </div>
              <button type="submit" disabled={loading}
                className="btn-swp btn-swp-primary" style={{ justifyContent: 'center', opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <button type="button" onClick={() => setView('login')}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.12em', color: 'rgba(238,240,242,0.3)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center' }}>
                Back to Login
              </button>
            </form>
          </div>
        )}

        {/* Forgot Password Sent */}
        {view === 'forgot-sent' && (
          <div style={{ background: 'rgba(13,15,20,0.88)', backdropFilter: 'blur(28px)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: '3px', padding: '36px 32px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 300, color: 'rgba(238,240,242,0.5)', marginBottom: '24px', lineHeight: 1.7 }}>
              If an account exists with <strong style={{ color: 'var(--swp-white)' }}>{forgotEmail}</strong>, a password reset link has been sent.
            </p>
            <button onClick={() => { setView('login'); setForgotEmail(''); }}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.12em', color: 'rgba(106,157,190,0.7)', background: 'none', border: 'none', cursor: 'pointer' }}>
              Back to Login
            </button>
          </div>
        )}

        {/* Back to site */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link to="/" style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(238,240,242,0.3)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = 'rgba(106,157,190,0.7)'}
            onMouseLeave={e => e.target.style.color = 'rgba(238,240,242,0.3)'}>
            <ArrowLeft size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
            Back to Site
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: '16px', fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.12em', color: 'rgba(238,240,242,0.15)' }}>
          Shadow Wolves Productions · Restricted
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
