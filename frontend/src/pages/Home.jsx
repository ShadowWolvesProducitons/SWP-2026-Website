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
      <section className="hero-section relative flex items-center justify-center overflow-hidden">
        {/* Cinematic Background Video/Animation */}
        <div className="hero-background absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
          {/* Animated fog and moonlight effect */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-900/20 rounded-full filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-800/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          {/* Wolf silhouettes overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJmb2ciIHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0icmdiYSgwLDAsMCwwLjEpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2ZvZykiLz48L3N2Zz4=')] opacity-20"></div>
          {/* Moving fog effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
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
              to="/contact"
              className="cta-button-outline border-2 border-white hover:bg-white hover:text-black text-white px-8 py-4 rounded-full font-mono text-sm uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2">

              Start a Project
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
                className="film-poster aspect-[2/3] relative"
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
              className="service-card bg-black p-8 rounded-lg border border-gray-800 hover:border-gray-600 transition-all">

                <div
                className="service-icon w-16 h-16 rounded-full mb-6 flex items-center justify-center"
                style={{ backgroundColor: `${service.color}20`, border: `2px solid ${service.color}` }}>

                  <span className="text-2xl font-bold" style={{ color: service.color }}>{service.id}</span>
                </div>
                
                <h3 className="text-3xl font-bold text-white mb-2">{service.name}</h3>
                <p className="text-gray-400 italic mb-4">{service.tagline}</p>
                <p className="text-gray-300 mb-6 leading-relaxed">{service.description}</p>
                
                <ul className="space-y-2">
                  {service.features.slice(0, 4).map((feature, idx) =>
                <li key={idx} className="text-gray-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: service.color }}></span>
                      {feature}
                    </li>
                )}
                </ul>
              </div>
            )}
          </div>
          
          <div className="text-center mt-12">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-white hover:text-electric-blue transition-colors text-lg font-mono uppercase tracking-widest">

              Learn More
              <ArrowRight size={20} />
            </Link>
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