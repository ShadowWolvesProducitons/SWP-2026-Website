import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Plus, Edit2, Trash2, Star, ExternalLink, Eye, Image, X, Upload, FolderOpen, Sparkles, Loader2, Check, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import AssetPicker from './AssetPicker';

const API = process.env.REACT_APP_BACKEND_URL;
// Removed "Templates" - they are now merged into "Downloads"
const ITEM_TYPES = ['Apps', 'Downloads', 'Courses', 'eBooks'];

const AdminArmoryTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filterType, setFilterType] = useState('All');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/den-items?include_archived=true`);
      if (r.ok) setItems(await r.json());
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    try {
      await fetch(`${API}/api/den-items/${item.id}?permanent=true`, { method: 'DELETE' });
      toast.success('Product deleted');
      fetchItems();
    } catch { toast.error('Failed to delete'); }
  };

  const filteredItems = filterType === 'All' ? items : items.filter(i => i.item_type === filterType);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">The Armory</h2>
        <button onClick={() => { setEditingItem(null); setShowModal(true); }} className="flex items-center gap-2 bg-swp-ice hover:bg-swp-ice text-white px-4 py-2 rounded-swp text-sm" data-testid="add-product-btn">
          <Plus size={18} /> Add Product
        </button>
      </div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {['All', ...ITEM_TYPES].map((type) => (
          <button key={type} onClick={() => setFilterType(type)} className={`px-4 py-2 rounded-sm text-sm transition-all ${filterType === type ? 'bg-white text-black' : 'bg-swp-surface text-swp-white-ghost hover:text-swp-white'}`} data-testid={`filter-tab-${type.toLowerCase()}`}>{type}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        {ITEM_TYPES.map((type) => (
          <div key={type} className="bg-swp-surface border border-swp-border rounded-swp p-3 text-center">
            <p className="text-2xl font-bold text-white">{items.filter(i => i.item_type === type).length}</p>
            <p className="text-swp-white-ghost/70 text-xs">{type}</p>
          </div>
        ))}
      </div>
      {loading ? (
        <div className="text-center py-12"><RefreshCw className="w-8 h-8 text-swp-ice animate-spin mx-auto" /></div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-swp-surface border border-swp-border rounded-swp"><p className="text-swp-white-ghost/70">No products found</p></div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div key={item.id} className={`bg-swp-surface border rounded-swp p-4 flex items-center gap-4 ${item.is_archived ? 'border-red-900/50 opacity-60' : 'border-swp-border'}`}>
              <div className="w-16 h-16 rounded-swp overflow-hidden bg-gray-900 flex-shrink-0">
                {item.thumbnail_url ? <img src={`${API}${item.thumbnail_url}`} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-700"><Image size={24} /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {item.featured && <Star size={14} className="text-swp-ice" fill="currentColor" />}
                  <h4 className="text-white font-medium truncate">{item.title}</h4>
                  {item.is_archived && <span className="text-red-400 text-xs">(Archived)</span>}
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-swp-white-ghost/70">{item.item_type}</span>
                  {item.slug && <span className="text-swp-ice text-xs font-mono">/armory/{item.slug}</span>}
                  {item.is_free ? <span className="text-green-400">Free</span> : item.price ? <span className="text-white">{item.price}</span> : null}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {item.slug && <a href={`/armory/${item.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 text-swp-white-ghost hover:text-swp-ice" title="View"><Eye size={18} /></a>}
                {item.primary_link_url && <a href={item.primary_link_url} target="_blank" rel="noopener noreferrer" className="p-2 text-swp-white-ghost hover:text-swp-white" title="External"><ExternalLink size={18} /></a>}
                <button onClick={() => { setEditingItem(item); setShowModal(true); }} className="p-2 text-swp-white-ghost hover:text-swp-ice"><Edit2 size={18} /></button>
                <button onClick={() => handleDelete(item)} className="p-2 text-swp-white-ghost hover:text-red-400"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {showModal && <ProductModal item={editingItem} onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); fetchItems(); }} />}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PRODUCT MODAL — Product Page Builder
   Tabs: Basics | Pricing & Access | Content | Media | SEO
   ═══════════════════════════════════════════════════════════════ */

const MODAL_TABS = [
  { id: 'basics', label: 'Basics' },
  { id: 'pricing', label: 'Pricing & Access' },
  { id: 'content', label: 'Content' },
  { id: 'media', label: 'Media' },
  { id: 'seo', label: 'SEO' },
];

const derivePricingModel = (item) => {
  if (!item) return 'free';
  if (item.pricing_model) return item.pricing_model;
  if (item.is_free) return 'free';
  if (item.price) return 'one_time';
  return 'free';
};

