import React, { useState, useEffect, useRef } from 'react';
import { Image, Upload, Save, Eye, RefreshCw, ChevronDown, ChevronUp, Move } from 'lucide-react';
import { toast } from 'sonner';
import AdminLeadMagnetSettings from './AdminLeadMagnetSettings';

const API = process.env.REACT_APP_BACKEND_URL;

const PAGES = [
  { id: 'films', label: 'Films', defaultImage: '/api/upload/images/header-films.jpg' },
  { id: 'armory', label: 'The Armory', defaultImage: '/api/upload/images/header-armory.jpg' },
  { id: 'den', label: 'The Den (Blog)', defaultImage: '/api/upload/images/header-den.jpg' },
  { id: 'workwithus', label: 'Work With Us', defaultImage: '/api/upload/images/header-workwithus.jpg' },
  { id: 'about', label: 'About', defaultImage: '/api/upload/images/header-about.jpg' },
  // Removed: Contact (merged with Work With Us), Investors (replaced by Studio Portal)
];

const AdminSiteSettingsTab = () => {
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
        <RefreshCw className="w-8 h-8 text-electric-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Headers */}
      <div className="space-y-4">
        
        <div className="space-y-3">
          {PAGES.map((page) => {
            const isExpanded = expandedPage === page.id;
            const pageSettings = settings[page.id] || {};
            
            return (
              <div 
                key={page.id}
                className="bg-smoke-gray border border-gray-800 rounded-xl overflow-hidden"
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
                    <ChevronUp size={20} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400" />
                  )}
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-800">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                      {/* Preview */}
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Preview</label>
                        <div 
                          className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-900"
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
                              <h3 className="text-3xl font-bold text-white font-cinzel">
                                {pageSettings.title || page.label}
                              </h3>
                              {pageSettings.subtitle && (
                                <p className="text-gray-300 mt-2">{pageSettings.subtitle}</p>
                              )}
                            </div>
                          </div>
                          {/* Position indicator */}
                          <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-gray-300 flex items-center gap-1">
                            <Move size={12} />
                            {pageSettings.position_x ?? 50}%, {pageSettings.position_y ?? 30}%
                          </div>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="space-y-4">
                        {/* Image Upload */}
                        <div>
                          <label className="text-sm text-gray-400 mb-2 block">Header Image</label>
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
                            className="w-full px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
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
                          <p className="text-xs text-gray-500 mt-1">Recommended: 1920×600px or wider</p>
                        </div>

                        {/* Position X */}
                        <div>
                          <label className="text-sm text-gray-400 mb-2 flex items-center justify-between">
                            <span>Horizontal Position</span>
                            <span className="text-electric-blue">{pageSettings.position_x ?? 50}%</span>
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={pageSettings.position_x ?? 50}
                            onChange={(e) => handleSettingChange(page.id, 'position_x', parseInt(e.target.value))}
                            className="w-full accent-electric-blue"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Left</span>
                            <span>Center</span>
                            <span>Right</span>
                          </div>
                        </div>

                        {/* Position Y */}
                        <div>
                          <label className="text-sm text-gray-400 mb-2 flex items-center justify-between">
                            <span>Vertical Position</span>
                            <span className="text-electric-blue">{pageSettings.position_y ?? 30}%</span>
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={pageSettings.position_y ?? 30}
                            onChange={(e) => handleSettingChange(page.id, 'position_y', parseInt(e.target.value))}
                            className="w-full accent-electric-blue"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Top</span>
                            <span>Middle</span>
                            <span>Bottom</span>
                          </div>
                        </div>

                        {/* Overlay Opacity */}
                        <div>
                          <label className="text-sm text-gray-400 mb-2 flex items-center justify-between">
                            <span>Overlay Darkness</span>
                            <span className="text-electric-blue">{pageSettings.overlay_opacity ?? 85}%</span>
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
                          className="w-full px-4 py-2.5 bg-electric-blue hover:bg-electric-blue/90 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
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
                          className="w-full px-4 py-2 border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
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
      </div>

      {/* Info */}
      <div className="bg-electric-blue/10 border border-electric-blue/30 rounded-lg p-4">
        <p className="text-sm text-gray-300">
          <strong className="text-electric-blue">Tip:</strong> Use the sliders to adjust how much of the header image is visible. 
          Lower vertical position values show more of the top of the image. Changes are saved per page.
        </p>
      </div>

      {/* Lead Magnet Settings */}
      <AdminLeadMagnetSettings />
    </div>
  );
};

export default AdminSiteSettingsTab;
