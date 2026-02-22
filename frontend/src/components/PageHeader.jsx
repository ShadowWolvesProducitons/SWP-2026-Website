import React, { useState, useEffect } from 'react';

const API = process.env.REACT_APP_BACKEND_URL;

const PAGE_HEADERS = {
  about: '/api/upload/images/header-about.jpg',
  films: '/api/upload/images/header-films.jpg',
  armory: '/api/upload/images/header-armory.jpg',
  den: '/api/upload/images/header-den.jpg',
  investors: '/api/upload/images/header-investors.jpg',
  workwithus: '/api/upload/images/header-workwithus.jpg',
  contact: '/api/upload/images/header-contact.jpg',
};

const PageHeader = ({ page, title, subtitle, children }) => {
  const [settings, setSettings] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const defaultImage = PAGE_HEADERS[page];

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API}/api/site-settings/headers/${page}`);
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Failed to fetch header settings:', error);
      } finally {
        setLoaded(true);
      }
    };
    fetchSettings();
  }, [page]);

  // Only show the final image URL (from settings or default if no custom set)
  const imageUrl = loaded ? (settings?.image_url || defaultImage) : null;
  const positionX = settings?.position_x ?? 50;
  const positionY = settings?.position_y ?? 30;
  const overlayOpacity = settings?.overlay_opacity ?? 85;

  return (
    <section className="page-header relative py-12 overflow-hidden" data-testid={`page-header-${page}`}>
      {/* Background Image - only show after settings are loaded */}
      {loaded && imageUrl && (
        <div className="absolute inset-0">
          <img 
            src={`${API}${imageUrl}`} 
            alt="" 
            className="w-full h-full object-cover"
            style={{ objectPosition: `${positionX}% ${positionY}%` }}
          />
          <div 
            className="absolute inset-0 bg-gradient-to-r from-black via-black to-black/60"
            style={{ opacity: overlayOpacity / 100 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
        </div>
      )}
      {/* Fallback gradient while loading or if no image */}
      {(!loaded || !imageUrl) && (
        <div className="absolute inset-0 bg-gradient-to-br from-black via-smoke-gray to-black">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-electric-blue rounded-full filter blur-3xl" />
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 relative z-10">
        <h1 className="md:text-7xl text-6xl font-bold text-white mb-4 font-cinzel">
          {settings?.title || title}
        </h1>
        {(settings?.subtitle || subtitle) && (
          <p className="max-w-2xl text-lg text-gray-300">{settings?.subtitle || subtitle}</p>
        )}
        {children}
      </div>
    </section>
  );
};

export default PageHeader;
