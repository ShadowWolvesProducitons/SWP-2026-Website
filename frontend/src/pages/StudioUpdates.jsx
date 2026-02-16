import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, RefreshCw, Filter, Calendar, Tag } from 'lucide-react';

const StudioUpdates = () => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');

  useEffect(() => {
    fetchUpdates();
  }, [selectedTag]);

  const fetchUpdates = async () => {
    const token = localStorage.getItem('studio_token');
    
    try {
      let url = `${process.env.REACT_APP_BACKEND_URL}/api/studio-portal/updates`;
      if (selectedTag) {
        url += `?tag=${selectedTag}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUpdates(data.updates || []);
        setAvailableTags(data.available_tags || []);
      }
    } catch (err) {
      console.error('Failed to fetch updates:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-electric-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8" data-testid="studio-updates">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white font-cinzel mb-2">Updates</h1>
        <p className="text-gray-400">Stay informed with the latest news and announcements</p>
      </motion.div>

      {/* Tag Filter */}
      {availableTags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={16} className="text-gray-500" />
            <button
              onClick={() => setSelectedTag('')}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                !selectedTag 
                  ? 'bg-electric-blue text-white' 
                  : 'bg-smoke-gray text-gray-400 hover:text-white'
              }`}
            >
              All
            </button>
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors capitalize ${
                  selectedTag === tag 
                    ? 'bg-electric-blue text-white' 
                    : 'bg-smoke-gray text-gray-400 hover:text-white'
                }`}
              >
                {tag.replace('_', ' ')}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Updates List */}
      {updates.length > 0 ? (
        <div className="space-y-4">
          {updates.map((update, idx) => (
            <motion.article
              key={update.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-smoke-gray border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <h2 className="text-xl text-white font-semibold">{update.title}</h2>
                <div className="flex items-center gap-2 text-gray-500 text-sm whitespace-nowrap">
                  <Calendar size={14} />
                  {formatDate(update.created_at)}
                </div>
              </div>
              
              {/* Tags */}
              {update.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {update.tags.map((tag, tIdx) => (
                    <span 
                      key={tIdx} 
                      className="px-2 py-0.5 bg-electric-blue/10 text-electric-blue text-xs font-mono uppercase rounded"
                    >
                      {tag.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Body */}
              <div 
                className="text-gray-400 prose prose-invert prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: update.body }}
              />
            </motion.article>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-smoke-gray border border-gray-800 rounded-lg p-12 text-center"
        >
          <Bell size={48} className="text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl text-white mb-2">No Updates Yet</h2>
          <p className="text-gray-500">
            {selectedTag 
              ? `No updates found with the "${selectedTag}" tag.`
              : "Check back later for news and announcements about your projects."}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default StudioUpdates;