const ProductModal = ({ item, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: item?.title || '', slug: item?.slug || '', item_type: item?.item_type || 'Apps',
    sort_order: item?.sort_order || 0, featured: item?.featured || false,
    is_published: item?.is_published ?? true, is_archived: item?.is_archived || false,
    pricing_model: derivePricingModel(item),
    price: item?.price || '', price_note: item?.price_note || '',
    monthly_price: item?.monthly_price || '', annual_price: item?.annual_price || '',
    billing_note: item?.billing_note || '', includes_trial: item?.includes_trial || false,
    trial_days: item?.trial_days || 14,
    primary_link_url: item?.primary_link_url || '', demo_url: item?.demo_url || '',
    file_url: item?.file_url || '',
    short_description: item?.short_description || '', what_it_is: item?.what_it_is || '',
    who_its_for: item?.who_its_for || [], core_actions: item?.core_actions || [],
    experiences: item?.experiences || [], features: item?.features || [],
    how_it_works: item?.how_it_works || [], how_it_works_notes: item?.how_it_works_notes || '',
    why_it_works: item?.why_it_works || '',
    final_cta_text: item?.final_cta_text || '', final_cta_microcopy: item?.final_cta_microcopy || '',
    tags: item?.tags || [],
    hero_image_url: item?.hero_image_url || '', thumbnail_url: item?.thumbnail_url || '',
    screenshots: item?.screenshots || [], video_url: item?.video_url || '',
    focus_keyword: item?.focus_keyword || '', seo_title: item?.seo_title || '',
    seo_description: item?.seo_description || '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('basics');
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [assetPickerField, setAssetPickerField] = useState(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!item?.slug);
  const [aiOverlayOpen, setAiOverlayOpen] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [sectionRegen, setSectionRegen] = useState({ loading: null, section: null, result: null });
  const [seoGenerating, setSeoGenerating] = useState(false);
  const [seoResult, setSeoResult] = useState(null);

  const set = (key, val) => setFormData(s => ({ ...s, [key]: val }));
  const isApp = formData.item_type === 'Apps';

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManuallyEdited && formData.title) {
      const slug = formData.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').trim();
      setFormData(s => ({ ...s, slug }));
    }
  }, [formData.title, slugManuallyEdited]);

  const openAssetPicker = (field) => { setAssetPickerField(field); setAssetPickerOpen(true); };
  const handleAssetSelect = (url) => {
    if (assetPickerField === 'screenshot') set('screenshots', [...formData.screenshots, url]);
    else if (assetPickerField) set(assetPickerField, url);
    toast.success('Asset selected');
  };

  const uploadFile = (e, field) => {
    const file = e.target.files[0]; if (!file) return;
    const fd = new FormData(); fd.append('file', file);
    fd.append('source', 'armory'); fd.append('tags', `armory,${formData.item_type},${field}`);
    setUploading(true);
    fetch(`${API}/api/upload/image`, { method: 'POST', body: fd })
      .then(r => r.ok ? r.json() : Promise.reject()).then(d => { set(field, d.url); toast.success('Uploaded'); })
      .catch(() => toast.error('Upload failed')).finally(() => setUploading(false));
  };
  const uploadScreenshot = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const fd = new FormData(); fd.append('file', file);
    fd.append('source', 'armory'); fd.append('tags', `armory,${formData.item_type},screenshot`);
    setUploading(true);
    fetch(`${API}/api/upload/image`, { method: 'POST', body: fd })
      .then(r => r.ok ? r.json() : Promise.reject()).then(d => { set('screenshots', [...formData.screenshots, d.url]); toast.success('Added'); })
      .catch(() => toast.error('Upload failed')).finally(() => setUploading(false));
  };
  
  const uploadDownloadFile = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const fd = new FormData(); fd.append('file', file);
    fd.append('source', 'armory'); fd.append('tags', `armory,${formData.item_type},download`);
    setUploading(true);
    fetch(`${API}/api/upload/file`, { method: 'POST', body: fd })
      .then(r => r.ok ? r.json() : Promise.reject()).then(d => { set('file_url', d.url); toast.success('File uploaded'); })
      .catch(() => toast.error('Upload failed')).finally(() => setUploading(false));
  };

  const save = async () => {
    if (!formData.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    const data = { ...formData, is_free: formData.pricing_model === 'free', price_status: formData.pricing_model === 'free' ? 'Free' : formData.price || '' };
    try {
      const url = item ? `${API}/api/den-items/${item.id}` : `${API}/api/den-items`;
      const r = await fetch(url, { method: item ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (r.ok) { toast.success(item ? 'Updated' : 'Created'); onSave(); } else toast.error('Failed');
    } catch { toast.error('Error'); } finally { setSaving(false); }
  };

  // ── Section-level AI regeneration ──
  const regenSection = async (section) => {
    setSectionRegen({ loading: section, section: null, result: null });
    try {
      const r = await fetch(`${API}/api/ai/regenerate-product-section`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, product_name: formData.title, product_type: formData.item_type, existing_content: formData })
      });
      if (!r.ok) throw new Error('Failed');
      const data = await r.json();
      setSectionRegen({ loading: null, section, result: data });
    } catch (err) {
      toast.error('Regeneration failed');
      setSectionRegen({ loading: null, section: null, result: null });
    }
  };

  const applySectionResult = (section) => {
    const r = sectionRegen.result;
    if (!r) return;
    if (section === 'cta') { set('final_cta_text', r.cta_text || ''); set('final_cta_microcopy', r.cta_microcopy || ''); }
    else {
      const fieldMap = { positioning_line: 'short_description', what_this_is: 'what_it_is', what_you_get: 'experiences' };
      const field = fieldMap[section] || section;
      set(field, r.value);
    }
    setSectionRegen({ loading: null, section: null, result: null });
    toast.success('Applied');
  };

  // ── SEO AI generation ──
  const generateSeo = async () => {
    setSeoGenerating(true);
    try {
      const r = await fetch(`${API}/api/ai/generate-product-seo`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: formData.title, positioning_line: formData.short_description, what_this_is: formData.what_it_is, tags: formData.tags })
      });
      if (!r.ok) throw new Error('Failed');
      const data = await r.json();
      setSeoResult(data);
    } catch { toast.error('SEO generation failed'); }
    finally { setSeoGenerating(false); }
  };

  const applySeoResult = (fields) => {
    if (!seoResult) return;
    const updates = {};
    if (fields.includes('all') || fields.includes('focus_keyword')) updates.focus_keyword = seoResult.focus_keyword || '';
    if (fields.includes('all') || fields.includes('seo_title')) updates.seo_title = seoResult.seo_title || '';
    if (fields.includes('all') || fields.includes('seo_description')) updates.seo_description = seoResult.seo_description || '';
    setFormData(s => ({ ...s, ...updates }));
    if (fields.includes('all')) setSeoResult(null);
    toast.success('SEO applied');
  };

  const imgUrl = (u) => u && (u.startsWith('http') ? u : `${API}${u}`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-swp-deep/90 overflow-y-auto">
      <div className="bg-swp-surface border border-swp-border rounded-swp w-full max-w-3xl my-8 max-h-[90vh] overflow-hidden flex flex-col" data-testid="product-modal">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-0 flex-shrink-0">
          <div><h3 className="text-lg font-bold text-white">{item ? 'Edit' : 'New'} Product</h3><p className="text-swp-white-ghost/50 text-xs">Product Page Builder</p></div>
          <button onClick={onClose} className="p-2 text-swp-white-ghost hover:text-swp-white"><X size={20} /></button>
        </div>
        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-4 pb-4 overflow-x-auto flex-shrink-0">
          {MODAL_TABS.map(tab => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm whitespace-nowrap rounded-sm transition-colors ${activeTab === tab.id ? 'bg-swp-ice text-white' : 'bg-swp-surface text-swp-white-ghost hover:text-swp-white'}`}
              data-testid={`tab-${tab.id}`}>{tab.label}</button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ─── BASICS ─── */}
          {activeTab === 'basics' && (
            <div className="space-y-4">
              <Fl label="Product Title *" helper="Main product name displayed everywhere">
                <TI value={formData.title} onChange={e => set('title', e.target.value)} placeholder="e.g. House Heroes" data-testid="input-title" />
              </Fl>
              <Fl label="URL Slug" helper="Auto-generated from title. Edit to customize.">
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center">
                    <span className="text-swp-white-ghost/70 bg-swp-black px-3 py-2 border border-r-0 border-swp-border rounded-l-lg text-xs font-mono">/armory/</span>
                    <input type="text" value={formData.slug} onChange={e => { setSlugManuallyEdited(true); set('slug', e.target.value); }}
                      className="flex-1 bg-swp-black border border-swp-border rounded-r-lg px-3 py-2 text-white font-mono text-sm focus:border-swp-ice focus:outline-none" placeholder="house-heroes" data-testid="input-slug" />
                  </div>
                </div>
              </Fl>
              <div className="grid grid-cols-2 gap-4">
                <Fl label="Product Type *" helper="Determines content sections shown">
                  <select value={formData.item_type} onChange={e => set('item_type', e.target.value)} className="w-full bg-swp-black border border-swp-border rounded-swp px-4 py-2 text-white text-sm" data-testid="select-type">
                    {ITEM_TYPES.map(t => <option key={t} value={t}>{t.replace(/s$/, '')}</option>)}
                  </select>
                </Fl>
                <Fl label="Sort Order" helper="Lower numbers appear first">
                  <TI type="number" value={formData.sort_order} onChange={e => set('sort_order', parseInt(e.target.value) || 0)} />
                </Fl>
              </div>
              <div className="flex flex-wrap gap-5 pt-1">
                {[{ k: 'featured', l: 'Featured' }, { k: 'is_published', l: 'Published' }, { k: 'is_archived', l: 'Archived' }].map(({ k, l }) => (
                  <label key={k} className="flex items-center gap-2 text-swp-white-ghost text-sm cursor-pointer">
                    <input type="checkbox" checked={formData[k]} onChange={e => set(k, e.target.checked)} className="rounded" /> {l}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ─── PRICING & ACCESS ─── */}
          {activeTab === 'pricing' && (
            <div className="space-y-5">
              <Fl label="Pricing Model *" helper="Determines what pricing fields are shown">
                <select value={formData.pricing_model} onChange={e => set('pricing_model', e.target.value)} className="w-full bg-swp-black border border-swp-border rounded-swp px-4 py-2 text-white text-sm" data-testid="select-pricing-model">
                  <option value="free">Free</option>
                  <option value="one_time">One-time Purchase</option>
                  <option value="subscription">Subscription</option>
                </select>
              </Fl>
              {formData.pricing_model === 'one_time' && (
                <div className="grid grid-cols-2 gap-4 bg-swp-deep/50 rounded-swp p-4 border border-swp-border/50">
                  <Fl label="Price *" helper="e.g. A$29, $99">
                    <TI value={formData.price} onChange={e => set('price', e.target.value)} placeholder="A$29" data-testid="input-price" />
                  </Fl>
                  <Fl label="Price Note" helper="e.g. lifetime access, one-time">
                    <TI value={formData.price_note} onChange={e => set('price_note', e.target.value)} placeholder="Lifetime access" />
                  </Fl>
                </div>
              )}
              {formData.pricing_model === 'subscription' && (
                <div className="bg-swp-deep/50 rounded-swp p-4 border border-swp-border/50 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Fl label="Monthly Price" helper="e.g. A$9/mo">
                      <TI value={formData.monthly_price} onChange={e => set('monthly_price', e.target.value)} placeholder="A$9/mo" />
                    </Fl>
                    <Fl label="Annual Price" helper="e.g. A$89/yr">
                      <TI value={formData.annual_price} onChange={e => set('annual_price', e.target.value)} placeholder="A$89/yr" />
                    </Fl>
                  </div>
                  <Fl label="Billing Note" helper="e.g. Billed annually, cancel anytime">
                    <TI value={formData.billing_note} onChange={e => set('billing_note', e.target.value)} placeholder="Cancel anytime" />
                  </Fl>
                  <div>
                    <label className="flex items-center gap-2 text-swp-white-ghost text-sm cursor-pointer">
                      <input type="checkbox" checked={formData.includes_trial} onChange={e => set('includes_trial', e.target.checked)} className="rounded" /> Includes Trial?
                    </label>
                    {formData.includes_trial && (
                      <div className="mt-3 ml-6">
                        <Fl label="Trial Days">
                          <TI type="number" value={formData.trial_days} onChange={e => set('trial_days', parseInt(e.target.value) || 0)} placeholder="14" />
                        </Fl>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <hr className="border-swp-border" />
              <Fl label="Primary Access URL *" helper="App store, checkout page, or external link">
                <TI type="url" value={formData.primary_link_url} onChange={e => set('primary_link_url', e.target.value)} placeholder="https://apps.apple.com/..." data-testid="input-primary-url" />
              </Fl>
              <Fl label="Demo / Preview URL" helper="Optional. Let users try before buying.">
                <TI type="url" value={formData.demo_url} onChange={e => set('demo_url', e.target.value)} placeholder="https://demo.example.com" />
              </Fl>
              {(formData.item_type === 'Downloads' || formData.item_type === 'eBooks' || formData.item_type === 'Courses') && (
                <div className="bg-swp-deep/50 rounded-swp p-4 border border-swp-border/50 space-y-4">
                  <p className="text-swp-white-ghost/70 text-[10px] font-mono uppercase tracking-widest">Downloadable File</p>
                  <Fl label="Upload File" helper="Upload a file for users to download (PDF, ZIP, etc.)">
                    <div className="space-y-3">
                      {formData.file_url && (
                        <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-swp p-3">
                          <Check size={16} className="text-green-400" />
                          <span className="text-green-400 text-sm flex-1 truncate">{formData.file_url.split('/').pop()}</span>
                          <button type="button" onClick={() => set('file_url', '')} className="text-swp-white-ghost hover:text-red-400">
                            <X size={16} />
                          </button>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-swp-surface border border-swp-border rounded-swp text-swp-white-ghost hover:text-swp-white hover:border-gray-600 cursor-pointer transition-all">
                          <Upload size={16} />
                          <span className="text-sm">{uploading ? 'Uploading...' : 'Upload File'}</span>
                          <input type="file" className="hidden" onChange={e => uploadDownloadFile(e)} disabled={uploading} data-testid="upload-download-file" />
                        </label>
                        <button type="button" onClick={() => openAssetPicker('file_url')} className="flex items-center gap-2 px-4 py-3 bg-swp-surface border border-swp-border rounded-swp text-swp-white-ghost hover:text-swp-white hover:border-gray-600 transition-all">
                          <FolderOpen size={16} />
                          <span className="text-sm">Asset Library</span>
                        </button>
                      </div>
                      <div className="relative">
                        <span className="text-swp-white-ghost/70 text-xs absolute left-0 -top-5">Or enter URL manually:</span>
                        <TI value={formData.file_url} onChange={e => set('file_url', e.target.value)} placeholder="/api/upload/files/document.pdf" />
                      </div>
                    </div>
                  </Fl>
                </div>
              )}
            </div>
          )}

          {/* ─── PRODUCT PAGE CONTENT ─── */}
          {activeTab === 'content' && (
            <div className="space-y-5">
              {/* AI Generate Button */}
              <button type="button" onClick={() => setAiOverlayOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-electric-blue/10 to-purple-500/10 border border-swp-ice/30 rounded-swp text-swp-ice text-sm hover:from-electric-blue/20 hover:to-purple-500/20 transition-all"
                data-testid="ai-generate-content-btn">
                <Sparkles size={16} /> Generate Product Page Content
              </button>

              {/* Hero Section */}
              <div className="bg-swp-deep/50 rounded-swp p-4 space-y-4 border border-swp-border/50">
                <p className="text-swp-white-ghost/70 text-[10px] font-mono uppercase tracking-widest">Hero / Above the Fold</p>
                <FieldWithRegen label="Positioning Line" helper="One punchy line under the product name" section="positioning_line" sectionRegen={sectionRegen} onRegen={regenSection} onApply={applySectionResult} onDismiss={() => setSectionRegen({ loading: null, section: null, result: null })}>
                  <TI value={formData.short_description} onChange={e => set('short_description', e.target.value)} placeholder="One-line positioning statement" data-testid="input-positioning" />
                </FieldWithRegen>
              </div>

              {/* What This Is */}
              <FieldWithRegen label="What This Is" helper="What it is, who it's for, what it solves. 1-2 paragraphs (max 600 chars)." section="what_this_is" sectionRegen={sectionRegen} onRegen={regenSection} onApply={applySectionResult} onDismiss={() => setSectionRegen({ loading: null, section: null, result: null })}>
                <TexA value={formData.what_it_is} onChange={e => set('what_it_is', e.target.value)} placeholder="[Product] is a [tool/app/course] designed to help [who] [achieve outcome]..." rows={3} />
                <p className="text-swp-white-ghost/50 text-xs mt-1">{(formData.what_it_is || '').length}/600</p>
              </FieldWithRegen>

              {/* Who It's For */}
              <ListEditor label="Who It's For" helper="Audience descriptors" items={formData.who_its_for} onChange={v => set('who_its_for', v)} placeholder="e.g. Indie filmmakers" />

              {/* Conditional Sections */}
              {isApp ? (
                <>
                  <FieldWithRegen label="Features" helper="Scannable feature grid on the product page" section="features" sectionRegen={sectionRegen} onRegen={regenSection} onApply={applySectionResult} onDismiss={() => setSectionRegen({ loading: null, section: null, result: null })} isList>
                    <ListEditor items={formData.features} onChange={v => set('features', v)} placeholder="e.g. Offline mode" />
                  </FieldWithRegen>
                  <ListEditor label="Core Actions" helper="Short, scannable steps" items={formData.core_actions} onChange={v => set('core_actions', v)} placeholder="e.g. Create a room" />
                  <ListEditor label="How It Works" helper="Optional numbered flow" items={formData.how_it_works} onChange={v => set('how_it_works', v)} placeholder="e.g. Open the app" />
                </>
              ) : (
                <>
                  <FieldWithRegen label="What You Get" helper="Deliverables, outcomes, or experiences" section="what_you_get" sectionRegen={sectionRegen} onRegen={regenSection} onApply={applySectionResult} onDismiss={() => setSectionRegen({ loading: null, section: null, result: null })} isList>
                    <ListEditor items={formData.experiences} onChange={v => set('experiences', v)} placeholder="e.g. Downloadable resources" />
                  </FieldWithRegen>
                  <ListEditor label="How It Works" helper="Numbered flow from start to outcome" items={formData.how_it_works} onChange={v => set('how_it_works', v)} placeholder="e.g. Enrol and get instant access" />
                  <ListEditor label="Features" helper="Optional additional features" items={formData.features} onChange={v => set('features', v)} placeholder="e.g. Lifetime access" />
                </>
              )}

              <Fl label="How It Works — Notes" helper="2-3 short clarifying lines">
                <TexA value={formData.how_it_works_notes} onChange={e => set('how_it_works_notes', e.target.value)} placeholder="Everything updates in real time..." rows={2} />
              </Fl>
              <Fl label="Why It Works" helper="Optional. Max 300 characters.">
                <TexA value={formData.why_it_works} onChange={e => set('why_it_works', e.target.value)} placeholder="Built by practitioners, not theorists..." rows={2} />
                <p className="text-swp-white-ghost/50 text-xs mt-1">{(formData.why_it_works || '').length}/300</p>
              </Fl>

              {/* Final CTA */}
              <div className="bg-swp-deep/50 rounded-swp p-4 space-y-4 border border-swp-border/50">
                <p className="text-swp-white-ghost/70 text-[10px] font-mono uppercase tracking-widest">Final CTA</p>
                <FieldWithRegen label="CTA Text" helper="Reinforce action at the bottom of the page" section="cta" sectionRegen={sectionRegen} onRegen={regenSection} onApply={applySectionResult} onDismiss={() => setSectionRegen({ loading: null, section: null, result: null })}>
                  <TI value={formData.final_cta_text} onChange={e => set('final_cta_text', e.target.value)} placeholder="[Product] is ready when you are." />
                </FieldWithRegen>
                <Fl label="CTA Microcopy" helper="One line of reassurance below the button">
                  <TI value={formData.final_cta_microcopy} onChange={e => set('final_cta_microcopy', e.target.value)} placeholder="No subscriptions. No ads. No lock-in." />
                </Fl>
              </div>

              <TagEditor label="Tags / Use Cases" helper="Pill keywords for scanning + SEO" tags={formData.tags} onChange={v => set('tags', v)} />
            </div>
          )}

          {/* ─── MEDIA ─── */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <Fl label="Hero Image" helper="Appears in product header and Armory grid. Ideal: 800 x 800px (square, auto-fit)">
                <div className="flex items-start gap-4 flex-wrap">
                  {formData.hero_image_url && (
                    <div className="relative">
                      <img src={imgUrl(formData.hero_image_url)} alt="" className="w-48 h-28 object-cover rounded-swp" />
                      <button type="button" onClick={() => set('hero_image_url', '')} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-sm flex items-center justify-center"><X size={12} /></button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <label className="flex items-center gap-2 px-4 py-2 bg-swp-black border border-swp-border rounded-swp cursor-pointer hover:bg-gray-900 text-sm">
                      <Upload size={16} className="text-swp-white-ghost" /><span className="text-swp-white-ghost">{uploading ? 'Uploading...' : 'Upload'}</span>
                      <input type="file" accept="image/*" onChange={e => uploadFile(e, 'hero_image_url')} className="hidden" />
                    </label>
                    <button type="button" onClick={() => openAssetPicker('hero_image_url')} className="flex items-center gap-2 px-4 py-2 bg-swp-ice/10 border border-swp-ice/30 rounded-swp text-swp-ice text-sm hover:bg-swp-ice/15">
                      <FolderOpen size={16} /> Browse Library
                    </button>
                  </div>
                </div>
              </Fl>
              <Fl label="Screenshots Gallery" helper="Optional gallery images on the product page">
                <div className="flex flex-wrap gap-3 mb-3">
                  {formData.screenshots.map((s, i) => (
                    <div key={i} className="relative">
                      <img src={imgUrl(s)} alt="" className="w-24 h-16 object-cover rounded-swp" />
                      <button type="button" onClick={() => set('screenshots', formData.screenshots.filter((_, j) => j !== i))} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-sm flex items-center justify-center"><X size={12} /></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-swp-black border border-swp-border rounded-swp cursor-pointer hover:bg-gray-900 text-sm">
                    <Upload size={16} className="text-swp-white-ghost" /><span className="text-swp-white-ghost">{uploading ? 'Uploading...' : 'Add Screenshot'}</span>
                    <input type="file" accept="image/*" onChange={uploadScreenshot} className="hidden" />
                  </label>
                  <button type="button" onClick={() => openAssetPicker('screenshot')} className="flex items-center gap-2 px-4 py-2 bg-swp-ice/10 border border-swp-ice/30 rounded-swp text-swp-ice text-sm hover:bg-swp-ice/15">
                    <FolderOpen size={16} /> Browse Library
                  </button>
                </div>
              </Fl>
              <Fl label="Video Embed URL" helper="YouTube or Vimeo embed URL">
                <TI type="url" value={formData.video_url} onChange={e => set('video_url', e.target.value)} placeholder="https://www.youtube.com/embed/..." />
              </Fl>
            </div>
          )}

          {/* ─── SEO ─── */}
          {activeTab === 'seo' && (
            <div className="space-y-5">
              <FieldWithRegen label="Focus Keyword" helper="Primary keyword for SEO" section="focus_keyword" sectionRegen={sectionRegen} onRegen={regenSection} onApply={applySectionResult} onDismiss={() => setSectionRegen({ loading: null, section: null, result: null })}>
                <TI value={formData.focus_keyword} onChange={e => set('focus_keyword', e.target.value)} placeholder="e.g. filmmaking app" data-testid="input-focus-keyword" />
              </FieldWithRegen>

              <FieldWithRegen label="SEO Title" helper={`${(formData.seo_title || '').length}/60 chars`} section="seo_title" sectionRegen={sectionRegen} onRegen={regenSection} onApply={applySectionResult} onDismiss={() => setSectionRegen({ loading: null, section: null, result: null })}>
                <TI value={formData.seo_title} onChange={e => set('seo_title', e.target.value)} placeholder="Override page title for search engines..." data-testid="input-seo-title" />
                <div className="w-full bg-gray-800 rounded-sm h-1 mt-2">
                  <div className={`h-1 rounded-sm ${(formData.seo_title||'').length>60?'bg-red-500':(formData.seo_title||'').length>=30?'bg-green-500':'bg-yellow-500'}`} style={{width:`${Math.min(((formData.seo_title||'').length/60)*100,100)}%`}} />
                </div>
              </FieldWithRegen>

              <FieldWithRegen label="SEO Description" helper={`${(formData.seo_description || '').length}/160 chars`} section="seo_description" sectionRegen={sectionRegen} onRegen={regenSection} onApply={applySectionResult} onDismiss={() => setSectionRegen({ loading: null, section: null, result: null })}>
                <TexA value={formData.seo_description} onChange={e => set('seo_description', e.target.value)} placeholder="Meta description..." rows={3} />
                <div className="w-full bg-gray-800 rounded-sm h-1 mt-2">
                  <div className={`h-1 rounded-sm ${(formData.seo_description||'').length>160?'bg-red-500':(formData.seo_description||'').length>=100?'bg-green-500':'bg-yellow-500'}`} style={{width:`${Math.min(((formData.seo_description||'').length/160)*100,100)}%`}} />
                </div>
              </FieldWithRegen>

              {/* Google Preview */}
              <div className="bg-swp-deep/70 rounded-swp p-4 border border-swp-border">
                <p className="text-swp-white-ghost/50 text-[10px] font-mono uppercase tracking-widest mb-3">Google Preview</p>
                <p className="text-[#8ab4f8] text-base font-medium truncate">{formData.seo_title || formData.title || 'Product Title'} | Shadow Wolves</p>
                <p className="text-[#bdc1c6] text-xs truncate">shadowwolvesproductions.com.au /armory/{formData.slug || 'product-slug'}</p>
                <p className="text-[#969ba1] text-sm line-clamp-2 mt-0.5">{formData.seo_description || formData.short_description || formData.what_it_is || 'Description...'}</p>
              </div>

              {/* SEO Checklist */}
              <div className="bg-swp-deep/50 rounded-swp p-4 border border-swp-border/50 space-y-2">
                <p className="text-swp-white-ghost/70 text-[10px] font-mono uppercase tracking-widest mb-2">SEO Checklist</p>
                <SeoCheck ok={(formData.seo_title||'').length>=30&&(formData.seo_title||'').length<=60} label="Title length optimal (30-60)" />
                <SeoCheck ok={(formData.seo_description||'').length>=100&&(formData.seo_description||'').length<=160} label="Description length optimal (100-160)" />
                <SeoCheck ok={!!formData.slug} label="Slug set" />
                <SeoCheck ok={formData.focus_keyword&&(formData.seo_title||'').toLowerCase().includes((formData.focus_keyword||'').toLowerCase())} label="Focus keyword present in title" />
                <SeoCheck ok={formData.tags?.length>0} label="Tags added" />
              </div>

              {/* Generate SEO from Content */}
              <button type="button" onClick={generateSeo} disabled={seoGenerating}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-electric-blue/10 to-purple-500/10 border border-swp-ice/30 rounded-swp text-swp-ice text-sm hover:from-electric-blue/20 hover:to-purple-500/20 transition-all disabled:opacity-50"
                data-testid="ai-seo-generate-btn">
                {seoGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {seoGenerating ? 'Generating...' : 'Generate SEO from Content'}
              </button>

              {/* SEO AI Result Preview */}
              {seoResult && (
                <div className="bg-swp-ice/5 border border-swp-ice/15 rounded-swp p-4 space-y-3" data-testid="seo-result-preview">
                  <p className="text-white text-sm font-medium flex items-center gap-2"><Sparkles size={14} className="text-swp-ice" /> AI-Generated SEO</p>
                  <SeoPreviewItem label="Focus Keyword" value={seoResult.focus_keyword} onApply={() => applySeoResult(['focus_keyword'])} />
                  <SeoPreviewItem label="SEO Title" value={seoResult.seo_title} onApply={() => applySeoResult(['seo_title'])} />
                  <SeoPreviewItem label="SEO Description" value={seoResult.seo_description} onApply={() => applySeoResult(['seo_description'])} />
                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => applySeoResult(['all'])} className="flex-1 px-4 py-2 bg-swp-ice text-white rounded-swp text-sm hover:bg-swp-ice">Apply All</button>
                    <button type="button" onClick={() => setSeoResult(null)} className="px-4 py-2 border border-swp-border text-swp-white-ghost rounded-swp text-sm hover:text-swp-white">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-swp-border bg-swp-deep/50 flex-shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2 border border-swp-border text-swp-white-ghost rounded-swp hover:text-swp-white text-sm">Cancel</button>
          <button onClick={save} disabled={saving} className="px-6 py-2 bg-swp-ice hover:bg-swp-ice disabled:bg-swp-muted text-white rounded-swp text-sm" data-testid="product-save-btn">
            {saving ? 'Saving...' : (item ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      </div>

      {/* Asset Picker */}
      <AssetPicker isOpen={assetPickerOpen} onClose={() => setAssetPickerOpen(false)} onSelect={handleAssetSelect} assetType="image" title="Select Image from Library" />

      {/* AI Content Generation Overlay */}
      {aiOverlayOpen && (
        <AIOverlay
          formData={formData}
          onClose={() => { setAiOverlayOpen(false); setAiResult(null); }}
          aiResult={aiResult}
          setAiResult={setAiResult}
          onApply={(result, selectedSections) => {
            const updates = {};
            const fm = { positioning_line: 'short_description', what_this_is: 'what_it_is', what_you_get: 'experiences' };
            for (const key of selectedSections) {
              if (key === 'cta_text') updates.final_cta_text = result.cta_text || '';
              else if (key === 'cta_microcopy') updates.final_cta_microcopy = result.cta_microcopy || '';
              else { const field = fm[key] || key; updates[field] = result[key]; }
            }
            setFormData(s => ({ ...s, ...updates }));
            setAiOverlayOpen(false);
            setAiResult(null);
            toast.success('AI content applied');
          }}
        />
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   AI CONTENT GENERATION OVERLAY
   ═══════════════════════════════════════════════════════════════ */

const AIOverlay = ({ formData, onClose, aiResult, setAiResult, onApply }) => {
  const [inputs, setInputs] = useState({
    product_name: formData.title || '',
    product_type: formData.item_type || 'Apps',
    pricing_model: formData.pricing_model || 'free',
    price: formData.price || '',
    primary_url: formData.primary_link_url || '',
    short_description: formData.short_description || formData.what_it_is?.slice(0, 200) || '',
    who_its_for: (formData.who_its_for || []).join(', '),
    key_outcomes: '',
    tone: 'Cinematic, direct, no fluff',
    constraints: '',
  });
  const [generating, setGenerating] = useState(false);
  const [selected, setSelected] = useState({});
  const isApp = inputs.product_type === 'Apps';

  const generate = async () => {
    if (!inputs.product_name || !inputs.short_description) { toast.error('Product Name and Short Description are required'); return; }
    setGenerating(true);
    try {
      const r = await fetch(`${API}/api/ai/generate-product-content`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs)
      });
      if (!r.ok) { const err = await r.json().catch(() => ({})); throw new Error(err.detail || 'Generation failed'); }
      const data = await r.json();
      setAiResult(data);
      // Select all by default
      const keys = Object.keys(data);
      const sel = {};
      keys.forEach(k => { sel[k] = true; });
      setSelected(sel);
    } catch (err) { toast.error(err.message || 'AI generation failed'); }
    finally { setGenerating(false); }
  };

  const toggleSection = (key) => setSelected(s => ({ ...s, [key]: !s[key] }));

  const sectionLabels = {
    positioning_line: 'Positioning Line', what_this_is: 'What This Is', who_its_for: 'Who It\'s For',
    features: 'Features', core_actions: 'Core Actions', what_you_get: 'What You Get', how_it_works: 'How It Works',
    how_it_works_notes: 'How It Works Notes', cta_text: 'CTA Text', cta_microcopy: 'CTA Microcopy',
    tags: 'Tags', focus_keyword: 'Focus Keyword', seo_title: 'SEO Title', seo_description: 'SEO Description',
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-swp-black/90" data-testid="ai-overlay">
      <div className="bg-[#111] border border-swp-border rounded-swp w-full max-w-xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-swp-border">
          <h3 className="text-white font-bold flex items-center gap-2"><Sparkles size={18} className="text-swp-ice" /> {aiResult ? 'Generated Content' : 'Generate Product Page Content'}</h3>
          <button onClick={onClose} className="p-1 text-swp-white-ghost hover:text-swp-white"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!aiResult ? (
            <div className="space-y-4">
              <p className="text-swp-white-ghost/70 text-xs mb-4">Fill in the required fields below. AI will generate all content sections.</p>
              <div className="space-y-3">
                <p className="text-swp-white-ghost text-xs font-mono uppercase tracking-wider">Required</p>
                <AIInput label="Product Name" value={inputs.product_name} onChange={v => setInputs(s => ({ ...s, product_name: v }))} required />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-swp-white-ghost text-xs mb-1">Product Type</label>
                    <select value={inputs.product_type} onChange={e => setInputs(s => ({ ...s, product_type: e.target.value }))} className="w-full bg-swp-black border border-swp-border rounded-swp px-3 py-2 text-white text-sm">
                      {ITEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-swp-white-ghost text-xs mb-1">Pricing Model</label>
                    <select value={inputs.pricing_model} onChange={e => setInputs(s => ({ ...s, pricing_model: e.target.value }))} className="w-full bg-swp-black border border-swp-border rounded-swp px-3 py-2 text-white text-sm">
                      <option value="free">Free</option><option value="one_time">One-time</option><option value="subscription">Subscription</option>
                    </select>
                  </div>
                </div>
                {inputs.pricing_model !== 'free' && <AIInput label="Price" value={inputs.price} onChange={v => setInputs(s => ({ ...s, price: v }))} placeholder="A$29" />}
                <AIInput label="Primary Access URL" value={inputs.primary_url} onChange={v => setInputs(s => ({ ...s, primary_url: v }))} placeholder="https://..." />
                <div>
                  <label className="block text-swp-white-ghost text-xs mb-1">Short Description *</label>
                  <textarea value={inputs.short_description} onChange={e => setInputs(s => ({ ...s, short_description: e.target.value }))} rows={2} placeholder="1-2 sentences about what this product does..." className="w-full bg-swp-black border border-swp-border rounded-swp px-3 py-2 text-white text-sm resize-none focus:border-swp-ice focus:outline-none" />
                </div>
              </div>
              <div className="space-y-3 pt-2">
                <p className="text-swp-white-ghost text-xs font-mono uppercase tracking-wider">Optional</p>
                <AIInput label="Who it's for" value={inputs.who_its_for} onChange={v => setInputs(s => ({ ...s, who_its_for: v }))} placeholder="e.g. Indie filmmakers, content creators" />
                <AIInput label="Key outcomes" value={inputs.key_outcomes} onChange={v => setInputs(s => ({ ...s, key_outcomes: v }))} placeholder="What users achieve..." />
                <AIInput label="Tone" value={inputs.tone} onChange={v => setInputs(s => ({ ...s, tone: v }))} />
                <AIInput label="Constraints" value={inputs.constraints} onChange={v => setInputs(s => ({ ...s, constraints: v }))} placeholder="e.g. no ads, lifetime access" />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-swp-white-ghost/70 text-xs mb-3">Review generated content. Toggle sections to include/exclude, then apply.</p>
              {Object.entries(aiResult).map(([key, value]) => {
                if (!sectionLabels[key]) return null;
                const isChecked = selected[key] ?? true;
                return (
                  <div key={key} className={`rounded-swp border p-3 transition-colors cursor-pointer ${isChecked ? 'border-swp-ice/25 bg-swp-ice/5' : 'border-swp-border bg-swp-deep/50 opacity-60'}`}
                    onClick={() => toggleSection(key)} data-testid={`ai-section-${key}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${isChecked ? 'bg-swp-ice border-swp-ice' : 'border-gray-600'}`}>
                        {isChecked && <Check size={10} className="text-white" />}
                      </div>
                      <span className="text-swp-white-dim text-xs font-mono uppercase tracking-wider">{sectionLabels[key]}</span>
                    </div>
                    <p className="text-white text-sm ml-6 line-clamp-2">{Array.isArray(value) ? value.join(' / ') : String(value)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 p-4 border-t border-swp-border">
          {!aiResult ? (
            <>
              <button type="button" onClick={onClose} className="px-4 py-2 border border-swp-border text-swp-white-ghost rounded-swp text-sm hover:text-swp-white">Cancel</button>
              <button type="button" onClick={generate} disabled={generating} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-swp-ice text-white rounded-swp text-sm hover:bg-swp-ice disabled:opacity-50" data-testid="ai-generate-btn">
                {generating ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : <><Sparkles size={16} /> Generate</>}
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => setAiResult(null)} className="px-4 py-2 border border-swp-border text-swp-white-ghost rounded-swp text-sm hover:text-swp-white">Back</button>
              <button type="button" onClick={onClose} className="px-4 py-2 border border-swp-border text-swp-white-ghost rounded-swp text-sm hover:text-swp-white">Cancel</button>
              <button type="button" onClick={() => onApply(aiResult, Object.keys(selected).filter(k => selected[k]))}
                className="flex-1 px-4 py-2 bg-swp-ice text-white rounded-swp text-sm hover:bg-swp-ice" data-testid="ai-apply-btn">
                Apply Selected ({Object.values(selected).filter(Boolean).length})
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ═══ Shared UI Components ═══ */

const Fl = ({ label, helper, children }) => (
  <div><label className="block text-swp-white-ghost text-sm mb-1">{label}</label>{children}{helper && <p className="text-swp-white-ghost/50 text-xs mt-1">{helper}</p>}</div>
);

const TI = ({ value, onChange, placeholder, ...p }) => (
  <input type="text" value={value} onChange={onChange} placeholder={placeholder} className="w-full bg-swp-black border border-swp-border rounded-swp px-4 py-2 text-white text-sm focus:border-swp-ice focus:outline-none" {...p} />
);

const TexA = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} className="w-full bg-swp-black border border-swp-border rounded-swp px-4 py-2 text-white text-sm resize-none focus:border-swp-ice focus:outline-none" />
);

const SeoCheck = ({ ok, label }) => (
  <div className="flex items-center gap-2 text-sm">
    <span className={`w-4 h-4 rounded-sm flex items-center justify-center text-xs ${ok ? 'bg-green-500/20 text-green-400' : 'bg-gray-700/50 text-swp-white-ghost/70'}`}>{ok ? '\u2713' : '\u2013'}</span>
    <span className={ok ? 'text-swp-white-dim' : 'text-swp-white-ghost/70'}>{label}</span>
  </div>
);

const AIInput = ({ label, value, onChange, placeholder, required }) => (
  <div>
    <label className="block text-swp-white-ghost text-xs mb-1">{label}{required && ' *'}</label>
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-swp-black border border-swp-border rounded-swp px-3 py-2 text-white text-sm focus:border-swp-ice focus:outline-none" />
  </div>
);

const SeoPreviewItem = ({ label, value, onApply }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 min-w-0">
      <p className="text-swp-white-ghost/70 text-xs">{label}</p>
      <p className="text-white text-sm truncate">{value}</p>
    </div>
    <button type="button" onClick={onApply} className="px-3 py-1 text-swp-ice text-xs border border-swp-ice/30 rounded hover:bg-swp-ice/10">Apply</button>
  </div>
);

/* ─── Field with inline AI regeneration sparkle ─── */
const FieldWithRegen = ({ label, helper, section, sectionRegen, onRegen, onApply, onDismiss, children, isList }) => {
  const isLoading = sectionRegen.loading === section;
  const hasResult = sectionRegen.section === section && sectionRegen.result;

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <label className="block text-swp-white-ghost text-sm">{label}</label>
        <button type="button" onClick={() => onRegen(section)} disabled={isLoading}
          className="p-0.5 text-swp-white-ghost/50 hover:text-swp-ice transition-colors disabled:opacity-50" title="Regenerate with AI" data-testid={`regen-${section}`}>
          {isLoading ? <Loader2 size={13} className="animate-spin text-swp-ice" /> : <Sparkles size={13} />}
        </button>
      </div>
      {children}
      {helper && !isList && <p className="text-swp-white-ghost/50 text-xs mt-1">{helper}</p>}
      {hasResult && (
        <div className="mt-2 bg-swp-ice/5 border border-swp-ice/15 rounded-swp p-3" data-testid={`regen-preview-${section}`}>
          <p className="text-swp-white-ghost/70 text-[10px] font-mono uppercase tracking-wider mb-1">AI Suggestion</p>
          <p className="text-white text-sm mb-2">
            {section === 'cta'
              ? `${sectionRegen.result.cta_text || ''} / ${sectionRegen.result.cta_microcopy || ''}`
              : Array.isArray(sectionRegen.result.value) ? sectionRegen.result.value.join(' / ') : sectionRegen.result.value}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={() => onApply(section)} className="px-3 py-1 bg-swp-ice text-white text-xs rounded hover:bg-swp-ice">Apply</button>
            <button type="button" onClick={onDismiss} className="px-3 py-1 border border-swp-border text-swp-white-ghost text-xs rounded hover:text-swp-white">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

const ListEditor = ({ label, helper, items, onChange, placeholder }) => {
  const [val, setVal] = useState('');
  const [editIdx, setEditIdx] = useState(-1);
  const [editVal, setEditVal] = useState('');
  const add = () => { if (val.trim()) { onChange([...items, val.trim()]); setVal(''); } };
  const startEdit = (i) => { setEditIdx(i); setEditVal(items[i]); };
  const saveEdit = () => { if (editVal.trim()) { const next = [...items]; next[editIdx] = editVal.trim(); onChange(next); } setEditIdx(-1); };
  return (
    <div>
      {label && <label className="block text-swp-white-ghost text-sm mb-1">{label}</label>}
      {helper && <p className="text-swp-white-ghost/50 text-xs mb-2">{helper}</p>}
      <div className="space-y-1.5 mb-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 bg-swp-black border border-swp-border rounded-swp px-3 py-1.5 text-sm">
            <span className="text-swp-white-ghost/70 font-mono w-5">{i+1}.</span>
            {editIdx === i ? (
              <input type="text" value={editVal} onChange={e => setEditVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveEdit()} onBlur={saveEdit} autoFocus className="flex-1 bg-transparent text-white outline-none" />
            ) : (
              <span className="text-white flex-1 cursor-pointer" onClick={() => startEdit(i)}>{item}</span>
            )}
            <button type="button" onClick={() => onChange(items.filter((_,j)=>j!==i))} className="text-swp-white-ghost hover:text-red-400"><X size={14} /></button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="text" value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key==='Enter'&&(e.preventDefault(),add())} className="flex-1 bg-swp-black border border-swp-border rounded-swp px-3 py-1.5 text-white text-sm focus:border-swp-ice focus:outline-none" placeholder={placeholder} />
        <button type="button" onClick={add} className="px-3 py-1.5 bg-swp-ice text-white rounded-swp text-sm">Add</button>
      </div>
    </div>
  );
};

const TagEditor = ({ label, helper, tags, onChange }) => {
  const [val, setVal] = useState('');
  const add = () => { if (val.trim() && !tags.includes(val.trim())) { onChange([...tags, val.trim()]); setVal(''); } };
  return (
    <div>
      <label className="block text-swp-white-ghost text-sm mb-1">{label}</label>
      {helper && <p className="text-swp-white-ghost/50 text-xs mb-2">{helper}</p>}
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, i) => (
          <span key={i} className="flex items-center gap-1 bg-white/5 border border-swp-border px-3 py-1 rounded-sm text-sm text-swp-white-dim">
            {tag}<button type="button" onClick={() => onChange(tags.filter((_,j)=>j!==i))} className="text-swp-white-ghost hover:text-red-400"><X size={12} /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="text" value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key==='Enter'&&(e.preventDefault(),add())} className="flex-1 bg-swp-black border border-swp-border rounded-swp px-3 py-1.5 text-white text-sm focus:border-swp-ice focus:outline-none" placeholder="Add a tag..." />
        <button type="button" onClick={add} className="px-3 py-1.5 bg-gray-700 text-white rounded-swp text-sm">Add</button>
      </div>
    </div>
  );
};

export default AdminArmoryTab;
