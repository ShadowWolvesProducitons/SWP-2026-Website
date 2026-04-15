import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { LayoutDashboard, Film, Bell, User, LogOut, Menu, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_wolfmedia/artifacts/bifyh7bv_Black%20Logo%20Only.png";

const NAV_ITEMS = [
  { path:'/studio-access',          icon:LayoutDashboard, label:'Dashboard', exact:true },
  { path:'/studio-access/projects', icon:Film,            label:'Projects' },
  { path:'/studio-access/updates',  icon:Bell,            label:'Updates' },
  { path:'/studio-access/account',  icon:User,            label:'Account' },
];

const ROLE_LABELS = { admin:'Admin', investor:'Investor', sales_agent:'Sales Agent', director:'Director', producer:'Producer', executive_producer:'Executive Producer', cast:'Cast', crew:'Crew', talent_manager:'Talent Manager', other:'Other' };

const S = {
  sidebar: { width:'220px', flexShrink:0, background:'rgba(13,15,20,0.97)', borderRight:'0.5px solid rgba(255,255,255,0.07)', display:'flex', flexDirection:'column', position:'sticky', top:0, height:'100vh' },
  navItem: (active) => ({ display:'flex', alignItems:'center', gap:'12px', padding:'11px 20px', fontFamily:'var(--font-mono)', fontSize:'10px', letterSpacing:'0.13em', textTransform:'uppercase', textDecoration:'none', color:active?'var(--swp-ice)':'rgba(238,240,242,0.35)', background:active?'rgba(106,157,190,0.08)':'transparent', borderLeft:`2px solid ${active?'var(--swp-ice)':'transparent'}`, transition:'all 0.2s' }),
};

const StudioPortalLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => { checkAuth(); }, []);

  // ── Auth check preserved exactly ──
  const checkAuth = async () => {
    const token = localStorage.getItem('studio_token');
    if (!token) { navigate('/studio-access/login'); return; }
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/studio-portal/me`, { headers:{ 'Authorization':`Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setUser(d.user); localStorage.setItem('studio_user', JSON.stringify(d.user)); }
      else { localStorage.removeItem('studio_token'); localStorage.removeItem('studio_user'); navigate('/studio-access/login'); }
    } catch { navigate('/studio-access/login'); }
    finally { setLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('studio_token'); localStorage.removeItem('studio_user');
    toast.success('Logged out successfully'); navigate('/studio-access/login');
  };

  const isActive = (path, exact=false) => exact ? location.pathname===path : location.pathname.startsWith(path);

  if (loading) return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--swp-black)' }}><RefreshCw style={{ width:'24px', height:'24px', color:'var(--swp-ice)', animation:'spin 1s linear infinite' }} /></div>;

  return (
    <>
      <Helmet><title>Studio Portal | Shadow Wolves Productions</title></Helmet>
      <div style={{ minHeight:'100vh', background:'var(--swp-black)', display:'flex' }} data-testid="studio-portal-layout">

        {/* Sidebar — desktop */}
        <aside className="hidden lg:flex" style={{ ...S.sidebar, flexDirection:'column' }}>
          <div style={{ padding:'20px 20px 16px', borderBottom:'0.5px solid rgba(255,255,255,0.07)' }}>
            <img src={LOGO_URL} alt="SWP" style={{ height:'32px', width:'auto', marginBottom:'10px', opacity:0.85 }} />
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'8px', letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(106,157,190,0.6)' }}>Studio Portal</div>
          </div>

          <nav style={{ flex:1, padding:'12px 0' }}>
            {NAV_ITEMS.map(item => (
              <Link key={item.path} to={item.path} style={S.navItem(isActive(item.path, item.exact))}
                onMouseEnter={e=>{ if(!isActive(item.path,item.exact)) e.currentTarget.style.color='rgba(238,240,242,0.7)'; }}
                onMouseLeave={e=>{ if(!isActive(item.path,item.exact)) e.currentTarget.style.color='rgba(238,240,242,0.35)'; }}>
                <item.icon size={14} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div style={{ padding:'16px 20px', borderTop:'0.5px solid rgba(255,255,255,0.07)' }}>
            <div style={{ marginBottom:'14px' }}>
              <div style={{ fontFamily:'var(--font-body)', fontSize:'13px', fontWeight:400, color:'var(--swp-white)', marginBottom:'3px' }}>{user?.full_name}</div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:'8px', letterSpacing:'0.1em', color:'rgba(238,240,242,0.3)' }}>{user?.email}</div>
              <span style={{ display:'inline-block', marginTop:'8px', fontFamily:'var(--font-mono)', fontSize:'8px', letterSpacing:'0.12em', textTransform:'uppercase', background:'rgba(106,157,190,0.1)', color:'var(--swp-ice)', border:'0.5px solid rgba(106,157,190,0.25)', padding:'3px 9px', borderRadius:'1px' }}>
                {ROLE_LABELS[user?.role] || user?.role}
              </span>
            </div>
            <button onClick={handleLogout} style={{ display:'flex', alignItems:'center', gap:'8px', background:'none', border:'none', cursor:'pointer', color:'rgba(200,80,80,0.6)', fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.12em', textTransform:'uppercase', transition:'color 0.2s' }}
              onMouseEnter={e=>e.currentTarget.style.color='rgba(220,100,100,0.9)'} onMouseLeave={e=>e.currentTarget.style.color='rgba(200,80,80,0.6)'}>
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        </aside>

        {/* Mobile header */}
        <div className="lg:hidden" style={{ position:'fixed', top:0, left:0, right:0, zIndex:50, background:'rgba(13,15,20,0.97)', backdropFilter:'blur(16px)', borderBottom:'0.5px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px' }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'10px', letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--swp-ice)' }}>Studio Portal</div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(238,240,242,0.5)' }}>
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} style={{ borderTop:'0.5px solid rgba(255,255,255,0.07)', paddingBottom:'16px' }}>
              {NAV_ITEMS.map(item => (
                <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}
                  style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 20px', fontFamily:'var(--font-mono)', fontSize:'10px', letterSpacing:'0.13em', textTransform:'uppercase', textDecoration:'none', color:isActive(item.path,item.exact)?'var(--swp-ice)':'rgba(238,240,242,0.4)' }}>
                  <item.icon size={14} />{item.label}
                </Link>
              ))}
              <div style={{ padding:'12px 20px', borderTop:'0.5px solid rgba(255,255,255,0.07)', marginTop:'8px' }}>
                <div style={{ fontFamily:'var(--font-body)', fontSize:'13px', color:'var(--swp-white)', marginBottom:'8px' }}>{user?.full_name}</div>
                <button onClick={handleLogout} style={{ display:'flex', alignItems:'center', gap:'8px', background:'none', border:'none', cursor:'pointer', color:'rgba(200,80,80,0.7)', fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.12em', textTransform:'uppercase' }}>
                  <LogOut size={13} /> Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Main content */}
        <main style={{ flex:1, overflowY:'auto' }} className="pt-16 lg:pt-0">
          <Outlet context={{ user, checkAuth }} />
        </main>
      </div>
    </>
  );
};

export default StudioPortalLayout;
