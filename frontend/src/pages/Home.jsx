import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { services, testimonials } from '../mock';
import { ArrowRight, Star, Award, Users, Film, Play } from 'lucide-react';
import FilmModal from '../components/FilmModal';

const Home = () => {
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [featuredFilms, setFeaturedFilms] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchFeaturedFilms();
  }, []);

  const fetchFeaturedFilms = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/films`);
      if (response.ok) {
        const data = await response.json();
        // Filter featured films and take first 3
        const featured = data.filter(film => film.featured).slice(0, 3);
        setFeaturedFilms(featured);
      }
    } catch (err) {
      console.error('Failed to load films:', err);
    }
  };

  const handleFilmClick = (film) => {
    // Transform API data to match modal expectations
    const modalFilm = {
      ...film,
      posterColor: film.poster_color,
      imdbUrl: film.imdb_url,
      watchUrl: film.watch_url,
      watchUrlTitle: film.watch_url_title,
      posterUrl: film.poster_url
    };
    setSelectedFilm(modalFilm);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedFilm(null), 300);
  };

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
          
          <p className="hero-subtitle md:text-2xl max-w-3xl !font-bold !text-xl !italic mb-12 mx-auto text-gray-300">A new breed of storytellers driven by instinct, not trends — from primal horror to deeply human stories, we create where others fear to go.

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
              <div className="uppercase !text-xs text-gray-400">Festival Awards</div>
            </div>
            <div className="stat-item text-center">
              <Users className="w-10 h-10 mx-auto mb-2 text-white" />
              <div className="text-3xl font-bold text-white mb-1">5+</div>
              <div className="uppercase !text-xs text-gray-400">Projects In Development</div>
            </div>
            <div className="stat-item text-center">
              <Star className="w-10 h-10 mx-auto mb-2 text-electric-blue" />
              <div className="text-3xl font-bold text-white mb-1">20+</div>
              <div className="uppercase !text-xs text-gray-400">Years Combined Experience</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Films Section */}
      <section className="featured-films-section py-24 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">Featured Films</h2>
            <p className="!text-xl text-gray-400">A selection from our past work and current slate.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {featuredFilms.map((film) => (
              <button
                key={film.id}
                onClick={() => handleFilmClick(film)}
                className="film-card group relative overflow-hidden rounded-lg aspect-[2/3] transition-all duration-300 cursor-pointer"
              >
                {/* Poster / Placeholder */}
                <div
                  className="absolute inset-0 transition-all duration-300"
                  style={{ backgroundColor: film.poster_color || '#1a1a2e' }}
                >
                  {film.poster_url ? (
                    <img
                      src={`${process.env.REACT_APP_BACKEND_URL}${film.poster_url}`}
                      alt={film.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-gray-500 text-xs font-mono uppercase tracking-widest text-center px-2">
                        Poster<br />Coming Soon
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Default State - Title at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-0">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-white font-bold text-sm line-clamp-2">{film.title}</h3>
                  </div>
                </div>

                {/* Hover State - Full info */}
                <div className="absolute inset-0 bg-black/95 opacity-0 group-hover:opacity-100 transition-all duration-300 p-4 flex flex-col">
                  {/* Title */}
                  <h3 className="text-white font-bold text-base mb-2 line-clamp-2">{film.title}</h3>
                  
                  {/* Tagline */}
                  {film.tagline && (
                    <p className="text-gray-300 text-xs mb-3 line-clamp-2 italic">"{film.tagline}"</p>
                  )}
                  
                  {/* Genres */}
                  {film.genres && film.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {film.genres.slice(0, 3).map((genre, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-xs rounded-full bg-electric-blue/20 text-electric-blue border border-electric-blue/30"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Status */}
                  <div className="mt-auto">
                    <span className="text-gray-400 text-xs font-mono uppercase tracking-wider">
                      {film.status}
                    </span>
                  </div>
                  
                  {/* More Button */}
                  <div className="mt-3 flex items-center justify-center">
                    <span className="inline-flex items-center gap-1 px-4 py-2 bg-electric-blue text-white text-xs font-mono uppercase tracking-widest rounded-full group-hover:animate-pulse">
                      More
                      <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </button>
            ))}
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
            <h2 className="md:text-6xl !font-bold !text-5xl mb-4 text-white">What We Do</h2>
            <p className="!text-xl text-gray-400">We develop, produce, and support screen stories from first idea to final delivery — with clarity, intention, and zero BS.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Development Card */}
            <div className="service-card bg-black p-8 rounded-lg border border-gray-800 hover:border-electric-blue transition-all flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-electric-blue/20 rounded-full flex items-center justify-center border-2 border-electric-blue">
                  <span className="text-xl font-bold text-electric-blue">1</span>
                </div>
                <h3 className="text-2xl font-bold text-white uppercase tracking-wide">Development</h3>
              </div>
              
              <p className="text-gray-300 text-lg mb-4 leading-relaxed">
                We work at the foundation — concept, script, and structure.
              </p>
              <p className="text-gray-400 mb-6 leading-relaxed">
                From early ideas to production-ready drafts, we help shape stories that hold up under pressure and resonate on screen.
              </p>
              
              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-3">This includes:</p>
                <ul className="space-y-2">
                  <li className="text-gray-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-electric-blue"></span>
                    Script development
                  </li>
                  <li className="text-gray-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-electric-blue"></span>
                    Story consultation
                  </li>
                  <li className="text-gray-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-electric-blue"></span>
                    Creative direction
                  </li>
                </ul>
              </div>
              
              <Link 
                to="/services"
                className="mt-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-electric-blue hover:bg-electric-blue/90 text-white transition-all font-mono text-xs uppercase tracking-widest"
              >
                Learn More
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Pre-Production Card */}
            <div className="service-card bg-black p-8 rounded-lg border border-gray-800 hover:border-electric-blue transition-all flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-electric-blue/20 rounded-full flex items-center justify-center border-2 border-electric-blue">
                  <span className="text-xl font-bold text-electric-blue">2</span>
                </div>
                <h3 className="text-2xl font-bold text-white uppercase tracking-wide">Pre-Production</h3>
              </div>
              
              <p className="text-gray-300 text-lg mb-4 leading-relaxed">
                Strong films are built before the camera rolls.
              </p>
              <p className="text-gray-400 mb-6 leading-relaxed">
                We handle planning, breakdowns, casting support, and logistics so productions move with purpose — not panic.
              </p>
              
              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-3">Our focus is:</p>
                <ul className="space-y-2">
                  <li className="text-gray-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-electric-blue"></span>
                    Clarity
                  </li>
                  <li className="text-gray-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-electric-blue"></span>
                    Efficiency
                  </li>
                  <li className="text-gray-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-electric-blue"></span>
                    Readiness
                  </li>
                </ul>
              </div>
              
              <Link 
                to="/services"
                className="mt-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-electric-blue hover:bg-electric-blue/90 text-white transition-all font-mono text-xs uppercase tracking-widest"
              >
                Learn More
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Post-Production Card */}
            <div className="service-card bg-black p-8 rounded-lg border border-gray-800 hover:border-electric-blue transition-all flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-electric-blue/20 rounded-full flex items-center justify-center border-2 border-electric-blue">
                  <span className="text-xl font-bold text-electric-blue">3</span>
                </div>
                <h3 className="text-2xl font-bold text-white uppercase tracking-wide">Post-Production</h3>
              </div>
              
              <p className="text-gray-300 text-lg mb-4 leading-relaxed">
                Editing, sound, and mixing are where the story finds its final shape.
              </p>
              <p className="text-gray-400 mb-6 leading-relaxed">
                We collaborate closely through post to ensure the finished film delivers on its promise — emotionally and technically.
              </p>
              
              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-3">From rough cut to final export, we prioritise:</p>
                <ul className="space-y-2">
                  <li className="text-gray-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-electric-blue"></span>
                    Narrative cohesion
                  </li>
                  <li className="text-gray-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-electric-blue"></span>
                    Technical polish
                  </li>
                  <li className="text-gray-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-electric-blue"></span>
                    Emotional impact
                  </li>
                </ul>
              </div>
              
              <Link 
                to="/services"
                className="mt-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-electric-blue hover:bg-electric-blue/90 text-white transition-all font-mono text-xs uppercase tracking-widest"
              >
                Learn More
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Additional Support Pills */}
          <div className="additional-support text-center">
            <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wide">Additional Support</h3>
            <div className="flex flex-wrap gap-3 justify-center">
              <span className="px-6 py-3 rounded-full bg-black border border-gray-700 text-gray-300 hover:border-electric-blue hover:text-white transition-all text-sm">
                Script Coverage
              </span>
              <span className="px-6 py-3 rounded-full bg-black border border-gray-700 text-gray-300 hover:border-electric-blue hover:text-white transition-all text-sm">
                Development Notes
              </span>
              <span className="px-6 py-3 rounded-full bg-black border border-gray-700 text-gray-300 hover:border-electric-blue hover:text-white transition-all text-sm">
                Pitch Materials
              </span>
              <span className="px-6 py-3 rounded-full bg-black border border-gray-700 text-gray-300 hover:border-electric-blue hover:text-white transition-all text-sm">
                Creative Consulting
              </span>
            </div>
          </div>

          {/* View All Services Button */}
          <div className="text-center mt-12">
            <Link 
              to="/services" 
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-electric-blue hover:bg-electric-blue/90 text-white transition-all font-mono text-sm uppercase tracking-widest"
            >
              View All Services
              <ArrowRight size={18} />
            </Link>
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
          <h2 className="md:text-5xl !font-bold !text-4xl mb-4 text-white">🐺 JOIN THE PACK

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

      {/* Film Modal */}
      <FilmModal
        film={selectedFilm}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>);

};

export default Home;