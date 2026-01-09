import React, { useEffect, useState } from 'react';
import { Smartphone, Download, FileText, BookOpen, GraduationCap, ExternalLink, RefreshCw, Star } from 'lucide-react';
import { Helmet } from 'react-helmet';

const TheDen = () => {
  const [activeTab, setActiveTab] = useState('Apps');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/den-items?item_type=${activeTab}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (err) {
      console.error('Failed to load items:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'Apps', label: 'Apps', icon: Smartphone },
    { id: 'Templates', label: 'Templates', icon: FileText },
    { id: 'Downloads', label: 'Downloads', icon: Download },
    { id: 'Courses', label: 'Courses', icon: GraduationCap },
    { id: 'eBooks', label: 'eBooks', icon: BookOpen }
  ];

  const getIcon = () => {
    const tab = tabs.find(t => t.id === activeTab);
    return tab ? tab.icon : FileText;
  };

  const Icon = getIcon();

  return (
    <div className="the-armory-page pt-20">
      <Helmet>
        <title>The Armory | Shadow Wolves Productions</title>
        <meta name="description" content="Your creative arsenal — apps, templates, downloads, and courses to evolve your craft." />
      </Helmet>

      {/* Page Header */}
      <section className="page-header py-24 bg-gradient-to-br from-black via-smoke-gray to-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-electric-blue rounded-full filter blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6" style={{ fontFamily: 'Cinzel, serif' }}>
            The Armory
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Your creative arsenal — apps, templates, downloads, and courses to evolve your craft.
          </p>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="tabs-navigation py-8 bg-smoke-gray border-b border-gray-800 sticky top-20 z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-2 flex-wrap">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-full text-sm font-mono uppercase tracking-widest transition-all inline-flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-electric-blue text-white'
                      : 'bg-black text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-700'
                  }`}
                >
                  <TabIcon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="tab-content py-16 bg-black min-h-[50vh]">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-16">
              <RefreshCw className="w-8 h-8 text-electric-blue animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading {activeTab.toLowerCase()}...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <Icon className="w-16 h-16 text-gray-700 mx-auto mb-6" />
              <p className="text-gray-400 text-xl mb-2">No {activeTab.toLowerCase()} available yet</p>
              <p className="text-gray-500">Check back soon for updates.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="item-card bg-smoke-gray border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-all group"
                >
                  {/* Thumbnail */}
                  <div className="relative h-48 bg-gray-900">
                    {item.thumbnail_url ? (
                      <img
                        src={`${process.env.REACT_APP_BACKEND_URL}${item.thumbnail_url}`}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon className="w-16 h-16 text-gray-700" />
                      </div>
                    )}
                    {item.featured && (
                      <div className="absolute top-3 left-3 px-2 py-1 bg-electric-blue text-white text-xs font-mono uppercase tracking-widest rounded flex items-center gap-1">
                        <Star size={12} fill="currentColor" />
                        Featured
                      </div>
                    )}
                    {!item.is_free && item.price && (
                      <div className="absolute top-3 right-3 px-3 py-1 bg-black/80 text-white text-sm font-bold rounded">
                        {item.price}
                      </div>
                    )}
                    {item.is_free && (
                      <div className="absolute top-3 right-3 px-3 py-1 bg-green-500/20 text-green-400 text-xs font-mono uppercase rounded border border-green-500/40">
                        Free
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-electric-blue transition-colors">
                      {item.title}
                    </h3>
                    {item.short_description && (
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {item.short_description}
                      </p>
                    )}
                    
                    {/* Tags */}
                    {item.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-black text-gray-400 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      {item.primary_link_url && (
                        <a
                          href={item.primary_link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-electric-blue hover:bg-electric-blue/90 text-white rounded-full text-sm font-mono uppercase tracking-widest transition-all"
                        >
                          View
                          <ExternalLink size={14} />
                        </a>
                      )}
                      {item.file_url && (
                        <a
                          href={item.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 rounded-full text-sm font-mono uppercase tracking-widest transition-all"
                        >
                          <Download size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default TheDen;
