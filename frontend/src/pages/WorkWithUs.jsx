import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Send, CheckCircle, ChevronDown, Mail, Plus, Minus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '../components/PageHeader';
import { useSeoSettings, getCanonicalUrl } from '../contexts/SeoContext';

// ── ALL CONSTANTS PRESERVED ──
const ROLES = ['Writer','Director','Producer','Actor','Cinematographer','Editor','Composer','Other'];
const SUBMISSION_TYPES = ['Script','Concept','Proof-of-Concept','Collaboration','Brand/IP Partnership'];
const FORMATS = ['Short','Feature','Series','Documentary','Other'];
const GENRES = ['Horror','Thriller','Psychological','Supernatural','Slasher','Drama','Action','Sci-Fi','Dark Comedy'];
const PROJECT_STAGES = ['Idea','First Draft','Polished Draft','Proof-of-Concept','In Development'];
const ENQUIRY_TOPICS = ['General Question','Investment Opportunities','Distribution','Press/Media','Partnership','Other'];

const FAQ_ITEMS = [
  { question:"What kind of projects are you looking for?", answer:"We develop and produce bold, genre-driven stories with teeth. Horror, thriller, psychological, slasher, supernatural, crime, true-crime and war-leaning drama are in our wheelhouse. If it's safe, predictable, or trying to please everyone, it's probably not us." },
  { question:"Do you accept unsolicited scripts or attachments?", answer:"Not upfront. We don't accept unsolicited attachments for legal and confidentiality reasons. If there's alignment, we'll request materials securely." },
  { question:"What should I submit first?", answer:"Start with a strong logline and a link to your pitch materials (deck, lookbook, or teaser). Keep it lean. If it hooks us, we'll ask for the next layer." },
  { question:"What formats do you work with?", answer:"Short films, feature films, series, and documentaries (selectively). Choose the format that best serves the story, not the one that feels easiest to \"get made.\"" },
  { question:"I'm cast/crew. How do I get into your database?", answer:"CineConnect is our upcoming cast & crew network. Register your interest and we'll notify you when it opens.", link:{ text:"CineConnect", url:"https://www.cognitoforms.com/ShadowWolvesProductions/CastCrewHub" } },
  { question:"Do you work with investors and partners?", answer:"Yes, through our Studio Access Portal. If you're interested in investment, you can", link:{ text:"REQUEST ACCESS", url:"/request-access" } },
  { question:"How long does it take to hear back?", answer:"If it's a fit, you'll hear from us. If it's not, you probably won't. We keep our focus tight so we can actually build." },
  { question:"Can I submit multiple projects?", answer:"Submit your best one first. If it connects, we'll open the door to more." },
  { question:"Aside from films, what else do you do?", answer:"We build more than projects. We're developing a studio ecosystem — tools, resources, and platforms designed to support independent creators." },
  { question:"What is The Den?", answer:"The Den is our working studio journal. Casting calls, crew intel, production lessons, industry news, and tools we actually use." },
  { question:"What is The Armory?", answer:"The Armory is our creative arsenal — premium apps, templates, and resources built from real-world production experience." },
  { question:"Is Shadow Wolves just horror?", answer:"No. Genre is our backbone, but not our limit. We prioritise bold, commercially viable stories across film and series." },
];

const generateFAQSchema = () => ({
  "@context":"https://schema.org","@type":"FAQPage",
  mainEntity: FAQ_ITEMS.map(i => ({ "@type":"Question", name:i.question, acceptedAnswer:{"@type":"Answer", text:i.answer+(i.link?` ${i.link.text}: ${i.link.url}`:'')} }))
});

