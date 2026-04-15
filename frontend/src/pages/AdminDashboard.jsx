import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Film, Package, FileText, LogOut, BarChart3, FolderOpen, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import AdminFilmsTab       from '../components/admin/AdminFilmsTab';
import AdminArmoryTab      from '../components/admin/AdminArmoryTab';
import AdminBlogTab        from '../components/admin/AdminBlogTab';
import AdminAssetsTab      from '../components/admin/AdminAssetsTab';
import AdminStudioTab      from '../components/admin/AdminStudioTab';
import AdminDashboardTab   from '../components/admin/AdminDashboardTab';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_wolfmedia/artifacts/bifyh7bv_Black%20Logo%20Only.png";

const TABS = [
  { id: 'dashboard', label: 'Dashboard',  Icon: BarChart3  },
  { id: 'films',     label: 'Films',      Icon: Film       },
  { id: 'armory',    label: 'Resources',  Icon: Package    },
  { id: 'blog',      label: 'Blog',       Icon: FileText   },
  { id: 'assets',    label: 'Assets',     Icon: FolderOpen },
  { id: 'studio',    label: 'Studio',     Icon: Building2  },
];

const LEGACY = {
  analytics: 'dashboard', activity: 'dashboard',
  newsletter: 'studio', 'email-templates': 'studio',
  investors: 'studio', 'site-settings': 'studio', 'studio-portal': 'studio',
};

const s = {
  shell: {
    display: 'flex', minHeight: '100vh',
    background: 'var(--swp-black)', color: 'var(--swp-white)',
    fontFamily: 'var(--font-body)',
  },
  sidebar: (collapsed) => ({
    width: collapsed ? '64px' : '220px',
    flexShrink: 0,
    background: 'rgba(13,15,20,0.95)',
    backdropFilter: 'blur(16px)',
    borderRight: '0.5px solid rgba(255,255,255,0.07)',
    display: 'flex', flexDirection: 'column',
    position: 'sticky', top: 0, height: '100vh',
    transition: 'width 0.25s ease',
    overflow: 'hidden',
  }),
  sidebarTop: {
    padding: '20px 16px 16px',
    borderBottom: '0.5px solid rgba(255,255,255,0.06)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  navItem: (active, collapsed) => ({
    display: 'flex', alignItems: 'center',
    gap: collapsed ? 0 : '12px',
    padding: collapsed ? '13px 0' : '11px 18px',
    justifyContent: collapsed ? 'center' : 'flex-start',
    cursor: 'pointer', border: 'none',
    background: active ? 'rgba(106,157,190,0.1)' : 'transparent',
    borderLeft: active ? '2px solid var(--swp-ice)' : '2px solid transparent',
    color: active ? 'var(--swp-white)' : 'rgba(238,240,242,0.38)',
    fontFamily: 'var(--font-mono)',
    fontSize: '10px', letterSpacing: '0.13em', textTransform: 'uppercase',
    transition: 'all 0.2s', width: '100%', whiteSpace: 'nowrap',
  }),
  main: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  topbar: {
    height: '56px', padding: '0 32px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    borderBottom: '0.5px solid rgba(255,255,255,0.07)',
    background: 'rgba(13,15,20,0.8)',
    backdropFilter: 'blur(12px)',
    position: 'sticky', top: 0, zIndex: 40,
  },
  content: { flex: 1, padding: '36px 32px', overflowY: 'auto' },
};

const AdminDashboard = ({ onLogout }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const tabFromUrl = searchParams.get('tab') || 'dashboard';
  const activeTab  = LEGACY[tabFromUrl] || tabFromUrl;

  const handleTabChange = (id) => setSearchParams({ tab: id });

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    onLogout();
    navigate('/admin');
    toast.success('Logged out');
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'films':     return <AdminFilmsTab />;
      case 'armory':    return <AdminArmoryTab />;
      case 'blog':      return <AdminBlogTab />;
      case 'assets':    return <AdminAssetsTab />;
      case 'studio':    return <AdminStudioTab />;
      default:          return <AdminDashboardTab />;
    }
  };

  const activeLabel = TABS.find(t => t.id === activeTab)?.label || 'Dashboard';

  return (
    <div style={s.shell}>
      {/* Sidebar */}
      <aside style={s.sidebar(collapsed)}>
        <div style={s.sidebarTop}>
          {!collapsed && (
            <img
              src={LOGO_URL}
              alt="SWP"
              style={{ height: '32px', width: 'auto', opacity: 0.85 }}
            />
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(238,240,242,0.3)', padding: '4px', marginLeft: collapsed ? 'auto' : 0, marginRight: collapsed ? 'auto' : 0 }}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav style={{ flex: 1, padding: '12px 0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              style={s.navItem(activeTab === id, collapsed)}
              title={collapsed ? label : undefined}
              onMouseEnter={e => { if (activeTab !== id) e.currentTarget.style.color = 'rgba(238,240,242,0.7)'; }}
              onMouseLeave={e => { if (activeTab !== id) e.currentTarget.style.color = 'rgba(238,240,242,0.38)'; }}
            >
              <Icon size={15} style={{ flexShrink: 0 }} />
              {!collapsed && label}
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div style={{ padding: '12px 0', borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
          <Link
            to="/"
            style={{
              ...s.navItem(false, collapsed),
              display: 'flex', alignItems: 'center',
              gap: collapsed ? 0 : '12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              textDecoration: 'none', fontSize: '10px',
            }}
            title={collapsed ? 'View site' : undefined}
          >
            <ChevronLeft size={15} style={{ flexShrink: 0 }} />
            {!collapsed && 'View Site'}
          </Link>
          <button
            onClick={handleLogout}
            style={{ ...s.navItem(false, collapsed), color: 'rgba(200,100,100,0.6)' }}
            title={collapsed ? 'Logout' : undefined}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(220,120,120,0.9)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(200,100,100,0.6)'}
          >
            <LogOut size={15} style={{ flexShrink: 0 }} />
            {!collapsed && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div style={s.main}>
        {/* Top bar */}
        <div style={s.topbar}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', letterSpacing: '0.04em', color: 'var(--swp-white)' }}>
            {activeLabel}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(238,240,242,0.25)' }}>
            Admin
          </span>
        </div>

        {/* Tab content */}
        <div style={s.content}>
          {renderTab()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
