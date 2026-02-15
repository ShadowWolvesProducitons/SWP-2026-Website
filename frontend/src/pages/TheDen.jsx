import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Download, FileText, BookOpen, GraduationCap, ExternalLink, RefreshCw, Star, ShoppingBag } from 'lucide-react';
import { Helmet } from 'react-helmet';
import PageHeader from '../components/PageHeader';

const TheDen = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allItems, setAllItems] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAllItems();
  }, []);

  useEffect(() => {
    if (activeTab === 'All') {
      setItems(allItems);
    } else {
      setItems(allItems.filter(item => item.item_type === activeTab));
    }
  }, [activeTab, allItems]);

  const fetchAllItems = async () => {
    setLoading(true);
    try {
      // Fetch all item types
      const types = ['Apps', 'Templates', 'Downloads', 'Courses', 'eBooks'];
      const allFetchedItems = [];
      
      for (const type of types) {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/den-items?item_type=${type}`);
        if (response.ok) {
          const data = await response.json();
          allFetchedItems.push(...data);
        }
      }
      
      // Sort: featured first, then by sort_order
      allFetchedItems.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (a.sort_order || 0) - (b.sort_order || 0);
      });
      
      setAllItems(allFetchedItems);
      setItems(allFetchedItems);
    } catch (err) {
      console.error('Failed to load items:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'All', label: 'All Products', icon: ShoppingBag },
    { id: 'Apps', label: 'Apps', icon: Smartphone },
    { id: 'Templates', label: 'Templates', icon: FileText },
    { id: 'Downloads', label: 'Downloads', icon: Download },
    { id: 'Courses', label: 'Courses', icon: GraduationCap },
    { id: 'eBooks', label: 'eBooks', icon: BookOpen }
  ];

  const getTabCount = (tabId) => {
    if (tabId === 'All') return allItems.length;
    return allItems.filter(item => item.item_type === tabId).length;
  };

  return (
    <div className="the-armory-page pt-20 min-h-screen bg-black">
      <Helmet>
        <title>The Armory | Shadow Wolves Productions</title>
        <meta name="description" content="Your creative arsenal — apps, templates, resources, and courses built for real-world filmmaking." />
      </Helmet>

      {/* Page Header */}
      <PageHeader page="armory" title="The Armory" subtitle="Your creative arsenal — apps, templates, resources, and courses built for real-world filmmaking." />

      {/* Filter Bar */}
      <section className="filter-bar py-6 bg-smoke-gray/50 border-y border-gray-800/50 sticky top-20 z-40 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
              {tabs.map((tab) => {
                const count = getTabCount(tab.id);
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'bg-white text-black font-medium'
                        : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                    data-testid={`tab-${tab.id.toLowerCase()}`}
                  >
                    {tab.label}
                    {count > 0 && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        activeTab === tab.id ? 'bg-black/10' : 'bg-white/10'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Results count */}
            <p className="text-gray-500 text-sm">
              {items.length} {items.length === 1 ? 'product' : 'products'}
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="products-section py-12 bg-black">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-24">
              <RefreshCw className="w-10 h-10 text-electric-blue animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading products...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-24">
              <ShoppingBag className="w-20 h-20 text-gray-800 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-2">No products yet</h3>
              <p className="text-gray-500">Check back soon for new additions to the armory.</p>
            </div>
          ) : (
            <>
              {/* Featured Collection - Only show when viewing "All" */}
              {activeTab === 'All' && items.filter(i => i.featured).length > 0 && (
                <div className="mb-12">
                  <h2 className="text-sm font-mono text-electric-blue uppercase tracking-widest mb-6">Featured Collection</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {items.filter(i => i.featured).map((item) => (
                      <ProductCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              )}

              {/* All Products */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {items.filter(i => activeTab !== 'All' || !i.featured).map((item) => (
                  <ProductCard key={item.id} item={item} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

// Product Card Component — Top 3/4 image auto-fit, bottom 1/4 info strip
const ProductCard = ({ item }) => {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'Apps': return Smartphone;
      case 'Templates': return FileText;
      case 'Downloads': return Download;
      case 'Courses': return GraduationCap;
      case 'eBooks': return BookOpen;
      default: return FileText;
    }
  };

  const Icon = getTypeIcon(item.item_type);
  const hasLandingPage = item.slug && item.is_published !== false;
  const linkUrl = hasLandingPage ? `/armory/${item.slug}` : (item.primary_link_url || item.file_url || '#');
  const isExternalLink = !hasLandingPage && linkUrl !== '#';

  const CardWrapper = ({ children }) => {
    if (hasLandingPage) {
      return <Link to={linkUrl} className="product-card group block" data-testid={`product-card-${item.id}`}>{children}</Link>;
    }
    return (
      <a href={linkUrl} target={isExternalLink ? '_blank' : undefined} rel={isExternalLink ? 'noopener noreferrer' : undefined}
        className="product-card group block" data-testid={`product-card-${item.id}`}>{children}</a>
    );
  };

  return (
    <CardWrapper>
      <div className="relative overflow-hidden rounded-lg border border-gray-800/50 hover:border-white/20 transition-all duration-300 bg-smoke-gray">
        {/* Top 3/4 — Image area (square aspect) */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
          {item.thumbnail_url ? (
            <img src={`${process.env.REACT_APP_BACKEND_URL}${item.thumbnail_url}`} alt={item.title}
              className="absolute inset-0 w-full h-full object-contain bg-black transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
              <Icon className="w-10 h-10 text-gray-700 mb-2" />
            </div>
          )}
          {/* Featured Badge */}
          {item.featured && (
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-electric-blue text-white text-[10px] font-medium rounded-full flex items-center gap-1 z-10">
              <Star size={10} fill="currentColor" /> Featured
            </div>
          )}
        </div>
        {/* Bottom 1/4 — Info strip */}
        <div className="p-2.5">
          <span className="text-gray-500 text-[10px] font-mono uppercase tracking-wider block">{item.item_type}</span>
          <h3 className="text-white font-bold text-xs line-clamp-1 mt-0.5">{item.title}</h3>
          <span className="text-[10px] mt-1 block">
            {item.is_free ? <span className="text-green-400">Free</span> : item.price ? <span className="text-gray-400">{item.price}</span> : null}
          </span>
        </div>
      </div>
    </CardWrapper>
  );
};

export default TheDen;