// ── STYLE TOKENS ──
const T = {
  glass: { background:'rgba(17,19,24,0.68)', backdropFilter:'blur(20px)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:'3px' },
  mono: { fontFamily:'var(--font-mono)', fontSize:'9px', fontWeight:300, letterSpacing:'0.14em', textTransform:'uppercase' },
  label: { fontFamily:'var(--font-mono)', fontSize:'9px', fontWeight:300, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(238,240,242,0.4)', display:'block', marginBottom:'8px' },
  input: { background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:'2px', padding:'12px 14px', fontFamily:'var(--font-body)', fontSize:'14px', fontWeight:300, color:'var(--swp-white)', outline:'none', width:'100%', transition:'border-color 0.2s, background 0.2s' },
  inputErr: { borderColor:'rgba(200,80,80,0.5)' },
  errMsg: { fontFamily:'var(--font-mono)', fontSize:'8px', color:'rgba(200,100,100,0.8)', letterSpacing:'0.1em', marginTop:'5px' },
  ice: '#6a9dbe',
};

// ── CINECONNECT CARD ──
const CineConnectCard = () => (
  <div style={{ ...T.glass, padding:'28px 30px' }} data-testid="cineconnect-section">
    <div style={{ ...T.mono, color:'rgba(106,157,190,0.6)', marginBottom:'10px' }}>Coming soon</div>
    <h4 style={{ fontFamily:'var(--font-display)', fontSize:'22px', color:'var(--swp-white)', letterSpacing:'0.03em', marginBottom:'10px' }}>CineConnect</h4>
    <p style={{ fontFamily:'var(--font-body)', fontSize:'13px', fontWeight:300, color:'rgba(238,240,242,0.42)', lineHeight:1.65, marginBottom:'20px' }}>
      Cast &amp; Crew Network launching soon. Fill out the form to join our talent database and you'll already be in the system when we go live.
    </p>
    <button onClick={() => window.open('https://www.cognitoforms.com/ShadowWolvesProductions/CastCrewHub','_blank')}
      data-testid="cineconnect-register-btn"
      className="btn-swp btn-swp-primary" style={{ width:'100%', justifyContent:'center' }}>
      Join the Database →
    </button>
  </div>
);

// ── SUBMIT PROJECT FORM — all logic preserved ──
const SubmitProjectForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({ name:'',email:'',role:'',submission_type:'',format:'',genres:[],project_stage:'',logline:'',external_link:'',message:'' });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmOriginal, setConfirmOriginal] = useState(false);
  const [confirmNoAttachments, setConfirmNoAttachments] = useState(false);

  const validateForm = () => {
    const e = {};
    if (!formData.name.trim()) e.name='Name is required';
    if (!formData.email.trim()) { e.email='Email is required'; } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email='Invalid email format';
    if (!formData.role) e.role='Please select your role';
    if (!formData.submission_type) e.submission_type='Please select submission type';
    if (!formData.format) e.format='Please select format';
    if (formData.genres.length===0) e.genres='Select at least one genre';
    if (!formData.project_stage) e.project_stage='Please select project stage';
    if (!formData.logline.trim()) { e.logline='Logline is required'; } else if (formData.logline.length>300) e.logline='Logline must be under 300 characters';
    setErrors(e); return Object.keys(e).length===0;
  };
  const handleChange = (e) => { const {name,value}=e.target; setFormData(p=>({...p,[name]:value})); if(errors[name]) setErrors(p=>({...p,[name]:null})); };
  const handleGenreToggle = (g) => { setFormData(p=>({...p,genres:p.genres.includes(g)?p.genres.filter(x=>x!==g):[...p.genres,g]})); if(errors.genres) setErrors(p=>({...p,genres:null})); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) { toast.error('Please fix the errors below'); return; }
    if (!confirmOriginal||!confirmNoAttachments) { toast.error('Please confirm the required acknowledgements'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/submissions`,{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...formData,submission_type_tag:'project'}) });
      if (res.ok) { onSuccess(); toast.success('Submission received'); }
      else { const err=await res.json(); toast.error(err.detail||'Submission failed'); }
    } catch { toast.error('Network error. Please try again.'); }
    finally { setSubmitting(false); }
  };

  const SWPSelect = ({ name, value, onChange, options, placeholder, testId }) => (
    <div style={{ position:'relative' }}>
      <select name={name} value={value} onChange={onChange} data-testid={testId}
        style={{ ...T.input, ...(errors[name]?T.inputErr:{}), appearance:'none', cursor:'pointer', backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(238,240,242,0.3)' stroke-width='1.2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat:'no-repeat', backgroundPosition:'right 14px center', paddingRight:'40px' }}>
        <option value="">{placeholder}</option>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} data-testid="submit-project-form" style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
      {/* Name + Email */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
        <div><label style={T.label}>Name *</label><input type="text" name="name" value={formData.name} onChange={handleChange} style={{ ...T.input,...(errors.name?T.inputErr:{}) }} placeholder="Your name" data-testid="project-name-input" />{errors.name&&<p style={T.errMsg}>{errors.name}</p>}</div>
        <div><label style={T.label}>Email *</label><input type="email" name="email" value={formData.email} onChange={handleChange} style={{ ...T.input,...(errors.email?T.inputErr:{}) }} placeholder="your@email.com" data-testid="project-email-input" />{errors.email&&<p style={T.errMsg}>{errors.email}</p>}</div>
      </div>
      {/* Role + Type */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
        <div><label style={T.label}>Your Role *</label><SWPSelect name="role" value={formData.role} onChange={handleChange} options={ROLES} placeholder="Select role" testId="project-role-select" />{errors.role&&<p style={T.errMsg}>{errors.role}</p>}</div>
        <div><label style={T.label}>Submission Type *</label><SWPSelect name="submission_type" value={formData.submission_type} onChange={handleChange} options={SUBMISSION_TYPES} placeholder="Select type" testId="project-type-select" />{errors.submission_type&&<p style={T.errMsg}>{errors.submission_type}</p>}</div>
      </div>
      {/* Format + Stage */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
        <div><label style={T.label}>Format *</label><SWPSelect name="format" value={formData.format} onChange={handleChange} options={FORMATS} placeholder="Select format" testId="project-format-select" />{errors.format&&<p style={T.errMsg}>{errors.format}</p>}</div>
        <div><label style={T.label}>Project Stage *</label><SWPSelect name="project_stage" value={formData.project_stage} onChange={handleChange} options={PROJECT_STAGES} placeholder="Where is it at?" testId="project-stage-select" />{errors.project_stage&&<p style={T.errMsg}>{errors.project_stage}</p>}</div>
      </div>
      {/* Genres */}
      <div>
        <label style={T.label}>Genre(s) *</label>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
          {GENRES.map(g=>(
            <button key={g} type="button" onClick={()=>handleGenreToggle(g)} data-testid={`genre-chip-${g.toLowerCase()}`}
              style={{ ...T.mono, padding:'7px 14px', borderRadius:'2px', border:`0.5px solid ${formData.genres.includes(g)?T.ice:'rgba(255,255,255,0.09)'}`, background:formData.genres.includes(g)?'rgba(106,157,190,0.12)':'transparent', color:formData.genres.includes(g)?T.ice:'rgba(238,240,242,0.38)', cursor:'pointer', transition:'all 0.2s' }}>
              {g}
            </button>
          ))}
        </div>
        {errors.genres&&<p style={T.errMsg}>{errors.genres}</p>}
      </div>
      {/* Logline */}
      <div>
        <label style={T.label}>Logline * <span style={{ ...T.mono, fontSize:'8px', color:'rgba(238,240,242,0.2)', textTransform:'none' }}>({formData.logline.length}/300)</span></label>
        <textarea name="logline" value={formData.logline} onChange={handleChange} rows={2} maxLength={300} style={{ ...T.input,...(errors.logline?T.inputErr:{}), resize:'none' }} placeholder="One sentence. Make it count." data-testid="project-logline-input" />
        {errors.logline&&<p style={T.errMsg}>{errors.logline}</p>}
      </div>
      {/* Link + Message */}
      <div><label style={T.label}>Link <span style={{ ...T.mono, fontSize:'8px', color:'rgba(238,240,242,0.2)', textTransform:'none' }}>(Drive, Vimeo, website)</span></label><input type="url" name="external_link" value={formData.external_link} onChange={handleChange} style={T.input} placeholder="https://…" data-testid="project-link-input" /></div>
      <div><label style={T.label}>Message <span style={{ ...T.mono, fontSize:'8px', color:'rgba(238,240,242,0.2)', textTransform:'none' }}>(optional)</span></label><textarea name="message" value={formData.message} onChange={handleChange} rows={3} maxLength={500} style={{ ...T.input, resize:'none' }} placeholder="Anything else?" data-testid="project-message-input" /></div>
      {/* Confirmations */}
      <div style={{ borderTop:'0.5px solid rgba(255,255,255,0.07)', paddingTop:'16px', display:'flex', flexDirection:'column', gap:'12px' }}>
        {[
          { state:confirmOriginal, set:setConfirmOriginal, label:"I confirm this project is original or I control the rights to submit it. *", testId:"confirm-original-checkbox" },
          { state:confirmNoAttachments, set:setConfirmNoAttachments, label:"I understand unsolicited attachments cannot be accepted. *", testId:"confirm-attachments-checkbox" },
        ].map(({state,set,label,testId})=>(
          <label key={testId} style={{ display:'flex', alignItems:'flex-start', gap:'12px', cursor:'pointer' }}>
            <input type="checkbox" checked={state} onChange={e=>set(e.target.checked)} data-testid={testId} style={{ marginTop:'2px', accentColor:T.ice, width:'14px', height:'14px' }} />
            <span style={{ fontFamily:'var(--font-body)', fontSize:'13px', fontWeight:300, color:'rgba(238,240,242,0.45)', lineHeight:1.6 }}>{label}</span>
          </label>
        ))}
      </div>
      <button type="submit" disabled={submitting} data-testid="submit-project-btn" className="btn-swp btn-swp-primary" style={{ justifyContent:'center', opacity:submitting?0.6:1 }}>
        {submitting ? 'Processing…' : <><Send size={14} /> Submit Project</>}
      </button>
    </form>
  );
};

// ── GENERAL ENQUIRY FORM ──
const GeneralEnquiryForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({ name:'',email:'',phone:'',topic:'',message:'' });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e={};
    if (!formData.name.trim()) e.name='Name is required';
    if (!formData.email.trim()) { e.email='Email is required'; } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email='Invalid email';
    if (!formData.topic) e.topic='Please select a topic';
    if (!formData.message.trim()) e.message='Message is required';
    setErrors(e); return Object.keys(e).length===0;
  };
  const handleChange = (e) => { const {name,value}=e.target; setFormData(p=>({...p,[name]:value})); if(errors[name]) setErrors(p=>({...p,[name]:null})); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fix the errors below'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/contact`,{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...formData,service:formData.topic,submission_type_tag:'enquiry'}) });
      if (res.ok) { onSuccess(); toast.success('Message sent successfully'); }
      else { const err=await res.json(); toast.error(err.detail||'Failed to send'); }
    } catch { toast.error('Network error. Please try again.'); }
    finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="general-enquiry-form" style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
        <div><label style={T.label}>Full Name *</label><input type="text" name="name" value={formData.name} onChange={handleChange} style={{ ...T.input,...(errors.name?T.inputErr:{}) }} placeholder="John Doe" data-testid="enquiry-name-input" />{errors.name&&<p style={T.errMsg}>{errors.name}</p>}</div>
        <div><label style={T.label}>Email *</label><input type="email" name="email" value={formData.email} onChange={handleChange} style={{ ...T.input,...(errors.email?T.inputErr:{}) }} placeholder="john@example.com" data-testid="enquiry-email-input" />{errors.email&&<p style={T.errMsg}>{errors.email}</p>}</div>
      </div>
      <div><label style={T.label}>Phone <span style={{ ...T.mono, fontSize:'8px', color:'rgba(238,240,242,0.2)', textTransform:'none' }}>(optional)</span></label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} style={T.input} placeholder="+61 XXX XXX XXX" data-testid="enquiry-phone-input" /></div>
      <div>
        <label style={T.label}>What can we help with? *</label>
        <div style={{ position:'relative' }}>
          <select name="topic" value={formData.topic} onChange={handleChange} data-testid="enquiry-topic-select" style={{ ...T.input,...(errors.topic?T.inputErr:{}), appearance:'none', cursor:'pointer', backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(238,240,242,0.3)' stroke-width='1.2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat:'no-repeat', backgroundPosition:'right 14px center', paddingRight:'40px' }}>
            <option value="">Select a topic</option>
            {ENQUIRY_TOPICS.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        {errors.topic&&<p style={T.errMsg}>{errors.topic}</p>}
      </div>
      <div><label style={T.label}>Message *</label><textarea name="message" value={formData.message} onChange={handleChange} rows={5} style={{ ...T.input,...(errors.message?T.inputErr:{}), resize:'none' }} placeholder="Tell us about your enquiry…" data-testid="enquiry-message-input" />{errors.message&&<p style={T.errMsg}>{errors.message}</p>}</div>
      <button type="submit" disabled={submitting} data-testid="submit-enquiry-btn" className="btn-swp btn-swp-primary" style={{ justifyContent:'center', opacity:submitting?0.6:1 }}>
        {submitting ? 'Sending…' : <><Mail size={14} /> Send Message</>}
      </button>
    </form>
  );
};

