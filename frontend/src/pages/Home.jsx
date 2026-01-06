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
        {/* Cinematic Background with Moonlight and Fog */}
        <div className="hero-background absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#050a30] to-black">
          {/* Moonlight glow effect */}
          <div className="absolute top-10 right-1/4 w-64 h-64 bg-blue-100/30 rounded-full filter blur-3xl animate-pulse"></div>
          
          {/* Animated fog layers */}
          <div className="absolute inset-0 opacity-40">
            <div className="fog-layer absolute inset-0 bg-gradient-to-b from-transparent via-gray-600/20 to-transparent animate-fog-drift"></div>
            <div className="fog-layer-2 absolute inset-0 bg-gradient-to-t from-transparent via-gray-500/15 to-transparent animate-fog-drift-reverse"></div>
          </div>
          
          {/* Wolf silhouettes - subtle in background */}
          <div className="absolute bottom-20 left-10 opacity-20">
            <svg width="120" height="80" viewBox="0 0 120 80" fill="currentColor" className="text-white">
              <path d="M20,60 Q25,45 35,50 Q40,30 50,45 Q55,40 60,50 Q70,55 75,50 Q80,60 70,65 Q60,70 50,65 Q40,70 30,65 Q20,70 20,60 Z"/>
            </svg>
          </div>
          <div className="absolute bottom-32 right-20 opacity-15">
            <svg width="100" height="70" viewBox="0 0 100 70" fill="currentColor" className="text-white">
              <path d="M15,50 Q20,35 30,40 Q35,25 42,38 Q47,33 52,40 Q60,45 65,40 Q70,50 60,55 Q50,60 42,55 Q32,60 22,55 Q15,60 15,50 Z"/>
            </svg>
          </div>
          
          {/* Forest silhouette at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent">
            <svg className="absolute bottom-0 w-full h-24 opacity-60" preserveAspectRatio="none" viewBox="0 0 1200 120" fill="currentColor">
              <path d="M0,80 L50,60 L80,80 L100,50 L130,80 L160,60 L190,80 L220,40 L250,80 L280,60 L310,80 L340,50 L370,80 L400,60 L430,80 L460,45 L490,80 L520,60 L550,80 L580,55 L610,80 L640,60 L670,80 L700,50 L730,80 L760,60 L790,80 L820,45 L850,80 L880,60 L910,80 L940,50 L970,80 L1000,60 L1030,80 L1060,55 L1090,80 L1120,60 L1150,80 L1180,65 L1200,80 L1200,120 L0,120 Z" className="text-black"/>
            </svg>
          </div>
          
          {/* Cold blue gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-blue-950/20 to-black/60"></div>
          
          {/* Subtle stars/particles */}
          <div className="absolute inset-0 opacity-30">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
                style={{
                  top: `${Math.random() * 50}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`
                }}
              ></div>
            ))}
          </div>
        </div>
        
        <div className="hero-content relative z-10 container mx-auto px-4 py-32 text-center">
          <div className="inline-block mb-6 px-4 py-2 rounded-full border border-electric-blue/30 bg-electric-blue/10">
            <span className="uppercase !font-mono !text-sm !italic !text-[#FFFFFF]">We Don’t Follow. We Hunt.</span>
          </div>
          
          <h1 className="hero-title text-6xl md:text-8xl font-bold text-white mb-6 leading-tight">
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
              to="/apps"
              className="cta-button-outline border-2 border-white hover:bg-white hover:text-black text-white px-8 py-4 rounded-full font-mono text-sm uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2">

              Enter The Den
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-16 bg-smoke-gray">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="stat-item text-center">
              <Film className="w-12 h-12 mx-auto mb-3 text-electric-blue" />
              <div className="!font-bold !text-4xl mb-2 text-white">15+</div>
              <div className="text-gray-400 text-sm uppercase tracking-wide">Films Produced</div>
            </div>
            <div className="stat-item text-center">
              <Award className="w-12 h-12 mx-auto mb-3 text-electric-blue" />
              <div className="text-4xl font-bold text-white mb-2">25+</div>
              <div className="text-gray-400 text-sm uppercase tracking-wide">Awards Won</div>
            </div>
            <div className="stat-item text-center">
              <Users className="w-12 h-12 mx-auto mb-3 text-white" />
              <div className="!font-bold !text-4xl mb-2 text-white">5+</div>
              <div className="uppercase !text-sm text-gray-400">Films In Production</div>
            </div>
            <div className="stat-item text-center">
              <Star className="w-12 h-12 mx-auto mb-3 text-electric-blue" />
              <div className="!font-bold !text-4xl mb-2 text-white">20+</div>
              <div className="text-gray-400 text-sm uppercase tracking-wide">Years Experience</div>
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredFilms.map((film) =>
            <Link
              key={film.id}
              to={`/films/${film.id}`}
              className="film-card group relative overflow-hidden rounded-lg bg-smoke-gray hover:transform hover:-translate-y-2 transition-all duration-300">

                <div
                className="film-poster aspect-square relative"
                style={{ backgroundColor: film.posterColor }}>

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-16 h-16 text-white" />
                  </div>
                </div>
                
                <div className="film-info p-6">
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-electric-blue transition-colors">{film.title}</h3>
                  <p className="text-gray-400 mb-3 italic">{film.tagline}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {film.genre.map((g, idx) =>
                  <span
                    key={idx}
                    className="genre-tag px-3 py-1 text-xs rounded-full bg-electric-blue/20 text-electric-blue border border-electric-blue/30 uppercase tracking-wide font-mono">

                        {g}
                      </span>
                  )}
                  </div>
                  <div className="text-sm text-gray-500">{film.year} • {film.duration}</div>
                </div>
              </Link>
            )}
          </div>
          
          <div className="text-center mt-12">
            <Link
              to="/films"
              className="inline-flex items-center gap-2 text-white hover:text-electric-blue transition-colors text-lg font-mono uppercase tracking-widest">

              View All Films
              <ArrowRight size={20} />
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

      {/* Join The Pack Section */}
      <section className="join-pack-section py-24 bg-gradient-to-br from-navy-dark via-black to-navy-dark relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-electric-blue rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-electric-blue rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            JOIN THE PACK
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed">
            Step into the den — get exclusive discounts, first looks, early course releases and more.
          </p>
          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto italic">
            Subscribe. Follow. Hunt with us.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#newsletter" 
              className="cta-button bg-electric-blue hover:bg-electric-blue/90 text-white px-10 py-5 rounded-full font-mono text-sm uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2"
            >
              📬 Join the Pack
            </a>
            <a 
              href="#merch" 
              className="cta-button-outline border-2 border-electric-blue text-electric-blue hover:bg-electric-blue hover:text-white px-10 py-5 rounded-full font-mono text-sm uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2"
            >
              🛒 Visit The Den
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-24 bg-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-electric-blue rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Ready to Create
            <br />
            <span className="text-electric-blue">Something Extraordinary?</span>
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Let's bring your vision to life. Get in touch with our team today.
          </p>
          <Link
            to="/contact"
            className="cta-button bg-electric-blue hover:bg-electric-blue/90 text-white px-10 py-5 rounded-full font-mono text-sm uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2">

            Get Started
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>);

};

export default Home;