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

// Product Modal with all fields - unified accordion-based Product Page Builder
const ProductModal = ({ item, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    // 1. Product Basics
    title: item?.title || '',
    slug: item?.slug || '',
    item_type: item?.item_type || 'Apps',
    sort_order: item?.sort_order || 0,
    featured: item?.featured || false,
    is_published: item?.is_published ?? true,
    is_archived: item?.is_archived || false,
    // 2. Product Page Content
    short_description: item?.short_description || '',
    price_status: item?.price_status || '',
    what_it_is: item?.what_it_is || '',
    core_actions: item?.core_actions || [],
    experiences: item?.experiences || [],
    features: item?.features || [],
    how_it_works: item?.how_it_works || [],
    how_it_works_notes: item?.how_it_works_notes || '',
    who_its_for: item?.who_its_for || [],
    why_it_works: item?.why_it_works || '',
    what_its_not: item?.what_its_not || [],
    what_its_not_closing: item?.what_its_not_closing || '',
    final_cta_text: item?.final_cta_text || '',
    final_cta_microcopy: item?.final_cta_microcopy || '',
    tags: item?.tags || [],
    // 3. Media
    hero_image_url: item?.hero_image_url || '',
    thumbnail_url: item?.thumbnail_url || '',
    screenshots: item?.screenshots || [],
    video_url: item?.video_url || '',
    // 4. Purchase & Access
    primary_link_url: item?.primary_link_url || '',
    demo_url: item?.demo_url || '',
    file_url: item?.file_url || '',
    is_free: item?.is_free ?? true,
    price: item?.price || '',
    price_note: item?.price_note || '',
    // 5. SEO
    seo_title: item?.seo_title || '',
    seo_description: item?.seo_description || '',
    // Legacy
    long_description: item?.long_description || '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [openSections, setOpenSections] = useState(['basics']);

  const toggleSection = (id) => {
    setOpenSections(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    setUploading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/upload/image`, { method: 'POST', body: fd });
      if (response.ok) {
        const data = await response.json();
        setFormData(s => ({ ...s, [field]: data.url }));
        toast.success('Image uploaded');
      }
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleScreenshotUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    setUploading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/upload/image`, { method: 'POST', body: fd });
      if (response.ok) {
        const data = await response.json();
        setFormData(s => ({ ...s, screenshots: [...s.screenshots, data.url] }));
        toast.success('Screenshot added');
      }
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const generateSlug = () => {
    const slug = formData.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').trim();
    setFormData(s => ({ ...s, slug }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) { toast.error('Title is required'); return; }
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
      } else { toast.error('Failed to save'); }
    } catch { toast.error('Error saving'); }
    finally { setSaving(false); }
  };

  const SectionHeader = ({ id, title, subtitle, badge }) => (
    <button
      type="button"
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between py-4 text-left group"
      data-testid={`section-${id}`}
    >
      <div className="flex items-center gap-3">
        <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-mono transition-colors ${
          openSections.includes(id) ? 'bg-electric-blue text-white' : 'bg-white/5 text-gray-500 group-hover:bg-white/10'
        }`}>
          {openSections.includes(id) ? '−' : '+'}
        </span>
        <div>
          <span className="text-white font-semibold text-sm">{title}</span>
          {subtitle && <span className="text-gray-600 text-xs ml-2">{subtitle}</span>}
        </div>
      </div>
      {badge && <span className="text-gray-600 text-xs font-mono">{badge}</span>}
    </button>
  );

  const Field = ({ label, helper, children }) => (
    <div>
      <label className="block text-gray-400 text-sm mb-1">{label}</label>
      {children}
      {helper && <p className="text-gray-600 text-xs mt-1">{helper}</p>}
    </div>
  );

  const TextInput = ({ value, onChange, placeholder, ...props }) => (
    <input type="text" value={value} onChange={onChange} placeholder={placeholder} className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:border-electric-blue focus:outline-none" {...props} />
  );

  const TextArea = ({ value, onChange, placeholder, rows = 3 }) => (
    <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white text-sm resize-none focus:border-electric-blue focus:outline-none" />
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 overflow-y-auto">
      <div className="bg-smoke-gray border border-gray-800 rounded-lg w-full max-w-3xl my-8 max-h-[90vh] overflow-hidden flex flex-col" data-testid="product-modal">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 flex-shrink-0">
          <div>
            <h3 className="text-xl font-bold text-white">{item ? 'Edit' : 'New'} Product</h3>
            <p className="text-gray-500 text-xs mt-0.5">Product Page Builder</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white"><X size={20} /></button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 divide-y divide-gray-800/50">

          {/* ═══ 1. PRODUCT BASICS ═══ */}
          <div>
            <SectionHeader id="basics" title="Product Basics" subtitle="Identify & categorise" badge="Required" />
            {openSections.includes('basics') && (
              <div className="pb-6 space-y-4">
                <Field label="Product Title *">
                  <TextInput value={formData.title} onChange={(e) => setFormData(s => ({ ...s, title: e.target.value }))} placeholder="e.g. House Heroes" required />
                </Field>

                <Field label="URL Slug" helper="Auto-generated from title, or edit manually">
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center">
                      <span className="text-gray-500 bg-black px-3 py-2 border border-r-0 border-gray-700 rounded-l-lg text-xs font-mono">/armory/</span>
                      <input type="text" value={formData.slug} onChange={(e) => setFormData(s => ({ ...s, slug: e.target.value }))} className="flex-1 bg-black border border-gray-700 rounded-r-lg px-3 py-2 text-white font-mono text-sm focus:border-electric-blue focus:outline-none" placeholder="house-heroes" />
                    </div>
                    <button type="button" onClick={generateSlug} className="px-3 py-2 bg-gray-700 text-white rounded-lg text-xs hover:bg-gray-600 whitespace-nowrap">Generate</button>
                  </div>
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Product Type *">
                    <select value={formData.item_type} onChange={(e) => setFormData(s => ({ ...s, item_type: e.target.value }))} className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white text-sm">
                      {ITEM_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </Field>
                  <Field label="Sort Order">
                    <TextInput type="number" value={formData.sort_order} onChange={(e) => setFormData(s => ({ ...s, sort_order: parseInt(e.target.value) || 0 }))} />
                  </Field>
                </div>

                <div className="flex flex-wrap gap-5">
                  {[
                    { key: 'featured', label: 'Featured' },
                    { key: 'is_published', label: 'Published' },
                    { key: 'is_archived', label: 'Archived' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 text-gray-400 text-sm cursor-pointer">
                      <input type="checkbox" checked={formData[key]} onChange={(e) => setFormData(s => ({ ...s, [key]: e.target.checked }))} className="rounded" />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ═══ 2. PRODUCT PAGE CONTENT ═══ */}
          <div>
            <SectionHeader id="content" title="Product Page Content" subtitle="What users see" badge="Core" />
            {openSections.includes('content') && (
              <div className="pb-6 space-y-5">

                {/* A) Hero / Above the fold */}
                <div className="bg-black/30 rounded-lg p-4 space-y-4 border border-gray-800/50">
                  <p className="text-gray-500 text-[10px] font-mono uppercase tracking-widest">Hero / Above the Fold</p>
                  <Field label="Short Positioning Line" helper="One line, appears under the product name on the hero">
                    <TextInput value={formData.short_description} onChange={(e) => setFormData(s => ({ ...s, short_description: e.target.value }))} placeholder="One-line positioning statement" />
                  </Field>
                  <Field label="Price Status" helper="Displayed prominently in the hero">
                    <select value={formData.price_status} onChange={(e) => setFormData(s => ({ ...s, price_status: e.target.value }))} className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white text-sm">
                      <option value="">Select...</option>
                      <option value="Free">Free</option>
                      <option value="Trial">Trial</option>
                      <option value="Invite Only">Invite Only</option>
                      <option value="Bundled">Bundled</option>
                    </select>
                    {formData.price_status === '' && (
                      <input type="text" value={formData.price_status} onChange={(e) => setFormData(s => ({ ...s, price_status: e.target.value }))} className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white text-sm mt-2" placeholder="Or type custom: A$29, etc." />
                    )}
                  </Field>
                </div>

                {/* B) What This Is */}
                <Field label="What This Is" helper="Explain what it is and who it's for. 1-2 lines max. Plain text only.">
                  <TextArea value={formData.what_it_is} onChange={(e) => setFormData(s => ({ ...s, what_it_is: e.target.value }))} placeholder="[App Name] turns [core activity] into [clear outcome]. Built for [who it's for], without [what it avoids]." rows={2} />
                </Field>

                {/* C) Core Actions */}
                <ListEditor label="Core Actions" helper="Short, scannable steps. Used primarily for apps. This section should read in under 5 seconds." items={formData.core_actions} onChange={(v) => setFormData(s => ({ ...s, core_actions: v }))} placeholder="e.g. Create a room" />

                {/* D) What You Get */}
                <ListEditor label="What You Get" helper="Deliverables, outcomes, or experiences. Maps directly to the product page." items={formData.experiences} onChange={(v) => setFormData(s => ({ ...s, experiences: v }))} placeholder="e.g. Real-time multiplayer battles" />

                {/* Features Grid */}
                <ListEditor label="Features" helper="Scannable grid (2-3 columns on the page). Avoid paragraphs — reassurance, not persuasion." items={formData.features} onChange={(v) => setFormData(s => ({ ...s, features: v }))} placeholder="e.g. Offline mode" />

                {/* E) How It Works */}
                <ListEditor label="How It Works" helper="Numbered flow. Steps the user takes from start to outcome." items={formData.how_it_works} onChange={(v) => setFormData(s => ({ ...s, how_it_works: v }))} placeholder="e.g. Choose your character" />
                <Field label="How It Works — Notes" helper="2-3 short clarifying lines below the steps">
                  <TextArea value={formData.how_it_works_notes} onChange={(e) => setFormData(s => ({ ...s, how_it_works_notes: e.target.value }))} placeholder="What updates in real time. Who controls what. How results are handled." rows={2} />
                </Field>

                {/* F) Who It's For */}
                <ListEditor label="Who It's For" helper="Audience descriptors." items={formData.who_its_for || []} onChange={(v) => setFormData(s => ({ ...s, who_its_for: v }))} placeholder="e.g. Filmmakers, Indie creators" />

                {/* G) Why It Works */}
                <Field label="Why It Works" helper="Optional. Short paragraph (max 3 lines). Used mainly for courses or services.">
                  <TextArea value={formData.why_it_works || ''} onChange={(e) => setFormData(s => ({ ...s, why_it_works: e.target.value }))} placeholder="Optional short paragraph..." rows={2} />
                </Field>

                {/* What It's Not */}
                <ListEditor label="What It's Not" helper="Keep it blunt. No ads. No social feeds. No noise." items={formData.what_its_not} onChange={(v) => setFormData(s => ({ ...s, what_its_not: v }))} placeholder="e.g. No ads" />
                <Field label="What It's Not — Closing Line">
                  <TextInput value={formData.what_its_not_closing} onChange={(e) => setFormData(s => ({ ...s, what_its_not_closing: e.target.value }))} placeholder="Just [core experience] and [emotional payoff]." />
                </Field>

                {/* H) Final CTA Copy */}
                <div className="bg-black/30 rounded-lg p-4 space-y-4 border border-gray-800/50">
                  <p className="text-gray-500 text-[10px] font-mono uppercase tracking-widest">Final CTA</p>
                  <Field label="CTA Button Text" helper="Reinforce action without repeating the hero">
                    <TextInput value={formData.final_cta_text} onChange={(e) => setFormData(s => ({ ...s, final_cta_text: e.target.value }))} placeholder="[App Name] is [core benefit]. Get It Free." />
                  </Field>
                  <Field label="CTA Microcopy" helper="Optional. One line of reassurance.">
                    <TextInput value={formData.final_cta_microcopy} onChange={(e) => setFormData(s => ({ ...s, final_cta_microcopy: e.target.value }))} placeholder="No subscriptions · No ads · No lock-in" />
                  </Field>
                </div>

                {/* Tags / Use Cases */}
                <TagEditor label="Tags / Use Cases" helper="Pill-style keywords for scanning + SEO. e.g. Fun · Group · Live · Strategy" tags={formData.tags} onChange={(v) => setFormData(s => ({ ...s, tags: v }))} />
              </div>
            )}
          </div>

          {/* ═══ 3. MEDIA ═══ */}
          <div>
            <SectionHeader id="media" title="Media" subtitle="Images & video" />
            {openSections.includes('media') && (
              <div className="pb-6 space-y-5">
                {/* Hero Image */}
                <Field label="Hero Image" helper="Appears in product header and Armory grid.">
                  <div className="flex items-start gap-4">
                    {formData.hero_image_url && (
                      <div className="relative">
                        <img src={formData.hero_image_url.startsWith('http') ? formData.hero_image_url : `${process.env.REACT_APP_BACKEND_URL}${formData.hero_image_url}`} alt="" className="w-48 h-28 object-cover rounded-lg" />
                        <button type="button" onClick={() => setFormData(s => ({ ...s, hero_image_url: '' }))} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"><X size={12} /></button>
                      </div>
                    )}
                    <label className="flex items-center gap-2 px-4 py-2 bg-black border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-900 text-sm">
                      <Upload size={16} className="text-gray-400" />
                      <span className="text-gray-400">{uploading ? 'Uploading...' : 'Upload'}</span>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'hero_image_url')} className="hidden" />
                    </label>
                  </div>
                </Field>

                {/* Screenshots Gallery */}
                <Field label="Screenshots Gallery" helper="Optional. Gallery images on the product page.">
                  <div className="flex flex-wrap gap-3 mb-3">
                    {formData.screenshots.map((screenshot, idx) => (
                      <div key={idx} className="relative">
                        <img src={screenshot.startsWith('http') ? screenshot : `${process.env.REACT_APP_BACKEND_URL}${screenshot}`} alt="" className="w-24 h-16 object-cover rounded-lg" />
                        <button type="button" onClick={() => setFormData(s => ({ ...s, screenshots: s.screenshots.filter((_, i) => i !== idx) }))} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-black border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-900 text-sm">
                    <Upload size={16} className="text-gray-400" />
                    <span className="text-gray-400">{uploading ? 'Uploading...' : 'Add Screenshot'}</span>
                    <input type="file" accept="image/*" onChange={handleScreenshotUpload} className="hidden" />
                  </label>
                </Field>

                {/* Video */}
                <Field label="Video Embed URL" helper="YouTube or Vimeo embed URL">
                  <TextInput type="url" value={formData.video_url} onChange={(e) => setFormData(s => ({ ...s, video_url: e.target.value }))} placeholder="https://www.youtube.com/embed/..." />
                </Field>
              </div>
            )}
          </div>

          {/* ═══ 4. PURCHASE & ACCESS ═══ */}
          <div>
            <SectionHeader id="purchase" title="Purchase & Access" subtitle="Links & pricing" />
            {openSections.includes('purchase') && (
              <div className="pb-6 space-y-4">
                <Field label="Primary Access URL" helper="App store, checkout page, or external link">
                  <TextInput type="url" value={formData.primary_link_url} onChange={(e) => setFormData(s => ({ ...s, primary_link_url: e.target.value }))} placeholder="https://apps.apple.com/..." />
                </Field>
                <Field label="Demo / Preview URL" helper="Optional. Let users try before buying.">
                  <TextInput type="url" value={formData.demo_url} onChange={(e) => setFormData(s => ({ ...s, demo_url: e.target.value }))} placeholder="https://demo.example.com" />
                </Field>
                <Field label="Direct File Download URL" helper="Optional. For downloadable files (templates, resources).">
                  <TextInput value={formData.file_url} onChange={(e) => setFormData(s => ({ ...s, file_url: e.target.value }))} placeholder="/api/upload/files/template.zip" />
                </Field>

                <hr className="border-gray-800" />

                <label className="flex items-center gap-2 text-gray-400 text-sm cursor-pointer">
                  <input type="checkbox" checked={formData.is_free} onChange={(e) => setFormData(s => ({ ...s, is_free: e.target.checked }))} className="rounded" />
                  Free Product
                </label>

                {!formData.is_free && (
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Price">
                      <TextInput value={formData.price} onChange={(e) => setFormData(s => ({ ...s, price: e.target.value }))} placeholder="A$29" />
                    </Field>
                    <Field label="Price Note">
                      <TextInput value={formData.price_note} onChange={(e) => setFormData(s => ({ ...s, price_note: e.target.value }))} placeholder="one-time purchase" />
                    </Field>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ═══ 5. SEO ═══ */}
          <div>
            <SectionHeader id="seo" title="SEO" subtitle="Search engine optimisation" />
            {openSections.includes('seo') && (
              <div className="pb-6 space-y-4">
                <Field label="SEO Title" helper="Optional. Overrides the product title for search engines.">
                  <TextInput value={formData.seo_title} onChange={(e) => setFormData(s => ({ ...s, seo_title: e.target.value }))} placeholder="Override page title for search engines..." />
                </Field>
                <Field label="SEO Description" helper="Optional. Overrides meta description for search engines.">
                  <TextArea value={formData.seo_description} onChange={(e) => setFormData(s => ({ ...s, seo_description: e.target.value }))} placeholder="Override meta description for search engines..." rows={3} />
                </Field>

                {/* Live Preview */}
                <div className="bg-black/50 rounded-lg p-4 border border-gray-800">
                  <p className="text-gray-600 text-[10px] font-mono uppercase tracking-widest mb-3">Live SEO Preview</p>
                  <p className="text-electric-blue text-sm font-medium truncate">
                    {formData.seo_title || formData.title || 'Product Title'} | Shadow Wolves
                  </p>
                  <p className="text-green-400 text-xs truncate">
                    shadowwolvesproductions.com.au/armory/{formData.slug || 'product-slug'}
                  </p>
                  <p className="text-gray-400 text-sm line-clamp-2 mt-1">
                    {formData.seo_description || formData.short_description || formData.what_it_is || 'Product description will appear here...'}
                  </p>
                </div>

                {/* AI SEO Assist */}
                <button
                  type="button"
                  onClick={() => {
                    const title = formData.title;
                    const desc = [formData.what_it_is, formData.short_description].filter(Boolean).join('. ');
                    const audience = (formData.who_its_for || []).join(', ');
                    const features = formData.experiences?.slice(0, 3).join(', ') || '';
                    const seoTitle = `${title}${audience ? ` for ${audience.split(',')[0].trim()}` : ''} | Shadow Wolves`;
                    const seoDesc = desc || `${title}${features ? ` — ${features}` : ''}. Built by Shadow Wolves Productions.`;
                    if (formData.seo_title && !window.confirm('Overwrite existing SEO Title?')) return;
                    setFormData(s => ({ ...s, seo_title: seoTitle.slice(0, 60), seo_description: seoDesc.slice(0, 160) }));
                    toast.success('SEO fields generated from content');
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-gray-700 rounded-lg text-gray-300 text-sm hover:bg-white/10 transition-colors"
                  data-testid="ai-seo-assist-btn"
                >
                  <Star size={16} className="text-electric-blue" />
                  Generate SEO from Content
                </button>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-800 bg-black/30 flex-shrink-0">
          <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-700 text-gray-400 rounded-lg hover:text-white text-sm">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="px-6 py-2 bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 text-white rounded-lg text-sm" data-testid="product-save-btn">
            {saving ? 'Saving...' : (item ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      </div>
    </div>
  );
};

// Reusable list editor for repeating items
const ListEditor = ({ label, helper, items, onChange, placeholder }) => {
  const [newItem, setNewItem] = useState('');
  const add = () => {
    if (newItem.trim()) { onChange([...items, newItem.trim()]); setNewItem(''); }
  };
  return (
    <div>
      <label className="block text-gray-400 text-sm mb-1">{label}</label>
      {helper && <p className="text-gray-600 text-xs mb-2">{helper}</p>}
      <div className="space-y-1.5 mb-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 bg-black border border-gray-700 rounded-lg px-3 py-1.5 text-sm">
            <span className="text-gray-500 font-mono w-5">{idx + 1}.</span>
            <span className="text-white flex-1">{item}</span>
            <button type="button" onClick={() => onChange(items.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-400"><X size={14} /></button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())} className="flex-1 bg-black border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm focus:border-electric-blue focus:outline-none" placeholder={placeholder} />
        <button type="button" onClick={add} className="px-3 py-1.5 bg-electric-blue text-white rounded-lg text-sm">Add</button>
      </div>
    </div>
  );
};

// Tag editor with pill display
const TagEditor = ({ label, helper, tags, onChange }) => {
  const [newTag, setNewTag] = useState('');
  const add = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) { onChange([...tags, newTag.trim()]); setNewTag(''); }
  };
  return (
    <div>
      <label className="block text-gray-400 text-sm mb-1">{label}</label>
      {helper && <p className="text-gray-600 text-xs mb-2">{helper}</p>}
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, idx) => (
          <span key={idx} className="flex items-center gap-1 bg-white/5 border border-gray-700 px-3 py-1 rounded-full text-sm text-gray-300">
            {tag}
            <button type="button" onClick={() => onChange(tags.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-400"><X size={12} /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())} className="flex-1 bg-black border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm focus:border-electric-blue focus:outline-none" placeholder="Add a tag..." />
        <button type="button" onClick={add} className="px-3 py-1.5 bg-gray-700 text-white rounded-lg text-sm">Add</button>
      </div>
    </div>
  );
};

export default AdminArmoryTab;
