import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film, Bell, FolderOpen, ChevronRight, RefreshCw, Calendar, FileText } from 'lucide-react';

const StudioDashboard = () => {
  const { user } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    const token = localStorage.getItem('studio_token');
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/studio-portal/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-electric-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8" data-testid="studio-dashboard">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white font-cinzel mb-2">
          Welcome, {data?.user?.full_name}
        </h1>
        <p className="text-gray-400">
          <span className="px-2 py-1 bg-electric-blue/20 text-electric-blue text-xs font-mono rounded mr-2">
            {getRoleLabel(data?.user?.role)}
          </span>
          Your Studio Portal Dashboard
        </p>
      </motion.div>

      {/* Projects Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-mono uppercase tracking-widest text-electric-blue flex items-center gap-2">
            <Film size={16} />
            Your Projects
          </h2>
          {data?.projects?.length > 0 && (
            <Link 
              to="/studio-access/projects" 
              className="text-gray-500 hover:text-white text-sm flex items-center gap-1 transition-colors"
            >
              View All <ChevronRight size={16} />
            </Link>
          )}
        </div>

        {data?.projects?.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.projects.slice(0, 6).map((project) => (
              <Link
                key={project.id}
                to={`/studio-access/projects/${project.slug}`}
                className="bg-smoke-gray border border-gray-800 rounded-lg overflow-hidden hover:border-gray-600 transition-colors group"
              >
                {/* Poster */}
                <div className="aspect-video bg-gray-900 relative overflow-hidden">
                  {project.poster_url ? (
                    <img
                      src={`${process.env.REACT_APP_BACKEND_URL}${project.poster_url}`}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film size={32} className="text-gray-700" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-black/70 text-electric-blue text-xs font-mono rounded">
                      {project.status}
                    </span>
                  </div>
                </div>
                {/* Info */}
                <div className="p-4">
                  <h3 className="text-white font-semibold mb-1">{project.title}</h3>
                  {project.genres?.length > 0 && (
                    <p className="text-gray-500 text-sm">{project.genres.join(' • ')}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-smoke-gray border border-gray-800 rounded-lg p-8 text-center">
            <Film size={32} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No projects assigned yet.</p>
            <p className="text-gray-600 text-sm mt-1">
              Contact admin to request project access.
            </p>
          </div>
        )}
      </motion.section>

      {/* Updates & Assets Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Updates */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-mono uppercase tracking-widest text-electric-blue flex items-center gap-2">
              <Bell size={16} />
              Recent Updates
            </h2>
            {data?.recent_updates?.length > 0 && (
              <Link 
                to="/studio-access/updates" 
                className="text-gray-500 hover:text-white text-sm flex items-center gap-1 transition-colors"
              >
                View All <ChevronRight size={16} />
              </Link>
            )}
          </div>

          {data?.recent_updates?.length > 0 ? (
            <div className="space-y-3">
              {data.recent_updates.slice(0, 4).map((update) => (
                <div
                  key={update.id}
                  className="bg-smoke-gray border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="text-white font-medium mb-1">{update.title}</h3>
                      <p className="text-gray-500 text-sm line-clamp-2">
                        {update.body?.replace(/<[^>]*>/g, '').substring(0, 100)}...
                      </p>
                    </div>
                    <span className="text-gray-600 text-xs whitespace-nowrap">
                      {new Date(update.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {update.tags?.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {update.tags.slice(0, 2).map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-smoke-gray border border-gray-800 rounded-lg p-6 text-center">
              <Bell size={24} className="text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No updates yet</p>
            </div>
          )}
        </motion.section>

        {/* Recent Assets */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-mono uppercase tracking-widest text-electric-blue flex items-center gap-2">
              <FolderOpen size={16} />
              Recent Assets
            </h2>
            {data?.recent_assets?.length > 0 && (
              <Link 
                to="/studio-access/assets" 
                className="text-gray-500 hover:text-white text-sm flex items-center gap-1 transition-colors"
              >
                View All <ChevronRight size={16} />
              </Link>
            )}
          </div>

          {data?.recent_assets?.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {data.recent_assets.slice(0, 4).map((asset) => (
                <div
                  key={asset.id}
                  className="bg-smoke-gray border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
                >
                  <FileText size={24} className="text-electric-blue mb-2" />
                  <h3 className="text-white text-sm font-medium line-clamp-1">{asset.name}</h3>
                  <p className="text-gray-600 text-xs capitalize">{asset.asset_type?.replace('_', ' ')}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-smoke-gray border border-gray-800 rounded-lg p-6 text-center">
              <FolderOpen size={24} className="text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No assets available</p>
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
};

export default StudioDashboard;
