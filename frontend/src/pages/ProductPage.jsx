import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Star, Play, Check, RefreshCw, Share2, Bookmark } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';

const ProductPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/den-items/by-slug/${slug}`);
        if (response.ok) setProduct(await response.json());
        else if (response.status === 404) setError('Product not found');
        else setError('Failed to load product');
      } catch { setError('Failed to load product'); }
      finally { setLoading(false); }
    };
    fetchProduct();
  }, [slug]);

  const handleShare = async () => {
    try { await navigator.share({ title: product.title, text: product.short_description, url: window.location.href }); }
    catch { navigator.clipboard.writeText(window.location.href); toast.success('Link copied to clipboard'); }
  };

  if (loading) return <div className="min-h-screen bg-black pt-20 flex items-center justify-center"><RefreshCw className="w-10 h-10 text-electric-blue animate-spin" /></div>;

  if (error || !product) return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Product Not Found</h1>
        <p className="text-gray-400 mb-8">The product you're looking for doesn't exist or has been removed.</p>
        <Link to="/armory" className="inline-flex items-center gap-2 px-6 py-3 bg-electric-blue text-white rounded-full" data-testid="back-to-armory"><ArrowLeft size={18} /> Back to The Armory</Link>
      </div>
    </div>
  );

  const primaryLink = product.primary_link_url || product.file_url;
  const ctaLabel = product.is_free ? 'Get It Free' : (product.price ? 'Buy Now' : 'Get Started');
  const priceDisplay = product.price_status || (product.is_free ? 'Free' : product.price);
  const microReassurance = product.final_cta_microcopy || (product.is_free ? 'Instant access · No credit card required' : 'Secure checkout · Instant access');
  const imgSrc = (url) => url ? (url.startsWith('http') ? url : `${process.env.REACT_APP_BACKEND_URL}${url}`) : null;
  const hasContent = product.what_it_is || product.core_actions?.length || product.experiences?.length || product.features?.length || product.how_it_works?.length || product.who_its_for?.length || product.why_it_works || product.long_description;

  return (
    <div className="min-h-screen bg-black pt-20" data-testid="product-page">
      <Helmet>
        <title>{product.seo_title || product.title} | Shadow Wolves Productions</title>
        <meta name="description" content={product.seo_description || product.short_description} />
        <meta property="og:title" content={product.title} />
        <meta property="og:description" content={product.short_description} />
      </Helmet>

      {/* Back */}
      <div className="container mx-auto px-4 py-4">
        <button onClick={() => window.history.length > 1 ? window.history.back() : (window.location.href = '/armory')} className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600 rounded-full transition-colors text-sm" data-testid="product-back-btn">
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      {/* ═══ MOBILE PURCHASE BLOCK (top) ═══ */}
      <div className="lg:hidden">
        <PurchaseBlock product={product} primaryLink={primaryLink} ctaLabel={ctaLabel} priceDisplay={priceDisplay} microReassurance={microReassurance} onShare={handleShare} />
      </div>

      {/* ═══ TWO-COLUMN LAYOUT ═══ */}
      <div className="container mx-auto px-4 pb-16">
        <div className="lg:flex lg:gap-12 lg:items-start">

          {/* LEFT COLUMN — Content (scrollable) */}
          <div className="flex-1 min-w-0">

            {/* Hero Image */}
            {(product.hero_image_url || product.thumbnail_url) && (
              <div className="aspect-video rounded-xl overflow-hidden bg-smoke-gray border border-gray-800 mb-10">
                <img 
                  src={imgSrc(product.hero_image_url || product.thumbnail_url)} 
                  alt={product.title} 
                  className="w-full h-full object-cover" 
                  loading="lazy"
                />
              </div>
            )}

            {/* WHAT THIS IS */}
            {product.what_it_is && (
              <ContentSection title="What This Is" testId="section-what-it-is">
                <p className="text-gray-400 text-base leading-relaxed whitespace-pre-line">{product.what_it_is}</p>
              </ContentSection>
            )}

            {/* CORE ACTIONS */}
            {product.core_actions?.length > 0 && (
              <ContentSection title="Core Actions" testId="section-core-actions">
                <div className="space-y-3">
                  {product.core_actions.map((action, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <span className="w-7 h-7 rounded-full bg-electric-blue/10 border border-electric-blue/30 text-electric-blue text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                      <p className="text-gray-300">{action}</p>
                    </div>
                  ))}
                </div>
              </ContentSection>
            )}

            {/* WHAT YOU GET */}
            {product.experiences?.length > 0 && (
              <ContentSection title="What You Get" testId="section-experiences">
                <ul className="space-y-2.5">
                  {product.experiences.map((exp, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-electric-blue mt-2 flex-shrink-0" />
                      <span>{exp}</span>
                    </li>
                  ))}
                </ul>
              </ContentSection>
            )}

            {/* FEATURES */}
            {product.features?.length > 0 && (
              <ContentSection title="Features" testId="section-features">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-smoke-gray/50 rounded-lg border border-gray-800/50">
                      <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{f}</span>
                    </div>
                  ))}
                </div>
              </ContentSection>
            )}

            {/* HOW IT WORKS */}
            {product.how_it_works?.length > 0 && (
              <ContentSection title="How It Works" testId="section-how-it-works">
                <div className="space-y-3">
                  {product.how_it_works.map((step, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <span className="w-7 h-7 rounded-lg bg-white/5 border border-gray-700 text-gray-400 text-xs font-mono flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                      <p className="text-gray-300">{step}</p>
                    </div>
                  ))}
                </div>
                {product.how_it_works_notes && <p className="text-gray-500 text-sm mt-4 leading-relaxed">{product.how_it_works_notes}</p>}
              </ContentSection>
            )}

            {/* WHO IT'S FOR */}
            {product.who_its_for?.length > 0 && (
              <ContentSection title="Who It's For" testId="section-who-its-for">
                <ul className="space-y-2.5">
                  {product.who_its_for.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-electric-blue mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </ContentSection>
            )}

            {/* WHY IT WORKS */}
            {product.why_it_works && (
              <ContentSection title="Why It Works" testId="section-why-it-works">
                <p className="text-gray-400 text-base leading-relaxed">{product.why_it_works}</p>
              </ContentSection>
            )}

            {/* VIDEO */}
            {product.video_url && (
              <div className="mb-10">
                <div className="aspect-video rounded-xl overflow-hidden bg-smoke-gray border border-gray-800">
                  <iframe src={product.video_url} title={`${product.title} video`} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                </div>
              </div>
            )}

            {/* SCREENSHOTS */}
            {product.screenshots?.length > 0 && (
              <ContentSection title="Screenshots" testId="section-screenshots">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.screenshots.map((s, i) => (
                    <div key={i} className="aspect-video rounded-lg overflow-hidden bg-smoke-gray border border-gray-800">
                      <img src={imgSrc(s)} alt={`${product.title} screenshot ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </ContentSection>
            )}

            {/* LONG DESCRIPTION FALLBACK */}
            {product.long_description && !product.what_it_is && (
              <ContentSection title="About">
                <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">{product.long_description}</p>
              </ContentSection>
            )}

            {/* TAGS */}
            {product.tags?.length > 0 && (
              <div className="py-6 border-t border-gray-800/50" data-testid="section-tags">
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, i) => (
                    <span key={i} className="px-4 py-1.5 bg-white/5 border border-gray-800 rounded-full text-gray-400 text-sm">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN — Purchase Block (sticky, desktop only) */}
          <div className="hidden lg:block lg:w-[380px] flex-shrink-0">
            <div className="sticky top-24">
              <PurchaseBlock product={product} primaryLink={primaryLink} ctaLabel={ctaLabel} priceDisplay={priceDisplay} microReassurance={microReassurance} onShare={handleShare} />
            </div>
          </div>
        </div>
      </div>

      {/* FINAL CTA (full-width) */}
      <section className="py-16 border-t border-gray-800/50" data-testid="section-final-cta">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xl text-gray-300 mb-6 max-w-xl mx-auto">
            {product.final_cta_text || `${product.title} is ready when you are.`}
          </p>
          {primaryLink && (
            <a href={primaryLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-10 py-4 bg-electric-blue hover:bg-electric-blue/90 text-white rounded-full font-mono text-sm uppercase tracking-widest transition-all" data-testid="product-final-cta">
              {ctaLabel} <ExternalLink size={18} />
            </a>
          )}
          {product.final_cta_microcopy && <p className="text-gray-600 text-sm mt-4">{product.final_cta_microcopy}</p>}
        </div>
      </section>

      {/* MOBILE STICKY CTA (bottom bar) */}
      {primaryLink && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-lg border-t border-gray-800 px-4 py-3" data-testid="mobile-sticky-cta">
          <a href={primaryLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3.5 bg-electric-blue text-white rounded-full font-mono text-sm uppercase tracking-widest">
            {ctaLabel} <ExternalLink size={16} />
          </a>
        </div>
      )}

      {/* Back to Armory */}
      <section className="container mx-auto px-4 py-8 border-t border-gray-800/50 mb-16 lg:mb-0">
        <Link to="/armory" className="inline-flex items-center gap-2 text-gray-400 hover:text-electric-blue transition-colors" data-testid="back-to-armory-bottom">
          <ArrowLeft size={18} /> Back to The Armory
        </Link>
      </section>
    </div>
  );
};

