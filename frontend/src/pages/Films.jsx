import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, X, RefreshCw } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import FilmModal from '../components/FilmModal';
import PageHeader from '../components/PageHeader';
import { useSeoSettings, generateMovieSchema, getCanonicalUrl } from '../contexts/SeoContext';

const STATUS_OPTIONS = ['All', 'Development', 'Packaging', 'Pre-Production', 'Filming', 'Post-Production', 'Marketing', 'Released'];

const T = {
  glass: { background:'rgba(17,19,24,0.68)', backdropFilter:'blur(20px)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:'3px' },
  mono: { fontFamily:'var(--font-mono)', fontSize:'9px', fontWeight:300, letterSpacing:'0.14em', textTransform:'uppercase' },
  ice: '#6a9dbe',
};

// Status → badge colour
const statusColour = (s) => {
  const map = {
    'Development':    { bg:'rgba(200,175,120,0.12)', color:'rgba(200,175,120,0.9)',  border:'rgba(200,175,120,0.25)' },
    'Post-Production':{ bg:'rgba(120,200,140,0.10)', color:'rgba(120,200,140,0.9)', border:'rgba(120,200,140,0.25)' },
    'Released':       { bg:'rgba(106,157,190,0.10)', color:'rgba(106,157,190,0.9)', border:'rgba(106,157,190,0.2)'  },
  };
  return map[s] || { bg:'rgba(238,240,242,0.05)', color:'rgba(238,240,242,0.4)', border:'rgba(255,255,255,0.08)' };
};

const Films = () => {
  const seoSettings = useSeoSettings();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [filteredFilms, setFilteredFilms] = useState([]);
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const genreDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);
  const scrollPositionRef = useRef(null);

  useEffect(() => { if (!slug) window.scrollTo(0, 0); fetchFilms(); }, []);

  // ── URL-driven modal — preserved exactly ──
  useEffect(() => {
    if (slug && films.length > 0) {
      const film = films.find(f => f.slug === slug || f.id === slug);
      if (film) {
        scrollPositionRef.current = window.scrollY;
        document.body.style.overflow = 'hidden';
        setSelectedFilm({ ...film, posterColor:film.poster_color, imdbUrl:film.imdb_url, watchUrl:film.watch_url, watchUrlTitle:film.watch_url_title, posterUrl:film.poster_url, slug:film.slug||film.id });
      }
    } else if (!slug) {
      document.body.style.overflow = 'unset';
      setSelectedFilm(null);
      if (scrollPositionRef.current > 0) window.scrollTo(0, scrollPositionRef.current);
    }
  }, [slug, films]);

  // ── API call preserved exactly ──
  const fetchFilms = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/films`);
      if (response.ok) { const data = await response.json(); setFilms(data); setFilteredFilms(data); }
    } catch (err) { console.error('Failed to load films:', err); }
    finally { setLoading(false); }
  };

  const genreOptions = useMemo(() => {
    const all = films.flatMap(f => f.genres || []);
    return ['All', ...[...new Set(all)].sort()];
  }, [films]);

  useEffect(() => {
    let result = films;
    if (selectedGenre !== 'All') result = result.filter(f => f.genres?.includes(selectedGenre));
    if (selectedStatus !== 'All') result = result.filter(f => f.status === selectedStatus);
    setFilteredFilms(result);
  }, [selectedGenre, selectedStatus, films]);

  useEffect(() => {
    const handle = (e) => {
      if (genreDropdownRef.current && !genreDropdownRef.current.contains(e.target)) setIsGenreDropdownOpen(false);
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target)) setIsStatusDropdownOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const handleFilmClick = (film) => navigate(`/films/${film.slug || film.id}`);
  const closeModal = () => navigate('/films');
  const movieSchema = selectedFilm ? generateMovieSchema(selectedFilm, seoSettings) : null;

  const FilterBtn = ({ label, isOpen, hasActive, onClick }) => (
    <button
      onClick={onClick}
      data-testid={`${label.toLowerCase().replace(/\s+/g,'-')}-filter-btn`}
      style={{ display:'flex', alignItems:'center', gap:'8px', padding:'9px 16px', background:'rgba(17,19,24,0.8)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:'2px', color:'rgba(238,240,242,0.6)', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.14em', textTransform:'uppercase', transition:'all 0.2s' }}
    >
      {label}
      <ChevronDown size={13} style={{ transition:'transform 0.2s', transform:isOpen?'rotate(180deg)':'none', opacity:0.5 }} />
      {hasActive && <span style={{ marginLeft:'4px', width:'6px', height:'6px', borderRadius:'50%', background:T.ice, display:'inline-block' }} />}
    </button>
  );

  const ChipGroup = ({ options, selected, onSelect, accentClass }) => (
    <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', padding:'16px' }}>
      {options.map(opt => (
        <button key={opt} onClick={() => onSelect(opt)}
          data-testid={`${accentClass}-chip-${opt.toLowerCase().replace(/\s+/g,'-')}`}
          style={{ fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.12em', textTransform:'uppercase', padding:'6px 14px', borderRadius:'2px', border:`0.5px solid ${selected===opt ? T.ice : 'rgba(255,255,255,0.08)'}`, background:selected===opt ? 'rgba(106,157,190,0.12)' : 'transparent', color:selected===opt ? T.ice : 'rgba(238,240,242,0.4)', cursor:'pointer', transition:'all 0.2s' }}>
          {opt}
        </button>
      ))}
    </div>
  );

  return (
    <div className="films-page" style={{ paddingTop:'64px', minHeight:'100vh' }}>
      {selectedFilm ? (
        <>
          <Helmet>
            <title>{selectedFilm.title} | {seoSettings.global_seo?.site_name || 'Shadow Wolves Productions'}</title>
            {selectedFilm.logline && <meta name="description" content={selectedFilm.logline.substring(0,160)} />}
            <link rel="canonical" href={getCanonicalUrl(`/films/${selectedFilm.slug||selectedFilm.id}`, seoSettings)} />
          </Helmet>
          {movieSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(movieSchema) }} />}
        </>
      ) : (
        <Helmet>
          <title>Films | {seoSettings.global_seo?.site_name || 'Shadow Wolves Productions'}</title>
          <meta name="description" content="Explore original screen stories from Shadow Wolves Productions — past, present, and in development." />
          <link rel="canonical" href={getCanonicalUrl('/films', seoSettings)} />
        </Helmet>
      )}

      <PageHeader page="films" title="Films" subtitle="Original screen stories — past, present, and in development." />

      {/* ── FILTER BAR ── */}
      <div style={{ padding:'20px 52px', background:'rgba(13,15,20,0.85)', backdropFilter:'blur(16px)', borderBottom:'0.5px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap', position:'sticky', top:'64px', zIndex:40 }}>

        {/* Genre dropdown */}
        <div ref={genreDropdownRef} style={{ position:'relative' }}>
          <FilterBtn label="Browse by Genre" isOpen={isGenreDropdownOpen} hasActive={selectedGenre!=='All'}
            onClick={() => { setIsGenreDropdownOpen(!isGenreDropdownOpen); setIsStatusDropdownOpen(false); }} />
          {isGenreDropdownOpen && (
            <div style={{ position:'absolute', top:'calc(100% + 8px)', left:0, ...T.glass, minWidth:'280px', zIndex:50 }}>
              <ChipGroup options={genreOptions} selected={selectedGenre} onSelect={(g) => { setSelectedGenre(g); setIsGenreDropdownOpen(false); }} accentClass="genre" />
            </div>
          )}
        </div>

        {/* Status dropdown */}
        <div ref={statusDropdownRef} style={{ position:'relative' }}>
          <FilterBtn label="Browse by Stage" isOpen={isStatusDropdownOpen} hasActive={selectedStatus!=='All'}
            onClick={() => { setIsStatusDropdownOpen(!isStatusDropdownOpen); setIsGenreDropdownOpen(false); }} />
          {isStatusDropdownOpen && (
            <div style={{ position:'absolute', top:'calc(100% + 8px)', left:0, ...T.glass, minWidth:'320px', zIndex:50 }}>
              <ChipGroup options={STATUS_OPTIONS} selected={selectedStatus} onSelect={(s) => { setSelectedStatus(s); setIsStatusDropdownOpen(false); }} accentClass="status" />
            </div>
          )}
        </div>

        {/* Clear filters */}
        {(selectedGenre!=='All'||selectedStatus!=='All') && (
          <button onClick={() => { setSelectedGenre('All'); setSelectedStatus('All'); }} data-testid="clear-filters-btn"
            style={{ display:'flex', alignItems:'center', gap:'6px', background:'none', border:'none', color:'rgba(238,240,242,0.35)', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.12em', textTransform:'uppercase', padding:'8px' }}>
            <X size={12} /> Clear
          </button>
        )}

        <span style={{ fontFamily:'var(--font-mono)', fontSize:'9px', color:'rgba(238,240,242,0.2)', letterSpacing:'0.1em', marginLeft:'auto' }}>
          {filteredFilms.length} film{filteredFilms.length!==1?'s':''}
        </span>
      </div>

      {/* ── FILMS GRID ── */}
      <section style={{ padding:'48px 52px 100px' }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <RefreshCw style={{ width:'24px', height:'24px', color:T.ice, animation:'spin 1s linear infinite', margin:'0 auto 16px' }} />
            <p style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'rgba(238,240,242,0.3)', letterSpacing:'0.14em', textTransform:'uppercase' }}>Loading films…</p>
          </div>
        ) : (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:'10px' }}>
              {filteredFilms.map(film => {
                const sc = statusColour(film.status);
                return (
                  <button
                    key={film.id}
                    onClick={() => handleFilmClick(film)}
                    data-testid="film-card"
                    style={{ position:'relative', overflow:'hidden', borderRadius:'3px', aspectRatio:'2/3', cursor:'pointer', border:'0.5px solid rgba(255,255,255,0.07)', background:'var(--swp-surface)', transition:'border-color 0.3s, transform 0.3s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.16)'; e.currentTarget.style.transform='translateY(-3px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.transform='translateY(0)'; }}
                  >
                    {/* Poster */}
                    <div style={{ position:'absolute', inset:0, backgroundColor:film.poster_color||'#111318' }}>
                      {film.poster_url ? (
                        <img src={`${process.env.REACT_APP_BACKEND_URL}${film.poster_url}`} alt={film.title} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
                      ) : (
                        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'16px', background:'linear-gradient(135deg, rgba(17,19,24,1) 0%, rgba(28,32,40,1) 100%)' }}>
                          <h4 style={{ fontFamily:'var(--font-display)', fontSize:'16px', color:'rgba(238,240,242,0.55)', textAlign:'center', letterSpacing:'0.04em', marginBottom:'10px' }}>{film.title}</h4>
                          <span style={{ ...sc, ...T.mono, padding:'3px 9px', borderRadius:'1px', border:`0.5px solid ${sc.border}` }}>
                            {film.status==='Development'?'In Dev':'Poster TBC'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Featured badge */}
                    {film.featured && (
                      <div style={{ position:'absolute', top:'10px', right:'10px', zIndex:3, ...T.mono, background:'rgba(106,157,190,0.12)', color:T.ice, border:`0.5px solid rgba(106,157,190,0.3)`, padding:'3px 8px', borderRadius:'1px' }}>
                        Featured
                      </div>
                    )}

                    {/* Default overlay — title */}
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(8,9,11,0.9) 0%, rgba(8,9,11,0.15) 50%, transparent 100%)', zIndex:1 }}>
                      <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'14px 12px' }}>
                        <h3 style={{ fontFamily:'var(--font-display)', fontSize:'16px', color:'var(--swp-white)', letterSpacing:'0.03em', lineHeight:1.1 }}>{film.title}</h3>
                      </div>
                    </div>

                    {/* Hover overlay */}
                    <div className="film-hover-overlay" style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(8,9,11,0.97) 0%, rgba(8,9,11,0.75) 45%, rgba(8,9,11,0.2) 100%)', zIndex:2, opacity:0, transition:'opacity 0.3s', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'12px' }}
                      onMouseEnter={e=>e.currentTarget.style.opacity='1'} onMouseLeave={e=>e.currentTarget.style.opacity='0'}>
                      <div>
                        <span style={{ ...T.mono, ...sc, padding:'3px 9px', borderRadius:'1px', border:`0.5px solid ${sc.border}`, display:'inline-block' }}>{film.status}</span>
                      </div>
                      <div>
                        <h3 style={{ fontFamily:'var(--font-display)', fontSize:'17px', color:'var(--swp-white)', letterSpacing:'0.03em', marginBottom:'6px' }}>{film.title}</h3>
                        {film.tagline && <p style={{ fontFamily:'var(--font-body)', fontSize:'11px', color:'rgba(238,240,242,0.45)', lineHeight:1.5, marginBottom:'8px' }}>{film.tagline}</p>}
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'8px' }}>
                          <div style={{ display:'flex', flexWrap:'wrap', gap:'4px' }}>
                            {film.genres?.slice(0,2).map((g,i) => (
                              <span key={i} style={{ ...T.mono, fontSize:'8px', padding:'2px 7px', background:'rgba(255,255,255,0.06)', borderRadius:'1px', color:'rgba(238,240,242,0.5)' }}>{g}</span>
                            ))}
                          </div>
                          <span style={{ ...T.mono, color:'rgba(106,157,190,0.7)' }}>View →</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredFilms.length === 0 && (
              <div style={{ textAlign:'center', padding:'80px 0' }}>
                <p style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'rgba(238,240,242,0.3)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:'16px' }}>
                  {selectedGenre!=='All'&&selectedStatus!=='All' ? `No ${selectedStatus} films in ${selectedGenre}` : selectedGenre!=='All' ? `No films in ${selectedGenre}` : `No ${selectedStatus} films`}
                </p>
                <button onClick={() => { setSelectedGenre('All'); setSelectedStatus('All'); }}
                  style={{ fontFamily:'var(--font-mono)', fontSize:'9px', letterSpacing:'0.14em', textTransform:'uppercase', color:T.ice, background:'none', border:'none', cursor:'pointer' }}>
                  Clear filters
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <FilmModal film={selectedFilm} isOpen={!!selectedFilm} onClose={closeModal} />
    </div>
  );
};

export default Films;
