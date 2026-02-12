import React, { useState, useEffect, useCallback } from 'react';
import { Search, Image, FileText, Upload, X, Check, FolderOpen } from 'lucide-react';

const AssetPicker = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  assetType = 'all', // 'image', 'pdf', 'all'
  allowUpload = true,
  title = 'Select Asset'
}) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(assetType === 'all' ? 'all' : assetType);
  const [uploading, setUploading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('asset_type', filter);
      if (search) params.set('search', search);
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/assets?${params}`);
      if (res.ok) setAssets(await res.json());
    } catch { 
      console.error('Failed to load assets');
    } finally { 
      setLoading(false); 
    }
  }, [filter, search]);

  useEffect(() => {
    if (isOpen) fetchAssets();
  }, [isOpen, fetchAssets]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const fd = new FormData();
    fd.append('file', file);
    fd.append('source', 'asset-picker');
    fd.append('tags', 'manual-upload');
    
    setUploading(true);
    try {
      const isImage = file.type.startsWith('image/');
      const endpoint = isImage ? '/api/upload/image' : '/api/upload/file';
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}${endpoint}`, { 
        method: 'POST', 
        body: fd 
      });
      if (res.ok) {
        const data = await res.json();
        // Select the newly uploaded asset
        onSelect(data.url);
        onClose();
      }
    } catch {
      console.error('Upload failed');
    } finally { 
      setUploading(false); 
      e.target.value = '';
    }
  };

  const handleSelect = () => {
    if (selectedAsset) {
      onSelect(selectedAsset.file_url);
      onClose();
    }
  };

  const imgUrl = (u) => u && (u.startsWith('http') ? u : `${process.env.REACT_APP_BACKEND_URL}${u}`);
  const isImage = (a) => a.asset_type === 'image' || a.mime_type?.startsWith('image/');

  if (!isOpen) return null;

  const filteredAssets = assetType === 'all' 
    ? assets 
    : assets.filter(a => {
        if (assetType === 'image') return isImage(a);
        if (assetType === 'pdf') return a.asset_type === 'pdf' || a.mime_type === 'application/pdf';
        return true;
      });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90" data-testid="asset-picker">
      <div className="bg-smoke-gray border border-gray-800 rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <FolderOpen size={20} className="text-electric-blue" />
            <h3 className="text-lg font-bold text-white">{title}</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-800">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-500" />
            <input 
              type="text" 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              placeholder="Search assets..."
              className="w-full bg-black border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:border-electric-blue focus:outline-none"
              data-testid="asset-picker-search"
            />
          </div>
          {assetType === 'all' && (
            <div className="flex gap-1">
              {['all', 'image', 'pdf'].map(t => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-3 py-2 rounded-lg text-xs capitalize ${
                    filter === t ? 'bg-white text-black' : 'bg-black text-gray-400 hover:text-white'
                  }`}
                >
                  {t === 'all' ? 'All' : t === 'image' ? 'Images' : 'PDFs'}
                </button>
              ))}
            </div>
          )}
          {allowUpload && (
            <label className="flex items-center gap-2 px-4 py-2 bg-electric-blue text-white rounded-lg text-sm cursor-pointer hover:bg-electric-blue/90">
              <Upload size={16} />
              <span>{uploading ? 'Uploading...' : 'Upload New'}</span>
              <input 
                type="file" 
                onChange={handleUpload} 
                className="hidden" 
                accept={assetType === 'image' ? 'image/*' : assetType === 'pdf' ? '.pdf' : '*'}
                data-testid="asset-picker-upload"
              />
            </label>
          )}
        </div>

        {/* Asset Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading assets...</div>
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen size={48} className="text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500">No assets found</p>
              <p className="text-gray-600 text-sm mt-1">Upload a new file to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredAssets.map(asset => (
                <button
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`relative bg-black border rounded-lg overflow-hidden aspect-square group transition-all ${
                    selectedAsset?.id === asset.id 
                      ? 'border-electric-blue ring-2 ring-electric-blue/30' 
                      : 'border-gray-800 hover:border-gray-700'
                  }`}
                  data-testid={`asset-item-${asset.id}`}
                >
                  {isImage(asset) ? (
                    <img 
                      src={imgUrl(asset.file_url)} 
                      alt={asset.original_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-2">
                      <FileText size={32} className="text-gray-600 mb-2" />
                      <span className="text-gray-500 text-[10px] truncate w-full text-center">
                        {asset.original_name}
                      </span>
                    </div>
                  )}
                  {selectedAsset?.id === asset.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-electric-blue rounded-full flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-[10px] truncate">{asset.original_name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-800 bg-black/30">
          <p className="text-gray-500 text-sm">
            {selectedAsset ? `Selected: ${selectedAsset.original_name}` : 'Click an asset to select'}
          </p>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 border border-gray-700 text-gray-400 rounded-lg text-sm hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSelect}
              disabled={!selectedAsset}
              className="px-4 py-2 bg-electric-blue text-white rounded-lg text-sm disabled:bg-gray-700 disabled:text-gray-500"
              data-testid="asset-picker-select"
            >
              Select Asset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetPicker;
