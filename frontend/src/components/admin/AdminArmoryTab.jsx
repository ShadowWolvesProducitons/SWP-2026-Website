import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Plus, Edit2, Trash2, Star, ExternalLink, Link as LinkIcon, Upload, X, Eye, Image } from 'lucide-react';
import { toast } from 'sonner';

const ITEM_TYPES = ['Apps', 'Templates', 'Downloads', 'Courses', 'eBooks'];

const AdminArmoryTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filterType, setFilterType] = useState('All');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/den-items?include_archived=true`);
      if (response.ok) {
        setItems(await response.json());
      }
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/den-items/${item.id}?permanent=true`, {
        method: 'DELETE'
      });
      toast.success('Product deleted');
      fetchItems();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const filteredItems = filterType === 'All' 
    ? items 
    : items.filter(i => i.item_type === filterType);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">The Armory</h2>
        <button
          onClick={() => { setEditingItem(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-electric-blue hover:bg-electric-blue/90 text-white px-4 py-2 rounded-lg text-sm"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['All', ...ITEM_TYPES].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              filterType === type
                ? 'bg-white text-black'
                : 'bg-smoke-gray text-gray-400 hover:text-white'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        {ITEM_TYPES.map((type) => {
          const count = items.filter(i => i.item_type === type).length;
          return (
            <div key={type} className="bg-smoke-gray border border-gray-800 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-white">{count}</p>
              <p className="text-gray-500 text-xs">{type}</p>
            </div>
          );
        })}
      </div>

      {/* Products List */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-electric-blue animate-spin mx-auto" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-smoke-gray border border-gray-800 rounded-lg">
          <p className="text-gray-500">No products found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div key={item.id} className={`bg-smoke-gray border rounded-lg p-4 flex items-center gap-4 ${
              item.is_archived ? 'border-red-900/50 opacity-60' : 'border-gray-800'
            }`}>
              {/* Thumbnail */}
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-900 flex-shrink-0">
                {item.thumbnail_url ? (
                  <img 
                    src={`${process.env.REACT_APP_BACKEND_URL}${item.thumbnail_url}`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-700">
                    <Image size={24} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {item.featured && <Star size={14} className="text-electric-blue" fill="currentColor" />}
                  <h4 className="text-white font-medium truncate">{item.title}</h4>
                  {item.is_archived && <span className="text-red-400 text-xs">(Archived)</span>}
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-500">{item.item_type}</span>
                  {item.slug && (
                    <span className="text-electric-blue text-xs font-mono">/armory/{item.slug}</span>
                  )}
                  {item.is_free ? (
                    <span className="text-green-400">Free</span>
                  ) : item.price ? (
                    <span className="text-white">{item.price}</span>
                  ) : null}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {item.slug && (
                  <a
                    href={`/armory/${item.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-electric-blue"
                    title="View Landing Page"
                  >
                    <Eye size={18} />
                  </a>
                )}
                {item.primary_link_url && (
                  <a
                    href={item.primary_link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-white"
                    title="External Link"
                  >
                    <ExternalLink size={18} />
                  </a>
                )}
                <button
                  onClick={() => { setEditingItem(item); setShowModal(true); }}
                  className="p-2 text-gray-400 hover:text-electric-blue"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="p-2 text-gray-400 hover:text-red-400"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ProductModal
          item={editingItem}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); fetchItems(); }}
        />
      )}
    </div>
  );
};

// Product Modal with all fields
const ProductModal = ({ item, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: item?.title || '',
    slug: item?.slug || '',
    item_type: item?.item_type || 'Apps',
    featured: item?.featured || false,
    is_published: item?.is_published ?? true,
    short_description: item?.short_description || '',
    long_description: item?.long_description || '',
    what_it_is: item?.what_it_is || '',
    core_actions: item?.core_actions || [],
    experiences: item?.experiences || [],
    how_it_works: item?.how_it_works || [],
    how_it_works_notes: item?.how_it_works_notes || '',
    what_its_not: item?.what_its_not || [],
    what_its_not_closing: item?.what_its_not_closing || '',
    final_cta_text: item?.final_cta_text || '',
    final_cta_microcopy: item?.final_cta_microcopy || '',
    price_status: item?.price_status || '',
    hero_image_url: item?.hero_image_url || '',
    thumbnail_url: item?.thumbnail_url || '',
    screenshots: item?.screenshots || [],
    features: item?.features || [],
    primary_link_url: item?.primary_link_url || '',
    file_url: item?.file_url || '',
    demo_url: item?.demo_url || '',
    video_url: item?.video_url || '',
    price: item?.price || '',
    price_note: item?.price_note || '',
    is_free: item?.is_free ?? true,
    tags: item?.tags || [],
    seo_title: item?.seo_title || '',
    seo_description: item?.seo_description || '',
    sort_order: item?.sort_order || 0,
    is_archived: item?.is_archived || false
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [newFeature, setNewFeature] = useState('');
  const [newTag, setNewTag] = useState('');

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    setUploading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/upload/image`, {
        method: 'POST',
        body: fd
      });
      if (response.ok) {
        const data = await response.json();
        setFormData(s => ({ ...s, [field]: data.url }));
        toast.success('Image uploaded');
      }
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleScreenshotUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    setUploading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/upload/image`, {
        method: 'POST',
        body: fd
      });
      if (response.ok) {
        const data = await response.json();
        setFormData(s => ({ ...s, screenshots: [...s.screenshots, data.url] }));
        toast.success('Screenshot added');
      }
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeScreenshot = (idx) => {
    setFormData(s => ({ ...s, screenshots: s.screenshots.filter((_, i) => i !== idx) }));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(s => ({ ...s, features: [...s.features, newFeature.trim()] }));
      setNewFeature('');
    }
  };

  const removeFeature = (idx) => {
    setFormData(s => ({ ...s, features: s.features.filter((_, i) => i !== idx) }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(s => ({ ...s, tags: [...s.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (idx) => {
    setFormData(s => ({ ...s, tags: s.tags.filter((_, i) => i !== idx) }));
  };

  const generateSlug = () => {
    const slug = formData.title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    setFormData(s => ({ ...s, slug }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = item
        ? `${process.env.REACT_APP_BACKEND_URL}/api/den-items/${item.id}`
        : `${process.env.REACT_APP_BACKEND_URL}/api/den-items`;
      
      const response = await fetch(url, {
        method: item ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        toast.success(item ? 'Product updated' : 'Product created');
        onSave();
      } else {
        toast.error('Failed to save');
      }
    } catch (err) {
      toast.error('Error saving');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'landing', label: 'Landing Page' },
    { id: 'content', label: 'Content' },
    { id: 'media', label: 'Media' },
    { id: 'links', label: 'Links & Pricing' },
    { id: 'seo', label: 'SEO' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 overflow-y-auto">
      <div className="bg-smoke-gray border border-gray-800 rounded-lg w-full max-w-3xl my-8 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h3 className="text-xl font-bold text-white">{item ? 'Edit' : 'Add'} Product</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 border-b border-gray-800 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-t-lg text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-black text-white border-b-2 border-electric-blue'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(s => ({ ...s, title: e.target.value }))}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">URL Slug</label>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center">
                    <span className="text-gray-500 bg-black px-3 py-2 border border-r-0 border-gray-700 rounded-l-lg text-sm">/armory/</span>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData(s => ({ ...s, slug: e.target.value }))}
                      className="flex-1 bg-black border border-gray-700 rounded-r-lg px-4 py-2 text-white font-mono"
                      placeholder="house-heroes"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={generateSlug}
                    className="px-3 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Type *</label>
                  <select
                    value={formData.item_type}
                    onChange={(e) => setFormData(s => ({ ...s, item_type: e.target.value }))}
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white"
                  >
                    {ITEM_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData(s => ({ ...s, sort_order: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-gray-400">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData(s => ({ ...s, featured: e.target.checked }))}
                    className="rounded"
                  />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-gray-400">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData(s => ({ ...s, is_published: e.target.checked }))}
                    className="rounded"
                  />
                  Landing Page Published
                </label>
                <label className="flex items-center gap-2 text-gray-400">
                  <input
                    type="checkbox"
                    checked={formData.is_archived}
                    onChange={(e) => setFormData(s => ({ ...s, is_archived: e.target.checked }))}
                    className="rounded"
                  />
                  Archived
                </label>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">Short Description</label>
                <input
                  type="text"
                  value={formData.short_description}
                  onChange={(e) => setFormData(s => ({ ...s, short_description: e.target.value }))}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white"
                  placeholder="Brief tagline or description"
                />
              </div>
            </div>
          )}

          {/* Landing Page Tab */}
          {activeTab === 'landing' && (
            <LandingPageFields formData={formData} setFormData={setFormData} />
          )}

          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Long Description</label>
                <textarea
                  value={formData.long_description}
                  onChange={(e) => setFormData(s => ({ ...s, long_description: e.target.value }))}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white resize-none h-32"
                  placeholder="Detailed description for the landing page..."
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Features</label>
                <div className="space-y-2 mb-2">
                  {formData.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-black border border-gray-700 rounded-lg px-3 py-2">
                      <span className="text-white flex-1">{feature}</span>
                      <button type="button" onClick={() => removeFeature(idx)} className="text-gray-400 hover:text-red-400">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    className="flex-1 bg-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                    placeholder="Add a feature..."
                  />
                  <button type="button" onClick={addFeature} className="px-3 py-2 bg-electric-blue text-white rounded-lg text-sm">
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag, idx) => (
                    <span key={idx} className="flex items-center gap-1 bg-white/5 border border-gray-700 px-3 py-1 rounded-full text-sm text-gray-300">
                      {tag}
                      <button type="button" onClick={() => removeTag(idx)} className="text-gray-400 hover:text-red-400">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 bg-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                    placeholder="Add a tag..."
                  />
                  <button type="button" onClick={addTag} className="px-3 py-2 bg-gray-700 text-white rounded-lg text-sm">
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Media Tab */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              {/* Thumbnail */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Thumbnail (for listing grid)</label>
                <div className="flex items-start gap-4">
                  {formData.thumbnail_url && (
                    <img 
                      src={`${process.env.REACT_APP_BACKEND_URL}${formData.thumbnail_url}`}
                      alt="" 
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                  <label className="flex items-center gap-2 px-4 py-2 bg-black border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-900">
                    <Upload size={16} className="text-gray-400" />
                    <span className="text-gray-400 text-sm">{uploading ? 'Uploading...' : 'Upload'}</span>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'thumbnail_url')} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Hero Image */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Hero Image (large banner for landing page)</label>
                <div className="flex items-start gap-4">
                  {formData.hero_image_url && (
                    <img 
                      src={`${process.env.REACT_APP_BACKEND_URL}${formData.hero_image_url}`}
                      alt="" 
                      className="w-48 h-28 object-cover rounded-lg"
                    />
                  )}
                  <label className="flex items-center gap-2 px-4 py-2 bg-black border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-900">
                    <Upload size={16} className="text-gray-400" />
                    <span className="text-gray-400 text-sm">{uploading ? 'Uploading...' : 'Upload'}</span>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'hero_image_url')} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Screenshots */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Screenshots Gallery</label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {formData.screenshots.map((screenshot, idx) => (
                    <div key={idx} className="relative">
                      <img 
                        src={screenshot.startsWith('http') ? screenshot : `${process.env.REACT_APP_BACKEND_URL}${screenshot}`}
                        alt="" 
                        className="w-24 h-16 object-cover rounded-lg"
                      />
                      <button 
                        type="button"
                        onClick={() => removeScreenshot(idx)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-black border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-900">
                  <Upload size={16} className="text-gray-400" />
                  <span className="text-gray-400 text-sm">{uploading ? 'Uploading...' : 'Add Screenshot'}</span>
                  <input type="file" accept="image/*" onChange={handleScreenshotUpload} className="hidden" />
                </label>
              </div>

              {/* Video */}
              <div>
                <label className="block text-gray-400 text-sm mb-1">Video Embed URL (YouTube/Vimeo)</label>
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => setFormData(s => ({ ...s, video_url: e.target.value }))}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white"
                  placeholder="https://www.youtube.com/embed/..."
                />
              </div>
            </div>
          )}

          {/* Links & Pricing Tab */}
          {activeTab === 'links' && (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Primary Link URL</label>
                <input
                  type="url"
                  value={formData.primary_link_url}
                  onChange={(e) => setFormData(s => ({ ...s, primary_link_url: e.target.value }))}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white"
                  placeholder="https://apps.apple.com/..."
                />
                <p className="text-gray-600 text-xs mt-1">App Store, website, or main download link</p>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">Demo/Preview URL</label>
                <input
                  type="url"
                  value={formData.demo_url}
                  onChange={(e) => setFormData(s => ({ ...s, demo_url: e.target.value }))}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white"
                  placeholder="https://demo.example.com"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">Direct File Download URL</label>
                <input
                  type="text"
                  value={formData.file_url}
                  onChange={(e) => setFormData(s => ({ ...s, file_url: e.target.value }))}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white"
                  placeholder="/api/upload/files/template.zip"
                />
              </div>

              <hr className="border-gray-800" />

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-gray-400">
                  <input
                    type="checkbox"
                    checked={formData.is_free}
                    onChange={(e) => setFormData(s => ({ ...s, is_free: e.target.checked }))}
                    className="rounded"
                  />
                  Free Product
                </label>
              </div>

              {!formData.is_free && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Price</label>
                    <input
                      type="text"
                      value={formData.price}
                      onChange={(e) => setFormData(s => ({ ...s, price: e.target.value }))}
                      className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white"
                      placeholder="$29"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Price Note</label>
                    <input
                      type="text"
                      value={formData.price_note}
                      onChange={(e) => setFormData(s => ({ ...s, price_note: e.target.value }))}
                      className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white"
                      placeholder="one-time purchase"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">SEO Title (optional)</label>
                <input
                  type="text"
                  value={formData.seo_title}
                  onChange={(e) => setFormData(s => ({ ...s, seo_title: e.target.value }))}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white"
                  placeholder="Override page title for search engines..."
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">SEO Description (optional)</label>
                <textarea
                  value={formData.seo_description}
                  onChange={(e) => setFormData(s => ({ ...s, seo_description: e.target.value }))}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white resize-none h-24"
                  placeholder="Override meta description for search engines..."
                />
              </div>

              <div className="bg-black/50 rounded-lg p-4 border border-gray-800">
                <p className="text-gray-500 text-xs mb-2">Preview</p>
                <p className="text-electric-blue text-sm font-medium truncate">
                  {formData.seo_title || formData.title || 'Product Title'} | Shadow Wolves
                </p>
                <p className="text-green-400 text-xs truncate">
                  shadowwolvesproductions.com.au/armory/{formData.slug || 'product-slug'}
                </p>
                <p className="text-gray-400 text-sm line-clamp-2 mt-1">
                  {formData.seo_description || formData.short_description || 'Product description will appear here...'}
                </p>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-800 bg-black/30">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-700 text-gray-400 rounded-lg hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2 bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 text-white rounded-lg"
          >
            {saving ? 'Saving...' : (item ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminArmoryTab;