// ── NEWSLETTER ──
const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); if (!email) return; setSubmitting(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/newsletter`,{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,source:'work_with_us_page'}) });
      if (res.ok) { setSubscribed(true); toast.success('Welcome to the pack!'); }
      else { const err=await res.json(); toast.error(err.detail||'Failed to subscribe'); }
    } catch { toast.error('Connection error.'); }
    finally { setSubmitting(false); }
  };

  return (
    <section style={{ padding:'0 52px 100px' }}>
      <div style={{ background:'rgba(17,19,24,0.68)', backdropFilter:'blur(20px)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:'3px', padding:'56px 64px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'60px', alignItems:'center' }}>
        <div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(106,157,190,0.65)', display:'flex', alignItems:'center', gap:'10px', marginBottom:'14px' }}>
            <span style={{ width:'24px', height:'0.5px', background:'rgba(106,157,190,0.4)', display:'block' }}/>Stay in the loop
          </div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(28px,3vw,42px)', color:'var(--swp-white)', letterSpacing:'0.02em', marginBottom:'12px' }}>Join the Pack</h2>
          <p style={{ fontFamily:'var(--font-body)', fontSize:'14px', fontWeight:300, color:'rgba(238,240,242,0.5)', lineHeight:1.7 }}>Inside access to casting calls, industry updates, and the tools we actually use.</p>
        </div>
        <div>
          {subscribed ? (
            <div data-testid="newsletter-success" style={{ display:'flex', alignItems:'center', gap:'12px', color:'rgba(120,200,140,0.85)' }}>
              <CheckCircle size={22} />
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', letterSpacing:'0.12em', textTransform:'uppercase' }}>You're in. Welcome to the pack.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} data-testid="newsletter-form" style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter your email" required data-testid="newsletter-email-input" className="swp-input" />
              <button type="submit" disabled={submitting} data-testid="newsletter-submit-btn" className="btn-swp btn-swp-primary" style={{ justifyContent:'center', opacity:submitting?0.6:1 }}>
                {submitting ? 'Subscribing…' : 'Subscribe'}
              </button>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'8px', color:'rgba(238,240,242,0.2)', letterSpacing:'0.1em' }}>No spam. Unsubscribe anytime.</span>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

// ── FAQ ──
const FAQSection = () => {
  const [open, setOpen] = useState({});
  const toggle = i => setOpen(p=>({...p,[i]:!p[i]}));
  return (
    <section style={{ padding:'0 52px 80px' }} data-testid="faq-section">
      <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(106,157,190,0.65)', display:'flex', alignItems:'center', gap:'16px', marginBottom:'28px' }}>
        <span style={{ width:'24px', height:'0.5px', background:'rgba(106,157,190,0.4)', display:'block' }}/>Frequently asked
        <div style={{ flex:1, height:'0.5px', background:'rgba(255,255,255,0.07)' }}/>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1px', background:'rgba(255,255,255,0.07)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:'3px', overflow:'hidden' }}>
        {FAQ_ITEMS.map((item,i)=>(
          <div key={i} data-testid={`faq-item-${i}`} style={{ background:'rgba(13,15,20,0.75)', cursor:'pointer' }} onClick={()=>toggle(i)}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'16px', padding:'22px 26px' }}>
              <span style={{ fontFamily:'var(--font-body)', fontSize:'14px', fontWeight:400, color:'rgba(238,240,242,0.65)', lineHeight:1.5 }}>{item.question}</span>
              {open[i] ? <Minus size={15} style={{ color:'rgba(106,157,190,0.7)', flexShrink:0, marginTop:'2px' }} /> : <Plus size={15} style={{ color:'rgba(238,240,242,0.3)', flexShrink:0, marginTop:'2px' }} />}
            </div>
            {open[i] && (
              <div style={{ padding:'0 26px 22px', borderTop:'0.5px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontFamily:'var(--font-body)', fontSize:'13px', fontWeight:300, color:'rgba(238,240,242,0.42)', lineHeight:1.7, paddingTop:'14px' }}>
                  {item.answer}
                  {item.link && <> <a href={item.link.url} target={item.link.url.startsWith('http')?'_blank':undefined} rel={item.link.url.startsWith('http')?'noopener noreferrer':undefined} style={{ color:'rgba(106,157,190,0.8)', textDecoration:'none' }}>{item.link.text}</a></>}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

// ── SUCCESS STATE ──
const SuccessState = ({ type, onReset }) => (
  <div style={{ textAlign:'center', padding:'60px 0' }} data-testid={`${type}-success`}>
    <CheckCircle style={{ width:'52px', height:'52px', color:'rgba(120,200,140,0.85)', margin:'0 auto 20px' }} />
    <h3 style={{ fontFamily:'var(--font-display)', fontSize:'28px', color:'var(--swp-white)', letterSpacing:'0.03em', marginBottom:'12px' }}>
      {type==='project' ? 'Thanks for your submission.' : 'Message sent.'}
    </h3>
    <p style={{ fontFamily:'var(--font-body)', fontSize:'14px', fontWeight:300, color:'rgba(238,240,242,0.45)', marginBottom:'24px' }}>
      {type==='project' ? "If the project aligns with our current development slate, we'll be in touch." : "We'll get back to you as soon as possible."}
    </p>
    <button onClick={onReset} data-testid="submit-another-btn"
      style={{ fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(106,157,190,0.7)', background:'none', border:'none', cursor:'pointer' }}>
      Submit another {type==='project'?'project':'enquiry'}
    </button>
  </div>
);

// ── MAIN ──
const WorkWithUs = () => {
  const seoSettings = useSeoSettings();
  const [activeLane, setActiveLane] = useState(null);
  const [projectSubmitted, setProjectSubmitted] = useState(false);
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);
  useEffect(() => { window.scrollTo(0,0); }, []);
  const shouldRenderFaqSchema = seoSettings.organization_schema?.enable_faq_schema !== false;

  const LaneBtn = ({ lane, label, testId }) => {
    const active = activeLane===lane;
    return (
      <button onClick={() => setActiveLane(activeLane===lane?null:lane)} data-testid={testId}
        style={{ flex:1, padding:'16px 24px', fontFamily:'var(--font-mono)', fontSize:'10px', letterSpacing:'0.14em', textTransform:'uppercase', cursor:'pointer', borderRadius:'2px', transition:'all 0.25s', border:`0.5px solid ${active?'rgba(106,157,190,0.5)':'rgba(255,255,255,0.1)'}`, background:active?'rgba(106,157,190,0.1)':'rgba(17,19,24,0.6)', color:active?'var(--swp-ice)':'rgba(238,240,242,0.4)', backdropFilter:'blur(12px)' }}>
        {label}
      </button>
    );
  };

  return (
    <div className="work-with-us-page" style={{ paddingTop:'64px', minHeight:'100vh' }}>
      <Helmet>
        <title>Work With Us | {seoSettings.global_seo?.site_name||'Shadow Wolves Productions'}</title>
        <meta name="description" content="Submit your project or get in touch with Shadow Wolves Productions." />
        <link rel="canonical" href={getCanonicalUrl('/work-with-us',seoSettings)} />
      </Helmet>
      {shouldRenderFaqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html:JSON.stringify(generateFAQSchema()) }} />}

      <PageHeader page="workwithus" title="Work With Us" subtitle="Choose your lane. Submit with intent." />

      {/* ── FORM AREA ── */}
      <section style={{ padding:'48px 52px 80px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:'16px', alignItems:'start' }}>
          <div>
            {/* Lane buttons */}
            <div style={{ display:'flex', gap:'10px', marginBottom:'20px' }}>
              <LaneBtn lane="project" label="Submit a Project" testId="submit-project-toggle" />
              <LaneBtn lane="enquiry" label="General Enquiry" testId="general-enquiry-toggle" />
            </div>

            {/* Form panel */}
            {activeLane==='project' && (
              <div style={{ background:'rgba(17,19,24,0.68)', backdropFilter:'blur(20px)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:'3px', overflow:'hidden' }} data-testid="project-lane">
                <div style={{ padding:'24px 32px 0' }}>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(106,157,190,0.6)', marginBottom:'6px' }}>Submit a project</div>
                  <h2 style={{ fontFamily:'var(--font-display)', fontSize:'28px', color:'var(--swp-white)', letterSpacing:'0.03em', marginBottom:'20px' }}>Tell us about your project</h2>
                </div>
                <div style={{ padding:'0 32px 32px' }}>
                  {projectSubmitted ? <SuccessState type="project" onReset={()=>{ setProjectSubmitted(false); setActiveLane('project'); }} /> : <SubmitProjectForm onSuccess={()=>setProjectSubmitted(true)} />}
                </div>
              </div>
            )}

            {activeLane==='enquiry' && (
              <div style={{ background:'rgba(17,19,24,0.68)', backdropFilter:'blur(20px)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:'3px', overflow:'hidden' }} data-testid="enquiry-lane">
                <div style={{ padding:'24px 32px 0' }}>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(106,157,190,0.6)', marginBottom:'6px' }}>General enquiry</div>
                  <h2 style={{ fontFamily:'var(--font-display)', fontSize:'28px', color:'var(--swp-white)', letterSpacing:'0.03em', marginBottom:'20px' }}>Say something</h2>
                </div>
                <div style={{ padding:'0 32px 32px' }}>
                  {enquirySubmitted ? <SuccessState type="enquiry" onReset={()=>{ setEnquirySubmitted(false); setActiveLane('enquiry'); }} /> : <GeneralEnquiryForm onSuccess={()=>setEnquirySubmitted(true)} />}
                </div>
              </div>
            )}

            {!activeLane && (
              <div style={{ padding:'60px 0', textAlign:'center', color:'rgba(238,240,242,0.25)', fontFamily:'var(--font-mono)', fontSize:'10px', letterSpacing:'0.14em', textTransform:'uppercase' }}>
                Select an option above to get started.
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            <CineConnectCard />
            <div style={{ background:'rgba(17,19,24,0.68)', backdropFilter:'blur(16px)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:'3px', padding:'24px 26px' }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(238,240,242,0.3)', marginBottom:'10px' }}>Direct contact</div>
              <div style={{ fontFamily:'var(--font-body)', fontSize:'13px', fontWeight:300, color:'rgba(238,240,242,0.45)', lineHeight:2 }}>
                <div>admin@shadowwolvesproductions.com.au</div>
                <div>+61 0420 984 558</div>
                <div style={{ color:'rgba(238,240,242,0.25)' }}>Sydney, NSW, Australia</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FAQSection />
      <NewsletterSection />
    </div>
  );
};

export default WorkWithUs;
