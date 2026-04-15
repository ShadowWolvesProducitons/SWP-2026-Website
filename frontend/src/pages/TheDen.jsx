import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Download, FileText, BookOpen, GraduationCap, ExternalLink, RefreshCw, Star } from 'lucide-react';
import { Helmet } from 'react-helmet';
import PageHeader from '../components/PageHeader';

const T = {
  mono: { fontFamily:'var(--font-mono)', fontSize:'9px', fontWeight:300, letterSpacing:'0.14em', textTransform:'uppercase' },
  ice: '#6a9dbe',
};

const TABS = [
  { id:'All',       label:'All',       icon:FileText     },
  { id:'Apps',      label:'Apps',      icon:Smartphone   },
  { id:'Templates', label:'Templates', icon:FileText     },
  { id:'Downloads', label:'Downloads', icon:Download     },
  { id:'Courses',   label:'Courses',   icon:GraduationCap},
  { id:'eBooks',    label:'eBooks',    icon:BookOpen     },
];

const TheDen = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [allItems, setAllItems]   = useState([]);

  useEffect(() => { window.scrollTo(0, 0); fetchAllItems(); }, []);

  useEffect(() => {
    setItems(activeTab === 'All' ? allItems : allItems.filter(i => i.item_type === activeTab));
  }, [activeTab, allItems]);

  // ── API call preserved exactly ──
  const fetchAllItems = async () => {
    setLoading(true);
    try {
      const types = ['Apps','Templates','Downloads','Courses','eBooks'];
      const all = [];
      for (const type of types) {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/den-items?item_type=${type}`);
        if (res.ok) all.push(...await res.json());
      }
      all.sort((a,b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (a.sort_order||0)-(b.sort_order||0);
      });
      setAllItems(all); setItems(all);
    } catch { console.error('Failed to load items'); }
    finally { setLoading(false); }
  };

  const getCount = (id) => id==='All' ? allItems.length : allItems.filter(i=>i.item_type===id).length;

  return (
    <div className="the-armory-page" style={{ paddingTop:'64px', minHeight:'100vh' }}>
      <Helmet>
        <title>Resources | Shadow Wolves Productions</title>
        <meta name="description" content="Apps, templates, resources, and courses built for real-world filmmaking." />
      </Helmet>

      <PageHeader page="armory" title="Resources" subtitle="Apps, templates, and courses built from real production experience. Tools we actually use." />

      {/* ── FILTER TABS ── */}
      <div style={{ padding:'0 52px', background:'rgba(13,15,20,0.85)', backdropFilter:'blur(16px)', borderBottom:'0.5px solid rgba(255,255,255,0.07)', position:'sticky', top:'64px', zIndex:40 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'2px', overflowX:'auto', paddingBottom:'0' }}>
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            const count  = getCount(tab.id);
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                data-testid={`tab-${tab.id.toLowerCase()}`}
                style={{ ...T.mono, display:'flex', alignItems:'center', gap:'7px', padding:'16px 18px', background:'none', border:'none', borderBottom:`2px solid ${active ? T.ice : 'transparent'}`, color:active ? T.ice : 'rgba(238,240,242,0.35)', cursor:'pointer', transition:'all 0.2s', whiteSpace:'nowrap' }}>
                {tab.label}
                {count > 0 && (
                  <span style={{ fontSize:'8px', padding:'2px 6px', borderRadius:'1px', background:active?'rgba(106,157,190,0.12)':'rgba(255,255,255,0.05)', color:active?T.ice:'rgba(238,240,242,0.3)' }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
          <span style={{ ...T.mono, marginLeft:'auto', color:'rgba(238,240,242,0.2)', padding:'0 12px' }}>
            {items.length} item{items.length!==1?'s':''}
          </span>
        </div>
      </div>

      {/* ── PRODUCTS GRID ── */}
      <section style={{ padding:'48px 52px 100px' }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <RefreshCw style={{ width:'22px', height:'22px', color:T.ice, animation:'spin 1s linear infinite', margin:'0 auto 14px' }} />
            <p style={{ ...T.mono, color:'rgba(238,240,242,0.3)' }}>Loading…</p>
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <p style={{ fontFamily:'var(--font-display)', fontSize:'28px', color:'rgba(238,240,242,0.3)', letterSpacing:'0.04em', marginBottom:'8px' }}>Nothing here yet</p>
            <p style={{ ...T.mono, color:'rgba(238,240,242,0.2)' }}>Check back soon</p>
          </div>
        ) : (
          <>
            {/* Featured collection */}
            {activeTab === 'All' && items.filter(i=>i.featured).length > 0 && (
              <div style={{ marginBottom:'52px' }}>
                <div className="section-divider">
                  <span className="section-divider-label">Featured</span>
                  <div className="section-divider-line" />
                  <span className="section-divider-count">{items.filter(i=>i.featured).length} items</span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:'10px' }}>
                  {items.filter(i=>i.featured).map(item => <ProductCard key={item.id} item={item} />)}
                </div>
              </div>
            )}
            {/* All / filtered */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:'10px' }}>
              {items.filter(i => activeTab!=='All'||!i.featured).map(item => <ProductCard key={item.id} item={item} />)}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

// ── Product Card ──
const ProductCard = ({ item }) => {
  const hasLandingPage = item.slug && item.is_published !== false;
  const linkUrl = hasLandingPage ? `/armory/${item.slug}` : (item.primary_link_url || item.file_url || '#');
  const isExternal = !hasLandingPage && linkUrl !== '#';

  const inner = (
    <div style={{ overflow:'hidden', borderRadius:'3px', border:'0.5px solid rgba(255,255,255,0.07)', background:'var(--swp-surface)', transition:'border-color 0.3s, transform 0.3s', cursor:'pointer' }}
      onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,0.14)'; e.currentTarget.style.transform='translateY(-2px)'; }}
      onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.transform='translateY(0)'; }}>
      {/* Thumbnail */}
      <div style={{ aspectRatio:'1', background:'rgba(28,32,40,0.8)', position:'relative', overflow:'hidden' }}>
        {item.thumbnail_url ? (
          <img src={`${process.env.REACT_APP_BACKEND_URL}${item.thumbnail_url}`} alt={item.title}
            style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'contain', background:'#0a0a0c' }} loading="lazy" />
        ) : (
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontFamily:'var(--font-display)', fontSize:'22px', color:'rgba(238,240,242,0.12)', letterSpacing:'0.08em' }}>{item.item_type?.toUpperCase()?.slice(0,3)}</span>
          </div>
        )}
        {item.featured && (
          <div style={{ position:'absolute', top:'8px', left:'8px', fontFamily:'var(--font-mono)', fontSize:'8px', letterSpacing:'0.1em', textTransform:'uppercase', background:'rgba(106,157,190,0.12)', color:'#6a9dbe', border:'0.5px solid rgba(106,157,190,0.3)', padding:'3px 8px', borderRadius:'1px', display:'flex', alignItems:'center', gap:'4px' }}>
            <Star size={8} fill="currentColor" /> Featured
          </div>
        )}
      </div>
      {/* Info */}
      <div style={{ padding:'14px 16px' }}>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:'8px', letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(106,157,190,0.6)', display:'block', marginBottom:'5px' }}>{item.item_type}</span>
        <h3 style={{ fontFamily:'var(--font-display)', fontSize:'16px', color:'var(--swp-white)', letterSpacing:'0.03em', lineHeight:1.1, marginBottom:'8px' }}>{item.title}</h3>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color: item.is_free ? 'rgba(120,200,140,0.85)' : 'rgba(238,240,242,0.4)', letterSpacing:'0.1em' }}>
          {item.is_free ? 'Free' : item.price || null}
        </span>
      </div>
    </div>
  );

  if (hasLandingPage) return <Link to={linkUrl} data-testid={`product-card-${item.id}`} style={{ textDecoration:'none', display:'block' }}>{inner}</Link>;
  return <a href={linkUrl} target={isExternal?'_blank':undefined} rel={isExternal?'noopener noreferrer':undefined} data-testid={`product-card-${item.id}`} style={{ textDecoration:'none', display:'block' }}>{inner}</a>;
};

export default TheDen;
