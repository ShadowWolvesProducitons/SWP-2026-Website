import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_wolfmedia/artifacts/bifyh7bv_Black%20Logo%20Only.png";

const NAV_LINKS = [
  { name: 'About',        path: '/' },
  { name: 'Films',        path: '/films' },
  { name: 'Resources',    path: '/armory' },
  { name: 'Work With Us', path: '/work-with-us' },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <header
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: '64px',
        background: scrolled ? 'rgba(8,9,11,0.92)' : 'rgba(8,9,11,0.75)',
        backdropFilter: 'blur(18px) saturate(1.2)',
        borderBottom: '0.5px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center',
        padding: '0 52px',
        justifyContent: 'space-between',
        transition: 'background 0.3s ease',
      }}
    >
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
        <img
          src={LOGO_URL}
          alt="Shadow Wolves Productions"
          style={{ height: '40px', width: 'auto', display: 'block' }}
        />
      </Link>

      {/* Desktop nav */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '40px' }} className="hidden lg:flex">
        {NAV_LINKS.map(link => (
          <Link
            key={link.path}
            to={link.path}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              fontWeight: 300,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              color: isActive(link.path)
                ? 'rgba(238,240,242,0.85)'
                : 'rgba(238,240,242,0.3)',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => { if (!isActive(link.path)) e.target.style.color = 'var(--swp-ice)'; }}
            onMouseLeave={e => { if (!isActive(link.path)) e.target.style.color = 'rgba(238,240,242,0.3)'; }}
          >
            {link.name}
          </Link>
        ))}
      </nav>

      {/* Studio Portal CTA */}
      <Link
        to="/request-access"
        className="hidden lg:inline-flex"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          fontWeight: 300,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgba(106,157,190,0.75)',
          textDecoration: 'none',
          border: '0.5px solid rgba(106,157,190,0.25)',
          padding: '7px 16px',
          borderRadius: '2px',
          transition: 'background 0.2s, color 0.2s',
          flexShrink: 0,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(106,157,190,0.1)';
          e.currentTarget.style.color = 'var(--swp-ice)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'rgba(106,157,190,0.75)';
        }}
      >
        Studio Portal →
      </Link>

      {/* Mobile burger */}
      <button
        className="lg:hidden"
        onClick={() => setMenuOpen(!menuOpen)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(238,240,242,0.6)', padding: '8px' }}
        aria-label="Toggle menu"
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          position: 'absolute', top: '64px', left: 0, right: 0,
          background: 'rgba(8,9,11,0.97)',
          backdropFilter: 'blur(20px)',
          borderBottom: '0.5px solid rgba(255,255,255,0.07)',
          padding: '24px 32px 32px',
          display: 'flex', flexDirection: 'column',
        }}>
          {NAV_LINKS.map(link => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: isActive(link.path) ? 'rgba(238,240,242,0.9)' : 'rgba(238,240,242,0.4)',
                textDecoration: 'none',
                padding: '14px 0',
                borderBottom: '0.5px solid rgba(255,255,255,0.06)',
              }}
            >
              {link.name}
            </Link>
          ))}
          <Link
            to="/request-access"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--swp-ice)',
              textDecoration: 'none',
              padding: '14px 0',
              marginTop: '4px',
            }}
          >
            Studio Portal →
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
