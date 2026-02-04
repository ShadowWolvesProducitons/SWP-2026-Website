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
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <p className="text-electric-blue font-mono text-sm uppercase tracking-widest mb-6">
              Manifesto
            </p>
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              We don't chase trends.<br />
              We don't ask permission.<br />
              We don't make noise for the sake of it.
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-3xl">
              Shadow Wolves Productions exists to create bold, genre-driven stories with teeth — stories that entertain first, but leave a mark long after.
            </p>
          </div>
        </div>
      </section>

      {/* What We Believe */}
      <section className="py-20 bg-smoke-gray">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h2 
              className="text-3xl md:text-4xl font-bold text-white mb-10"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              What We Believe
            </h2>
            
            <ul className="space-y-5 mb-12">
              {[
                "Cinema should provoke, unsettle, and challenge the audience without talking down to them.",
                "Genre deserves respect, not shortcuts.",
                "Style means nothing without substance.",
                "The most interesting stories live in the untamed wild, not the safe zone."
              ].map((belief, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-4 text-lg text-gray-300"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-electric-blue mt-2.5 flex-shrink-0"></span>
                  <span>{belief}</span>
                </li>
              ))}
            </ul>

            {/* Standout Quote */}
            <div className="border-l-4 border-electric-blue pl-6 py-2">
              <p 
                className="text-2xl md:text-3xl text-white font-medium italic"
                style={{ fontFamily: 'Cinzel, serif' }}
              >
                "If it doesn't scare us a little, it's probably not worth making."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <div className="flex flex-col sm:flex-row gap-4">
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
