import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Film, Bell, User, LogOut, 
  Menu, X, ChevronRight, RefreshCw 
} from 'lucide-react';
import { toast } from 'sonner';

const NAV_ITEMS = [
  { path: '/studio-access', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/studio-access/projects', icon: Film, label: 'Projects' },
  { path: '/studio-access/updates', icon: Bell, label: 'Updates' },
  { path: '/studio-access/account', icon: User, label: 'Account' }
];

const StudioPortalLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('studio_token');
    
    if (!token) {
      navigate('/studio-access/login');
      return;
    }
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/studio-portal/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('studio_user', JSON.stringify(data.user));
      } else {
        // Token invalid
        localStorage.removeItem('studio_token');
        localStorage.removeItem('studio_user');
        navigate('/studio-access/login');
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      navigate('/studio-access/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('studio_token');
    localStorage.removeItem('studio_user');
    toast.success('Logged out successfully');
    navigate('/studio-access/login');
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Admin',
      investor: 'Investor',
      sales_agent: 'Sales Agent',
      director: 'Director',
      producer: 'Producer',
      executive_producer: 'Executive Producer',
      cast: 'Cast',
      crew: 'Crew',
      talent_manager: 'Talent Manager',
      other: 'Other'
    };
    return labels[role] || role;
  };

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-electric-blue animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Studio Portal | Shadow Wolves Productions</title>
      </Helmet>

      <div className="min-h-screen bg-black flex" data-testid="studio-portal-layout">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex flex-col w-64 bg-smoke-gray border-r border-gray-800">
          {/* Logo */}
          <div className="p-6 border-b border-gray-800">
            <Link to="/" className="text-white font-cinzel text-lg">
              Shadow Wolves
            </Link>
            <p className="text-electric-blue text-xs font-mono uppercase tracking-widest mt-1">
              Studio Portal
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                  isActive(item.path, item.exact)
                    ? 'bg-electric-blue/10 text-electric-blue border-r-2 border-electric-blue'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={20} />
                <span className="font-mono text-sm uppercase tracking-wider">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="p-6 border-t border-gray-800">
            <div className="mb-4">
              <p className="text-white font-semibold">{user?.full_name}</p>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <span className="inline-block mt-2 px-2 py-1 bg-electric-blue/20 text-electric-blue text-xs font-mono rounded">
                {getRoleLabel(user?.role)}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-500 hover:text-red-400 transition-colors text-sm"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-smoke-gray border-b border-gray-800">
          <div className="flex items-center justify-between px-4 py-4">
            <div>
              <span className="text-white font-cinzel">Shadow Wolves</span>
              <span className="text-electric-blue text-xs font-mono ml-2">Portal</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-400"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-smoke-gray border-b border-gray-800 pb-4"
            >
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-6 py-3 ${
                    isActive(item.path, item.exact)
                      ? 'text-electric-blue'
                      : 'text-gray-400'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              ))}
              <div className="px-6 pt-4 border-t border-gray-800 mt-2">
                <p className="text-white text-sm">{user?.full_name}</p>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-400 text-sm mt-2"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0 pt-16 lg:pt-0 overflow-auto">
          <Outlet context={{ user, checkAuth }} />
        </main>
      </div>
    </>
  );
};

export default StudioPortalLayout;
