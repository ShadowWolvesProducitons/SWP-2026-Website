import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Youtube, Instagram, Facebook } from 'lucide-react';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_wolfmedia/artifacts/bifyh7bv_Black%20Logo%20Only.png";

const LINKS = [
  { name: 'About',         path: '/' },
  { name: 'Films',         path: '/films' },
  { name: 'Resources',     path: '/armory' },
  { name: 'Work With Us',  path: '/work-with-us' },
  { name: 'Studio Portal', path: '/request-access' },
];

const SOCIALS = [
  { href: 'https://www.youtube.com/c/ShadowWolvesProductions',      Icon: Youtube   },
  { href: 'https://www.instagram.com/Shadow.Wolves.Productions',     Icon: Instagram },
  { href: 'https://www.facebook.com/ShadowWolvesProductions1',       Icon: Facebook  },
];

const Footer = () => {
  const navigate = useNavigate();
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef(null);

  const handleSecretClick = () => {
    clickCountRef.current++;
    if (clickCountRef.current === 3) {
      clickCountRef.current = 0;
      clearTimeout(clickTimerRef.current);
      navigate('/admin');
    }
    clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => { clickCountRef.current = 0; }, 1000);
  };

  const mono = (extra = {}) => ({
    fontFamily: 'var(--font-mono)',
    fontSize: '9px',
    fontWeight: 300,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'rgba(238,240,242,0.28)',
    textDecoration: 'none',
    transition: 'color 0.2s',
    ...extra,
  });

  return (
    <footer style={{
      borderTop: '0.5px solid rgba(255,255,255,0.07)',
      background: 'rgba(8,9,11,0.9)',
      backdropFilter: 'blur(16px)',
      padding: '48px 52px 40px',
      position: 'relative',
      zIndex: 10,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '40px',
        flexWrap: 'wrap',
        marginBottom: '40px',
      }}>

        {/* Logo + contact */}
        <div>
          <img
            src={LOGO_URL}
            alt="Shadow Wolves Productions"
            style={{ height: '44px', width: 'auto', marginBottom: '20px', opacity: 0.85 }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {['Sydney, NSW, Australia', 'admin@shadowwolvesproductions.com.au', '+61 0420 984 558'].map(line => (
              <span key={line} style={mono({ color: 'rgba(238,240,242,0.22)' })}>{line}</span>
            ))}
          </div>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {LINKS.map(link => (
            <Link
              key={link.path}
              to={link.path}
              style={mono()}
              onMouseEnter={e => e.target.style.color = 'var(--swp-ice)'}
              onMouseLeave={e => e.target.style.color = 'rgba(238,240,242,0.28)'}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Social + tagline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            {SOCIALS.map(({ href, Icon }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'rgba(238,240,242,0.25)', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--swp-ice)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(238,240,242,0.25)'}
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
          <span style={mono({ fontStyle: 'italic', color: 'rgba(238,240,242,0.15)', textTransform: 'none', letterSpacing: '0.04em', fontSize: '10px' })}>
            "We don't follow. We hunt."
          </span>
        </div>

      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
        <span
          style={mono({ color: 'rgba(238,240,242,0.18)', cursor: 'default', userSelect: 'none' })}
          onClick={handleSecretClick}
          data-testid="hidden-admin-link"
        >
          © 2026 Shadow Wolves Productions Pty Ltd. All rights reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
