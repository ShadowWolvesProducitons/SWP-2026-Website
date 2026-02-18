import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film, RefreshCw, Search } from 'lucide-react';

const StudioProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const token = localStorage.getItem('studio_token');
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/studio-portal/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.genres?.some(g => g.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-electric-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8" data-testid="studio-projects">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white font-cinzel mb-2">Projects</h1>
        <p className="text-gray-400">Access your assigned project materials</p>
      </motion.div>

      {projects.length > 0 ? (
        <>
          {/* Search */}
          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full bg-smoke-gray border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white focus:border-electric-blue focus:outline-none transition-colors"
            />
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProjects.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link
                  to={`/studio-access/projects/${project.slug}`}
                  className="block bg-smoke-gray border border-gray-800 rounded-lg overflow-hidden hover:border-electric-blue/50 transition-all group"
                >
                  {/* Poster - 2:3 ratio */}
                  <div className="aspect-[2/3] bg-gray-900 relative overflow-hidden">
                    {project.poster_url ? (
                      <img
                        src={`${process.env.REACT_APP_BACKEND_URL}${project.poster_url}`}
                        alt={project.title}
                        className="w-full h-full object-contain bg-black group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                        <Film size={48} className="text-gray-700" />
                      </div>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-white font-semibold text-lg group-hover:text-electric-blue transition-colors">
                        {project.title}
                      </h3>
                      <span className="px-2 py-1 bg-electric-blue text-white text-xs font-bold uppercase rounded shrink-0">
                        {project.status}
                      </span>
                    </div>
                    {project.genres?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.genres.map((genre, gIdx) => (
                          <span key={gIdx} className="text-gray-500 text-sm">
                            {genre}{gIdx < project.genres.length - 1 ? ' •' : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {filteredProjects.length === 0 && search && (
            <p className="text-gray-500 text-center py-8">No projects match your search.</p>
          )}
        </>
      ) : (
        <div className="bg-smoke-gray border border-gray-800 rounded-lg p-12 text-center">
          <Film size={48} className="text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl text-white mb-2">No Projects Assigned</h2>
          <p className="text-gray-500">
            You don't have access to any projects yet. Contact admin to request project access.
          </p>
        </div>
      )}
    </div>
  );
};

export default StudioProjects;
