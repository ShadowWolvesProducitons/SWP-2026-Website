import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, FolderOpen, ChevronRight, RefreshCw, FileText } from 'lucide-react';

const ROLE_LABELS = { admin:'Admin', investor:'Investor', sales_agent:'Sales Agent', director:'Director', producer:'Producer', executive_producer:'Executive Producer', cast:'Cast', crew:'Crew', talent_manager:'Talent Manager', other:'Other' };

const StudioDashboard = () => {
  const { user } = useOutletContext();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboard(); }, []);

  // ── API call preserved exactly ──
  const fetchDashboard = async () => {
    const token = localStorage.getItem('studio_token');
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/studio-portal/dashboard`, { headers:{ 'Authorization':`Bearer ${token}` } });
      if (res.ok) setData(await res.json());
    } catch { console.error('Failed to fetch dashboard'); }
    finally { setLoading(false); }
  };

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'64px' }}><RefreshCw style={{ width:'22px', height:'22px', color:'var(--swp-ice)', animation:'spin 1s linear infinite' }} /></div>;

  const Card = ({ children }) => (
    <div style={{ background:'rgba(17,19,24,0.68)', backdropFilter:'blur(16px)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:'3px', padding:'20px 24px', transition:'border-color 0.2s' }}
      onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.12)'} onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'}>
      {children}
    </div>
  );

  return (
    <div data-testid="studio-dashboard" style={{ padding:'40px 44px' }}>
      {/* Welcome */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:'40px' }}>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(106,157,190,0.6)', marginBottom:'10px', display:'flex', alignItems:'center', gap:'10px' }}>
          <span style={{ width:'24px', height:'0.5px', background:'rgba(106,157,190,0.4)', display:'block' }}/>
          {ROLE_LABELS[data?.user?.role] || data?.user?.role}
        </div>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(32px, 4vw, 52px)', color:'var(--swp-white)', letterSpacing:'0.02em', lineHeight:1.0 }}>
          Welcome,<br />{data?.user?.full_name}
        </h1>
      </motion.div>

      {/* Content grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
        {/* Recent Updates */}
        <motion.section initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(106,157,190,0.65)', display:'flex', alignItems:'center', gap:'8px' }}>
              <Bell size={13} /> Recent Updates
            </div>
            {data?.recent_updates?.length > 0 && (
              <Link to="/studio-access/updates" style={{ fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(238,240,242,0.3)', textDecoration:'none', display:'flex', alignItems:'center', gap:'4px', transition:'color 0.2s' }}
                onMouseEnter={e=>e.currentTarget.style.color='var(--swp-ice)'} onMouseLeave={e=>e.currentTarget.style.color='rgba(238,240,242,0.3)'}>
                View All <ChevronRight size={12} />
              </Link>
            )}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {data?.recent_updates?.length > 0 ? data.recent_updates.slice(0,4).map(u => (
              <Card key={u.id}>
                <div style={{ display:'flex', justifyContent:'space-between', gap:'12px' }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <h3 style={{ fontFamily:'var(--font-body)', fontSize:'14px', fontWeight:400, color:'var(--swp-white)', marginBottom:'4px' }}>{u.title}</h3>
                    <p style={{ fontFamily:'var(--font-body)', fontSize:'12px', fontWeight:300, color:'rgba(238,240,242,0.38)', lineHeight:1.5, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                      {u.body?.replace(/<[^>]*>/g,'').substring(0,100)}…
                    </p>
                  </div>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:'8px', color:'rgba(238,240,242,0.25)', whiteSpace:'nowrap' }}>{new Date(u.created_at).toLocaleDateString('en-AU',{day:'numeric',month:'short'})}</span>
                </div>
                {u.tags?.length>0 && <div style={{ display:'flex', gap:'6px', marginTop:'10px' }}>{u.tags.slice(0,2).map((t,i)=><span key={i} style={{ fontFamily:'var(--font-mono)', fontSize:'8px', letterSpacing:'0.1em', textTransform:'uppercase', background:'rgba(255,255,255,0.05)', color:'rgba(238,240,242,0.35)', padding:'3px 8px', borderRadius:'1px' }}>{t}</span>)}</div>}
              </Card>
            )) : (
              <Card><div style={{ textAlign:'center', padding:'20px 0' }}><Bell size={22} style={{ color:'rgba(238,240,242,0.15)', margin:'0 auto 8px' }} /><p style={{ fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.12em', color:'rgba(238,240,242,0.2)' }}>No updates yet</p></div></Card>
            )}
          </div>
        </motion.section>

        {/* Recent Assets */}
        <motion.section initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(106,157,190,0.65)', display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px' }}>
            <FolderOpen size={13} /> Recent Assets
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
            {data?.recent_assets?.length > 0 ? data.recent_assets.slice(0,4).map(a => (
              <Card key={a.id}>
                <FileText size={20} style={{ color:'var(--swp-ice)', marginBottom:'10px', opacity:0.7 }} />
                <h3 style={{ fontFamily:'var(--font-body)', fontSize:'13px', fontWeight:400, color:'var(--swp-white)', marginBottom:'4px', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{a.name}</h3>
                <p style={{ fontFamily:'var(--font-mono)', fontSize:'8px', letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(238,240,242,0.3)' }}>{a.asset_type?.replace('_',' ')}</p>
              </Card>
            )) : (
              <div style={{ gridColumn:'1/-1' }}>
                <Card><div style={{ textAlign:'center', padding:'20px 0' }}><FolderOpen size={22} style={{ color:'rgba(238,240,242,0.15)', margin:'0 auto 8px' }} /><p style={{ fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.12em', color:'rgba(238,240,242,0.2)' }}>No assets available</p></div></Card>
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default StudioDashboard;
