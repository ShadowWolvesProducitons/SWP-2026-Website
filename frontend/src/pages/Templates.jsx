import React, { useEffect, useState } from 'react';
import { templates } from '../mock';
import { Download, FileText, Filter } from 'lucide-react';

const Templates = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredTemplates, setFilteredTemplates] = useState(templates);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredTemplates(templates);
    } else {
      setFilteredTemplates(templates.filter(template => template.category === selectedCategory));
    }
  }, [selectedCategory]);

  const allCategories = ['All', ...new Set(templates.map(t => t.category))];

  return (
    <div className="templates-page pt-20">
      {/* Page Header */}
      <section className="page-header py-24 bg-gradient-to-br from-black via-smoke-gray to-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-crimson-red rounded-full filter blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="text-gold-accent" size={48} />
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">Templates</h1>
          <p className="text-xl text-gray-400 max-w-2xl">
            Professional production templates to streamline your workflow and save time
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="filter-section py-8 bg-smoke-gray border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Filter size={20} className="text-gray-400" />
            <span className="text-gray-400 font-mono text-sm uppercase tracking-widest">Filter by Category:</span>
            <div className="flex gap-2 flex-wrap">
              {allCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-widest transition-all ${
                    selectedCategory === category
                      ? 'bg-gold-accent text-black'
                      : 'bg-black text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Templates Grid */}
      <section className="templates-grid-section py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="template-card bg-smoke-gray p-6 rounded-lg border border-gray-800 hover:border-gray-600 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gold-accent/20 rounded-lg flex items-center justify-center flex-shrink-0 border-2 border-gold-accent">
                    <FileText size={32} className="text-gold-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 text-xs rounded-full bg-black text-gold-accent border border-gold-accent/30 uppercase tracking-wide font-mono">
                        {template.category}
                      </span>
                      <span className="text-gray-500 text-sm">{template.format}</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">{template.description}</p>
                    <button
                      className="bg-crimson-red hover:bg-crimson-red/90 text-white px-6 py-2 rounded-full font-mono text-xs uppercase tracking-widest transition-all inline-flex items-center gap-2"
                    >
                      <Download size={16} />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-24 bg-smoke-gray">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Need a Custom Template?
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            We can create custom templates tailored to your specific production needs.
          </p>
          <a
            href="/contact"
            className="cta-button bg-crimson-red hover:bg-crimson-red/90 text-white px-10 py-5 rounded-full font-mono text-sm uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2"
          >
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
};

export default Templates;