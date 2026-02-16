import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Film, Package, FileText, LogOut, RefreshCw, Briefcase, Users, Mail, BarChart3, ArrowLeft, Activity, FolderOpen, Settings, Shield } from 'lucide-react';
import { toast } from 'sonner';
import AdminFilmsTab from '../components/admin/AdminFilmsTab';
import AdminArmoryTab from '../components/admin/AdminArmoryTab';
import AdminBlogTab from '../components/admin/AdminBlogTab';
import AdminActivityTab from '../components/admin/AdminActivityTab';
import AdminInvestorTab from '../components/admin/AdminInvestorTab';
import AdminNewsletterTab from '../components/admin/AdminNewsletterTab';
import AdminEmailTemplatesTab from '../components/admin/AdminEmailTemplatesTab';
import AdminAnalyticsTab from '../components/admin/AdminAnalyticsTab';
import AdminAssetsTab from '../components/admin/AdminAssetsTab';
import AdminSiteSettingsTab from '../components/admin/AdminSiteSettingsTab';
import AdminStudioPortalTab from '../components/admin/AdminStudioPortalTab';

const TABS = [
  { id: 'analytics', label: 'Dashboard', icon: BarChart3 },
  { id: 'films', label: 'Films', icon: Film },
  { id: 'armory', label: 'The Armory', icon: Package },
  { id: 'blog', label: 'The Den', icon: FileText },
  { id: 'assets', label: 'Assets', icon: FolderOpen },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'studio-portal', label: 'Studio Portal', icon: Shield },
  { id: 'newsletter', label: 'Newsletter', icon: Users },
  { id: 'email-templates', label: 'Templates', icon: Mail },
  { id: 'investors', label: 'Investors', icon: Briefcase },
  { id: 'site-settings', label: 'Site Settings', icon: Settings },
];

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('analytics');
  const navigate = useNavigate();

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

      {/* Tab Navigation */}
      <nav className="bg-smoke-gray/50 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-mono text-sm uppercase tracking-widest transition-all border-b-2 ${
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
        {activeTab === 'analytics' && <AdminAnalyticsTab />}
        {activeTab === 'films' && <AdminFilmsTab />}
        {activeTab === 'armory' && <AdminArmoryTab />}
        {activeTab === 'blog' && <AdminBlogTab />}
        {activeTab === 'assets' && <AdminAssetsTab />}
        {activeTab === 'activity' && <AdminActivityTab />}
        {activeTab === 'studio-portal' && <AdminStudioPortalTab />}
        {activeTab === 'newsletter' && <AdminNewsletterTab />}
        {activeTab === 'email-templates' && <AdminEmailTemplatesTab />}
        {activeTab === 'investors' && <AdminInvestorTab />}
        {activeTab === 'site-settings' && <AdminSiteSettingsTab />}
      </main>
    </div>
  );
};

export default AdminDashboard;
