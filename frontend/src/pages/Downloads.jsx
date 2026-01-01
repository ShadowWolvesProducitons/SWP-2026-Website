import React, { useEffect, useState } from 'react';
import { ebooks } from '../mock';
import { Download, BookOpen, Filter } from 'lucide-react';

const Downloads = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredEbooks, setFilteredEbooks] = useState(ebooks);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredEbooks(ebooks);
    } else {
      setFilteredEbooks(ebooks.filter(ebook => ebook.category === selectedCategory));
    }
  }, [selectedCategory]);

  const allCategories = ['All', ...new Set(ebooks.map(e => e.category))];

  return (
    <div className="downloads-page pt-20">
      {/* Page Header */}
      <section className="page-header py-24 bg-gradient-to-br from-black via-smoke-gray to-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-electric-blue rounded-full filter blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="text-electric-blue" size={48} />
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">Downloads</h1>
          <p className="text-xl text-gray-400 max-w-2xl">
            Free ebooks and guides to help you master the art of filmmaking
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
                      ? 'bg-electric-blue text-white'
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

      {/* Ebooks Grid */}
      <section className="ebooks-grid-section py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEbooks.map((ebook) => (
              <div
                key={ebook.id}
                className="ebook-card bg-smoke-gray rounded-lg overflow-hidden border border-gray-800 hover:border-gray-600 transition-all hover:transform hover:-translate-y-2"
              >
                <div
                  className="ebook-cover h-64 p-8 flex items-center justify-center"
                  style={{ backgroundColor: ebook.cover }}
                >
                  <BookOpen size={80} className="text-white opacity-40" />
                </div>
                <div className="ebook-content p-6">
                  <div className="mb-4">
                    <span className="px-3 py-1 text-xs rounded-full bg-black text-electric-blue border border-electric-blue/30 uppercase tracking-wide font-mono">
                      {ebook.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{ebook.title}</h3>
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">{ebook.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                    <span>{ebook.pages} pages</span>
                    <span>{ebook.format}</span>
                  </div>
                  <button
                    className="w-full bg-electric-blue hover:bg-electric-blue/90 text-white py-3 rounded-full font-mono text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <Download size={16} />
                    Free Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section py-24 bg-smoke-gray">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Stay Updated
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Subscribe to our newsletter to get notified when we release new ebooks and resources.
          </p>
          <div className="max-w-md mx-auto">
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-full bg-black border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-electric-blue transition-colors"
              />
              <button
                className="bg-electric-blue hover:bg-electric-blue/90 text-white px-8 py-4 rounded-full font-mono text-xs uppercase tracking-widest transition-all"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Downloads;