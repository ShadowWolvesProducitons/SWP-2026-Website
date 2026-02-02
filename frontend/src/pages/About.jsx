import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="about-page pt-20 min-h-screen bg-black">
      <Helmet>
        <title>About | Shadow Wolves Productions</title>
        <meta name="description" content="Shadow Wolves Productions exists to create bold, genre-driven stories with teeth — stories that entertain first, but leave a mark long after the screen goes black." />
      </Helmet>

      {/* Hero Section */}
      <section className="hero-section relative py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 right-0 w-[800px] h-[800px] bg-electric-blue rounded-full filter blur-[200px]"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <p className="text-electric-blue font-mono text-sm uppercase tracking-widest mb-6">
              Manifesto
            </p>
            <h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              We Don't Follow.<br />
              <span className="text-electric-blue">We Hunt.</span>
            </h1>
          </div>
        </div>
      </section>

      {/* Main Manifesto */}
      <section className="manifesto-section py-20 border-t border-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-12">
              Shadow Wolves Productions exists to create bold, genre-driven stories with teeth — stories that entertain first, but leave a mark long after the screen goes black.
            </p>

            <div className="space-y-6 text-lg text-gray-400 leading-relaxed mb-16">
              <p>We don't chase trends.</p>
              <p>We don't ask permission.</p>
              <p>We don't make noise for the sake of it.</p>
            </div>

            <div className="space-y-8 text-gray-300 leading-relaxed">
              <p>
                We believe cinema should provoke, unsettle, and challenge the audience without talking down to them.
              </p>
              <p>
                We believe genre is not disposable — it's a weapon when used with intent.
              </p>
              <p>
                And we believe the most interesting stories live in the grey, not the safe middle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="what-we-do-section py-24 bg-smoke-gray/30 border-t border-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 
              className="text-3xl md:text-4xl font-bold text-white mb-8"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              What We Do
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed">
              We develop and produce original film and screen content with a strong focus on horror, thriller, and psychological genre work.
            </p>
          </div>
        </div>
      </section>

      {/* What We Believe */}
      <section className="beliefs-section py-24 border-t border-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 
              className="text-3xl md:text-4xl font-bold text-white mb-12"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              What We Believe
            </h2>
            
            <ul className="space-y-6">
              {[
                "Story comes first. Always.",
                "Genre deserves respect, not shortcuts.",
                "Audiences are smarter than most people give them credit for.",
                "Style means nothing without substance.",
                "If it doesn't scare us a little, it's probably not worth making."
              ].map((belief, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-4 text-lg text-gray-300"
                >
                  <span className="text-electric-blue mt-1.5 text-sm">▪</span>
                  <span>{belief}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* What We Don't Do */}
      <section className="dont-do-section py-24 bg-smoke-gray/30 border-t border-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 
              className="text-3xl md:text-4xl font-bold text-white mb-12"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              What We Don't Do
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                "Content-by-committee",
                "Trend-chasing",
                "Diluted ideas",
                "Projects without a spine"
              ].map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 text-lg text-gray-500"
                >
                  <span className="text-red-500/60 text-xl">✕</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Closing Statement */}
      <section className="closing-section py-32 border-t border-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8">
              Shadow Wolves is a creator-led studio working with a trusted network of collaborators.
            </p>
            <p className="text-2xl md:text-3xl text-white font-medium leading-relaxed mb-16">
              No noise. No bullshit.<br />
              <span className="text-electric-blue">Just work that stands on its own.</span>
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/films"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-electric-blue hover:bg-electric-blue/90 text-white rounded-full font-mono text-sm uppercase tracking-widest transition-all"
              >
                View Our Work
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/work-with-us"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-gray-700 hover:border-gray-500 text-white rounded-full font-mono text-sm uppercase tracking-widest transition-all"
              >
                Work With Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
