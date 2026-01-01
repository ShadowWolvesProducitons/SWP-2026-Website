import React, { useEffect } from 'react';
import { services } from '../mock';
import { Check } from 'lucide-react';

const Services = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="services-page pt-20">
      {/* Page Header */}
      <section className="page-header py-24 bg-gradient-to-br from-black via-smoke-gray to-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-electric-blue rounded-full filter blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">Our Services</h1>
          <p className="text-xl text-gray-400 max-w-2xl">
            End-to-end production services that bring your vision from concept to screen
          </p>
        </div>
      </section>

      {/* Services Detail */}
      <section className="services-detail-section py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="space-y-16">
            {services.map((service, idx) => (
              <div
                key={service.id}
                className="service-detail-card grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
              >
                {idx % 2 === 0 ? (
                  <>
                    {/* Content */}
                    <div>
                      <div
                        className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
                        style={{
                          backgroundColor: `${service.color}20`,
                          border: `2px solid ${service.color}`
                        }}
                      >
                        <span className="text-3xl font-bold" style={{ color: service.color }}>
                          {service.id}
                        </span>
                      </div>
                      <h2 className="text-5xl font-bold text-white mb-3">{service.name}</h2>
                      <p className="text-xl text-gray-400 italic mb-6">{service.tagline}</p>
                      <p className="text-gray-300 text-lg leading-relaxed mb-8">{service.description}</p>
                      <div className="space-y-3">
                        {service.features.map((feature, fidx) => (
                          <div key={fidx} className="flex items-start gap-3">
                            <Check size={20} className="text-white mt-1 flex-shrink-0" style={{ color: service.color }} />
                            <span className="text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Visual */}
                    <div
                      className="aspect-square rounded-lg"
                      style={{ backgroundColor: service.color, opacity: 0.1 }}
                    ></div>
                  </>
                ) : (
                  <>
                    {/* Visual */}
                    <div
                      className="aspect-square rounded-lg order-2 lg:order-1"
                      style={{ backgroundColor: service.color, opacity: 0.1 }}
                    ></div>
                    {/* Content */}
                    <div className="order-1 lg:order-2">
                      <div
                        className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
                        style={{
                          backgroundColor: `${service.color}20`,
                          border: `2px solid ${service.color}`
                        }}
                      >
                        <span className="text-3xl font-bold" style={{ color: service.color }}>
                          {service.id}
                        </span>
                      </div>
                      <h2 className="text-5xl font-bold text-white mb-3">{service.name}</h2>
                      <p className="text-xl text-gray-400 italic mb-6">{service.tagline}</p>
                      <p className="text-gray-300 text-lg leading-relaxed mb-8">{service.description}</p>
                      <div className="space-y-3">
                        {service.features.map((feature, fidx) => (
                          <div key={fidx} className="flex items-start gap-3">
                            <Check size={20} className="text-white mt-1 flex-shrink-0" style={{ color: service.color }} />
                            <span className="text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-24 bg-smoke-gray">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Ready to Start
            <br />
            <span className="text-electric-blue">Your Project?</span>
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Let's discuss how we can bring your creative vision to life with our comprehensive production services.
          </p>
          <a
            href="/contact"
            className="cta-button bg-electric-blue hover:bg-electric-blue/90 text-white px-10 py-5 rounded-full font-mono text-sm uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2"
          >
            Get in Touch
          </a>
        </div>
      </section>
    </div>
  );
};

export default Services;