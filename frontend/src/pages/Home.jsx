import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowRight, Award, Users, Film, Play, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ServicesModal from '../components/ServicesModal';
import SupportModal from '../components/SupportModal';

const Home = () => {
  const [servicesModalOpen, setServicesModalOpen] = useState(false);
  const [activeServiceKey, setActiveServiceKey] = useState(null);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [activeSupportKey, setActiveSupportKey] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
      <Helmet>
        <title>About | Shadow Wolves Productions</title>
        <meta name="description" content="Shadow Wolves Productions exists to create bold, genre-driven stories with teeth — stories that entertain first, but leave a mark long after the screen goes black." />
      </Helmet>

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
            <span className="uppercase !font-mono !text-sm !italic !text-[#FFFFFF]">We Don't Follow. We Hunt.</span>
          </div>
          
          <h1 className="hero-title text-6xl md:text-8xl font-bold text-white mb-12 leading-tight font-cinzel">
            SHADOW WOLVES
            <br />
            <span className="text-electric-blue">PRODUCTIONS</span>
          </h1>
          
          {/* CTA Hierarchy */}
          <div className="flex flex-col items-center gap-4">
            <Link
              to="/films"
              className="bg-electric-blue hover:bg-electric-blue/90 text-white px-8 py-3.5 rounded-full font-mono text-sm uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-electric-blue/30"
              data-testid="hero-cta-films"
            >
              <Play size={20} />
              View Our Films
            </Link>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Link
                to="/work-with-us"
                className="border-2 border-white/80 hover:bg-white hover:text-black text-white px-6 py-3 rounded-full font-mono text-sm uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2"
                data-testid="hero-cta-work"
              >
                Work With Us
              </Link>
              <Link
                to="/armory"
                className="border border-gray-600 hover:border-white/60 text-gray-400 hover:text-white px-6 py-3 rounded-full font-mono text-xs uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2"
                data-testid="hero-cta-armory"
              >
                Enter The Armory
              </Link>
            </div>
          </div>
          
          {/* Scroll Indicator */}
          <div className="scroll-indicator mt-6 flex flex-col items-center">
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

      {/* Manifesto Section */}
      <section className="py-16 md:py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Manifesto lines */}
            <div className="space-y-3 mb-8">
              <p className="text-xl md:text-2xl text-gray-300 tracking-wide font-bold font-cinzel">
                We don't chase <span className="text-electric-blue">trends</span>
              </p>
              <p className="text-xl md:text-2xl text-gray-300 tracking-wide font-bold font-cinzel">
                We don't ask <span className="text-electric-blue">permission</span>
              </p>
              <p className="text-xl md:text-2xl text-gray-300 tracking-wide font-bold font-cinzel">
                We don't make noise for the <span className="text-electric-blue">sake of it</span>
              </p>
            </div>
            <p className="text-xl md:text-2xl text-gray-400 leading-relaxed mx-auto whitespace-nowrap">
              Shadow Wolves Productions exists to create bold, genre-driven stories with teeth.
            </p>
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
              <Film className="w-10 h-10 mx-auto mb-2 text-electric-blue" />
              <div className="text-3xl font-bold text-white mb-1">20+</div>
              <div className="uppercase !text-xs text-gray-400">Years Combined Experience</div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="services-section py-12 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="md:text-6xl !font-bold !text-5xl mb-4 text-white font-cinzel">What We Do</h2>
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
                className="service-card-minimal group relative bg-smoke-gray p-8 md:p-10 rounded-xl border border-gray-800 hover:border-electric-blue/50 transition-all duration-300 text-left focus:outline-none focus:ring-2 focus:ring-electric-blue focus:ring-offset-2 focus:ring-offset-black hover:-translate-y-0.5"
                aria-label={`Learn more about ${service.title}`}
              >
                <span 
                  className="absolute top-6 right-6 text-6xl md:text-7xl font-bold text-white/[0.06] group-hover:text-white/[0.12] transition-opacity duration-300 select-none font-cinzel"
                >
                  {service.num}
                </span>
                
                <div className="relative z-10">
                  <h3 
                    className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-electric-blue transition-colors duration-300 font-cinzel"
                  >
                    {service.title}
                  </h3>
                  
                  <span className="text-gray-500 text-sm group-hover:text-gray-400 transition-colors inline-flex items-center gap-2">
                    Learn more
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>

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
                  className="px-5 py-2.5 rounded-full bg-smoke-gray border border-gray-700 text-gray-400 hover:border-electric-blue/50 hover:text-white transition-all text-sm focus:outline-none focus:ring-2 focus:ring-electric-blue"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quote Separator */}
      <section className="py-16 bg-smoke-gray">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="border-l-4 border-electric-blue pl-6 py-2">
              <p className="text-xl md:text-2xl text-white font-medium italic font-cinzel">
                "If it doesn't scare us a little, it's probably not worth making."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We're Building Section */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 font-cinzel text-center">
              What We're Building
            </h2>
            
            <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
              <p>
                We're developing a slate of genre-driven projects across film, television, and emerging formats. Each project is selected for its creative ambition and commercial viability.
              </p>
              <p>
                Beyond production, we're building a studio ecosystem — films, tools, and resources designed to support independent creators who share our approach.
              </p>
              <p>
                This is long-term development, not a quick flip. We build what we believe in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Work With Us / Invest With Us */}
      <section className="py-16 bg-smoke-gray">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/work-with-us"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-electric-blue hover:bg-electric-blue/90 text-white rounded-full font-mono text-sm uppercase tracking-widest transition-all"
                data-testid="about-cta-work"
              >
                Work With Us
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/investors"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-gray-700 hover:border-gray-500 text-white rounded-full font-mono text-sm uppercase tracking-widest transition-all"
                data-testid="about-cta-invest"
              >
                Invest With Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Join The Pack Newsletter Section */}
      <section className="join-pack-newsletter py-12 bg-gradient-to-br from-navy-dark via-black to-navy-dark relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-electric-blue rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-electric-blue rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="md:text-5xl !font-bold !text-4xl mb-4 text-white font-cinzel">JOIN THE PACK</h2>
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
                  <>Subscribe</>
                )}
              </button>
            </div>
            <p className="text-gray-500 text-xs mt-4">
              No spam. Unsubscribe anytime. We respect your privacy.
            </p>
          </form>
        </div>
      </section>

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
    </div>
  );
};

export default Home;
