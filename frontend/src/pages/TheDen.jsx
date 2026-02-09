import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Download, FileText, BookOpen, GraduationCap, ExternalLink, RefreshCw, Star, ShoppingBag } from 'lucide-react';
import { Helmet } from 'react-helmet';

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
        <meta name="description" content="Your creative arsenal — apps, templates, downloads, and courses to evolve your craft." />
      </Helmet>

      {/* Page Header */}
      <section className="page-header py-20 bg-gradient-to-br from-black via-smoke-gray/50 to-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-electric-blue rounded-full filter blur-[120px]"></div>
          <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-purple-600 rounded-full filter blur-[100px]"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <p className="text-electric-blue font-mono text-sm uppercase tracking-widest mb-4">Collection</p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6" style={{ fontFamily: 'Cinzel, serif' }}>
              The Armory
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              Your creative arsenal — premium apps, templates, resources, and courses designed to elevate your filmmaking craft.
            </p>
          </div>
        </div>
      </section>

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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.filter(i => i.featured).map((item) => (
                      <ProductCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              )}

              {/* All Products */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

// Product Card Component
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
  
  // Use slug-based link if available, otherwise fall back to external link
  const hasLandingPage = item.slug && item.is_published !== false;
  const linkUrl = hasLandingPage ? `/armory/${item.slug}` : (item.primary_link_url || item.file_url || '#');
  const isExternalLink = !hasLandingPage && linkUrl !== '#';

  const CardWrapper = ({ children }) => {
    if (hasLandingPage) {
      return (
        <Link to={linkUrl} className="product-card group block" data-testid={`product-card-${item.id}`}>
          {children}
        </Link>
      );
    }
    return (
      <a
        href={linkUrl}
        target={isExternalLink ? '_blank' : undefined}
        rel={isExternalLink ? 'noopener noreferrer' : undefined}
        className="product-card group block"
        data-testid={`product-card-${item.id}`}
      >
        {children}
      </a>
    );
  };

  return (
    <CardWrapper>
      {/* Card Container */}
      <div className="relative bg-smoke-gray rounded-xl overflow-hidden border border-gray-800/50 hover:border-gray-700 transition-all duration-300">
        
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-900">
          {item.thumbnail_url ? (
            <img
              src={`${process.env.REACT_APP_BACKEND_URL}${item.thumbnail_url}`}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <Icon className="w-16 h-16 text-gray-700 group-hover:text-gray-600 transition-colors" />
            </div>
          )}
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          
          {/* Featured Badge */}
          {item.featured && (
            <div className="absolute top-3 left-3 px-2.5 py-1 bg-electric-blue text-white text-xs font-medium rounded-md flex items-center gap-1.5 shadow-lg">
              <Star size={12} fill="currentColor" />
              Featured
            </div>
          )}
          
          {/* Quick View Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="px-4 py-2 bg-white text-black text-sm font-medium rounded-full flex items-center gap-2 shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              {hasLandingPage ? 'View Details' : 'Get It'}
              {!hasLandingPage && isExternalLink && <ExternalLink size={14} />}
            </span>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4">
          {/* Category Tag */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-500 font-mono uppercase tracking-wider">
              {item.item_type}
            </span>
          </div>
          
          {/* Title */}
          <h3 className="text-white font-semibold text-lg leading-tight mb-2 group-hover:text-electric-blue transition-colors line-clamp-2">
            {item.title}
          </h3>
          
          {/* Description */}
          {item.short_description && (
            <p className="text-gray-500 text-sm line-clamp-2 mb-3">
              {item.short_description}
            </p>
          )}
          
          {/* Price - Standardized A$ format */}
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-800/50">
            <div className="price-display">
              {item.is_free ? (
                <span className="text-green-400 font-semibold text-lg">Free</span>
              ) : item.price ? (
                <span className="text-white font-semibold text-lg">
                  {/* Ensure A$ prefix if price is numeric */}
                  {item.price.startsWith('A$') || item.price.startsWith('$') ? item.price.replace('$', 'A$').replace('A$A$', 'A$') : `A$${item.price}`}
                </span>
              ) : item.price_note ? (
                <span className="text-gray-400 text-sm">{item.price_note}</span>
              ) : (
                <span className="text-gray-500 text-sm">View pricing</span>
              )}
            </div>
            
            {/* Tags Preview */}
            {item.tags?.length > 0 && (
              <div className="flex gap-1">
                {item.tags.slice(0, 2).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-white/5 text-gray-500 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </CardWrapper>
  );
};

export default TheDen;
