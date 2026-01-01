import React, { useEffect } from 'react';
import { apps } from '../mock';
import { Smartphone, Download, ExternalLink } from 'lucide-react';

const Apps = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="apps-page pt-20">
      {/* Page Header */}
      <section className="page-header py-24 bg-gradient-to-br from-black via-smoke-gray to-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-electric-blue rounded-full filter blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <Smartphone className="text-electric-blue" size={48} />
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">Apps & Tools</h1>
          <p className="text-xl text-gray-400 max-w-2xl">
            Professional production tools designed to streamline your filmmaking workflow
          </p>
        </div>
      </section>

      {/* Apps Grid */}
      <section className="apps-grid-section py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {apps.map((app) => (
              <div
                key={app.id}
                className="app-card bg-smoke-gray rounded-lg overflow-hidden border border-gray-800 hover:border-gray-600 transition-all hover:transform hover:-translate-y-2"
              >
                <div
                  className="app-header h-48 p-8 flex items-center justify-center"
                  style={{ backgroundColor: `${app.color}15` }}
                >
                  <Smartphone size={64} style={{ color: app.color }} />
                </div>
                <div className="app-content p-6">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-white mb-2">{app.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span className="px-3 py-1 rounded-full bg-black border border-gray-700 font-mono uppercase tracking-wide">
                        {app.platform}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-6 leading-relaxed">{app.description}</p>
                  <div className="mb-6">
                    <div className="text-sm text-gray-400 mb-3 uppercase tracking-wide">Key Features:</div>
                    <ul className="space-y-2">
                      {app.features.map((feature, idx) => (
                        <li key={idx} className="text-gray-300 text-sm flex items-center gap-2">
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: app.color }}
                          ></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    className="w-full bg-electric-blue hover:bg-electric-blue/90 text-white py-3 rounded-full font-mono text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    Download App
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="coming-soon-section py-24 bg-smoke-gray">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">More Apps Coming Soon</h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            We're constantly developing new tools to help filmmakers create better content. Stay tuned for updates!
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 text-white hover:text-electric-blue transition-colors text-lg font-mono uppercase tracking-widest"
          >
            Request a Feature
            <ExternalLink size={20} />
          </a>
        </div>
      </section>
    </div>
  );
};

export default Apps;