import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ServicesModal from '../components/ServicesModal';
import SupportModal from '../components/SupportModal';
import { useSeoSettings, generateOrganizationSchema, getCanonicalUrl } from '../contexts/SeoContext';

// ── Shared style tokens ──
const T = {
  eyebrow: { fontFamily:'var(--font-mono)', fontSize:'10px', fontWeight:300, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(106,157,190,0.7)', display:'flex', alignItems:'center', gap:'10px' },
  displayTitle: { fontFamily:'var(--font-display)', lineHeight:0.92, letterSpacing:'0.01em', color:'var(--swp-white)' },
  body: { fontFamily:'var(--font-body)', fontWeight:300, color:'rgba(238,240,242,0.55)', lineHeight:1.75 },
  monoLabel: { fontFamily:'var(--font-mono)', fontSize:'9px', fontWeight:300, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(238,240,242,0.4)' },
  glass: { background:'rgba(17,19,24,0.68)', backdropFilter:'blur(22px) saturate(1.1)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:'3px' },
  ice: '#6a9dbe',
};

const Home = () => {
  const seoSettings = useSeoSettings();
  const [servicesModalOpen, setServicesModalOpen] = useState(false);
  const [activeServiceKey, setActiveServiceKey] = useState(null);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [activeSupportKey, setActiveSupportKey] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const openServicesModal = (key) => { setActiveServiceKey(key); setServicesModalOpen(true); };
  const closeServicesModal = () => { setServicesModalOpen(false); setTimeout(() => setActiveServiceKey(null), 200); };
  const openSupportModal = (key) => { setActiveSupportKey(key); setSupportModalOpen(true); };
  const closeSupportModal = () => { setSupportModalOpen(false); setTimeout(() => setActiveSupportKey(null), 200); };

  const organizationSchema = generateOrganizationSchema(seoSettings);

  // ── API call preserved exactly ──
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) { toast.error('Please enter your email'); return; }
    setSubscribing(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail, source: 'homepage' })
      });
      if (response.ok) {
        toast.success('Welcome to the pack! Check your email.');
        setNewsletterEmail('');
        localStorage.setItem('swp_subscribed', 'true');
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to subscribe');
      }
    } catch { toast.error('Something went wrong. Please try again.'); }
    finally { setSubscribing(false); }
  };

  return (
    <div className="home-page">
      <Helmet>
        <title>{seoSettings.global_seo?.site_name || 'Shadow Wolves Productions'}</title>
        <meta name="description" content={seoSettings.global_seo?.default_meta_description || 'Shadow Wolves Productions exists to create bold, genre-driven stories with teeth.'} />
        <link rel="canonical" href={getCanonicalUrl('/', seoSettings)} />
      </Helmet>
      {organizationSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />}

      {/* ── HERO ── */}
      <section style={{ minHeight:'100vh', position:'relative', display:'flex', flexDirection:'column', justifyContent:'center', padding:'120px 52px 80px', overflow:'hidden' }}>
        {/* Video background — preserved from original */}
        <div style={{ position:'absolute', inset:0, zIndex:0 }}>
          <video autoPlay loop muted playsInline className="hero-video" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }}>
            <source src="https://customer-assets.emergentagent.com/job_wolfmedia/artifacts/0n4k6t8k_SWP_Hero_BG.mp4" type="video/mp4" />
          </video>
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(8,9,11,0.55) 0%, rgba(8,9,11,0.35) 40%, rgba(8,9,11,0.88) 100%)' }} />
          <div style={{ position:'absolute', inset:0, background:'rgba(5,6,8,0.42)' }} />
        </div>

        <div style={{ position:'relative', zIndex:2, maxWidth:'860px' }}>
          <div style={{ ...T.eyebrow, marginBottom:'20px' }}>
            <span style={{ display:'block', width:'24px', height:'0.5px', background:'rgba(106,157,190,0.6)' }} />
            Indie film production — NSW, Australia
          </div>
          <h1 style={{ ...T.displayTitle, fontSize:'clamp(68px, 10vw, 138px)', marginBottom:'24px' }}>
            Shadow Wolves<br />
            <span style={{ color:T.ice }}>Productions</span>
          </h1>
          <p style={{ ...T.body, fontSize:'16px', maxWidth:'440px', marginBottom:'44px' }}>
            Bold, genre-driven stories with teeth. We develop, produce and support screen stories that refuse to flinch.
          </p>
          <div style={{ display:'flex', gap:'14px', flexWrap:'wrap', alignItems:'center' }}>
            <Link to="/films" data-testid="hero-cta-films" className="btn-swp btn-swp-primary">
              View our films
            </Link>
            <Link to="/work-with-us" data-testid="hero-cta-work" className="btn-swp btn-swp-ghost">
              Work with us
            </Link>
            <Link to="/armory" data-testid="hero-cta-armory" style={{ fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(238,240,242,0.3)', textDecoration:'none', transition:'color 0.2s' }}
              onMouseEnter={e=>e.target.style.color='rgba(106,157,190,0.8)'} onMouseLeave={e=>e.target.style.color='rgba(238,240,242,0.3)'}>
              Resources →
            </Link>
          </div>
          {/* Scroll indicator */}
          <div className="scroll-indicator" style={{ marginTop:'52px', display:'flex', flexDirection:'column', alignItems:'flex-start', gap:'6px' }}>
            <span style={{ ...T.monoLabel }}>Scroll</span>
            <svg width="12" height="18" viewBox="0 0 12 18" fill="none" style={{ opacity:0.35 }}>
              <path d="M6 1v16M1 12l5 5 5-5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </section>

      {/* ── MANIFESTO ── */}
      <section style={{ padding:'100px 52px' }}>
        <div style={{ ...T.glass, padding:'56px 64px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'72px', alignItems:'center' }}>
          <div>
            <div style={{ ...T.eyebrow, marginBottom:'20px' }}>
              <span style={{ width:'24px', height:'0.5px', background:'rgba(106,157,190,0.5)', display:'block' }}/>
              Who we are
            </div>
            <h2 style={{ ...T.displayTitle, fontSize:'clamp(36px, 4vw, 56px)' }}>
              We don't chase <em style={{ fontStyle:'normal', color:T.ice }}>trends.</em><br/>
              We don't ask <em style={{ fontStyle:'normal', color:T.ice }}>permission.</em>
            </h2>
          </div>
          <div>
            <p style={{ ...T.body, fontSize:'15px', marginBottom:'18px' }}>
              Shadow Wolves Productions is an independent film company built on the belief that <strong style={{ color:'var(--swp-white)', fontWeight:400 }}>the most dangerous stories are the ones that need to be told.</strong>
            </p>
            <p style={{ ...T.body, fontSize:'15px', marginBottom:'18px' }}>
              We work across the full production pipeline — from a shaky first draft to festival delivery — with a focus on psychological thrillers, horror, and dramatic narratives that don't look away.
            </p>
            <p style={{ ...T.body, fontSize:'15px' }}>Based in NSW. Built for the long game.</p>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section style={{ padding:'0 52px 100px' }}>
        <div style={{ ...T.glass, overflow:'hidden' }}>
          <div style={{ padding:'44px 56px 36px', borderBottom:'0.5px solid rgba(255,255,255,0.07)' }}>
            <div style={{ ...T.eyebrow, marginBottom:'14px' }}>
              <span style={{ width:'24px', height:'0.5px', background:'rgba(106,157,190,0.5)', display:'block' }}/>
              What we do
            </div>
            <h2 style={{ ...T.displayTitle, fontSize:'clamp(32px, 3.5vw, 48px)' }}>
              Full pipeline. No hand-holding.
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)' }}>
            {[
              { key:'development',    num:'01', title:'Development' },
              { key:'preproduction',  num:'02', title:'Pre-Production' },
              { key:'postproduction', num:'03', title:'Post-Production' },
            ].map((s, i) => (
              <button
                key={s.key}
                onClick={() => openServicesModal(s.key)}
                onKeyDown={e => (e.key==='Enter'||e.key===' ') && openServicesModal(s.key)}
                style={{
                  background:'transparent', border:'none', borderRight: i<2 ? '0.5px solid rgba(255,255,255,0.07)' : 'none',
                  padding:'40px 44px', textAlign:'left', cursor:'pointer', position:'relative', overflow:'hidden',
                  transition:'background 0.25s',
                }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(106,157,190,0.05)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                aria-label={`Learn more about ${s.title}`}
              >
                <span style={{ position:'absolute', top:'16px', right:'24px', fontFamily:'var(--font-display)', fontSize:'64px', color:'rgba(238,240,242,0.05)', letterSpacing:'0.04em', lineHeight:1, userSelect:'none' }}>{s.num}</span>
                <div style={{ ...T.monoLabel, marginBottom:'14px' }}>{s.num}</div>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:'28px', color:'var(--swp-white)', letterSpacing:'0.03em', marginBottom:'10px' }}>{s.title}</h3>
                <span style={{ ...T.monoLabel, color:'rgba(106,157,190,0.6)' }}>Learn more →</span>
              </button>
            ))}
          </div>
          {/* Additional support chips */}
          <div style={{ padding:'24px 56px', borderTop:'0.5px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' }}>
            <span style={{ ...T.monoLabel, marginRight:'6px' }}>Additional support —</span>
            {[
              { key:'script-coverage',     label:'Script Coverage' },
              { key:'development-notes',   label:'Development Notes' },
              { key:'pitch-materials',     label:'Pitch Materials' },
              { key:'creative-consulting', label:'Creative Consulting' },
            ].map(chip => (
              <button
                key={chip.key}
                onClick={() => openSupportModal(chip.key)}
                style={{ ...T.monoLabel, background:'transparent', border:'0.5px solid rgba(255,255,255,0.08)', borderRadius:'2px', padding:'6px 14px', cursor:'pointer', transition:'all 0.2s', color:'rgba(238,240,242,0.35)' }}
                onMouseEnter={e=>{ e.currentTarget.style.color='var(--swp-ice)'; e.currentTarget.style.borderColor='rgba(106,157,190,0.35)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.color='rgba(238,240,242,0.35)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; }}
              >{chip.label}</button>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUOTE ── */}
      <section style={{ padding:'0 52px 100px' }}>
        <div style={{ borderLeft:'1.5px solid rgba(106,157,190,0.3)', paddingLeft:'40px' }}>
          <blockquote style={{ fontFamily:'var(--font-display)', fontSize:'clamp(22px, 2.8vw, 36px)', color:'rgba(238,240,242,0.55)', letterSpacing:'0.02em', lineHeight:1.25 }}>
            "If it doesn't scare us a little, it's probably not worth making."
          </blockquote>
        </div>
      </section>

      {/* ── WHAT WE'RE BUILDING ── */}
      <section style={{ padding:'0 52px 100px' }}>
        <div style={{ ...T.glass, padding:'56px 64px' }}>
          <div style={{ ...T.eyebrow, marginBottom:'14px' }}>
            <span style={{ width:'24px', height:'0.5px', background:'rgba(106,157,190,0.5)', display:'block' }}/>
            The slate
          </div>
          <h2 style={{ ...T.displayTitle, fontSize:'clamp(32px, 3.5vw, 48px)', marginBottom:'24px' }}>What We're Building</h2>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'40px', alignItems:'end' }}>
            <div>
              <p style={{ ...T.body, fontSize:'15px', marginBottom:'16px' }}>
                We're developing a slate of genre-driven projects across film, television, and emerging formats. Each project is selected for its creative ambition and commercial viability.
              </p>
              <p style={{ ...T.body, fontSize:'15px' }}>
                Beyond production, we're building a studio ecosystem — films, tools, and resources designed to support independent creators who share our approach.
              </p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'12px', alignItems:'flex-start' }}>
              <p style={{ ...T.body, fontSize:'14px' }}>This is long-term development, not a quick flip. We build what we believe in.</p>
              <Link to="/request-access" data-testid="about-cta-invest" className="btn-swp btn-swp-primary">
                Investor access →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section style={{ padding:'0 52px 100px' }}>
        <div style={{ ...T.glass, padding:'56px 64px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'60px', alignItems:'center' }}>
          <div>
            <div style={{ ...T.eyebrow, marginBottom:'14px' }}>
              <span style={{ width:'24px', height:'0.5px', background:'rgba(106,157,190,0.5)', display:'block' }}/>
              Stay in the loop
            </div>
            <h2 style={{ ...T.displayTitle, fontSize:'clamp(28px, 3vw, 42px)', marginBottom:'12px' }}>Join the Pack</h2>
            <p style={{ ...T.body, fontSize:'14px' }}>
              Inside access to casting calls, industry updates, and the tools, apps, and templates we actually use.
            </p>
          </div>
          <form onSubmit={handleNewsletterSubmit} style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            <input
              type="email"
              value={newsletterEmail}
              onChange={e => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={subscribing}
              className="swp-input"
            />
            <button type="submit" disabled={subscribing} className="btn-swp btn-swp-primary" style={{ justifyContent:'center', opacity:subscribing?0.6:1 }}>
              {subscribing ? <><Loader2 size={14} className="animate-spin" /> Joining…</> : 'Subscribe'}
            </button>
            <span style={{ ...T.monoLabel, fontSize:'8px', color:'rgba(238,240,242,0.2)' }}>No spam. Unsubscribe anytime.</span>
          </form>
        </div>
      </section>

      <ServicesModal open={servicesModalOpen} onClose={closeServicesModal} serviceKey={activeServiceKey} />
      <SupportModal open={supportModalOpen} onClose={closeSupportModal} supportKey={activeSupportKey} />
    </div>
  );
};

export default Home;
