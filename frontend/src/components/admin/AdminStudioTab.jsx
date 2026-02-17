import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Building2, Users, Shield, MessageSquare, Settings, RefreshCw, Search } from 'lucide-react';
import { toast } from 'sonner';

// Import existing components that we'll reuse
import AdminStudioPortalTab from './AdminStudioPortalTab';
import AdminNewsletterTab from './AdminNewsletterTab';
import AdminEmailTemplatesTab from './AdminEmailTemplatesTab';
import AdminSiteSettingsTab from './AdminSiteSettingsTab';
import AdminSeoSettingsTab from './AdminSeoSettingsTab';

// Sub-navigation for Studio section
const STUDIO_SUBTABS = [
  { id: 'portal', label: 'Portal', icon: Shield, description: 'Manage studio access users and permissions' },
  { id: 'comms', label: 'Comms', icon: MessageSquare, description: 'Newsletter subscribers and email templates' },
  { id: 'settings', label: 'Settings', icon: Settings, description: 'Page headers and site configuration' },
  { id: 'seo', label: 'SEO', icon: Search, description: 'Search engine optimization and indexing' },
];

const AdminStudioTab = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const subtabFromUrl = searchParams.get('subtab') || 'portal';
  const [activeSubTab, setActiveSubTab] = useState(subtabFromUrl);
  const [commsSection, setCommsSection] = useState('subscribers'); // For Comms internal tabs

  // Keep subtab in sync with URL
  useEffect(() => {
    if (subtabFromUrl && subtabFromUrl !== activeSubTab) {
      setActiveSubTab(subtabFromUrl);
    }
  }, [subtabFromUrl]);

  const handleSubTabChange = (tabId) => {
    setActiveSubTab(tabId);
    setSearchParams({ tab: 'studio', subtab: tabId });
  };

  return (
    <div data-testid="admin-studio-tab">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Building2 className="text-electric-blue" />
          Studio
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Manage the Studio Access Portal, communications, and site settings
        </p>
      </div>

      {/* Sub-Navigation */}
      <div className="flex gap-3 mb-8 border-b border-gray-800 pb-4">
        {STUDIO_SUBTABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleSubTabChange(tab.id)}
              data-testid={`studio-subtab-${tab.id}`}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg font-mono text-sm uppercase tracking-widest transition-all ${
                activeSubTab === tab.id
                  ? 'bg-electric-blue text-white'
                  : 'bg-smoke-gray text-gray-400 hover:text-white hover:bg-smoke-gray/80 border border-gray-800'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Sub-Tab Content */}
      {activeSubTab === 'portal' && (
        <StudioPortalSection />
      )}

      {activeSubTab === 'comms' && (
        <StudioCommsSection 
          activeSection={commsSection} 
          setActiveSection={setCommsSection} 
        />
      )}

      {activeSubTab === 'settings' && (
        <StudioSettingsSection />
      )}

      {activeSubTab === 'seo' && (
        <StudioSeoSection />
      )}
    </div>
  );
};

// ========== PORTAL SECTION ==========
// Wraps the existing AdminStudioPortalTab with updated language
const StudioPortalSection = () => {
  return (
    <div data-testid="studio-portal-section">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Shield size={18} className="text-electric-blue" />
          Studio Access Portal Management
        </h3>
        <p className="text-gray-500 text-sm mt-1">
          Manage user access, roles, and project permissions for the Studio Portal
        </p>
      </div>
      {/* Reuse the existing portal management component */}
      <AdminStudioPortalTab />
    </div>
  );
};

// ========== COMMS SECTION ==========
// Merges Newsletter + Email Templates
const StudioCommsSection = ({ activeSection, setActiveSection }) => {
  return (
    <div data-testid="studio-comms-section">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <MessageSquare size={18} className="text-electric-blue" />
          Communications
        </h3>
        <p className="text-gray-500 text-sm mt-1">
          Manage newsletter subscribers and email templates
        </p>
      </div>

      {/* Internal Tabs for Comms */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveSection('subscribers')}
          data-testid="comms-tab-subscribers"
          className={`px-4 py-2 rounded-lg text-sm transition-all ${
            activeSection === 'subscribers'
              ? 'bg-white text-black'
              : 'bg-smoke-gray text-gray-400 hover:text-white border border-gray-700'
          }`}
        >
          Subscribers
        </button>
        <button
          onClick={() => setActiveSection('templates')}
          data-testid="comms-tab-templates"
          className={`px-4 py-2 rounded-lg text-sm transition-all ${
            activeSection === 'templates'
              ? 'bg-white text-black'
              : 'bg-smoke-gray text-gray-400 hover:text-white border border-gray-700'
          }`}
        >
          Templates
        </button>
      </div>

      {/* Content */}
      {activeSection === 'subscribers' && <AdminNewsletterTab />}
      {activeSection === 'templates' && <AdminEmailTemplatesTab />}
    </div>
  );
};

// ========== SETTINGS SECTION ==========
// Wraps the existing AdminSiteSettingsTab
const StudioSettingsSection = () => {
  return (
    <div data-testid="studio-settings-section">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Settings size={18} className="text-electric-blue" />
          Site Settings
        </h3>
        <p className="text-gray-500 text-sm mt-1">
          Configure page headers and site appearance
        </p>
      </div>
      {/* Reuse the existing site settings component */}
      <AdminSiteSettingsTab />
    </div>
  );
};

export default AdminStudioTab;
