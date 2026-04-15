import React, { useState } from 'react';
import { toast } from 'sonner';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_wolfmedia/artifacts/bifyh7bv_Black%20Logo%20Only.png";

const AdminLogin = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        sessionStorage.setItem('adminAuth', 'true');
        onLogin();
        toast.success('Access granted');
      } else {
        toast.error('Invalid password');
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
      <div style={{ width: '100%', maxWidth: '380px', padding: '0 24px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <img
            src={LOGO_URL}
            alt="Shadow Wolves Productions"
            style={{ height: '52px', width: 'auto', margin: '0 auto 16px' }}
          />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(238,240,242,0.3)' }}>
            Admin Access
          </div>
        </div>

        {/* Form */}
        <div style={{
          background: 'rgba(13,15,20,0.85)', backdropFilter: 'blur(24px)',
          border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: '3px',
          padding: '40px 36px',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(238,240,242,0.35)' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
                required
                className="swp-input"
                placeholder="••••••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-swp btn-swp-primary"
              style={{ marginTop: '8px', justifyContent: 'center', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Verifying…' : 'Enter →'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px', fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.12em', color: 'rgba(238,240,242,0.15)' }}>
          Shadow Wolves Productions · Restricted
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
