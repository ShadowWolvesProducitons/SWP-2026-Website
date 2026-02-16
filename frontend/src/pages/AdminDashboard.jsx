import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Film, Package, FileText, LogOut, RefreshCw, Briefcase, Users, Mail, BarChart3, ArrowLeft, Activity, FolderOpen, Settings, Shield, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import AdminFilmsTab from '../components/admin/AdminFilmsTab';
import AdminArmoryTab from '../components/admin/AdminArmoryTab';
import AdminBlogTab from '../components/admin/AdminBlogTab';
import AdminAssetsTab from '../components/admin/AdminAssetsTab';
import AdminStudioTab from '../components/admin/AdminStudioTab';
import AdminDashboardTab from '../components/admin/AdminDashboardTab';

// New streamlined navigation - 6 top-level tabs only
const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'films', label: 'Films', icon: Film },
  { id: 'armory', label: 'The Armory', icon: Package },
  { id: 'blog', label: 'The Den', icon: FileText },
  { id: 'assets', label: 'Assets', icon: FolderOpen },
  { id: 'studio', label: 'Studio', icon: Building2 },
];

// Route redirects for legacy URLs
const LEGACY_ROUTE_MAP = {
  'analytics': 'dashboard',
  'activity': 'dashboard',
  'newsletter': 'studio',
  'email-templates': 'studio',
  'investors': 'studio',
  'site-settings': 'studio',
  'studio-portal': 'studio',
};

const AdminDashboard = ({ onLogout }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get tab from URL or default to 'dashboard'
  const tabFromUrl = searchParams.get('tab') || 'dashboard';
  
  // Handle legacy route redirects
  const activeTab = LEGACY_ROUTE_MAP[tabFromUrl] || tabFromUrl;
  
  // Redirect if we mapped to a different tab
  useEffect(() => {
    if (LEGACY_ROUTE_MAP[tabFromUrl]) {
      const newTab = LEGACY_ROUTE_MAP[tabFromUrl];
      // For newsletter/templates, redirect to studio with comms sub-tab
      if (tabFromUrl === 'newsletter' || tabFromUrl === 'email-templates') {
        setSearchParams({ tab: 'studio', subtab: 'comms' });
      } else if (tabFromUrl === 'site-settings') {
        setSearchParams({ tab: 'studio', subtab: 'settings' });
      } else if (tabFromUrl === 'studio-portal' || tabFromUrl === 'investors') {
        setSearchParams({ tab: 'studio', subtab: 'portal' });
      } else {
        setSearchParams({ tab: newTab });
      }
      toast.info(`Redirected from ${tabFromUrl} to ${newTab}`);
    }
  }, [tabFromUrl, setSearchParams]);

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    onLogout();
    navigate('/admin');
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-smoke-gray border-b border-gray-800 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600 rounded-full transition-colors text-sm"
              data-testid="admin-back-to-site"
            >
              <ArrowLeft size={16} />
              Back to Website
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Studio Admin Console</h1>
              <p className="text-gray-500 text-xs">Shadow Wolves Productions</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </header>

      {/* Tab Navigation - Streamlined 6-tab structure */}
      <nav className="bg-smoke-gray/50 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  data-testid={`nav-tab-${tab.id}`}
                  className={`flex items-center gap-2 px-6 py-4 font-mono text-sm uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-electric-blue border-electric-blue bg-black/30'
                      : 'text-gray-400 border-transparent hover:text-white hover:bg-black/20'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Tab Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'dashboard' && <AdminDashboardTab />}
        {activeTab === 'films' && <AdminFilmsTab />}
        {activeTab === 'armory' && <AdminArmoryTab />}
        {activeTab === 'blog' && <AdminBlogTab />}
        {activeTab === 'assets' && <AdminAssetsTab />}
        {activeTab === 'studio' && <AdminStudioTab />}
      </main>
    </div>
  );
};

export default AdminDashboard;
