import React, { useState, useEffect } from 'react';
import { 
  Globe, Search, FileText, Map, Code, Save, RefreshCw, 
  Check, X, ExternalLink, AlertCircle, ChevronDown, ChevronUp,
  Building2, Link, ToggleLeft, ToggleRight
} from 'lucide-react';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;

const AdminSeoSettingsTab = () => {
  const [settings, setSettings] = useState({
    global_seo: {
      site_name: 'Shadow Wolves Productions',
      site_url: 'https://shadowwolvesproductions.com',
      default_meta_title_template: '{pageTitle} | Shadow Wolves Productions',
      default_meta_description: '',
      default_og_image_url: '',
      focus_keyword_default: ''
    },
    organization_schema: {
      org_name: 'Shadow Wolves Productions',
      org_logo_url: '',
      org_sameas_links: '',
      enable_movie_schema: true,
      enable_faq_schema: true
    },
    robots: {
      robots_allow_all: true,
      robots_disallow_paths: '/admin\n/admin/*\n/studio-access\n/studio-access/*\n/api\n/api/*',
      robots_custom_override: ''
    },
    sitemap: {
      sitemap_enabled: true,
      include_films: true,
      include_blog: true,
      include_armory: true,
      exclude_drafts: true,
      exclude_archived: true
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSection, setExpandedSection] = useState('global_seo');
  const [validationStatus, setValidationStatus] = useState(null);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API}/api/site-settings/seo`);
      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({
          global_seo: { ...prev.global_seo, ...data.global_seo },
          organization_schema: { ...prev.organization_schema, ...data.organization_schema },
          robots: { ...prev.robots, ...data.robots },
          sitemap: { ...prev.sitemap, ...data.sitemap }
        }));
      }
    } catch (error) {
      console.error('Failed to fetch SEO settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API}/api/site-settings/seo`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        toast.success('SEO settings saved successfully!');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const validateSchemas = async () => {
    setValidating(true);
    setValidationStatus(null);
    
    // Open Google Rich Results Test in new tab
    const testUrl = `https://search.google.com/test/rich-results?url=${encodeURIComponent(settings.global_seo.site_url || window.location.origin)}`;
    window.open(testUrl, '_blank');
    
    setValidationStatus({
      message: 'Google Rich Results Test opened in new tab. Check the results there.',
      type: 'info'
    });
    setValidating(false);
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const Toggle = ({ enabled, onToggle, label }) => (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 text-sm"
    >
      {enabled ? (
        <ToggleRight size={24} className="text-electric-blue" />
      ) : (
        <ToggleLeft size={24} className="text-gray-500" />
      )}
      <span className={enabled ? 'text-white' : 'text-gray-500'}>{label}</span>
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-electric-blue animate-spin" />
      </div>
    );
  }

  const SECTIONS = [
    { id: 'global_seo', label: 'Global SEO', icon: Globe, description: 'Site name, URL, and default meta tags' },
    { id: 'organization_schema', label: 'Organization Schema', icon: Building2, description: 'JSON-LD structured data for your organization' },
    { id: 'robots', label: 'Robots.txt', icon: FileText, description: 'Control search engine crawling' },
    { id: 'sitemap', label: 'Sitemap', icon: Map, description: 'Configure sitemap generation' },
  ];

  return (
    <div className="space-y-6" data-testid="admin-seo-settings">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Search size={20} className="text-electric-blue" />
            SEO & Indexing Settings
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Configure search engine optimization, robots.txt, sitemap, and structured data
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={validateSchemas}
            disabled={validating}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg text-sm flex items-center gap-2"
          >
            {validating ? <RefreshCw size={16} className="animate-spin" /> : <ExternalLink size={16} />}
            Test Rich Results
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-electric-blue hover:bg-electric-blue/90 text-white rounded-lg font-medium flex items-center gap-2"
          >
            {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            Save All Settings
          </button>
        </div>
      </div>

      {/* Validation Status */}
      {validationStatus && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          validationStatus.type === 'success' ? 'bg-green-900/30 border border-green-800' :
          validationStatus.type === 'error' ? 'bg-red-900/30 border border-red-800' :
          'bg-blue-900/30 border border-blue-800'
        }`}>
          {validationStatus.type === 'success' ? <Check size={20} className="text-green-400" /> :
           validationStatus.type === 'error' ? <X size={20} className="text-red-400" /> :
           <AlertCircle size={20} className="text-blue-400" />}
          <span className="text-sm text-gray-300">{validationStatus.message}</span>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-3">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const isExpanded = expandedSection === section.id;

          return (
            <div key={section.id} className="bg-smoke-gray border border-gray-800 rounded-xl overflow-hidden">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
                data-testid={`seo-section-${section.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-electric-blue/10 flex items-center justify-center">
                    <Icon size={20} className="text-electric-blue" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium">{section.label}</p>
                    <p className="text-gray-500 text-sm">{section.description}</p>
                  </div>
                </div>
                {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
              </button>

              {/* Section Content */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-gray-800">
                  
                  {/* Global SEO */}
                  {section.id === 'global_seo' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Site Name</label>
                        <input
                          type="text"
                          value={settings.global_seo.site_name || ''}
                          onChange={(e) => handleChange('global_seo', 'site_name', e.target.value)}
                          className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-electric-blue focus:outline-none"
                          placeholder="Shadow Wolves Productions"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Production Site URL</label>
                        <input
                          type="url"
                          value={settings.global_seo.site_url || ''}
                          onChange={(e) => handleChange('global_seo', 'site_url', e.target.value)}
                          className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-electric-blue focus:outline-none"
                          placeholder="https://shadowwolvesproductions.com"
                        />
                        <p className="text-xs text-gray-500 mt-1">Used for canonical URLs and sitemap</p>
                      </div>
                      <div className="lg:col-span-2">
                        <label className="text-sm text-gray-400 mb-2 block">Meta Title Template</label>
                        <input
                          type="text"
                          value={settings.global_seo.default_meta_title_template || ''}
                          onChange={(e) => handleChange('global_seo', 'default_meta_title_template', e.target.value)}
                          className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-electric-blue focus:outline-none"
                          placeholder="{pageTitle} | Shadow Wolves Productions"
                        />
                        <p className="text-xs text-gray-500 mt-1">Use {'{pageTitle}'} as placeholder for page-specific title</p>
                      </div>
                      <div className="lg:col-span-2">
                        <label className="text-sm text-gray-400 mb-2 block">Default Meta Description</label>
                        <textarea
                          value={settings.global_seo.default_meta_description || ''}
                          onChange={(e) => handleChange('global_seo', 'default_meta_description', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-electric-blue focus:outline-none resize-none"
                          placeholder="Your default site description for SEO..."
                        />
                        <p className="text-xs text-gray-500 mt-1">{(settings.global_seo.default_meta_description || '').length}/160 characters</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Default OG Image URL</label>
                        <input
                          type="url"
                          value={settings.global_seo.default_og_image_url || ''}
                          onChange={(e) => handleChange('global_seo', 'default_og_image_url', e.target.value)}
                          className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-electric-blue focus:outline-none"
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Focus Keyword (Optional)</label>
                        <input
                          type="text"
                          value={settings.global_seo.focus_keyword_default || ''}
                          onChange={(e) => handleChange('global_seo', 'focus_keyword_default', e.target.value)}
                          className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-electric-blue focus:outline-none"
                          placeholder="film production"
                        />
                      </div>
                    </div>
                  )}

                  {/* Organization Schema */}
                  {section.id === 'organization_schema' && (
                    <div className="space-y-4 mt-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-400 mb-2 block">Organization Name</label>
                          <input
                            type="text"
                            value={settings.organization_schema.org_name || ''}
                            onChange={(e) => handleChange('organization_schema', 'org_name', e.target.value)}
                            className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-electric-blue focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-400 mb-2 block">Organization Logo URL</label>
                          <input
                            type="url"
                            value={settings.organization_schema.org_logo_url || ''}
                            onChange={(e) => handleChange('organization_schema', 'org_logo_url', e.target.value)}
                            className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-electric-blue focus:outline-none"
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Same As Links (Social Profiles)</label>
                        <textarea
                          value={settings.organization_schema.org_sameas_links || ''}
                          onChange={(e) => handleChange('organization_schema', 'org_sameas_links', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-electric-blue focus:outline-none resize-none font-mono text-sm"
                          placeholder="https://instagram.com/yourprofile&#10;https://twitter.com/yourprofile&#10;https://youtube.com/yourchannel"
                        />
                        <p className="text-xs text-gray-500 mt-1">One URL per line (Instagram, YouTube, IMDb, etc.)</p>
                      </div>
                      <div className="flex gap-6 pt-2">
                        <Toggle
                          enabled={settings.organization_schema.enable_movie_schema}
                          onToggle={() => handleChange('organization_schema', 'enable_movie_schema', !settings.organization_schema.enable_movie_schema)}
                          label="Enable Movie Schema on film pages"
                        />
                        <Toggle
                          enabled={settings.organization_schema.enable_faq_schema}
                          onToggle={() => handleChange('organization_schema', 'enable_faq_schema', !settings.organization_schema.enable_faq_schema)}
                          label="Enable FAQ Schema on Work With Us"
                        />
                      </div>
                    </div>
                  )}

                  {/* Robots.txt */}
                  {section.id === 'robots' && (
                    <div className="space-y-4 mt-4">
                      <div className="flex items-center justify-between">
                        <Toggle
                          enabled={settings.robots.robots_allow_all}
                          onToggle={() => handleChange('robots', 'robots_allow_all', !settings.robots.robots_allow_all)}
                          label="Allow all crawling (recommended)"
                        />
                        <a
                          href={`${API}/api/seo/robots.txt`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-electric-blue text-sm hover:underline flex items-center gap-1"
                        >
                          <ExternalLink size={14} />
                          Preview robots.txt
                        </a>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Disallow Paths (one per line)</label>
                        <textarea
                          value={settings.robots.robots_disallow_paths || ''}
                          onChange={(e) => handleChange('robots', 'robots_disallow_paths', e.target.value)}
                          rows={6}
                          className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-electric-blue focus:outline-none resize-none font-mono text-sm"
                          placeholder="/admin&#10;/admin/*&#10;/api&#10;/api/*"
                        />
                        <p className="text-xs text-gray-500 mt-1">Core paths (/admin, /studio-access, /api) are always disallowed</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Custom Override (Advanced)</label>
                        <textarea
                          value={settings.robots.robots_custom_override || ''}
                          onChange={(e) => handleChange('robots', 'robots_custom_override', e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-electric-blue focus:outline-none resize-none font-mono text-sm"
                          placeholder="Leave empty to use generated robots.txt. If filled, this exact content will be served."
                        />
                      </div>
                    </div>
                  )}

                  {/* Sitemap */}
                  {section.id === 'sitemap' && (
                    <div className="space-y-4 mt-4">
                      <div className="flex items-center justify-between">
                        <Toggle
                          enabled={settings.sitemap.sitemap_enabled}
                          onToggle={() => handleChange('sitemap', 'sitemap_enabled', !settings.sitemap.sitemap_enabled)}
                          label="Enable sitemap.xml"
                        />
                        <a
                          href={`${API}/api/seo/sitemap.xml`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-electric-blue text-sm hover:underline flex items-center gap-1"
                        >
                          <ExternalLink size={14} />
                          Preview sitemap.xml
                        </a>
                      </div>
                      
                      <div className="bg-black/50 rounded-lg p-4 border border-gray-800">
                        <p className="text-sm text-gray-400 mb-3">Include in Sitemap:</p>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                          <Toggle
                            enabled={settings.sitemap.include_films}
                            onToggle={() => handleChange('sitemap', 'include_films', !settings.sitemap.include_films)}
                            label="Film pages"
                          />
                          <Toggle
                            enabled={settings.sitemap.include_blog}
                            onToggle={() => handleChange('sitemap', 'include_blog', !settings.sitemap.include_blog)}
                            label="Blog posts"
                          />
                          <Toggle
                            enabled={settings.sitemap.include_armory}
                            onToggle={() => handleChange('sitemap', 'include_armory', !settings.sitemap.include_armory)}
                            label="Armory products"
                          />
                        </div>
                      </div>
                      
                      <div className="bg-black/50 rounded-lg p-4 border border-gray-800">
                        <p className="text-sm text-gray-400 mb-3">Exclusions:</p>
                        <div className="flex gap-6">
                          <Toggle
                            enabled={settings.sitemap.exclude_drafts}
                            onToggle={() => handleChange('sitemap', 'exclude_drafts', !settings.sitemap.exclude_drafts)}
                            label="Exclude draft posts"
                          />
                          <Toggle
                            enabled={settings.sitemap.exclude_archived}
                            onToggle={() => handleChange('sitemap', 'exclude_archived', !settings.sitemap.exclude_archived)}
                            label="Exclude archived items"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div className="bg-electric-blue/10 border border-electric-blue/30 rounded-lg p-4">
        <p className="text-sm text-gray-300">
          <strong className="text-electric-blue">Pro Tip:</strong> Use the "Test Rich Results" button to validate your structured data with Google's official tool. 
          Make sure your production site URL is set correctly for accurate testing.
        </p>
      </div>
    </div>
  );
};

export default AdminSeoSettingsTab;
