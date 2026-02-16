import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FolderOpen, RefreshCw, Download, FileText, Image, Video, File, Filter } from 'lucide-react';
import { toast } from 'sonner';

const ASSET_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'pitch_deck', label: 'Pitch Decks' },
  { value: 'script', label: 'Scripts' },
  { value: 'ebook', label: 'E-Books' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
  { value: 'document', label: 'Documents' }
];

const StudioAssets = () => {
  const [searchParams] = useSearchParams();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('');
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    fetchAssets();
  }, [selectedType]);

  const fetchAssets = async () => {
    const token = localStorage.getItem('studio_token');
    
    try {
      let url = `${process.env.REACT_APP_BACKEND_URL}/api/studio-portal/assets`;
      if (selectedType) {
        url += `?asset_type=${selectedType}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAssets(data.assets || []);
      }
    } catch (err) {
      console.error('Failed to fetch assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (asset) => {
    const token = localStorage.getItem('studio_token');
    setDownloading(asset.id);
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/studio-portal/assets/${asset.id}/download`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = asset.name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast.success('Download started');
      } else {
        const err = await response.json();
        toast.error(err.detail || 'Download failed');
      }
    } catch (err) {
      toast.error('Download failed');
    } finally {
      setDownloading(null);
    }
  };

  const getAssetIcon = (type) => {
    switch (type) {
      case 'image':
        return Image;
      case 'video':
        return Video;
      case 'pitch_deck':
      case 'script':
      case 'ebook':
      case 'document':
        return FileText;
      default:
        return File;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-electric-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8" data-testid="studio-assets">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white font-cinzel mb-2">Assets</h1>
        <p className="text-gray-400">Download project materials and documents</p>
      </motion.div>

      {/* Type Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={16} className="text-gray-500" />
          {ASSET_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                selectedType === type.value 
                  ? 'bg-electric-blue text-white' 
                  : 'bg-smoke-gray text-gray-400 hover:text-white'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Watermark Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-smoke-gray border border-gray-800 rounded-lg p-4 mb-6"
      >
        <p className="text-gray-400 text-sm">
          <strong className="text-white">Notice:</strong> All downloaded documents are watermarked with your 
          information for tracking and security purposes.
        </p>
      </motion.div>

      {/* Assets Grid */}
      {assets.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {assets.map((asset, idx) => {
            const Icon = getAssetIcon(asset.asset_type);
            
            return (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-smoke-gray border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
              >
                {/* Icon & Type */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-electric-blue/10 rounded-lg flex items-center justify-center">
                    <Icon size={24} className="text-electric-blue" />
                  </div>
                  <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs font-mono uppercase rounded">
                    {asset.asset_type?.replace('_', ' ')}
                  </span>
                </div>

                {/* Name & Description */}
                <h3 className="text-white font-medium mb-1 line-clamp-2">{asset.name}</h3>
                {asset.description && (
                  <p className="text-gray-500 text-sm line-clamp-2 mb-3">{asset.description}</p>
                )}

                {/* File Size */}
                {asset.file_size > 0 && (
                  <p className="text-gray-600 text-xs mb-3">{formatFileSize(asset.file_size)}</p>
                )}

                {/* Download Button */}
                <button
                  onClick={() => handleDownload(asset)}
                  disabled={downloading === asset.id}
                  className="w-full flex items-center justify-center gap-2 bg-electric-blue/10 hover:bg-electric-blue/20 
                             text-electric-blue px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {downloading === asset.id ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      Download
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-smoke-gray border border-gray-800 rounded-lg p-12 text-center"
        >
          <FolderOpen size={48} className="text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl text-white mb-2">No Assets Available</h2>
          <p className="text-gray-500">
            {selectedType 
              ? `No ${selectedType.replace('_', ' ')}s found.`
              : "No downloadable assets are available for your projects yet."}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default StudioAssets;
