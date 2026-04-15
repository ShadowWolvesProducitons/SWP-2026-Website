import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_wolfmedia/artifacts/bifyh7bv_Black%20Logo%20Only.png";

const T = {
  input: { background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:'2px', padding:'13px 16px', fontFamily:'var(--font-body)', fontSize:'14px', fontWeight:300, color:'var(--swp-white)', outline:'none', width:'100%', transition:'border-color 0.2s' },
  label: { fontFamily:'var(--font-mono)', fontSize:'9px', fontWeight:300, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(238,240,242,0.4)', display:'block', marginBottom:'8px' },
};

const StudioLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // ── API calls preserved exactly ──
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/studio-portal/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email, password }) });
      const data = await res.json();
      if (res.ok) { localStorage.setItem('studio_token', data.token); localStorage.setItem('studio_user', JSON.stringify(data.user)); toast.success('Welcome back!'); navigate('/studio-access'); }
      else { toast.error(data.detail || 'Login failed'); }
    } catch { toast.error('An error occurred. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) { toast.error('Please enter your email'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/studio-portal/forgot-password`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email:forgotEmail }) });
      if (res.ok) { setForgotSent(true); toast.success('If an account exists, a reset link has been sent'); }
    } catch { toast.error('An error occurred. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <Helmet><title>Studio Portal Login | Shadow Wolves Productions</title></Helmet>
      <div data-testid="studio-login-page" style={{ minHeight:'100vh', background:'var(--swp-black)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px',
        backgroundImage:'radial-gradient(ellipse 60% 60% at 50% 30%, rgba(106,157,190,0.04) 0%, transparent 60%)' }}>
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} style={{ maxWidth:'400px', width:'100%' }}>

          {/* Header */}
          <div style={{ textAlign:'center', marginBottom:'40px' }}>
            <img src={LOGO_URL} alt="Shadow Wolves Productions" style={{ height:'48px', width:'auto', margin:'0 auto 20px', opacity:0.9 }} />
            <div style={{ display:'inline-flex', alignItems:'center', gap:'7px', fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(106,157,190,0.6)', border:'0.5px solid rgba(106,157,190,0.2)', padding:'5px 14px', borderRadius:'1px', marginBottom:'16px' }}>
              <span className="swp-pulse" style={{ width:'5px', height:'5px', borderRadius:'50%', background:'rgba(106,157,190,0.7)', display:'inline-block' }} />
              Studio Portal
            </div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'38px', color:'var(--swp-white)', letterSpacing:'0.02em', marginBottom:'8px' }}>
              {showForgotPassword ? 'Reset Password' : 'Sign In'}
            </h1>
            <p style={{ fontFamily:'var(--font-body)', fontSize:'14px', fontWeight:300, color:'rgba(238,240,242,0.4)' }}>
              {showForgotPassword ? 'Enter your email to receive a reset link' : 'Access your portal'}
            </p>
          </div>

          {/* Form container */}
          <div style={{ background:'rgba(13,15,20,0.88)', backdropFilter:'blur(28px)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:'3px', padding:'36px 32px' }}>
            {!showForgotPassword ? (
              <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
                <div>
                  <label style={T.label}>Email</label>
                  <div style={{ position:'relative' }}>
                    <Mail size={15} style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'rgba(238,240,242,0.25)', pointerEvents:'none' }} />
                    <input type="email" value={email} onChange={e=>setEmail(e.target.value)} style={{ ...T.input, paddingLeft:'40px' }} placeholder="your@email.com" required data-testid="login-email-input" />
                  </div>
                </div>
                <div>
                  <label style={T.label}>Password</label>
                  <div style={{ position:'relative' }}>
                    <Lock size={15} style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'rgba(238,240,242,0.25)', pointerEvents:'none' }} />
                    <input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} style={{ ...T.input, paddingLeft:'40px', paddingRight:'44px' }} placeholder="Enter your password" required data-testid="login-password-input" />
                    <button type="button" onClick={()=>setShowPassword(!showPassword)} style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(238,240,242,0.3)', transition:'color 0.2s' }}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <button type="button" onClick={()=>setShowForgotPassword(true)} style={{ background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.12em', color:'rgba(238,240,242,0.3)', transition:'color 0.2s' }}
                    onMouseEnter={e=>e.target.style.color='rgba(106,157,190,0.7)'} onMouseLeave={e=>e.target.style.color='rgba(238,240,242,0.3)'}>
                    Forgot password?
                  </button>
                </div>
                <button type="submit" disabled={loading} data-testid="login-submit-btn" className="btn-swp btn-swp-primary" style={{ justifyContent:'center', opacity:loading?0.6:1, marginTop:'4px' }}>
                  {loading ? 'Signing In…' : <>Sign In <ArrowRight size={14} /></>}
                </button>
                <p style={{ textAlign:'center', fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.1em', color:'rgba(238,240,242,0.25)' }}>
                  No account?{' '}
                  <Link to="/request-access" style={{ color:'rgba(106,157,190,0.7)', textDecoration:'none' }}>Request Access</Link>
                </p>
              </form>
            ) : (
              <>
                {forgotSent ? (
                  <div style={{ textAlign:'center' }}>
                    <p style={{ fontFamily:'var(--font-body)', fontSize:'14px', fontWeight:300, color:'rgba(238,240,242,0.5)', marginBottom:'24px', lineHeight:1.7 }}>
                      If an account exists with <strong style={{ color:'var(--swp-white)' }}>{forgotEmail}</strong>, a password reset link has been sent.
                    </p>
                    <button onClick={()=>{ setShowForgotPassword(false); setForgotSent(false); setForgotEmail(''); }}
                      style={{ fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.12em', color:'rgba(106,157,190,0.7)', background:'none', border:'none', cursor:'pointer' }}>
                      Back to Login
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                    <div style={{ position:'relative' }}>
                      <Mail size={15} style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'rgba(238,240,242,0.25)', pointerEvents:'none' }} />
                      <input type="email" value={forgotEmail} onChange={e=>setForgotEmail(e.target.value)} style={{ ...T.input, paddingLeft:'40px' }} placeholder="your@email.com" required />
                    </div>
                    <button type="submit" disabled={loading} className="btn-swp btn-swp-primary" style={{ justifyContent:'center', opacity:loading?0.6:1 }}>
                      {loading ? 'Sending…' : 'Send Reset Link'}
                    </button>
                    <button type="button" onClick={()=>setShowForgotPassword(false)}
                      style={{ fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.12em', color:'rgba(238,240,242,0.3)', background:'none', border:'none', cursor:'pointer', textAlign:'center' }}>
                      Back to Login
                    </button>
                  </form>
                )}
              </>
            )}
          </div>

          <div style={{ textAlign:'center', marginTop:'24px' }}>
            <Link to="/" style={{ fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(238,240,242,0.2)', textDecoration:'none' }}>
              ← Back to Website
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default StudioLogin;
