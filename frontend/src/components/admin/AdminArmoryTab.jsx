import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Plus, Edit2, Trash2, Star, ExternalLink, Link as LinkIcon, Upload, X, Eye, Image, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import AssetPicker from './AssetPicker';

const ITEM_TYPES = ['Apps', 'Templates', 'Downloads', 'Courses', 'eBooks'];

// Quick Fill templates per product type
const PRODUCT_TEMPLATES = {
  Apps: {
    what_it_is: '[App Name] is a [type of app] that helps [target audience] [achieve specific outcome] — without [common frustration it eliminates].',
    core_actions: ['Create or join a [session/room/workspace]', 'Choose your [key option/mode/character]', 'Start [the core experience]'],
    experiences: ['Real-time [core interaction]', '[Key feature] with [unique twist]', 'Live [competitive/collaborative element]', '[Social/community feature]', '[Reward/progression system]'],
    features: ['Works offline', 'No account required', 'Cross-platform sync', 'Push notifications', 'Dark mode'],
    how_it_works: ['[First user action — e.g. Open the app]', '[Core setup step — e.g. Select your preferences]', '[Trigger moment — e.g. Start a session]', '[Live interaction — e.g. Play in real time]', '[Outcome — e.g. See your results]'],
    how_it_works_notes: 'Everything updates in real time. Your data stays on your device.',
    who_its_for: ['[Primary audience — e.g. Mobile gamers]', '[Secondary audience — e.g. Friends looking for quick sessions]', '[Niche audience — e.g. Competitive strategy fans]'],
    why_it_works: '',
    tags: ['App', 'Mobile', 'Free', 'iOS', 'Android'],
    final_cta_text: '[App Name] is [one-line benefit]. Try it now.',
    final_cta_microcopy: 'No subscriptions · No ads · No lock-in',
    price_status: 'Free',
  },
  Courses: {
    what_it_is: '[Course Name] is a [format — self-paced / cohort / masterclass] designed to take [target audience] from [starting point] to [end result] in [timeframe].',
    core_actions: [],
    experiences: ['[Module 1 outcome]', '[Module 2 outcome]', '[Module 3 outcome]', '[Practical project or assignment]', '[Certificate or credential on completion]'],
    features: ['Lifetime access', 'Downloadable resources', 'Community access', 'Mobile-friendly', 'Progress tracking'],
    how_it_works: ['Enrol and get instant access', 'Work through [X] modules at your own pace', 'Complete hands-on assignments', 'Get feedback from [instructor/peers]', 'Receive your certificate'],
    how_it_works_notes: 'Each module builds on the last. Go at your speed — no deadlines.',
    who_its_for: ['[Beginners looking to break in]', '[Working professionals wanting to level up]', '[Creatives switching careers]'],
    why_it_works: 'This course is built by practitioners, not theorists. Every lesson comes from real-world projects, not textbook exercises.',
    tags: ['Course', 'Online', 'Self-paced', 'Certificate'],
    final_cta_text: 'Start learning today.',
    final_cta_microcopy: 'Lifetime access · Learn at your pace',
    price_status: '',
  },
  Templates: {
    what_it_is: '[Template Name] is a ready-to-use [type — script template / pitch deck / shot list / budget sheet] built for [who] who need [outcome] without starting from scratch.',
    core_actions: [],
    experiences: ['[What the template includes — e.g. Pre-formatted structure]', '[Key section — e.g. Industry-standard layout]', '[Bonus — e.g. Example content included]', '[Customisation — e.g. Fully editable in Google Docs / Notion / Excel]'],
    features: ['Instant download', 'Fully editable', 'Print-ready', 'Multiple formats', 'Instructions included'],
    how_it_works: ['Purchase and download instantly', 'Open in [software]', 'Replace placeholder content with yours', 'Export or share'],
    how_it_works_notes: 'No special software needed. Works with tools you already use.',
    who_its_for: ['[Filmmakers prepping for production]', '[Writers structuring their first draft]', '[Producers building pitch packages]'],
    why_it_works: '',
    tags: ['Template', 'Download', 'Filmmaking', 'Production'],
    final_cta_text: 'Skip the blank page. Start with structure.',
    final_cta_microcopy: 'Instant download · One-time purchase',
    price_status: '',
  },
  Downloads: {
    what_it_is: '[Resource Name] is a downloadable [type — guide / toolkit / asset pack / checklist] for [who] working on [what].',
    core_actions: [],
    experiences: ['[What it contains]', '[Key resource]', '[Practical use case]'],
    features: ['PDF format', 'Mobile-friendly', 'Printable', 'No DRM'],
    how_it_works: ['Download the file', 'Open on any device', 'Use it in your workflow'],
    how_it_works_notes: '',
    who_its_for: ['[Primary audience]', '[Secondary audience]'],
    why_it_works: '',
    tags: ['Download', 'Resource', 'Free'],
    final_cta_text: 'Grab it and get to work.',
    final_cta_microcopy: 'Free download · No signup required',
    price_status: 'Free',
  },
  eBooks: {
    what_it_is: '[Book Title] is a [length — short / comprehensive] guide to [topic], written for [audience] who want [outcome].',
    core_actions: [],
    experiences: ['[Chapter/section 1 topic]', '[Chapter/section 2 topic]', '[Chapter/section 3 topic]', '[Practical exercises or case studies]'],
    features: ['PDF + ePub formats', 'Mobile-optimised', 'Highlight & bookmark', 'Printable'],
    how_it_works: ['Purchase and download', 'Read on any device', 'Apply the frameworks to your projects'],
    how_it_works_notes: 'Written to be read in [X hours]. Every chapter ends with actionable takeaways.',
    who_its_for: ['[Aspiring filmmakers]', '[Industry professionals]', '[Students and self-learners]'],
    why_it_works: 'Written from years of hands-on experience — not recycled advice.',
    tags: ['eBook', 'Guide', 'Filmmaking', 'Education'],
    final_cta_text: 'The knowledge you need. The format you want.',
    final_cta_microcopy: 'Instant delivery · Read anywhere',
    price_status: '',
  },
};

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
          data-testid="add-product-btn"
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
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-900 flex-shrink-0">
                {item.thumbnail_url ? (
                  <img src={`${process.env.REACT_APP_BACKEND_URL}${item.thumbnail_url}`} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-700"><Image size={24} /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {item.featured && <Star size={14} className="text-electric-blue" fill="currentColor" />}
                  <h4 className="text-white font-medium truncate">{item.title}</h4>
                  {item.is_archived && <span className="text-red-400 text-xs">(Archived)</span>}
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-500">{item.item_type}</span>
                  {item.slug && <span className="text-electric-blue text-xs font-mono">/armory/{item.slug}</span>}
                  {item.is_free ? <span className="text-green-400">Free</span> : item.price ? <span className="text-white">{item.price}</span> : null}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {item.slug && <a href={`/armory/${item.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-electric-blue" title="View"><Eye size={18} /></a>}
                {item.primary_link_url && <a href={item.primary_link_url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-white" title="External"><ExternalLink size={18} /></a>}
                <button onClick={() => { setEditingItem(item); setShowModal(true); }} className="p-2 text-gray-400 hover:text-electric-blue"><Edit2 size={18} /></button>
                <button onClick={() => handleDelete(item)} className="p-2 text-gray-400 hover:text-red-400"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ProductModal item={editingItem} onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); fetchItems(); }} />
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PRODUCT MODAL — Tabbed Product Page Builder
   Tabs: Basics | Content | Media | Access | SEO
   ═══════════════════════════════════════════════════════════════ */

const MODAL_TABS = [
  { id: 'basics', label: 'Basics' },
  { id: 'content', label: 'Content' },
  { id: 'media', label: 'Media' },
  { id: 'access', label: 'Access' },
  { id: 'seo', label: 'SEO' },
];

const ProductModal = ({ item, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: item?.title || '', slug: item?.slug || '', item_type: item?.item_type || 'Apps',
    sort_order: item?.sort_order || 0, featured: item?.featured || false,
    is_published: item?.is_published ?? true, is_archived: item?.is_archived || false,
    short_description: item?.short_description || '', price_status: item?.price_status || '',
    what_it_is: item?.what_it_is || '', core_actions: item?.core_actions || [],
    experiences: item?.experiences || [], features: item?.features || [],
    how_it_works: item?.how_it_works || [], how_it_works_notes: item?.how_it_works_notes || '',
    who_its_for: item?.who_its_for || [], why_it_works: item?.why_it_works || '',
    final_cta_text: item?.final_cta_text || '', final_cta_microcopy: item?.final_cta_microcopy || '',
    tags: item?.tags || [],
    hero_image_url: item?.hero_image_url || '', thumbnail_url: item?.thumbnail_url || '',
    screenshots: item?.screenshots || [], video_url: item?.video_url || '',
    primary_link_url: item?.primary_link_url || '', demo_url: item?.demo_url || '',
    file_url: item?.file_url || '', is_free: item?.is_free ?? true,
    price: item?.price || '', price_note: item?.price_note || '',
    seo_title: item?.seo_title || '', seo_description: item?.seo_description || '',
    og_image: item?.og_image || '', focus_keyword: item?.focus_keyword || '',
    long_description: item?.long_description || '',
    what_its_not: item?.what_its_not || [], what_its_not_closing: item?.what_its_not_closing || '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('basics');
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [assetPickerField, setAssetPickerField] = useState(null);

  const openAssetPicker = (field) => {
    setAssetPickerField(field);
    setAssetPickerOpen(true);
  };

  const handleAssetSelect = (url) => {
    if (assetPickerField === 'screenshot') {
      setFormData(s => ({ ...s, screenshots: [...s.screenshots, url] }));
    } else if (assetPickerField) {
      setFormData(s => ({ ...s, [assetPickerField]: url }));
    }
    toast.success('Asset selected');
  };

  const applyTemplate = () => {
    const template = PRODUCT_TEMPLATES[formData.item_type];
    if (!template) return;
    const hasContent = formData.what_it_is || formData.core_actions.length || formData.experiences.length || formData.features.length;
    if (hasContent && !window.confirm('This will overwrite your current content fields. Continue?')) return;
    setFormData(s => ({
      ...s,
      what_it_is: template.what_it_is,
      core_actions: [...template.core_actions],
      experiences: [...template.experiences],
      features: [...template.features],
      how_it_works: [...template.how_it_works],
      how_it_works_notes: template.how_it_works_notes,
      who_its_for: [...template.who_its_for],
      why_it_works: template.why_it_works,
      tags: s.tags.length ? s.tags : [...template.tags],
      final_cta_text: s.final_cta_text || template.final_cta_text,
      final_cta_microcopy: s.final_cta_microcopy || template.final_cta_microcopy,
      price_status: s.price_status || template.price_status,
    }));
    setActiveTab('content');
    toast.success(`${formData.item_type} template applied — edit the placeholders`);
  };
  const contentIsEmpty = !formData.what_it_is && !formData.core_actions.length && !formData.experiences.length && !formData.features.length;

  const up = (e, field) => {
    const file = e.target.files[0]; if (!file) return;
    const fd = new FormData(); 
    fd.append('file', file);
    fd.append('source', 'armory');
    fd.append('tags', `armory,${formData.item_type || 'product'},${field}`);
    setUploading(true);
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/upload/image`, { method: 'POST', body: fd })
      .then(r => r.ok ? r.json() : Promise.reject()).then(d => { setFormData(s => ({ ...s, [field]: d.url })); toast.success('Uploaded'); })
      .catch(() => toast.error('Upload failed')).finally(() => setUploading(false));
  };
  const upScreenshot = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const fd = new FormData(); 
    fd.append('file', file);
    fd.append('source', 'armory');
    fd.append('tags', `armory,${formData.item_type || 'product'},screenshot`);
    setUploading(true);
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/upload/image`, { method: 'POST', body: fd })
      .then(r => r.ok ? r.json() : Promise.reject()).then(d => { setFormData(s => ({ ...s, screenshots: [...s.screenshots, d.url] })); toast.success('Added'); })
      .catch(() => toast.error('Upload failed')).finally(() => setUploading(false));
  };
  const genSlug = () => setFormData(s => ({ ...s, slug: s.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').trim() }));
  const genSEO = () => {
    const t = formData.title, d = [formData.what_it_is, formData.short_description].filter(Boolean).join('. ');
    const a = (formData.who_its_for || []).join(', '), kw = formData.focus_keyword || '';
    const st = `${t}${a ? ` — ${a.split(',')[0].trim()}` : ''}${kw ? ` | ${kw}` : ''} | Shadow Wolves`;
    const sd = d || `${t}${formData.experiences?.length ? ' — ' + formData.experiences.slice(0, 2).join(', ') : ''}. Shadow Wolves Productions.`;
    if (formData.seo_title && !window.confirm('Overwrite existing SEO fields?')) return;
    setFormData(s => ({ ...s, seo_title: st.slice(0, 60), seo_description: sd.slice(0, 160) }));
    toast.success('SEO generated');
  };
  const save = async () => {
    if (!formData.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const url = item ? `${process.env.REACT_APP_BACKEND_URL}/api/den-items/${item.id}` : `${process.env.REACT_APP_BACKEND_URL}/api/den-items`;
      const r = await fetch(url, { method: item ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (r.ok) { toast.success(item ? 'Updated' : 'Created'); onSave(); } else toast.error('Failed');
    } catch { toast.error('Error'); } finally { setSaving(false); }
  };
  const imgUrl = (u) => u && (u.startsWith('http') ? u : `${process.env.REACT_APP_BACKEND_URL}${u}`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 overflow-y-auto">
      <div className="bg-smoke-gray border border-gray-800 rounded-lg w-full max-w-3xl my-8 max-h-[90vh] overflow-hidden flex flex-col" data-testid="product-modal">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-0 flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-white">{item ? 'Edit' : 'New'} Product</h3>
            <p className="text-gray-600 text-xs">Product Page Builder</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white"><X size={20} /></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 pb-0 border-b border-gray-800 overflow-x-auto flex-shrink-0">
          {MODAL_TABS.map(tab => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? 'text-white border-electric-blue' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
              data-testid={`tab-${tab.id}`}>{tab.label}</button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ─── BASICS ─── */}
          {activeTab === 'basics' && (
            <div className="space-y-4">
              <Fl label="Product Title *">
                <TI value={formData.title} onChange={e => setFormData(s => ({ ...s, title: e.target.value }))} placeholder="e.g. House Heroes" />
              </Fl>
              <Fl label="URL Slug" helper="Auto-generated from title, or edit manually">
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center">
                    <span className="text-gray-500 bg-black px-3 py-2 border border-r-0 border-gray-700 rounded-l-lg text-xs font-mono">/armory/</span>
                    <input type="text" value={formData.slug} onChange={e => setFormData(s => ({ ...s, slug: e.target.value }))} className="flex-1 bg-black border border-gray-700 rounded-r-lg px-3 py-2 text-white font-mono text-sm focus:border-electric-blue focus:outline-none" placeholder="house-heroes" />
                  </div>
                  <button type="button" onClick={genSlug} className="px-3 py-2 bg-gray-700 text-white rounded-lg text-xs hover:bg-gray-600">Generate</button>
                </div>
              </Fl>
              <div className="grid grid-cols-2 gap-4">
                <Fl label="Product Type *">
                  <select value={formData.item_type} onChange={e => setFormData(s => ({ ...s, item_type: e.target.value }))} className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white text-sm">
                    {ITEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Fl>
                <Fl label="Sort Order">
                  <TI type="number" value={formData.sort_order} onChange={e => setFormData(s => ({ ...s, sort_order: parseInt(e.target.value) || 0 }))} />
                </Fl>
              </div>

              {/* Quick Fill Template */}
              {!item && (
                <button type="button" onClick={applyTemplate} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-electric-blue/5 border border-electric-blue/20 rounded-lg text-electric-blue text-sm hover:bg-electric-blue/10 transition-colors" data-testid="quick-fill-btn">
                  <Star size={16} />
                  Quick Fill: Apply {formData.item_type} Template
                </button>
              )}
              <div className="flex flex-wrap gap-5 pt-1">
                {[{ k: 'featured', l: 'Featured' }, { k: 'is_published', l: 'Published' }, { k: 'is_archived', l: 'Archived' }].map(({ k, l }) => (
                  <label key={k} className="flex items-center gap-2 text-gray-400 text-sm cursor-pointer">
                    <input type="checkbox" checked={formData[k]} onChange={e => setFormData(s => ({ ...s, [k]: e.target.checked }))} className="rounded" /> {l}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ─── CONTENT ─── */}
          {activeTab === 'content' && (
            <div className="space-y-5">
              {/* Quick Fill prompt when content is empty */}
              {contentIsEmpty && (
                <div className="flex items-center justify-between bg-electric-blue/5 border border-electric-blue/20 rounded-lg p-4" data-testid="template-prompt">
                  <div>
                    <p className="text-white text-sm font-medium">Start with a template?</p>
                    <p className="text-gray-500 text-xs mt-0.5">Pre-fill all content sections with {formData.item_type}-specific prompts and structure.</p>
                  </div>
                  <button type="button" onClick={applyTemplate} className="flex items-center gap-2 px-4 py-2 bg-electric-blue text-white rounded-lg text-sm whitespace-nowrap hover:bg-electric-blue/90" data-testid="template-apply-btn">
                    <Star size={14} /> Apply Template
                  </button>
                </div>
              )}
              <div className="bg-black/30 rounded-lg p-4 space-y-4 border border-gray-800/50">
                <p className="text-gray-500 text-[10px] font-mono uppercase tracking-widest">Hero / Above the Fold</p>
                <Fl label="Short Positioning Line" helper="One line under the product name in the purchase block">
                  <TI value={formData.short_description} onChange={e => setFormData(s => ({ ...s, short_description: e.target.value }))} placeholder="One-line positioning statement" />
                </Fl>
                <Fl label="Price Status" helper="Displayed in the purchase block">
                  <div className="flex gap-2">
                    <select value={['Free','Trial','Invite Only','Bundled'].includes(formData.price_status) ? formData.price_status : '__custom'} onChange={e => { const v = e.target.value; setFormData(s => ({ ...s, price_status: v === '__custom' ? '' : v })); }} className="bg-black border border-gray-700 rounded-lg px-4 py-2 text-white text-sm">
                      <option value="">Select...</option>
                      <option value="Free">Free</option><option value="Trial">Trial</option>
                      <option value="Invite Only">Invite Only</option><option value="Bundled">Bundled</option>
                      <option value="__custom">Custom...</option>
                    </select>
                    {!['Free','Trial','Invite Only','Bundled'].includes(formData.price_status) && (
                      <TI value={formData.price_status} onChange={e => setFormData(s => ({ ...s, price_status: e.target.value }))} placeholder="A$119, etc." />
                    )}
                  </div>
                </Fl>
              </div>

              <Fl label="What This Is" helper="What it is, who it's for, what problem it solves. 1-2 paragraphs.">
                <TexA value={formData.what_it_is} onChange={e => setFormData(s => ({ ...s, what_it_is: e.target.value }))} placeholder="[Product] is a [tool/app/course] designed to help [who] [achieve outcome] without [pain point]." rows={3} />
              </Fl>

              <ListEditor label="Core Actions" helper="Short, scannable steps. Primarily for apps." items={formData.core_actions} onChange={v => setFormData(s => ({ ...s, core_actions: v }))} placeholder="e.g. Create a room" />
              <ListEditor label="What You Get" helper="Deliverables, outcomes, or experiences." items={formData.experiences} onChange={v => setFormData(s => ({ ...s, experiences: v }))} placeholder="e.g. Real-time multiplayer battles" />
              <ListEditor label="Features" helper="Scannable grid on the product page." items={formData.features} onChange={v => setFormData(s => ({ ...s, features: v }))} placeholder="e.g. Offline mode" />
              <ListEditor label="How It Works" helper="Numbered flow from start to outcome." items={formData.how_it_works} onChange={v => setFormData(s => ({ ...s, how_it_works: v }))} placeholder="e.g. Choose your character" />
              <Fl label="How It Works — Notes" helper="2-3 short clarifying lines">
                <TexA value={formData.how_it_works_notes} onChange={e => setFormData(s => ({ ...s, how_it_works_notes: e.target.value }))} placeholder="What updates in real time..." rows={2} />
              </Fl>
              <ListEditor label="Who It's For" helper="Audience descriptors." items={formData.who_its_for || []} onChange={v => setFormData(s => ({ ...s, who_its_for: v }))} placeholder="e.g. Indie filmmakers" />
              <Fl label="Why It Works" helper="Optional. Short paragraph (max 3 lines).">
                <TexA value={formData.why_it_works || ''} onChange={e => setFormData(s => ({ ...s, why_it_works: e.target.value }))} placeholder="Optional..." rows={2} />
              </Fl>

              <div className="bg-black/30 rounded-lg p-4 space-y-4 border border-gray-800/50">
                <p className="text-gray-500 text-[10px] font-mono uppercase tracking-widest">Final CTA</p>
                <Fl label="CTA Text" helper="Reinforce action at the bottom of the page">
                  <TI value={formData.final_cta_text} onChange={e => setFormData(s => ({ ...s, final_cta_text: e.target.value }))} placeholder="[App Name] is ready when you are." />
                </Fl>
                <Fl label="CTA Microcopy" helper="One line of reassurance below the button">
                  <TI value={formData.final_cta_microcopy} onChange={e => setFormData(s => ({ ...s, final_cta_microcopy: e.target.value }))} placeholder="No subscriptions · No ads · No lock-in" />
                </Fl>
              </div>
              <TagEditor label="Tags / Use Cases" helper="Pill keywords for scanning + SEO" tags={formData.tags} onChange={v => setFormData(s => ({ ...s, tags: v }))} />
            </div>
          )}

          {/* ─── MEDIA ─── */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <Fl label="Hero Image" helper="Appears in product header and Armory grid.">
                <div className="flex items-start gap-4 flex-wrap">
                  {formData.hero_image_url && (
                    <div className="relative">
                      <img src={imgUrl(formData.hero_image_url)} alt="" className="w-48 h-28 object-cover rounded-lg" />
                      <button type="button" onClick={() => setFormData(s => ({ ...s, hero_image_url: '' }))} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"><X size={12} /></button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <label className="flex items-center gap-2 px-4 py-2 bg-black border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-900 text-sm">
                      <Upload size={16} className="text-gray-400" /><span className="text-gray-400">{uploading ? 'Uploading...' : 'Upload'}</span>
                      <input type="file" accept="image/*" onChange={e => up(e, 'hero_image_url')} className="hidden" />
                    </label>
                    <button type="button" onClick={() => openAssetPicker('hero_image_url')} className="flex items-center gap-2 px-4 py-2 bg-electric-blue/10 border border-electric-blue/30 rounded-lg text-electric-blue text-sm hover:bg-electric-blue/20">
                      <FolderOpen size={16} /> Browse Library
                    </button>
                  </div>
                </div>
              </Fl>
              <Fl label="Screenshots Gallery" helper="Optional. Gallery images on the product page.">
                <div className="flex flex-wrap gap-3 mb-3">
                  {formData.screenshots.map((s, i) => (
                    <div key={i} className="relative">
                      <img src={imgUrl(s)} alt="" className="w-24 h-16 object-cover rounded-lg" />
                      <button type="button" onClick={() => setFormData(p => ({ ...p, screenshots: p.screenshots.filter((_, j) => j !== i) }))} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"><X size={12} /></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-black border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-900 text-sm">
                    <Upload size={16} className="text-gray-400" /><span className="text-gray-400">{uploading ? 'Uploading...' : 'Add Screenshot'}</span>
                    <input type="file" accept="image/*" onChange={upScreenshot} className="hidden" />
                  </label>
                  <button type="button" onClick={() => openAssetPicker('screenshot')} className="flex items-center gap-2 px-4 py-2 bg-electric-blue/10 border border-electric-blue/30 rounded-lg text-electric-blue text-sm hover:bg-electric-blue/20">
                    <FolderOpen size={16} /> Browse Library
                  </button>
                </div>
              </Fl>
              <Fl label="Video Embed URL" helper="YouTube or Vimeo embed URL">
                <TI type="url" value={formData.video_url} onChange={e => setFormData(s => ({ ...s, video_url: e.target.value }))} placeholder="https://www.youtube.com/embed/..." />
              </Fl>
            </div>
          )}

          {/* ─── ACCESS ─── */}
          {activeTab === 'access' && (
            <div className="space-y-4">
              <Fl label="Primary Access URL" helper="App store, checkout page, or external link">
                <TI type="url" value={formData.primary_link_url} onChange={e => setFormData(s => ({ ...s, primary_link_url: e.target.value }))} placeholder="https://apps.apple.com/..." />
              </Fl>
              <Fl label="Demo / Preview URL" helper="Optional. Let users try before buying.">
                <TI type="url" value={formData.demo_url} onChange={e => setFormData(s => ({ ...s, demo_url: e.target.value }))} placeholder="https://demo.example.com" />
              </Fl>
              <Fl label="Direct File Download URL" helper="For downloadable files.">
                <TI value={formData.file_url} onChange={e => setFormData(s => ({ ...s, file_url: e.target.value }))} placeholder="/api/upload/files/template.zip" />
              </Fl>
              <hr className="border-gray-800" />
              <label className="flex items-center gap-2 text-gray-400 text-sm cursor-pointer">
                <input type="checkbox" checked={formData.is_free} onChange={e => setFormData(s => ({ ...s, is_free: e.target.checked }))} className="rounded" /> Free Product
              </label>
              {!formData.is_free && (
                <div className="grid grid-cols-2 gap-4">
                  <Fl label="Price"><TI value={formData.price} onChange={e => setFormData(s => ({ ...s, price: e.target.value }))} placeholder="A$29" /></Fl>
                  <Fl label="Price Note"><TI value={formData.price_note} onChange={e => setFormData(s => ({ ...s, price_note: e.target.value }))} placeholder="one-time purchase" /></Fl>
                </div>
              )}
            </div>
          )}

          {/* ─── SEO ─── */}
          {activeTab === 'seo' && (
            <div className="space-y-5">
              <Fl label="Focus Keyword" helper="Primary keyword for SEO. Guides generation.">
                <TI value={formData.focus_keyword || ''} onChange={e => setFormData(s => ({ ...s, focus_keyword: e.target.value }))} placeholder="e.g. filmmaking app, indie screenplay course" />
              </Fl>
              <Fl label="SEO Title" helper={`${(formData.seo_title || '').length}/60 chars`}>
                <TI value={formData.seo_title} onChange={e => setFormData(s => ({ ...s, seo_title: e.target.value }))} placeholder="Override page title for search engines..." />
                <div className="w-full bg-gray-800 rounded-full h-1 mt-2"><div className={`h-1 rounded-full ${(formData.seo_title||'').length>60?'bg-red-500':(formData.seo_title||'').length>40?'bg-green-500':'bg-yellow-500'}`} style={{width:`${Math.min(((formData.seo_title||'').length/60)*100,100)}%`}}/></div>
              </Fl>
              <Fl label="SEO Description" helper={`${(formData.seo_description || '').length}/160 chars`}>
                <TexA value={formData.seo_description} onChange={e => setFormData(s => ({ ...s, seo_description: e.target.value }))} placeholder="Meta description..." rows={3} />
                <div className="w-full bg-gray-800 rounded-full h-1 mt-2"><div className={`h-1 rounded-full ${(formData.seo_description||'').length>160?'bg-red-500':(formData.seo_description||'').length>100?'bg-green-500':'bg-yellow-500'}`} style={{width:`${Math.min(((formData.seo_description||'').length/160)*100,100)}%`}}/></div>
              </Fl>
              <Fl label="OG Image URL" helper="Social sharing image (1200x630). Falls back to hero image.">
                <TI value={formData.og_image || ''} onChange={e => setFormData(s => ({ ...s, og_image: e.target.value }))} placeholder="https://... or leave blank" />
              </Fl>

              {/* Google Preview */}
              <div className="bg-black/50 rounded-lg p-4 border border-gray-800">
                <p className="text-gray-600 text-[10px] font-mono uppercase tracking-widest mb-3">Google Preview</p>
                <p className="text-[#8ab4f8] text-base font-medium truncate">{formData.seo_title || formData.title || 'Product Title'} | Shadow Wolves</p>
                <p className="text-[#bdc1c6] text-xs truncate">shadowwolvesproductions.com.au › armory ›{formData.slug || 'product-slug'}</p>
                <p className="text-[#969ba1] text-sm line-clamp-2 mt-0.5">{formData.seo_description || formData.short_description || formData.what_it_is || 'Description...'}</p>
              </div>

              {/* Social Preview */}
              <div className="bg-black/50 rounded-lg border border-gray-800 overflow-hidden">
                <p className="text-gray-600 text-[10px] font-mono uppercase tracking-widest px-4 pt-3 pb-2">Social Card</p>
                <div className="bg-[#18191a] rounded-b-lg mx-2 mb-2 overflow-hidden border border-gray-700/50">
                  {(formData.og_image || formData.hero_image_url) && <div className="h-32 bg-smoke-gray"><img src={imgUrl(formData.og_image || formData.hero_image_url)} alt="" className="w-full h-full object-cover" /></div>}
                  <div className="p-3">
                    <p className="text-gray-500 text-[10px] uppercase">shadowwolvesproductions.com.au</p>
                    <p className="text-white text-sm font-medium truncate mt-0.5">{formData.seo_title || formData.title || 'Title'}</p>
                    <p className="text-gray-400 text-xs line-clamp-2 mt-0.5">{formData.seo_description || formData.short_description || ''}</p>
                  </div>
                </div>
              </div>

              {/* Checklist */}
              <div className="bg-black/30 rounded-lg p-4 border border-gray-800/50 space-y-2">
                <p className="text-gray-500 text-[10px] font-mono uppercase tracking-widest mb-2">SEO Checklist</p>
                <SeoCheck ok={!!formData.seo_title} label="SEO title set" />
                <SeoCheck ok={(formData.seo_title||'').length>=30&&(formData.seo_title||'').length<=60} label="Title length optimal (30-60)" />
                <SeoCheck ok={!!formData.seo_description} label="Meta description set" />
                <SeoCheck ok={(formData.seo_description||'').length>=100&&(formData.seo_description||'').length<=160} label="Description length optimal (100-160)" />
                <SeoCheck ok={!!formData.slug} label="URL slug set" />
                <SeoCheck ok={!!formData.focus_keyword} label="Focus keyword defined" />
                <SeoCheck ok={formData.focus_keyword&&(formData.seo_title||'').toLowerCase().includes((formData.focus_keyword||'').toLowerCase())} label="Focus keyword in title" />
                <SeoCheck ok={formData.tags?.length>0} label="Tags added" />
                <SeoCheck ok={!!(formData.og_image||formData.hero_image_url)} label="Social image available" />
              </div>

              <button type="button" onClick={genSEO} className="flex items-center gap-2 px-4 py-2.5 bg-electric-blue/10 border border-electric-blue/30 rounded-lg text-electric-blue text-sm hover:bg-electric-blue/20 transition-colors w-full justify-center" data-testid="ai-seo-assist-btn">
                <Star size={16} /> Generate SEO from Content
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-gray-800 bg-black/30 flex-shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2 border border-gray-700 text-gray-400 rounded-lg hover:text-white text-sm">Cancel</button>
          <button onClick={save} disabled={saving} className="px-6 py-2 bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 text-white rounded-lg text-sm" data-testid="product-save-btn">
            {saving ? 'Saving...' : (item ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══ Shared UI Components ═══ */

const Fl = ({ label, helper, children }) => (
  <div><label className="block text-gray-400 text-sm mb-1">{label}</label>{children}{helper && <p className="text-gray-600 text-xs mt-1">{helper}</p>}</div>
);
const TI = ({ value, onChange, placeholder, ...p }) => (
  <input type="text" value={value} onChange={onChange} placeholder={placeholder} className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:border-electric-blue focus:outline-none" {...p} />
);
const TexA = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white text-sm resize-none focus:border-electric-blue focus:outline-none" />
);
const SeoCheck = ({ ok, label }) => (
  <div className="flex items-center gap-2 text-sm">
    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${ok ? 'bg-green-500/20 text-green-400' : 'bg-gray-700/50 text-gray-500'}`}>{ok ? '✓' : '–'}</span>
    <span className={ok ? 'text-gray-300' : 'text-gray-500'}>{label}</span>
  </div>
);

