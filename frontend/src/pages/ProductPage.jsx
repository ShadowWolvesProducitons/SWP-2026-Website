import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, ExternalLink, Star, Play, Check, 
  RefreshCw, Share2, Smartphone, FileText, GraduationCap, BookOpen, Download, X
} from 'lucide-react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';

const ProductPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/den-items/by-slug/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      } else if (response.status === 404) {
        setError('Product not found');
      } else {
        setError('Failed to load product');
      }
    } catch {
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({ title: product.title, text: product.short_description, url: window.location.href });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <RefreshCw className="w-10 h-10 text-electric-blue animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-black pt-20">
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Product Not Found</h1>
          <p className="text-gray-400 mb-8">The product you're looking for doesn't exist or has been removed.</p>
          <Link to="/armory" className="inline-flex items-center gap-2 px-6 py-3 bg-electric-blue text-white rounded-full hover:bg-electric-blue/90 transition-colors" data-testid="back-to-armory">
            <ArrowLeft size={18} /> Back to The Armory
          </Link>
        </div>
      </div>
    );
  }

  const primaryLink = product.primary_link_url || product.file_url;
  const ctaLabel = product.is_free ? 'Get It Free' : product.price ? `Get It Now` : 'Get Started';

  return (
    <div className="min-h-screen bg-black pt-20" data-testid="product-page">
      <Helmet>
        <title>{product.seo_title || product.title} | Shadow Wolves Productions</title>
        <meta name="description" content={product.seo_description || product.short_description} />
        <meta property="og:title" content={product.title} />
        <meta property="og:description" content={product.short_description} />
      </Helmet>

      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <button
          onClick={() => window.history.length > 1 ? window.history.back() : (window.location.href = '/armory')}
          className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600 rounded-full transition-colors text-sm"
          data-testid="product-back-btn"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      {/* HERO */}
      <section className="container mx-auto px-4 py-12 md:py-16" data-testid="product-hero">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-white/5 border border-gray-700 rounded-full text-gray-400 text-xs font-mono uppercase tracking-wider">
              {product.item_type}
            </span>
            {product.featured && (
              <span className="px-3 py-1 bg-electric-blue/20 text-electric-blue rounded-full text-xs font-medium flex items-center gap-1">
                <Star size={12} fill="currentColor" /> Featured
              </span>
            )}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4" style={{ fontFamily: 'Cinzel, serif' }} data-testid="product-title">
            {product.title}
          </h1>

          {product.short_description && (
            <p className="text-lg text-gray-400 mb-6 leading-relaxed" data-testid="product-tagline">
              {product.short_description}
            </p>
          )}

          {/* Price Status */}
          <div className="flex items-center gap-4 mb-8">
            {(product.price_status || product.is_free || product.price) && (
              <span className="text-2xl font-bold text-white" data-testid="product-price">
                {product.price_status || (product.is_free ? 'Free' : product.price)}
              </span>
            )}
          </div>

          {/* Primary CTA */}
          <div className="flex flex-wrap gap-4">
            {primaryLink && (
              <a
                href={primaryLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-8 py-4 bg-electric-blue hover:bg-electric-blue/90 text-white rounded-full font-mono text-sm uppercase tracking-widest transition-all"
                data-testid="product-primary-cta"
              >
                {ctaLabel}
                <ExternalLink size={18} />
              </a>
            )}
            {product.demo_url && (
              <a
                href={product.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-8 py-4 border border-gray-700 text-white rounded-full font-mono text-sm uppercase tracking-widest hover:bg-white/5 transition-colors"
                data-testid="product-demo-cta"
              >
                <Play size={18} /> View Demo
              </a>
            )}
            <button
              onClick={handleShare}
              className="p-4 border border-gray-700 text-gray-400 rounded-full hover:text-white hover:bg-white/5 transition-colors"
              title="Share"
              data-testid="product-share-btn"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Hero Image */}
      {(product.hero_image_url || product.thumbnail_url) && (
        <section className="container mx-auto px-4 pb-12">
          <div className="aspect-video rounded-xl overflow-hidden bg-smoke-gray border border-gray-800 max-w-5xl">
            <img
              src={(() => {
                const img = product.hero_image_url || product.thumbnail_url;
                return img.startsWith('http') ? img : `${process.env.REACT_APP_BACKEND_URL}${img}`;
              })()}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
        </section>
      )}

      {/* WHAT IT IS */}
      {product.what_it_is && (
        <section className="container mx-auto px-4 py-12 border-t border-gray-800/50" data-testid="section-what-it-is">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Cinzel, serif' }}>What It Is</h2>
            <p className="text-gray-400 text-lg leading-relaxed">{product.what_it_is}</p>
          </div>
        </section>
      )}

      {/* CORE ACTIONS */}
      {product.core_actions?.length > 0 && (
        <section className="container mx-auto px-4 py-12 border-t border-gray-800/50" data-testid="section-core-actions">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Cinzel, serif' }}>Core Actions</h2>
            <div className="space-y-3">
              {product.core_actions.map((action, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <span className="w-8 h-8 rounded-full bg-electric-blue/10 border border-electric-blue/30 text-electric-blue text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-gray-300 pt-1">{action}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* WHAT YOU DO / EXPERIENCES */}
      {product.experiences?.length > 0 && (
        <section className="container mx-auto px-4 py-12 border-t border-gray-800/50" data-testid="section-experiences">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Cinzel, serif' }}>What You Get</h2>
            <ul className="space-y-3">
              {product.experiences.map((exp, idx) => (
                <li key={idx} className="flex items-start gap-3 text-gray-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-electric-blue mt-2.5 flex-shrink-0" />
                  <span>{exp}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* FEATURES */}
      {product.features?.length > 0 && (
        <section className="py-12 bg-smoke-gray/30 border-t border-gray-800/50" data-testid="section-features">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl">
              <h2 className="text-2xl font-bold text-white mb-8" style={{ fontFamily: 'Cinzel, serif' }}>Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {product.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-black/50 rounded-lg border border-gray-800/50">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      {product.how_it_works?.length > 0 && (
        <section className="container mx-auto px-4 py-12 border-t border-gray-800/50" data-testid="section-how-it-works">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Cinzel, serif' }}>How It Works</h2>
            <div className="space-y-4">
              {product.how_it_works.map((step, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <span className="w-8 h-8 rounded-lg bg-white/5 border border-gray-700 text-gray-400 text-sm font-mono flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-gray-300 pt-1">{step}</p>
                </div>
              ))}
            </div>
            {product.how_it_works_notes && (
              <p className="text-gray-500 text-sm mt-4 leading-relaxed">{product.how_it_works_notes}</p>
            )}
          </div>
        </section>
      )}

      {/* Video */}
      {product.video_url && (
        <section className="container mx-auto px-4 py-12">
          <div className="aspect-video rounded-xl overflow-hidden bg-smoke-gray border border-gray-800 max-w-4xl">
            <iframe
              src={product.video_url}
              title={`${product.title} video`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      )}

      {/* Screenshots Gallery */}
      {product.screenshots?.length > 0 && (
        <section className="container mx-auto px-4 py-12 border-t border-gray-800/50" data-testid="section-screenshots">
          <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Cinzel, serif' }}>Screenshots</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {product.screenshots.map((screenshot, idx) => (
              <div key={idx} className="aspect-video rounded-lg overflow-hidden bg-smoke-gray border border-gray-800">
                <img
                  src={screenshot.startsWith('http') ? screenshot : `${process.env.REACT_APP_BACKEND_URL}${screenshot}`}
                  alt={`${product.title} screenshot ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* WHAT IT'S NOT */}
      {product.what_its_not?.length > 0 && (
        <section className="container mx-auto px-4 py-12 border-t border-gray-800/50" data-testid="section-what-its-not">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Cinzel, serif' }}>What It's Not</h2>
            <ul className="space-y-2">
              {product.what_its_not.map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-gray-400">
                  <X size={16} className="text-red-500/60 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {product.what_its_not_closing && (
              <p className="text-gray-300 mt-6 text-lg">{product.what_its_not_closing}</p>
            )}
          </div>
        </section>
      )}

      {/* Long Description (fallback for items without canonical sections) */}
      {product.long_description && !product.what_it_is && (
        <section className="container mx-auto px-4 py-12 border-t border-gray-800/50">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-white mb-6">About</h2>
            <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">{product.long_description}</p>
          </div>
        </section>
      )}

      {/* TAGS / USE CASES */}
      {product.tags?.length > 0 && (
        <section className="container mx-auto px-4 py-8 border-t border-gray-800/50" data-testid="section-tags">
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag, idx) => (
              <span key={idx} className="px-4 py-2 bg-white/5 border border-gray-800 rounded-full text-gray-400 text-sm">
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* FINAL CTA */}
      <section className="py-16 border-t border-gray-800/50" data-testid="section-final-cta">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xl text-gray-300 mb-6 max-w-xl mx-auto">
            {product.final_cta_text || `${product.title} is ready when you are.`}
          </p>
          {primaryLink && (
            <a
              href={primaryLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-10 py-4 bg-electric-blue hover:bg-electric-blue/90 text-white rounded-full font-mono text-sm uppercase tracking-widest transition-all"
              data-testid="product-final-cta"
            >
              {ctaLabel}
              <ExternalLink size={18} />
            </a>
          )}
          {product.final_cta_microcopy && (
            <p className="text-gray-600 text-sm mt-4">{product.final_cta_microcopy}</p>
          )}
        </div>
      </section>

      {/* Back to Armory */}
      <section className="container mx-auto px-4 py-8 border-t border-gray-800/50">
        <Link
          to="/armory"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-electric-blue transition-colors"
          data-testid="back-to-armory-bottom"
        >
          <ArrowLeft size={18} /> Back to The Armory
        </Link>
      </section>
    </div>
  );
};

export default ProductPage;
