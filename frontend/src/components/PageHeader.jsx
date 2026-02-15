import React from 'react';

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
  const bgImage = PAGE_HEADERS[page];

  return (
    <section className="page-header relative py-12 overflow-hidden" data-testid={`page-header-${page}`}>
      {/* Background Image */}
      {bgImage && (
        <div className="absolute inset-0">
          <img src={`${API}${bgImage}`} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
        </div>
      )}
      {!bgImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-black via-smoke-gray to-black">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-electric-blue rounded-full filter blur-3xl" />
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 relative z-10">
        <h1 className="md:text-7xl text-6xl font-bold text-white mb-4 font-cinzel">{title}</h1>
        {subtitle && <p className="max-w-2xl text-lg text-gray-300">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
};

export default PageHeader;