const ListEditor = ({ label, helper, items, onChange, placeholder }) => {
  const [val, setVal] = useState('');
  const add = () => { if (val.trim()) { onChange([...items, val.trim()]); setVal(''); } };
  return (
    <div>
      <label className="block text-gray-400 text-sm mb-1">{label}</label>
      {helper && <p className="text-gray-600 text-xs mb-2">{helper}</p>}
      <div className="space-y-1.5 mb-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 bg-black border border-gray-700 rounded-lg px-3 py-1.5 text-sm">
            <span className="text-gray-500 font-mono w-5">{i+1}.</span>
            <span className="text-white flex-1">{item}</span>
            <button type="button" onClick={() => onChange(items.filter((_,j)=>j!==i))} className="text-gray-400 hover:text-red-400"><X size={14} /></button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="text" value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key==='Enter'&&(e.preventDefault(),add())} className="flex-1 bg-black border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm focus:border-electric-blue focus:outline-none" placeholder={placeholder} />
        <button type="button" onClick={add} className="px-3 py-1.5 bg-electric-blue text-white rounded-lg text-sm">Add</button>
      </div>
    </div>
  );
};

const TagEditor = ({ label, helper, tags, onChange }) => {
  const [val, setVal] = useState('');
  const add = () => { if (val.trim() && !tags.includes(val.trim())) { onChange([...tags, val.trim()]); setVal(''); } };
  return (
    <div>
      <label className="block text-gray-400 text-sm mb-1">{label}</label>
      {helper && <p className="text-gray-600 text-xs mb-2">{helper}</p>}
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, i) => (
          <span key={i} className="flex items-center gap-1 bg-white/5 border border-gray-700 px-3 py-1 rounded-full text-sm text-gray-300">
            {tag}<button type="button" onClick={() => onChange(tags.filter((_,j)=>j!==i))} className="text-gray-400 hover:text-red-400"><X size={12} /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="text" value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key==='Enter'&&(e.preventDefault(),add())} className="flex-1 bg-black border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm focus:border-electric-blue focus:outline-none" placeholder="Add a tag..." />
        <button type="button" onClick={add} className="px-3 py-1.5 bg-gray-700 text-white rounded-lg text-sm">Add</button>
      </div>
    </div>
  );
};

export default AdminArmoryTab;
