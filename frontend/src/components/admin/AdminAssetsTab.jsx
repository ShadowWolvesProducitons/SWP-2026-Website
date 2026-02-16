import React, { useState, useEffect, useCallback } from 'react';
import { Upload, Search, RefreshCw, Trash2, Copy, Eye, X, FileText, Image, Film, BookOpen, File, Filter, Globe, Lock, Shield } from 'lucide-react';
import { toast } from 'sonner';

const ASSET_TYPES = [
  { id: 'all', label: 'All' },
  { id: 'image', label: 'Images', icon: Image },
  { id: 'pdf', label: 'PDFs', icon: FileText },
  { id: 'script', label: 'Scripts', icon: FileText },
  { id: 'deck', label: 'Decks', icon: Film },
  { id: 'ebook', label: 'eBooks', icon: BookOpen },
  { id: 'other', label: 'Other', icon: File },
];

// New collection/grouping filters
const ASSET_COLLECTIONS = [
  { id: 'all', label: 'All' },
  { id: 'films', label: 'Films' },
  { id: 'website', label: 'Website' },
  { id: 'armory', label: 'Armory' },
  { id: 'den', label: 'Den' },
];

const VISIBILITY = [
  { id: 'public', label: 'Public', icon: Globe, color: 'text-green-400 bg-green-500/10 border-green-500/30' },
  { id: 'investor_only', label: 'Investor', icon: Shield, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
  { id: 'admin_only', label: 'Admin', icon: Lock, color: 'text-gray-400 bg-gray-500/10 border-gray-500/30' },
];

const AdminAssetsTab = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterCollection, setFilterCollection] = useState('all');
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [preview, setPreview] = useState(null);
  const [uploadForm, setUploadForm] = useState({ asset_type: 'other', tags: '', visibility: 'admin_only', notes: '', collection: 'website' });

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') params.set('asset_type', filterType);
      if (search) params.set('search', search);
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/assets?${params}`);
      if (res.ok) setAssets(await res.json());
    } catch { toast.error('Failed to load assets'); }
    finally { setLoading(false); }
  }, [filterType, search]);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    setUploading(true);
    let count = 0;
    for (const file of files) {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('asset_type', uploadForm.asset_type);
      fd.append('tags', uploadForm.tags);
      fd.append('visibility', uploadForm.visibility);
      fd.append('notes', uploadForm.notes);
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/assets`, { method: 'POST', body: fd });
        if (res.ok) count++;
      } catch { /* continue */ }
    }
    setUploading(false);
    if (count) { toast.success(`${count} asset(s) uploaded`); setShowUpload(false); fetchAssets(); }
    else toast.error('Upload failed');
    e.target.value = '';
  };

  const handleDelete = async (asset) => {
    if (!window.confirm(`Delete "${asset.original_name}"?`)) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/assets/${asset.id}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Deleted'); fetchAssets(); }
    } catch { toast.error('Delete failed'); }
  };

  const copyUrl = (asset) => {
    const url = asset.file_url.startsWith('http') ? asset.file_url : `${process.env.REACT_APP_BACKEND_URL}${asset.file_url}`;
    navigator.clipboard.writeText(url);
    toast.success('URL copied');
  };

  const handleVisibilityChange = async (asset, vis) => {
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/assets/${asset.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ visibility: vis })
      });
      toast.success('Visibility updated');
      fetchAssets();
    } catch { toast.error('Update failed'); }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const imgUrl = (u) => u && (u.startsWith('http') ? u : `${process.env.REACT_APP_BACKEND_URL}${u}`);
  const isImage = (a) => a.asset_type === 'image' || a.mime_type?.startsWith('image/');
  const vis = (v) => VISIBILITY.find(x => x.id === v) || VISIBILITY[2];

  const typeCounts = ASSET_TYPES.slice(1).reduce((acc, t) => { acc[t.id] = assets.filter(a => a.asset_type === t.id).length; return acc; }, {});

  return (
    <div data-testid="admin-assets-tab">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white" data-testid="assets-title">Asset Library</h2>
          <p className="text-gray-500 text-sm">{assets.length} assets</p>
        </div>
        <button onClick={() => setShowUpload(!showUpload)} className="flex items-center gap-2 px-4 py-2 bg-electric-blue text-white rounded-lg text-sm" data-testid="upload-asset-btn">
          <Upload size={16} /> Upload Asset
        </button>
      </div>

      {/* Upload Panel */}
      {showUpload && (
        <div className="bg-smoke-gray border border-gray-700 rounded-lg p-5 mb-6 space-y-4" data-testid="upload-panel">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-400 text-xs mb-1">Asset Type</label>
              <select value={uploadForm.asset_type} onChange={e => setUploadForm(s => ({ ...s, asset_type: e.target.value }))} className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
                {ASSET_TYPES.slice(1).map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Visibility</label>
              <select value={uploadForm.visibility} onChange={e => setUploadForm(s => ({ ...s, visibility: e.target.value }))} className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
                {VISIBILITY.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Tags (comma-separated)</label>
              <input type="text" value={uploadForm.tags} onChange={e => setUploadForm(s => ({ ...s, tags: e.target.value }))} className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" placeholder="poster, film-1, hero" />
            </div>
          </div>
          <label className="flex items-center justify-center gap-3 px-6 py-8 bg-black border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-electric-blue/50 transition-colors">
            <Upload size={24} className="text-gray-500" />
            <span className="text-gray-400">{uploading ? 'Uploading...' : 'Click to select files (or drag & drop)'}</span>
            <input type="file" multiple onChange={handleUpload} className="hidden" data-testid="file-input" />
          </label>
        </div>
      )}

      {/* Search + Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-500" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-smoke-gray border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-white text-sm focus:border-electric-blue focus:outline-none" placeholder="Search assets..." data-testid="asset-search" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {ASSET_TYPES.map(t => (
            <button key={t.id} onClick={() => setFilterType(t.id)}
              className={`px-3 py-2 rounded-lg text-xs transition-all flex items-center gap-1.5 ${filterType === t.id ? 'bg-white text-black' : 'bg-smoke-gray text-gray-400 hover:text-white'}`}
              data-testid={`filter-${t.id}`}>
              {t.label}
              {t.id !== 'all' && typeCounts[t.id] > 0 && <span className="text-[10px] opacity-60">{typeCounts[t.id]}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Assets Grid */}
      {loading ? (
        <div className="text-center py-12"><RefreshCw className="w-8 h-8 text-electric-blue animate-spin mx-auto" /></div>
      ) : assets.length === 0 ? (
        <div className="text-center py-16 bg-smoke-gray border border-gray-800 rounded-lg">
          <File className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400">No assets found</p>
          <p className="text-gray-600 text-sm mt-1">Upload files to build your asset library</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {assets.map(asset => (
            <div key={asset.id} className="bg-smoke-gray border border-gray-800 rounded-lg overflow-hidden group hover:border-gray-700 transition-colors" data-testid={`asset-${asset.id}`}>
              {/* Preview */}
              <div className="aspect-square bg-black/50 flex items-center justify-center relative overflow-hidden">
                {isImage(asset) ? (
                  <img src={imgUrl(asset.file_url)} alt={asset.original_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <FileText size={32} className="text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500 text-xs truncate">{asset.original_name}</p>
                  </div>
                )}
                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => setPreview(asset)} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 text-white" title="Preview"><Eye size={16} /></button>
                  <button onClick={() => copyUrl(asset)} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 text-white" title="Copy URL"><Copy size={16} /></button>
                  <button onClick={() => handleDelete(asset)} className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 text-red-400" title="Delete"><Trash2 size={16} /></button>
                </div>
              </div>
              {/* Info */}
              <div className="p-3">
                <p className="text-white text-sm truncate font-medium">{asset.original_name}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-gray-500 text-xs">{formatSize(asset.file_size)}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase border ${vis(asset.visibility).color}`}>
                    {vis(asset.visibility).label}
                  </span>
                </div>
                {asset.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {asset.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-[10px] bg-white/5 text-gray-500 px-1.5 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold">{preview.original_name}</h3>
                <p className="text-gray-500 text-sm">{formatSize(preview.file_size)} · {preview.asset_type}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => copyUrl(preview)} className="px-3 py-1.5 bg-white/10 text-white rounded text-sm hover:bg-white/20 flex items-center gap-1"><Copy size={14} /> Copy URL</button>
                {/* Visibility selector */}
                <select value={preview.visibility} onChange={e => { handleVisibilityChange(preview, e.target.value); setPreview({ ...preview, visibility: e.target.value }); }} className="bg-black border border-gray-700 rounded px-2 py-1.5 text-white text-sm">
                  {VISIBILITY.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
                </select>
                <button onClick={() => setPreview(null)} className="p-2 text-gray-400 hover:text-white"><X size={20} /></button>
              </div>
            </div>
            {isImage(preview) ? (
              <img src={imgUrl(preview.file_url)} alt={preview.original_name} className="w-full rounded-lg" />
            ) : preview.mime_type === 'application/pdf' ? (
              <iframe src={imgUrl(preview.file_url)} title={preview.original_name} className="w-full h-[70vh] rounded-lg" />
            ) : (
              <div className="bg-smoke-gray rounded-lg p-12 text-center">
                <FileText size={64} className="text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Preview not available for this file type</p>
                <a href={imgUrl(preview.file_url)} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 px-4 py-2 bg-electric-blue text-white rounded-lg text-sm">Download</a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAssetsTab;
