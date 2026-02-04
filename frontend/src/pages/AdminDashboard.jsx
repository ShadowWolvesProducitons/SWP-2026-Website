import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Package, FileText, LogOut, RefreshCw, Inbox, Briefcase, MessageSquare, Users, Mail } from 'lucide-react';
import { toast } from 'sonner';
import AdminFilmsTab from '../components/admin/AdminFilmsTab';
import AdminArmoryTab from '../components/admin/AdminArmoryTab';
import AdminBlogTab from '../components/admin/AdminBlogTab';
import AdminSubmissionsTab from '../components/admin/AdminSubmissionsTab';
import AdminInvestorTab from '../components/admin/AdminInvestorTab';
import AdminMessagesTab from '../components/admin/AdminMessagesTab';
import AdminNewsletterTab from '../components/admin/AdminNewsletterTab';
import AdminEmailTemplatesTab from '../components/admin/AdminEmailTemplatesTab';

const TABS = [
  { id: 'films', label: 'Films', icon: Film },
  { id: 'armory', label: 'The Armory', icon: Package },
  { id: 'blog', label: 'The Den', icon: FileText },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'submissions', label: 'Submissions', icon: Inbox },
  { id: 'newsletter', label: 'Newsletter', icon: Users },
  { id: 'email-templates', label: 'Templates', icon: Mail },
  { id: 'investors', label: 'Investors', icon: Briefcase },
];

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('films');
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
            <div className="w-10 h-10 bg-electric-blue/20 rounded-lg flex items-center justify-center">
              <Film className="w-5 h-5 text-electric-blue" />
            </div>
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
        {activeTab === 'films' && <AdminFilmsTab />}
        {activeTab === 'armory' && <AdminArmoryTab />}
        {activeTab === 'blog' && <AdminBlogTab />}
        {activeTab === 'messages' && <AdminMessagesTab />}
        {activeTab === 'submissions' && <AdminSubmissionsTab />}
        {activeTab === 'newsletter' && <AdminNewsletterTab />}
        {activeTab === 'email-templates' && <AdminEmailTemplatesTab />}
        {activeTab === 'investors' && <AdminInvestorTab />}
      </main>
    </div>
  );
};

export default AdminDashboard;
