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

      {/* Hero Section - Reduced padding */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            {/* Manifesto lines - smaller, separate lines */}
            <div className="space-y-2 mb-8">
              <p className="text-lg md:text-xl text-gray-300 tracking-wide">
                We don't chase <span className="text-electric-blue">trends.</span>
              </p>
              <p className="text-lg md:text-xl text-gray-300 tracking-wide">
                We don't ask <span className="text-electric-blue">permission.</span>
              </p>
              <p className="text-lg md:text-xl text-gray-300 tracking-wide">
                We don't make noise for the <span className="text-electric-blue">sake of it.</span>
              </p>
            </div>
            <p className="text-xl md:text-2xl text-gray-400 leading-relaxed max-w-3xl">
              Shadow Wolves Productions exists to create bold, genre-driven stories with teeth — stories that entertain first, but leave a mark long after.
            </p>
          </div>
        </div>
      </section>

      {/* What We Believe - Reduced padding */}
      <section className="py-12 bg-smoke-gray">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h2 
              className="text-2xl md:text-3xl font-bold text-white mb-6"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              What We Believe
            </h2>
            
            <ul className="space-y-3 mb-8">
              {[
                "Cinema should provoke, unsettle, and challenge the audience without talking down to them.",
                "Genre deserves respect, not shortcuts.",
                "Style means nothing without substance.",
                "The most interesting stories live in the untamed wild, not the safe zone."
              ].map((belief, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-3 text-gray-300"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-electric-blue mt-2 flex-shrink-0"></span>
                  <span>{belief}</span>
                </li>
              ))}
            </ul>

            {/* Standout Quote */}
            <div className="border-l-2 border-electric-blue pl-5 py-1">
              <p 
                className="text-xl md:text-2xl text-white font-medium italic"
                style={{ fontFamily: 'Cinzel, serif' }}
              >
                "If it doesn't scare us a little, it's probably not worth making."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How We Work - New Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h2 
              className="text-2xl md:text-3xl font-bold text-white mb-6"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              How We Work
            </h2>
            
            <ul className="space-y-3">
              {[
                "Development-led, not trend-led.",
                "Lean teams, focused collaboration.",
                "Clear creative intent from concept to delivery."
              ].map((point, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-3 text-gray-300"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-electric-blue mt-2 flex-shrink-0"></span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* What We're Building - New Section */}
      <section className="py-12 bg-smoke-gray">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h2 
              className="text-2xl md:text-3xl font-bold text-white mb-6"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              What We're Building
            </h2>
            
            <div className="space-y-4 text-gray-300">
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

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/work-with-us"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-electric-blue hover:bg-electric-blue/90 text-white rounded-full font-mono text-sm uppercase tracking-widest transition-all"
                data-testid="about-cta-work"
              >
                Work With Us
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-gray-700 hover:border-gray-500 text-white rounded-full font-mono text-sm uppercase tracking-widest transition-all"
                data-testid="about-cta-contact"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
