import React, { useState, useEffect, useRef } from 'react';
import { 
  Image, Upload, Save, Eye, RefreshCw, ChevronDown, ChevronUp, Move, 
  FileText, Gift, ArrowRight, Plus, Trash2, Edit2, ToggleLeft, ToggleRight,
  GripVertical, ExternalLink, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import AdminLeadMagnetSettings from './AdminLeadMagnetSettings';

const API = process.env.REACT_APP_BACKEND_URL;

const PAGES = [
  { id: 'films', label: 'Films', defaultImage: '/api/upload/images/header-films.jpg' },
  { id: 'armory', label: 'The Armory', defaultImage: '/api/upload/images/header-armory.jpg' },
  { id: 'den', label: 'The Den (Blog)', defaultImage: '/api/upload/images/header-den.jpg' },
  { id: 'workwithus', label: 'Work With Us', defaultImage: '/api/upload/images/header-workwithus.jpg' },
  { id: 'about', label: 'About', defaultImage: '/api/upload/images/header-about.jpg' },
];

const TABS = [
  { id: 'pages', label: 'Page Headers', icon: FileText },
  { id: 'leadmagnet', label: 'Lead Magnet', icon: Gift },
  { id: 'redirects', label: 'Redirects', icon: ArrowRight },
];

const AdminSiteSettingsTab = () => {
  const [activeTab, setActiveTab] = useState('pages');

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-swp-border pb-4">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-swp text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-black'
                  : 'bg-swp-surface text-swp-white-ghost border border-swp-border hover:text-swp-white hover:border-gray-500'
              }`}
              data-testid={`settings-tab-${tab.id}`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'pages' && <PageHeadersSection />}
      {activeTab === 'leadmagnet' && <AdminLeadMagnetSettings />}
      {activeTab === 'redirects' && <RedirectsSection />}
    </div>
  );
};


// ============ PAGE HEADERS SECTION ============

const PageHeadersSection = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedPage, setExpandedPage] = useState(null);
  const [uploading, setUploading] = useState({});
  const fileInputRefs = useRef({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API}/api/site-settings`);
      if (response.ok) {
        const data = await response.json();
        setSettings(data.headers || {});
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (pageId, field, value) => {
    setSettings(prev => ({
      ...prev,
      [pageId]: {
        ...prev[pageId],
        [field]: value
      }
    }));
  };

  const handleSave = async (pageId) => {
    setSaving(true);
    try {
      const pageSettings = settings[pageId] || {};
      const response = await fetch(`${API}/api/site-settings/headers/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: pageId,
          image_url: pageSettings.image_url || null,
          position_x: pageSettings.position_x ?? 50,
          position_y: pageSettings.position_y ?? 30,
          overlay_opacity: pageSettings.overlay_opacity ?? 85,
          title: pageSettings.title || null,
          subtitle: pageSettings.subtitle || null,
        })
      });

      if (response.ok) {
        toast.success(`${PAGES.find(p => p.id === pageId)?.label} settings saved!`);
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (pageId, file) => {
    if (!file) return;

    setUploading(prev => ({ ...prev, [pageId]: true }));
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API}/api/upload/image`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        handleSettingChange(pageId, 'image_url', data.url);
        toast.success('Image uploaded! Click Save to apply.');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(prev => ({ ...prev, [pageId]: false }));
    }
  };

  const getImageUrl = (pageId) => {
    const pageSettings = settings[pageId] || {};
    const pageConfig = PAGES.find(p => p.id === pageId);
    return pageSettings.image_url || pageConfig?.defaultImage || '';
  };

  const getPositionStyle = (pageId) => {
    const pageSettings = settings[pageId] || {};
    const x = pageSettings.position_x ?? 50;
    const y = pageSettings.position_y ?? 30;
    return `${x}% ${y}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-swp-ice animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {PAGES.map((page) => {
        const isExpanded = expandedPage === page.id;
        const pageSettings = settings[page.id] || {};
        
        return (
          <div 
            key={page.id}
            className="bg-swp-surface border border-swp-border rounded-swp overflow-hidden"
          >
            {/* Collapsed Header */}
            <button
              onClick={() => setExpandedPage(isExpanded ? null : page.id)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
              data-testid={`header-settings-${page.id}`}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-16 h-10 rounded overflow-hidden bg-gray-800"
                  style={{
                    backgroundImage: `url(${API}${getImageUrl(page.id)})`,
                    backgroundSize: 'cover',
                    backgroundPosition: getPositionStyle(page.id)
                  }}
                />
                <span className="text-white font-medium">{page.label}</span>
              </div>
              {isExpanded ? (
                <ChevronUp size={20} className="text-swp-white-ghost" />
              ) : (
                <ChevronDown size={20} className="text-swp-white-ghost" />
              )}
            </button>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-swp-border">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                  {/* Preview */}
                  <div>
                    <label className="text-sm text-swp-white-ghost mb-2 block">Preview</label>
                    <div 
                      className="relative w-full h-48 rounded-swp overflow-hidden bg-gray-900"
                      style={{
                        backgroundImage: `url(${API}${getImageUrl(page.id)})`,
                        backgroundSize: 'cover',
                        backgroundPosition: getPositionStyle(page.id)
                      }}
                    >
                      <div 
                        className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/60"
                        style={{ opacity: (pageSettings.overlay_opacity ?? 85) / 100 }}
                      />
                      <div className="absolute inset-0 flex items-center p-6">
                        <div>
                          <h3 className="text-3xl font-bold text-white font-display">
                            {pageSettings.title || page.label}
                          </h3>
                          {pageSettings.subtitle && (
                            <p className="text-swp-white-dim mt-2">{pageSettings.subtitle}</p>
                          )}
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-swp-black/70 px-2 py-1 rounded text-xs text-swp-white-dim flex items-center gap-1">
                        <Move size={12} />
                        {pageSettings.position_x ?? 50}%, {pageSettings.position_y ?? 30}%
                      </div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="space-y-4">
                    {/* Image Upload */}
                    <div>
                      <label className="text-sm text-swp-white-ghost mb-2 block">Header Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={el => fileInputRefs.current[page.id] = el}
                        onChange={(e) => handleImageUpload(page.id, e.target.files?.[0])}
                      />
                      <button
                        onClick={() => fileInputRefs.current[page.id]?.click()}
                        disabled={uploading[page.id]}
                        className="w-full px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-swp-border rounded-swp text-swp-white-dim text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                      >
                        {uploading[page.id] ? (
                          <>
                            <RefreshCw size={16} className="animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload size={16} />
                            Upload New Image
                          </>
                        )}
                      </button>
                      <p className="text-xs text-swp-white-ghost/70 mt-1">Recommended: 1920×600px or wider</p>
                    </div>

                    {/* Position X */}
                    <div>
                      <label className="text-sm text-swp-white-ghost mb-2 flex items-center justify-between">
                        <span>Horizontal Position</span>
                        <span className="text-swp-ice">{pageSettings.position_x ?? 50}%</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={pageSettings.position_x ?? 50}
                        onChange={(e) => handleSettingChange(page.id, 'position_x', parseInt(e.target.value))}
                        className="w-full accent-electric-blue"
                      />
                    </div>

                    {/* Position Y */}
                    <div>
                      <label className="text-sm text-swp-white-ghost mb-2 flex items-center justify-between">
                        <span>Vertical Position</span>
                        <span className="text-swp-ice">{pageSettings.position_y ?? 30}%</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={pageSettings.position_y ?? 30}
                        onChange={(e) => handleSettingChange(page.id, 'position_y', parseInt(e.target.value))}
                        className="w-full accent-electric-blue"
                      />
                    </div>

                    {/* Overlay Opacity */}
                    <div>
                      <label className="text-sm text-swp-white-ghost mb-2 flex items-center justify-between">
                        <span>Overlay Darkness</span>
                        <span className="text-swp-ice">{pageSettings.overlay_opacity ?? 85}%</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={pageSettings.overlay_opacity ?? 85}
                        onChange={(e) => handleSettingChange(page.id, 'overlay_opacity', parseInt(e.target.value))}
                        className="w-full accent-electric-blue"
                      />
                    </div>

                    {/* Save Button */}
                    <button
                      onClick={() => handleSave(page.id)}
                      disabled={saving}
                      className="w-full px-4 py-2.5 bg-swp-ice hover:bg-swp-ice text-white rounded-swp font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Save Changes
                        </>
                      )}
                    </button>

                    {/* Preview Link */}
                    <a
                      href={`/${page.id === 'armory' ? 'services' : page.id === 'den' ? 'blog' : page.id === 'workwithus' ? 'work-with-us' : page.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full px-4 py-2 border border-swp-border hover:border-gray-500 text-swp-white-ghost hover:text-swp-white rounded-swp text-sm flex items-center justify-center gap-2 transition-colors"
                    >
                      <Eye size={16} />
                      Preview Page
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};


// ============ REDIRECTS SECTION ============

const RedirectsSection = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    from_path: '',
    to_url: '',
    status_code: 301,
    match_type: 'EXACT',
    preserve_query: true,
    priority: 100,
    is_enabled: true,
    note: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/redirects/rules`);
      if (response.ok) {
        const data = await response.json();
        setRules(data);
      }
    } catch (error) {
      toast.error('Failed to load redirects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRule(null);
    setFormData({
      from_path: '',
      to_url: '',
      status_code: 301,
      match_type: 'EXACT',
      preserve_query: true,
      priority: 100,
      is_enabled: true,
      note: ''
    });
    setShowModal(true);
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      from_path: rule.from_path,
      to_url: rule.to_url,
      status_code: rule.status_code,
      match_type: rule.match_type,
      preserve_query: rule.preserve_query,
      priority: rule.priority,
      is_enabled: rule.is_enabled,
      note: rule.note || ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.from_path || !formData.to_url) {
      toast.error('From Path and To URL are required');
      return;
    }

    setSaving(true);
    try {
      const url = editingRule 
        ? `${API}/api/redirects/rules/${editingRule.id}`
        : `${API}/api/redirects/rules`;
      
      const response = await fetch(url, {
        method: editingRule ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(editingRule ? 'Redirect updated' : 'Redirect created');
        setShowModal(false);
        fetchRules();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to save redirect');
      }
    } catch (error) {
      toast.error('Failed to save redirect');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ruleId) => {
    if (!window.confirm('Delete this redirect rule?')) return;

    try {
      const response = await fetch(`${API}/api/redirects/rules/${ruleId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        toast.success('Redirect deleted');
        fetchRules();
      }
    } catch (error) {
      toast.error('Failed to delete redirect');
    }
  };

  const handleToggle = async (ruleId) => {
    try {
      const response = await fetch(`${API}/api/redirects/rules/${ruleId}/toggle`, {
        method: 'PUT'
      });
      if (response.ok) {
        const data = await response.json();
        toast.success(data.is_enabled ? 'Redirect enabled' : 'Redirect disabled');
        fetchRules();
      }
    } catch (error) {
      toast.error('Failed to toggle redirect');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-swp-ice animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-swp-white-ghost/70 text-sm">
            Manage URL redirects for your site. Redirects run server-side before page rendering.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-swp-ice hover:bg-swp-ice text-white rounded-swp transition-colors"
          data-testid="create-redirect-btn"
        >
          <Plus size={18} />
          Add Redirect
        </button>
      </div>

      {/* Rules List */}
      {rules.length === 0 ? (
        <div className="text-center py-12 bg-swp-surface border border-swp-border rounded-swp">
          <ArrowRight className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-swp-white-ghost">No redirects configured</p>
          <p className="text-swp-white-ghost/50 text-sm mt-2">Add a redirect to forward visitors from one URL to another.</p>
        </div>
      ) : (
        <div className="bg-swp-surface border border-swp-border rounded-swp overflow-hidden">
          <table className="w-full">
            <thead className="bg-swp-deep/50 border-b border-swp-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-mono text-swp-white-ghost/70 uppercase">From</th>
                <th className="px-4 py-3 text-left text-xs font-mono text-swp-white-ghost/70 uppercase">To</th>
                <th className="px-4 py-3 text-center text-xs font-mono text-swp-white-ghost/70 uppercase">Type</th>
                <th className="px-4 py-3 text-center text-xs font-mono text-swp-white-ghost/70 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-mono text-swp-white-ghost/70 uppercase">Enabled</th>
                <th className="px-4 py-3 text-right text-xs font-mono text-swp-white-ghost/70 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id} className="border-b border-swp-border last:border-0 hover:bg-swp-black/20">
                  <td className="px-4 py-3">
                    <code className="text-sm text-swp-ice">{rule.from_path}</code>
                    {rule.match_type === 'PREFIX' && (
                      <span className="ml-2 text-xs text-swp-white-ghost/70">*</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-sm text-swp-white-dim truncate max-w-[200px] block">{rule.to_url}</code>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-1 text-xs rounded bg-gray-800 text-swp-white-ghost">
                      {rule.match_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 text-xs rounded ${
                      rule.status_code === 301 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {rule.status_code}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggle(rule.id)}
                      className={`p-1 rounded transition-colors ${
                        rule.is_enabled 
                          ? 'text-green-400 hover:bg-green-500/10' 
                          : 'text-swp-white-ghost/70 hover:bg-gray-800'
                      }`}
                    >
                      {rule.is_enabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEdit(rule)}
                        className="p-1.5 text-swp-white-ghost/70 hover:text-swp-ice hover:bg-swp-ice/10 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="p-1.5 text-swp-white-ghost/70 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 bg-swp-ice/10 border border-swp-ice/30 rounded-swp p-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={18} className="text-swp-ice flex-shrink-0 mt-0.5" />
          <div className="text-sm text-swp-white-dim">
            <p><strong className="text-swp-ice">301</strong> = Permanent redirect (cached by browsers)</p>
            <p><strong className="text-swp-ice">302</strong> = Temporary redirect (not cached)</p>
            <p className="mt-1 text-swp-white-ghost/70">PREFIX match redirects all URLs starting with the from path.</p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-swp-deep/90">
          <div className="bg-swp-surface border border-swp-border rounded-swp w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-swp-border">
              <h3 className="text-lg font-bold text-white">
                {editingRule ? 'Edit Redirect' : 'Add Redirect'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-swp-white-ghost hover:text-swp-white">
                ×
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-swp-white-ghost text-sm mb-1">From Path *</label>
                <input
                  type="text"
                  value={formData.from_path}
                  onChange={(e) => setFormData(prev => ({ ...prev, from_path: e.target.value }))}
                  placeholder="/old-path"
                  className="w-full bg-swp-black border border-swp-border rounded-swp px-4 py-2.5 text-white focus:border-swp-ice focus:outline-none"
                />
                <p className="text-xs text-swp-white-ghost/70 mt-1">Must start with /</p>
              </div>
              
              <div>
                <label className="block text-swp-white-ghost text-sm mb-1">To URL *</label>
                <input
                  type="text"
                  value={formData.to_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, to_url: e.target.value }))}
                  placeholder="https://example.com/new-path or /new-path"
                  className="w-full bg-swp-black border border-swp-border rounded-swp px-4 py-2.5 text-white focus:border-swp-ice focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-swp-white-ghost text-sm mb-1">Status Code</label>
                  <select
                    value={formData.status_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, status_code: parseInt(e.target.value) }))}
                    className="w-full bg-swp-black border border-swp-border rounded-swp px-4 py-2.5 text-white focus:border-swp-ice focus:outline-none"
                  >
                    <option value={301}>301 (Permanent)</option>
                    <option value={302}>302 (Temporary)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-swp-white-ghost text-sm mb-1">Match Type</label>
                  <select
                    value={formData.match_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, match_type: e.target.value }))}
                    className="w-full bg-swp-black border border-swp-border rounded-swp px-4 py-2.5 text-white focus:border-swp-ice focus:outline-none"
                  >
                    <option value="EXACT">Exact Match</option>
                    <option value="PREFIX">Prefix Match</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-swp-white-ghost text-sm mb-1">Priority</label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                    className="w-full bg-swp-black border border-swp-border rounded-swp px-4 py-2.5 text-white focus:border-swp-ice focus:outline-none"
                  />
                  <p className="text-xs text-swp-white-ghost/70 mt-1">Lower = higher priority</p>
                </div>
                
                <div className="flex items-center gap-4 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.preserve_query}
                      onChange={(e) => setFormData(prev => ({ ...prev, preserve_query: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-600 bg-swp-black text-swp-ice focus:ring-swp-ice"
                    />
                    <span className="text-swp-white-dim text-sm">Preserve Query</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_enabled}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_enabled: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-600 bg-swp-black text-swp-ice focus:ring-swp-ice"
                    />
                    <span className="text-swp-white-dim text-sm">Enabled</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-swp-white-ghost text-sm mb-1">Note (optional)</label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="Internal note about this redirect"
                  className="w-full bg-swp-black border border-swp-border rounded-swp px-4 py-2.5 text-white focus:border-swp-ice focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t border-swp-border">
              <button 
                onClick={() => setShowModal(false)} 
                className="px-4 py-2 border border-swp-border text-swp-white-ghost rounded-swp hover:text-swp-white text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-swp-ice text-white rounded-swp text-sm disabled:opacity-50"
              >
                {saving ? 'Saving...' : (editingRule ? 'Update' : 'Create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default AdminSiteSettingsTab;
