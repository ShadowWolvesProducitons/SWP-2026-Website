import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, ExternalLink, Download, Star, Play, Check, 
  RefreshCw, Share2, Smartphone, FileText, GraduationCap, BookOpen
} from 'lucide-react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';

const ProductPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

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
        setSelectedImage(data.hero_image_url || data.thumbnail_url);
      } else if (response.status === 404) {
        setError('Product not found');
      } else {
        setError('Failed to load product');
      }
    } catch (err) {
      console.error('Failed to load product:', err);
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

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

  const handleShare = async () => {
    try {
      await navigator.share({
        title: product.title,
        text: product.short_description,
        url: window.location.href
      });
    } catch (err) {
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
          <Link 
            to="/armory" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-electric-blue text-white rounded-full hover:bg-electric-blue/90 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to The Armory
          </Link>
        </div>
      </div>
    );
  }

  const Icon = getTypeIcon(product.item_type);
  const primaryLink = product.primary_link_url || product.file_url;

  return (
    <div className="min-h-screen bg-black pt-20">
      <Helmet>
        <title>{product.seo_title || product.title} | Shadow Wolves Productions</title>
        <meta name="description" content={product.seo_description || product.short_description} />
        <meta property="og:title" content={product.title} />
        <meta property="og:description" content={product.short_description} />
        {product.hero_image_url && (
          <meta property="og:image" content={`${process.env.REACT_APP_BACKEND_URL}${product.hero_image_url}`} />
        )}
      </Helmet>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm">
          <Link to="/armory" className="text-gray-500 hover:text-white transition-colors">
            The Armory
          </Link>
          <span className="text-gray-700">/</span>
          <span className="text-gray-500">{product.item_type}</span>
          <span className="text-gray-700">/</span>
          <span className="text-gray-300">{product.title}</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-video rounded-xl overflow-hidden bg-smoke-gray border border-gray-800">
              {selectedImage ? (
                <img
                  src={selectedImage.startsWith('http') ? selectedImage : `${process.env.REACT_APP_BACKEND_URL}${selectedImage}`}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon className="w-24 h-24 text-gray-700" />
                </div>
              )}
            </div>

            {/* Screenshots Thumbnails */}
            {product.screenshots && product.screenshots.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.thumbnail_url && (
                  <button
                    onClick={() => setSelectedImage(product.thumbnail_url)}
                    className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === product.thumbnail_url ? 'border-electric-blue' : 'border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <img
                      src={`${process.env.REACT_APP_BACKEND_URL}${product.thumbnail_url}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                )}
                {product.screenshots.map((screenshot, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(screenshot)}
                    className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === screenshot ? 'border-electric-blue' : 'border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <img
                      src={screenshot.startsWith('http') ? screenshot : `${process.env.REACT_APP_BACKEND_URL}${screenshot}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div>
            {/* Category & Featured */}
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-white/5 border border-gray-700 rounded-full text-gray-400 text-xs font-mono uppercase tracking-wider">
                {product.item_type}
              </span>
              {product.featured && (
                <span className="px-3 py-1 bg-electric-blue/20 text-electric-blue rounded-full text-xs font-medium flex items-center gap-1">
                  <Star size={12} fill="currentColor" />
                  Featured
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
              {product.title}
            </h1>

            {/* Short Description */}
            {product.short_description && (
              <p className="text-xl text-gray-400 mb-6 leading-relaxed">
                {product.short_description}
              </p>
            )}

            {/* Price */}
            <div className="mb-8">
              {product.is_free ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-green-400">Free</span>
                </div>
              ) : product.price ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-white">{product.price}</span>
                  {product.price_note && (
                    <span className="text-gray-500">{product.price_note}</span>
                  )}
                </div>
              ) : null}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-8">
              {primaryLink && (
                <a
                  href={primaryLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-8 py-4 bg-electric-blue hover:bg-electric-blue/90 text-white rounded-full font-mono text-sm uppercase tracking-widest transition-all"
                >
                  {product.is_free ? 'Get It Free' : 'Get It Now'}
                  <ExternalLink size={18} />
                </a>
              )}
              {product.demo_url && (
                <a
                  href={product.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-8 py-4 border border-gray-700 text-white rounded-full font-mono text-sm uppercase tracking-widest hover:bg-white/5 transition-colors"
                >
                  <Play size={18} />
                  View Demo
                </a>
              )}
              <button
                onClick={handleShare}
                className="p-4 border border-gray-700 text-gray-400 rounded-full hover:text-white hover:bg-white/5 transition-colors"
                title="Share"
              >
                <Share2 size={18} />
              </button>
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="bg-smoke-gray border border-gray-800 rounded-xl p-6">
                <h3 className="text-white font-bold mb-4">Features</h3>
                <ul className="space-y-3">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-300">
                      <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Video Section */}
      {product.video_url && (
        <section className="container mx-auto px-4 py-12">
          <div className="aspect-video rounded-xl overflow-hidden bg-smoke-gray border border-gray-800">
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

      {/* Long Description */}
      {product.long_description && (
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-white mb-6">About</h2>
            <div className="prose prose-invert prose-lg">
              <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">
                {product.long_description}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Tags */}
      {product.tags && product.tags.length > 0 && (
        <section className="container mx-auto px-4 py-8 border-t border-gray-800">
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-4 py-2 bg-white/5 border border-gray-800 rounded-full text-gray-400 text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Back to Armory */}
      <section className="container mx-auto px-4 py-12">
        <Link
          to="/armory"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-electric-blue transition-colors"
        >
          <ArrowLeft size={18} />
          Back to The Armory
        </Link>
      </section>
    </div>
  );
};

export default ProductPage;