/* ═══ PURCHASE BLOCK ═══ */
const PurchaseBlock = ({ product, primaryLink, ctaLabel, priceDisplay, microReassurance, onShare }) => (
  <div className="bg-smoke-gray border border-gray-800 rounded-xl p-6 mb-8 lg:mb-0" data-testid="purchase-block">
    {/* Product Name & Type */}
    <div className="flex items-center gap-2 mb-2">
      <span className="px-2 py-0.5 bg-white/5 border border-gray-700 rounded text-gray-500 text-[10px] font-mono uppercase tracking-wider">{product.item_type}</span>
      {product.featured && <Star size={14} className="text-electric-blue" fill="currentColor" />}
    </div>
    <h2 className="text-xl font-bold text-white mb-1 font-cinzel" data-testid="purchase-title">{product.title}</h2>
    {product.short_description && <p className="text-gray-400 text-sm mb-5 leading-relaxed">{product.short_description}</p>}

    {/* Price */}
    {priceDisplay && (
      <div className="mb-5" data-testid="purchase-price">
        <span className="text-3xl font-bold text-white">{priceDisplay}</span>
        {product.price_note && <span className="text-gray-500 text-sm ml-2">{product.price_note}</span>}
      </div>
    )}

    {/* Primary CTA */}
    {primaryLink && (
      <a
        href={primaryLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3.5 bg-electric-blue hover:bg-electric-blue/90 text-white rounded-full font-mono text-sm uppercase tracking-widest transition-all mb-3"
        data-testid="purchase-cta"
      >
        {ctaLabel} <ExternalLink size={16} />
      </a>
    )}

    {/* Demo */}
    {product.demo_url && (
      <a
        href={product.demo_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 border border-gray-700 text-gray-300 rounded-full text-sm hover:bg-white/5 transition-colors mb-3"
        data-testid="purchase-demo"
      >
        <Play size={16} /> View Demo
      </a>
    )}

    {/* Micro reassurance */}
    <p className="text-gray-500 text-xs text-center mb-4">{microReassurance}</p>

    {/* Actions */}
    <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-800">
      <button onClick={onShare} className="flex items-center gap-1.5 text-gray-500 hover:text-white text-xs transition-colors" data-testid="purchase-share">
        <Share2 size={14} /> Share
      </button>
      <button onClick={() => toast.success('Saved for later')} className="flex items-center gap-1.5 text-gray-500 hover:text-white text-xs transition-colors" data-testid="purchase-save">
        <Bookmark size={14} /> Save for Later
      </button>
    </div>
  </div>
);

/* ═══ CONTENT SECTION WRAPPER ═══ */
const ContentSection = ({ title, testId, children }) => (
  <section className="mb-10 pb-10 border-b border-gray-800/50 last:border-0" data-testid={testId}>
    <h2 className="text-lg font-bold text-white mb-4 font-cinzel">{title}</h2>
    {children}
  </section>
);

export default ProductPage;
