import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { User, Mail, MessageSquare, ChevronDown, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

// ── ALL CONSTANTS PRESERVED ──
const ROLES = [
  { value:'investor',           label:'Investor' },
  { value:'director',           label:'Director' },
  { value:'producer',           label:'Producer' },
  { value:'executive_producer', label:'Executive Producer (EP)' },
  { value:'sales_agent',        label:'Sales Agent' },
  { value:'cast',               label:'Cast' },
  { value:'crew',               label:'Crew' },
  { value:'talent_manager',     label:'Talent Manager' },
  { value:'other',              label:'Other' },
];

const LOGO_URL = "https://customer-assets.emergentagent.com/job_wolfmedia/artifacts/bifyh7bv_Black%20Logo%20Only.png";

const T = {
  mono: { fontFamily:'var(--font-mono)', fontSize:'9px', fontWeight:300, letterSpacing:'0.14em', textTransform:'uppercase' },
  label: { fontFamily:'var(--font-mono)', fontSize:'9px', fontWeight:300, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(238,240,242,0.4)', display:'block', marginBottom:'8px' },
  input: { background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:'2px', padding:'13px 16px', fontFamily:'var(--font-body)', fontSize:'14px', fontWeight:300, color:'var(--swp-white)', outline:'none', width:'100%', transition:'border-color 0.2s, background 0.2s' },
  ice: '#6a9dbe',
};

const RequestAccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedProject = searchParams.get('project');

  const [formData, setFormData] = useState({
    full_name:'', email:'', role:'', other_role_description:'',
    projects_requested: preselectedProject ? [preselectedProject] : [],
    other_project_selected:false, other_project_description:'', message:'', agreed_to_terms:false
  });
  const [projects, setProjects]                 = useState([]);
  const [loading, setLoading]                   = useState(false);
  const [submitted, setSubmitted]               = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'auto';
    document.body.style.position = '';
    document.documentElement.style.overflow = 'auto';
    window.scrollTo(0, 0);
    fetchProjects();
    return () => { document.body.style.overflow=''; document.body.style.position=''; };
  }, []);

  // ── API calls preserved exactly ──
  const fetchProjects = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/films`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data.filter(f => f.studio_access_enabled === true));
      }
    } catch { console.error('Failed to fetch projects'); }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(p => ({ ...p, [name]: type==='checkbox' ? checked : value }));
  };
  const handleRoleSelect = (v) => { setFormData(p=>({...p,role:v})); setRoleDropdownOpen(false); };
  const handleProjectToggle = (id) => setFormData(p=>({ ...p, projects_requested: p.projects_requested.includes(id) ? p.projects_requested.filter(x=>x!==id) : [...p.projects_requested,id] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name||!formData.email||!formData.role) { toast.error('Please fill in all required fields'); return; }
    if (!formData.agreed_to_terms) { toast.error('You must agree to the confidentiality terms'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/studio-portal/request-access`,{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(formData) });
      const data = await res.json();
      if (res.ok) { setSubmitted(true); toast.success('Request submitted successfully'); }
      else { toast.error(data.detail||'Failed to submit request'); }
    } catch { toast.error('An error occurred. Please try again.'); }
    finally { setLoading(false); }
  };

  // ── SUCCESS STATE ──
  if (submitted) {
    return (
      <>
        <Helmet><title>Request Submitted | Shadow Wolves Productions</title></Helmet>
        <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', background:'var(--swp-black)' }}>
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} style={{ maxWidth:'440px', width:'100%', textAlign:'center' }}>
            <div style={{ width:'64px', height:'64px', borderRadius:'50%', background:'rgba(120,200,140,0.1)', border:'0.5px solid rgba(120,200,140,0.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>
              <Check size={32} style={{ color:'rgba(120,200,140,0.85)' }} />
            </div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'42px', color:'var(--swp-white)', letterSpacing:'0.02em', marginBottom:'16px' }}>Check Your Email</h1>
            <p style={{ fontFamily:'var(--font-body)', fontSize:'15px', fontWeight:300, color:'rgba(238,240,242,0.5)', lineHeight:1.7, marginBottom:'32px' }}>
              We've sent a verification link to <strong style={{ color:'var(--swp-white)' }}>{formData.email}</strong>. Click the link to verify and set up your password.
            </p>
            <p style={{ fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.12em', color:'rgba(238,240,242,0.25)' }}>
              Didn't receive it? Check spam or{' '}
              <button onClick={()=>setSubmitted(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(106,157,190,0.7)', fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.12em' }}>try again</button>
            </p>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Request Access | Shadow Wolves Productions</title>
        <meta name="description" content="Request access to the Shadow Wolves Productions Studio Portal" />
      </Helmet>

      <div data-testid="request-access-page" style={{ minHeight:'100vh', background:'var(--swp-black)', padding:'80px 24px', overflowY:'auto',
        backgroundImage:'radial-gradient(ellipse 70% 70% at 50% 30%, rgba(106,157,190,0.04) 0%, transparent 60%)' }}>
        <div style={{ maxWidth:'640px', margin:'0 auto' }}>

          {/* Back link */}
          <Link to="/" data-testid="back-to-website-btn"
            style={{ display:'inline-flex', alignItems:'center', gap:'8px', fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(238,240,242,0.3)', textDecoration:'none', marginBottom:'48px', transition:'color 0.2s' }}
            onMouseEnter={e=>e.currentTarget.style.color='rgba(106,157,190,0.7)'} onMouseLeave={e=>e.currentTarget.style.color='rgba(238,240,242,0.3)'}>
            <ArrowLeft size={14} /> Back to website
          </Link>

          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}>

            {/* Portal header */}
            <div style={{ textAlign:'center', marginBottom:'48px' }}>
              <img src={LOGO_URL} alt="Shadow Wolves Productions" style={{ height:'52px', width:'auto', margin:'0 auto 24px', opacity:0.9 }} />
              <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(106,157,190,0.65)', border:'0.5px solid rgba(106,157,190,0.2)', padding:'6px 16px', borderRadius:'1px', marginBottom:'20px' }}>
                <span className="swp-pulse" style={{ width:'5px', height:'5px', borderRadius:'50%', background:'rgba(106,157,190,0.7)', display:'inline-block' }} />
                Restricted access
              </div>
              <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(44px, 7vw, 72px)', color:'var(--swp-white)', letterSpacing:'0.02em', lineHeight:0.92, marginBottom:'16px' }}>
                Studio<br/>Portal
              </h1>
              <p style={{ fontFamily:'var(--font-body)', fontSize:'15px', fontWeight:300, color:'rgba(238,240,242,0.45)', maxWidth:'440px', lineHeight:1.75, margin:'0 auto 16px' }}>
                Exclusive access to project materials, investment documents, pitch decks, and slate updates for authorised partners.
              </p>
              <p style={{ fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.12em', color:'rgba(238,240,242,0.25)' }}>
                Already have an account?{' '}
                <button onClick={()=>navigate('/studio-access/login')} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(106,157,190,0.7)', fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.12em', textDecoration:'underline' }}>Sign In</button>
              </p>
            </div>

            {/* Form container */}
            <div style={{ background:'rgba(13,15,20,0.88)', backdropFilter:'blur(28px)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:'3px', overflow:'hidden' }}>
              <div style={{ padding:'20px 40px', borderBottom:'0.5px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(106,157,190,0.65)' }}>Request access</span>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.12em', color:'rgba(238,240,242,0.2)' }}>Reviewed manually</span>
              </div>
              <div style={{ padding:'36px 40px' }}>
                <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'20px' }}>

                  {/* Name + Email */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                    <div>
                      <label style={T.label}>Full Name *</label>
                      <div style={{ position:'relative' }}>
                        <User size={16} style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'rgba(238,240,242,0.25)', pointerEvents:'none' }} />
                        <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} style={{ ...T.input, paddingLeft:'40px' }} placeholder="John Smith" required data-testid="full-name-input" />
                      </div>
                    </div>
                    <div>
                      <label style={T.label}>Email *</label>
                      <div style={{ position:'relative' }}>
                        <Mail size={16} style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'rgba(238,240,242,0.25)', pointerEvents:'none' }} />
                        <input type="email" name="email" value={formData.email} onChange={handleChange} style={{ ...T.input, paddingLeft:'40px' }} placeholder="john@company.com" required data-testid="email-input" />
                      </div>
                    </div>
                  </div>

                  {/* Role dropdown */}
                  <div>
                    <label style={T.label}>Role / Reason for Access *</label>
                    <div style={{ position:'relative' }}>
                      <button type="button" onClick={()=>setRoleDropdownOpen(!roleDropdownOpen)} data-testid="role-dropdown"
                        style={{ ...T.input, display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', textAlign:'left' }}>
                        <span style={{ color:formData.role?'var(--swp-white)':'rgba(238,240,242,0.2)' }}>
                          {formData.role ? ROLES.find(r=>r.value===formData.role)?.label : 'Select your role…'}
                        </span>
                        <ChevronDown size={16} style={{ color:'rgba(238,240,242,0.3)', transform:roleDropdownOpen?'rotate(180deg)':'none', transition:'transform 0.2s' }} />
                      </button>
                      {roleDropdownOpen && (
                        <div style={{ position:'absolute', top:'calc(100% + 6px)', left:0, right:0, background:'rgba(13,15,20,0.97)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:'2px', zIndex:20, overflow:'hidden', backdropFilter:'blur(16px)' }}>
                          {ROLES.map(r=>(
                            <button key={r.value} type="button" onClick={()=>handleRoleSelect(r.value)}
                              style={{ width:'100%', padding:'11px 16px', textAlign:'left', background:formData.role===r.value?'rgba(106,157,190,0.1)':'transparent', color:formData.role===r.value?T.ice:'rgba(238,240,242,0.6)', border:'none', cursor:'pointer', fontFamily:'var(--font-body)', fontSize:'14px', fontWeight:300, transition:'background 0.15s', borderBottom:'0.5px solid rgba(255,255,255,0.04)' }}>
                              {r.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Other role */}
                  {formData.role==='other' && (
                    <div>
                      <label style={T.label}>Please Specify</label>
                      <input type="text" name="other_role_description" value={formData.other_role_description} onChange={handleChange} style={T.input} placeholder="Describe your role or interest…" />
                    </div>
                  )}

                  {/* Projects of interest */}
                  <div>
                    <label style={T.label}>Projects of Interest <span style={{ ...T.mono, fontSize:'8px', color:'rgba(238,240,242,0.2)', textTransform:'none' }}>(optional)</span></label>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px' }}>
                      {projects.map(p=>(
                        <button key={p.id} type="button" onClick={()=>handleProjectToggle(p.id)}
                          style={{ padding:'10px 12px', borderRadius:'2px', textAlign:'left', fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', transition:'all 0.2s', border:`0.5px solid ${formData.projects_requested.includes(p.id)?T.ice:'rgba(255,255,255,0.09)'}`, background:formData.projects_requested.includes(p.id)?'rgba(106,157,190,0.12)':'transparent', color:formData.projects_requested.includes(p.id)?T.ice:'rgba(238,240,242,0.4)' }}>
                          {p.title}
                        </button>
                      ))}
                      <button type="button" onClick={()=>setFormData(p=>({...p,other_project_selected:!p.other_project_selected}))}
                        style={{ padding:'10px 12px', borderRadius:'2px', textAlign:'left', fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', transition:'all 0.2s', border:`0.5px solid ${formData.other_project_selected?T.ice:'rgba(255,255,255,0.09)'}`, background:formData.other_project_selected?'rgba(106,157,190,0.12)':'transparent', color:formData.other_project_selected?T.ice:'rgba(238,240,242,0.4)' }}>
                        Other
                      </button>
                    </div>
                    {formData.other_project_selected && (
                      <input type="text" name="other_project_description" value={formData.other_project_description} onChange={handleChange} data-testid="other-project-input"
                        style={{ ...T.input, marginTop:'10px' }} placeholder="Specify project or describe your interest…" />
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label style={T.label}>Message <span style={{ ...T.mono, fontSize:'8px', color:'rgba(238,240,242,0.2)', textTransform:'none' }}>(optional)</span></label>
                    <div style={{ position:'relative' }}>
                      <MessageSquare size={16} style={{ position:'absolute', left:'14px', top:'14px', color:'rgba(238,240,242,0.2)', pointerEvents:'none' }} />
                      <textarea name="message" value={formData.message} onChange={handleChange} rows={4}
                        style={{ ...T.input, paddingLeft:'40px', resize:'none' }}
                        placeholder="Tell us about yourself or your interest in our projects…" />
                    </div>
                  </div>

                  {/* Terms */}
                  <div style={{ background:'rgba(255,255,255,0.03)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:'2px', padding:'16px' }}>
                    <label style={{ display:'flex', alignItems:'flex-start', gap:'12px', cursor:'pointer' }}>
                      <input type="checkbox" name="agreed_to_terms" checked={formData.agreed_to_terms} onChange={handleChange} data-testid="terms-checkbox"
                        style={{ marginTop:'2px', accentColor:T.ice, width:'14px', height:'14px', flexShrink:0 }} />
                      <span style={{ fontFamily:'var(--font-body)', fontSize:'13px', fontWeight:300, color:'rgba(238,240,242,0.45)', lineHeight:1.65 }}>
                        I agree not to share, copy, or distribute any confidential materials accessed through the Studio Portal. I understand all documents may be watermarked and my access may be revoked if these terms are violated.
                      </span>
                    </label>
                  </div>

                  <button type="submit" disabled={loading} data-testid="submit-request-btn"
                    className="btn-swp btn-swp-primary" style={{ justifyContent:'center', opacity:loading?0.6:1 }}>
                    {loading ? 'Submitting…' : <>Request Access <ArrowRight size={14} /></>}
                  </button>
                </form>
              </div>

              {/* Trust strip */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1px', background:'rgba(255,255,255,0.06)', borderTop:'0.5px solid rgba(255,255,255,0.07)' }}>
                {[
                  { icon:'NDA', text:'All portal access is subject to confidentiality. Materials are not for distribution.' },
                  { icon:'VET', text:'Applications are reviewed manually. We don't automate access to sensitive project materials.' },
                  { icon:'SEC', text:'Secure, time-limited access links. No shared passwords. No bulk downloads.' },
                ].map(item => (
                  <div key={item.icon} style={{ background:'rgba(13,15,20,0.8)', padding:'18px 20px', display:'flex', gap:'12px', alignItems:'flex-start' }}>
                    <span style={{ fontFamily:'var(--font-display)', fontSize:'14px', color:'rgba(106,157,190,0.5)', flexShrink:0 }}>{item.icon}</span>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'8px', letterSpacing:'0.1em', color:'rgba(238,240,242,0.25)', lineHeight:1.7 }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </>
  );
};

export default RequestAccess;
