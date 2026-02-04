import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { services, testimonials } from '../mock';
import { ArrowRight, Star, Award, Users, Film, Play, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import FilmModal from '../components/FilmModal';
import ServicesModal from '../components/ServicesModal';
import SupportModal from '../components/SupportModal';

const Home = () => {
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [featuredFilms, setFeaturedFilms] = useState([]);
  const [servicesModalOpen, setServicesModalOpen] = useState(false);
  const [activeServiceKey, setActiveServiceKey] = useState(null);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [activeSupportKey, setActiveSupportKey] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

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

  const openServicesModal = (key) => {
    setActiveServiceKey(key);
    setServicesModalOpen(true);
  };

  const closeServicesModal = () => {
    setServicesModalOpen(false);
    setTimeout(() => setActiveServiceKey(null), 200);
  };

  const openSupportModal = (key) => {
    setActiveSupportKey(key);
    setSupportModalOpen(true);
  };

  const closeSupportModal = () => {
    setSupportModalOpen(false);
    setTimeout(() => setActiveSupportKey(null), 200);
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) {
      toast.error('Please enter your email');
      return;
    }

    setSubscribing(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: newsletterEmail,
          source: 'homepage'
        })
      });

      if (response.ok) {
        toast.success('Welcome to the pack! Check your email.');
        setNewsletterEmail('');
        // Mark as subscribed in localStorage for popup logic
        localStorage.setItem('swp_subscribed', 'true');
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to subscribe');
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubscribing(false);
    }
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
              to="/blog"
              className="cta-button-outline border-2 border-white hover:bg-white hover:text-black text-white px-8 py-4 rounded-full font-mono text-sm uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2">

              🐺 Enter The Den
              <ArrowRight size={18} />
            </Link>
          </div>
          
          <div className="flex justify-center mt-4">
            <Link
              to="/services"
              className="cta-button-outline border-2 border-gray-600 hover:border-white hover:bg-white hover:text-black text-gray-300 hover:text-black px-8 py-4 rounded-full font-mono text-sm uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2">
              ⚔️ Enter The Armory
              <ArrowRight size={18} />
            </Link>
          </div>
          
          {/* Scroll Indicator */}
          <div className="scroll-indicator mt-8 flex flex-col items-center">
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
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-4" style={{ fontFamily: 'Cinzel, serif' }}>Featured Films</h2>
            <p className="!text-xl text-gray-400">A selection from our past work and current slate.</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {featuredFilms.map((film) => (
              <button
                key={film.id}
                onClick={() => handleFilmClick(film)}
                className="film-card group relative overflow-hidden rounded-lg aspect-[2/3] cursor-pointer border-2 border-transparent hover:border-white/30 transition-all duration-300 w-[calc(50%-8px)] md:w-[calc(25%-12px)] lg:w-[calc(16.666%-14px)] max-w-[200px]"
              >
                {/* Poster / Placeholder */}
                <div
                  className="absolute inset-0"
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
                      <span className="text-gray-600 text-xs font-mono uppercase tracking-widest text-center px-2">
                        Poster<br />Coming Soon
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Default State - Simple gradient with title */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-0">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-white font-bold text-sm line-clamp-2">{film.title}</h3>
                  </div>
                </div>

                {/* Hover State - Cinematic Lower-Third */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                  {/* Status Pill - Top Left */}
                  <div>
                    <span className="inline-block px-2 py-1 text-[10px] font-mono uppercase tracking-wider bg-white/10 text-white/80 rounded">
                      {film.status}
                    </span>
                  </div>
                  
                  {/* Lower Third Content */}
                  <div>
                    <h3 className="text-white font-bold text-sm mb-1">{film.title}</h3>
                    {film.tagline && (
                      <p className="text-gray-300 text-xs line-clamp-1 mb-2">{film.tagline}</p>
                    )}
                    <div className="flex items-end justify-between">
                      {/* Genre Tags */}
                      <div className="flex flex-wrap gap-1">
                        {film.genres?.slice(0, 3).map((genre, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-[10px] rounded bg-white/10 text-white/70"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                      {/* View Cue */}
                      <span className="text-white/60 text-xs shrink-0 ml-2">
                        View →
                      </span>
                    </div>
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
            <h2 className="md:text-6xl !font-bold !text-5xl mb-4 text-white" style={{ fontFamily: 'Cinzel, serif' }}>What We Do</h2>
            <p className="!text-xl text-gray-400">We develop, produce, and support screen stories from first idea to final delivery.</p>
          </div>
          
          {/* Minimal Service Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { key: 'development', num: '01', title: 'Development' },
              { key: 'preproduction', num: '02', title: 'Pre-Production' },
              { key: 'postproduction', num: '03', title: 'Post-Production' }
            ].map((service) => (
              <button
                key={service.key}
                onClick={() => openServicesModal(service.key)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openServicesModal(service.key)}
                className="service-card-minimal group relative bg-black p-8 md:p-10 rounded-xl border border-gray-800 hover:border-electric-blue/50 transition-all duration-300 text-left focus:outline-none focus:ring-2 focus:ring-electric-blue focus:ring-offset-2 focus:ring-offset-black hover:-translate-y-0.5"
                aria-label={`Learn more about ${service.title}`}
              >
                {/* Large Number */}
                <span 
                  className="absolute top-6 right-6 text-6xl md:text-7xl font-bold text-white/[0.06] group-hover:text-white/[0.12] transition-opacity duration-300 select-none"
                  style={{ fontFamily: 'Cinzel, serif' }}
                >
                  {service.num}
                </span>
                
                {/* Content */}
                <div className="relative z-10">
                  <h3 
                    className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-electric-blue transition-colors duration-300"
                    style={{ fontFamily: 'Cinzel, serif' }}
                  >
                    {service.title}
                  </h3>
                  
                  <span className="text-gray-500 text-sm group-hover:text-gray-400 transition-colors inline-flex items-center gap-2">
                    Learn more
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>

                {/* Subtle glow on hover */}
                <div className="absolute inset-0 rounded-xl bg-electric-blue/0 group-hover:bg-electric-blue/[0.02] transition-colors duration-300 pointer-events-none" />
              </button>
            ))}
          </div>

          {/* Additional Support Chips */}
          <div className="additional-support text-center">
            <h3 className="text-sm font-mono text-gray-500 mb-4 uppercase tracking-widest">Additional Support</h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {[
                { key: 'script-coverage', label: 'Script Coverage' },
                { key: 'development-notes', label: 'Development Notes' },
                { key: 'pitch-materials', label: 'Pitch Materials' },
                { key: 'creative-consulting', label: 'Creative Consulting' }
              ].map((chip) => (
                <button
                  key={chip.key}
                  onClick={() => openSupportModal(chip.key)}
                  className="px-5 py-2.5 rounded-full bg-black border border-gray-700 text-gray-400 hover:border-electric-blue/50 hover:text-white transition-all text-sm focus:outline-none focus:ring-2 focus:ring-electric-blue"
                >
                  {chip.label}
                </button>
              ))}
            </div>
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
          <h2 className="md:text-5xl !font-bold !text-4xl mb-4 text-white" style={{ fontFamily: 'Cinzel, serif' }}>🐺 JOIN THE PACK</h2>
          <p className="max-w-2xl !text-lg mb-8 mx-auto text-gray-300">Inside access to casting calls, industry updates, and the tools, apps, and templates we actually use.</p>
          
          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-full bg-smoke-gray border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-electric-blue transition-colors"
                disabled={subscribing}
              />
              <button
                type="submit"
                disabled={subscribing}
                className="bg-electric-blue hover:bg-electric-blue/90 disabled:bg-electric-blue/50 text-white px-8 py-4 rounded-full font-mono text-sm uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2"
              >
                {subscribing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>📬 Subscribe</>
                )}
              </button>
            </div>
            <p className="text-gray-500 text-xs mt-4">
              No spam. Unsubscribe anytime. We respect your privacy.
            </p>
          </form>
        </div>
      </section>

      {/* Film Modal */}
      <FilmModal
        film={selectedFilm}
        isOpen={isModalOpen}
        onClose={closeModal}
      />

      {/* Services Modal */}
      <ServicesModal
        open={servicesModalOpen}
        onClose={closeServicesModal}
        serviceKey={activeServiceKey}
      />

      {/* Support Modal */}
      <SupportModal
        open={supportModalOpen}
        onClose={closeSupportModal}
        supportKey={activeSupportKey}
      />
    </div>);

};

export default Home;