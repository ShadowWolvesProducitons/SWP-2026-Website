import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { films, services, testimonials } from '../mock';
import { Play, ArrowRight, Star, Award, Users, Film } from 'lucide-react';

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const featuredFilms = films.filter((film) => film.featured).slice(0, 3);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section relative flex items-center justify-center overflow-hidden min-h-screen">
        {/* Cinematic Video Background */}
        <div className="hero-background absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover hero-video">

            <source src="https://customer-assets.emergentagent.com/job_wolfmedia/artifacts/0n4k6t8k_SWP_Hero_BG.mp4" type="video/mp4" />
          </video>
          
          {/* Fade overlay for smooth loop transition */}
          <div className="video-fade-overlay absolute inset-0 pointer-events-none"></div>
          
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80"></div>
          
          {/* Additional vignette effect */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/60"></div>
        </div>
        
        <div className="hero-content relative z-10 container mx-auto px-4 py-32 text-center">
          <div className="inline-block mb-6 px-4 py-2 rounded-full border border-electric-blue/30 bg-electric-blue/10">
            <span className="uppercase !font-mono !text-sm !italic !text-[#FFFFFF]">We Don’t Follow. We Hunt.</span>
          </div>
          
          <h1 className="hero-title text-6xl md:text-8xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: 'Cinzel, serif' }}>
            SHADOW WOLVES
            <br />
            <span className="text-electric-blue">PRODUCTIONS</span>
          </h1>
          
          <p className="hero-subtitle md:text-2xl max-w-3xl !font-bold !text-xl !italic mb-12 mx-auto text-gray-300">A new breed of storytellers driven by instinct, not trends — from primal horror to deeply human stories, we create what others won’t.

          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/films"
              className="cta-button bg-electric-blue hover:bg-electric-blue/90 text-white px-8 py-4 rounded-full font-mono text-sm uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2">

              <Play size={18} />
              View Our Films
            </Link>
            <Link
              to="/den"
              className="cta-button-outline border-2 border-white hover:bg-white hover:text-black text-white px-8 py-4 rounded-full font-mono text-sm uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2">

              🐺 Enter The Den
              <ArrowRight size={18} />
            </Link>
          </div>
          
          {/* Scroll Indicator */}
          <div className="scroll-indicator mt-16 flex flex-col items-center">
            <span className="text-white/60 text-sm uppercase tracking-widest font-mono mb-2">Scroll for More</span>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white/60">

              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-12 bg-smoke-gray">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="stat-item text-center">
              <Film className="w-10 h-10 mx-auto mb-2 text-electric-blue" />
              <div className="text-3xl font-bold text-white mb-1">15+</div>
              <div className="text-gray-400 text-xs uppercase tracking-wide">Films Produced</div>
            </div>
            <div className="stat-item text-center">
              <Award className="w-10 h-10 mx-auto mb-2 text-electric-blue" />
              <div className="text-3xl font-bold text-white mb-1">25+</div>
              <div className="text-gray-400 text-xs uppercase tracking-wide">Awards Won</div>
            </div>
            <div className="stat-item text-center">
              <Users className="w-10 h-10 mx-auto mb-2 text-white" />
              <div className="text-3xl font-bold text-white mb-1">5+</div>
              <div className="text-gray-400 text-xs uppercase tracking-wide">Films In Production</div>
            </div>
            <div className="stat-item text-center">
              <Star className="w-10 h-10 mx-auto mb-2 text-electric-blue" />
              <div className="text-3xl font-bold text-white mb-1">20+</div>
              <div className="text-gray-400 text-xs uppercase tracking-wide">Years Experience</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Films Section */}
      <section className="featured-films-section py-24 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">Featured Films</h2>
            <p className="text-xl text-gray-400">Our latest cinematic masterpieces</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {featuredFilms.map((film) =>
            <Link
              key={film.id}
              to={`/films/${film.id}`}
              className="film-card-flip group relative overflow-hidden rounded-lg aspect-[2/3] transition-all duration-300">

                {/* Front - Poster */}
                <div
                className="film-poster-front absolute inset-0 transition-opacity duration-300 group-hover:opacity-0"
                style={{ backgroundColor: film.posterColor }}>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-white font-bold text-sm line-clamp-2">{film.title}</h3>
                  </div>
                </div>
                
                {/* Back - Info on Hover */}
                <div className="film-poster-back absolute inset-0 bg-electric-blue/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-center">
                  <h3 className="text-white font-bold text-base mb-2">{film.title}</h3>
                  <p className="text-white/90 text-xs mb-3 line-clamp-3 italic">{film.tagline}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {film.genre.slice(0, 2).map((g, idx) =>
                  <span
                    key={idx}
                    className="px-2 py-0.5 text-xs rounded-full bg-white/20 text-white uppercase font-mono">

                        {g}
                      </span>
                  )}
                  </div>
                  <div className="text-white text-xs mt-auto">{film.year}</div>
                  <div className="flex items-center justify-center mt-2">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                </div>
              </Link>
            )}
          </div>
          
          <div className="text-center mt-12">
            <Link
              to="/films"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-electric-blue hover:bg-electric-blue/90 text-white transition-all font-mono text-sm uppercase tracking-widest">

              View All Films
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section py-24 bg-smoke-gray">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">Our Services</h2>
            <p className="text-xl text-gray-400">End-to-end production excellence</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service) =>
            <div
              key={service.id}
              className="service-card bg-black p-8 rounded-lg border border-gray-800 hover:border-gray-600 transition-all aspect-square flex flex-col">

                <div
                className="service-icon w-16 h-16 rounded-full mb-6 flex items-center justify-center"
                style={{ backgroundColor: `${service.color}20`, border: `2px solid ${service.color}` }}>

                  <span className="text-2xl font-bold" style={{ color: service.color }}>{service.id}</span>
                </div>
                
                <h3 className="text-3xl font-bold text-white mb-2">{service.name}</h3>
                <p className="text-gray-400 italic mb-4">{service.tagline}</p>
                <p className="text-gray-300 mb-6 leading-relaxed flex-grow">{service.description}</p>
                
                <Link
                to="/services"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-electric-blue text-electric-blue hover:bg-electric-blue hover:text-white transition-all font-mono text-xs uppercase tracking-widest mt-auto">

                  Learn More
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Join The Pack Newsletter Section */}
      <section className="join-pack-newsletter py-20 bg-gradient-to-br from-navy-dark via-black to-navy-dark relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-electric-blue rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-electric-blue rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="md:text-5xl !font-bold !text-4xl mb-4 text-white">Join the Pack

          </h2>
          <p className="max-w-2xl !text-lg mb-8 mx-auto text-gray-300">Inside access to casting calls, industry updates, and the tools, apps, and templates we actually use.

          </p>
          
          <div className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-full bg-smoke-gray border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-electric-blue transition-colors" />

              <button
                className="bg-electric-blue hover:bg-electric-blue/90 text-white px-8 py-4 rounded-full font-mono text-sm uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2">

                📬 Subscribe
              </button>
            </div>
            <p className="text-gray-500 text-xs mt-4">
              No spam. Unsubscribe anytime. We respect your privacy.
            </p>
          </div>
        </div>
      </section>
    </div>);

};

export default Home;