import React, { useState, useEffect, useCallback } from 'react';
import { 
  Upload, Search, RefreshCw, Trash2, Copy, Eye, X, FileText, Image, Film, BookOpen, File, 
  Globe, Lock, Shield, Folder, FolderOpen, ChevronRight, Edit2, Check, ArrowLeft, Plus
} from 'lucide-react';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;

// File type filters (auto-detected based on mime type)
const FILE_TYPE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'pdf', label: 'PDFs' },
  { id: 'image', label: 'Images' },
  { id: 'video', label: 'Videos' },
  { id: 'other', label: 'Other' },
];

// Category filters (manually assigned, multi-select)
const CATEGORY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'deck', label: 'Decks' },
  { id: 'script', label: 'Scripts' },
  { id: 'poster', label: 'Posters' },
  { id: 'still', label: 'Stills' },
  { id: 'ebook', label: 'eBooks' },
  { id: 'other', label: 'Other' },
];

// Collection types
const COLLECTIONS = [
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
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation state
  const [activeCollection, setActiveCollection] = useState('all');
  const [activeFolder, setActiveFolder] = useState(null); // null = root, or film/app id
  const [activeFolderName, setActiveFolderName] = useState('');
  
  // Filter state
  const [filterFileType, setFilterFileType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [search, setSearch] = useState('');
  
  // UI state
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [preview, setPreview] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);
  const [uploadForm, setUploadForm] = useState({ 
    categories: [], 
    tags: '', 
    visibility: 'admin_only', 
    collection: 'website',
    folder: ''
  });

  // Fetch all assets
  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/assets`);
      if (res.ok) setAssets(await res.json());
    } catch { toast.error('Failed to load assets'); }
    finally { setLoading(false); }
  }, []);

  // Fetch films for folder options
  const fetchFilms = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/films`);
      if (res.ok) {
        const data = await res.json();
        setFilms(data);
      }
    } catch { console.error('Failed to load films'); }
  }, []);

  useEffect(() => { 
    fetchAssets(); 
    fetchFilms();
  }, [fetchAssets, fetchFilms]);

  // Get file type from mime type
  const getFileType = (asset) => {
    const mime = asset.mime_type || '';
    if (mime.startsWith('image/')) return 'image';
    if (mime === 'application/pdf') return 'pdf';
    if (mime.startsWith('video/')) return 'video';
    return 'other';
  };

  // Filter assets based on current navigation and filters
  const getFilteredAssets = () => {
    let filtered = [...assets];
    
    // Filter by collection
    if (activeCollection !== 'all') {
      filtered = filtered.filter(a => a.collection === activeCollection);
    }
    
    // Filter by folder (when inside a collection like Films)
    if (activeFolder) {
      filtered = filtered.filter(a => a.folder === activeFolder);
    }
    
    // Filter by file type
    if (filterFileType !== 'all') {
      filtered = filtered.filter(a => getFileType(a) === filterFileType);
    }
    
    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(a => a.categories?.includes(filterCategory));
    }
    
    // Search
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(a => 
        a.original_name?.toLowerCase().includes(term) ||
        a.tags?.some(t => t.toLowerCase().includes(term))
      );
    }
    
    return filtered;
  };

  // Get folders for current collection (e.g., film names when in Films collection)
  const getFolders = () => {
    if (activeCollection !== 'films') return [];
    
    // Get unique folders from assets + all films
    const assetFolders = new Set(assets.filter(a => a.collection === 'films' && a.folder).map(a => a.folder));
    const allFolders = films.map(f => ({ id: f.id, name: f.title }));
    
    return allFolders;
  };

  // Count assets per folder
  const getFolderAssetCount = (folderId) => {
    return assets.filter(a => a.collection === activeCollection && a.folder === folderId).length;
  };

  // Handle upload
  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    setUploading(true);
    let count = 0;
    
    for (const file of files) {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('categories', JSON.stringify(uploadForm.categories));
      fd.append('tags', uploadForm.tags);
      fd.append('visibility', uploadForm.visibility);
      fd.append('collection', activeCollection !== 'all' ? activeCollection : uploadForm.collection);
      fd.append('folder', activeFolder || uploadForm.folder);
      
      try {
        const res = await fetch(`${API}/api/assets`, { method: 'POST', body: fd });
        if (res.ok) count++;
      } catch { /* continue */ }
    }
    
    setUploading(false);
    if (count) { 
      toast.success(`${count} asset(s) uploaded`); 
      setShowUpload(false); 
      fetchAssets(); 
    } else {
      toast.error('Upload failed');
    }
    e.target.value = '';
  };

  // Handle delete
  const handleDelete = async (asset) => {
    if (!window.confirm(`Delete "${asset.original_name}"?`)) return;
    try {
      const res = await fetch(`${API}/api/assets/${asset.id}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Deleted'); fetchAssets(); }
    } catch { toast.error('Delete failed'); }
  };

  // Handle asset update
  const handleUpdateAsset = async (asset, updates) => {
    try {
      const res = await fetch(`${API}/api/assets/${asset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        toast.success('Asset updated');
        fetchAssets();
        setEditingAsset(null);
      } else {
        toast.error('Update failed');
      }
    } catch { toast.error('Update failed'); }
  };

  const copyUrl = (asset) => {
    const url = asset.file_url.startsWith('http') ? asset.file_url : `${API}${asset.file_url}`;
    navigator.clipboard.writeText(url);
    toast.success('URL copied');
  };

  const formatSize = (bytes) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const imgUrl = (u) => u && (u.startsWith('http') ? u : `${API}${u}`);
  const isImage = (a) => getFileType(a) === 'image';
  const vis = (v) => VISIBILITY.find(x => x.id === v) || VISIBILITY[2];

  const filteredAssets = getFilteredAssets();
  const folders = getFolders();

  // Count by file type for current view
  const fileTypeCounts = FILE_TYPE_FILTERS.slice(1).reduce((acc, t) => {
    acc[t.id] = filteredAssets.filter(a => getFileType(a) === t.id).length;
    return acc;
  }, {});

  // Count by category for current view
  const categoryCounts = CATEGORY_FILTERS.slice(1).reduce((acc, c) => {
    acc[c.id] = filteredAssets.filter(a => a.categories?.includes(c.id)).length;
    return acc;
  }, {});

  return (
    <div data-testid="admin-assets-tab">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white" data-testid="assets-title">Asset Library</h2>
          <p className="text-gray-500 text-sm">{assets.length} total assets</p>
        </div>
        <button 
          onClick={() => setShowUpload(!showUpload)} 
          className="flex items-center gap-2 px-4 py-2 bg-electric-blue text-white rounded-lg text-sm" 
          data-testid="upload-asset-btn"
        >
          <Upload size={16} /> Upload Asset
        </button>
      </div>

      {/* Upload Panel */}
      {showUpload && (
        <div className="bg-smoke-gray border border-gray-700 rounded-lg p-5 mb-6 space-y-4" data-testid="upload-panel">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Collection */}
            <div>
              <label className="block text-gray-400 text-xs mb-1">Collection</label>
              <select 
                value={activeCollection !== 'all' ? activeCollection : uploadForm.collection} 
                onChange={e => setUploadForm(s => ({ ...s, collection: e.target.value }))} 
                disabled={activeCollection !== 'all'}
                className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50"
              >
                {COLLECTIONS.slice(1).map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            
            {/* Folder (Film/App) */}
            <div>
              <label className="block text-gray-400 text-xs mb-1">Folder (Film/App)</label>
              <select 
                value={activeFolder || uploadForm.folder} 
                onChange={e => setUploadForm(s => ({ ...s, folder: e.target.value }))} 
                disabled={!!activeFolder}
                className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50"
              >
                <option value="">No folder</option>
                {films.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
              </select>
            </div>
            
            {/* Categories (multi-select) */}
            <div>
              <label className="block text-gray-400 text-xs mb-1">Categories</label>
              <div className="flex flex-wrap gap-1">
                {CATEGORY_FILTERS.slice(1).map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setUploadForm(s => ({
                        ...s,
                        categories: s.categories.includes(c.id)
                          ? s.categories.filter(x => x !== c.id)
                          : [...s.categories, c.id]
                      }));
                    }}
                    className={`px-2 py-1 rounded text-xs transition-all ${
                      uploadForm.categories.includes(c.id)
                        ? 'bg-electric-blue text-white'
                        : 'bg-black border border-gray-700 text-gray-400 hover:text-white'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Visibility */}
            <div>
              <label className="block text-gray-400 text-xs mb-1">Visibility</label>
              <select 
                value={uploadForm.visibility} 
                onChange={e => setUploadForm(s => ({ ...s, visibility: e.target.value }))} 
                className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              >
                {VISIBILITY.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
              </select>
            </div>
          </div>
          
          {/* Tags */}
          <div>
            <label className="block text-gray-400 text-xs mb-1">Tags (comma-separated)</label>
            <input 
              type="text" 
              value={uploadForm.tags} 
              onChange={e => setUploadForm(s => ({ ...s, tags: e.target.value }))} 
              className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" 
              placeholder="hero, promotional, behind-scenes" 
            />
          </div>
          
          {/* File Input */}
          <label className="flex items-center justify-center gap-3 px-6 py-8 bg-black border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-electric-blue/50 transition-colors">
            <Upload size={24} className="text-gray-500" />
            <span className="text-gray-400">{uploading ? 'Uploading...' : 'Click to select files (or drag & drop)'}</span>
            <input type="file" multiple onChange={handleUpload} className="hidden" data-testid="file-input" />
          </label>
        </div>
      )}

      {/* Collection Tabs */}
      <div className="flex gap-2 mb-4">
        {COLLECTIONS.map(c => (
          <button
            key={c.id}
            onClick={() => {
              setActiveCollection(c.id);
              setActiveFolder(null);
              setActiveFolderName('');
            }}
            className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-widest transition-all ${
              activeCollection === c.id
                ? 'bg-electric-blue text-white'
                : 'bg-smoke-gray text-gray-400 hover:text-white border border-gray-700'
            }`}
            data-testid={`collection-filter-${c.id}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Breadcrumb Navigation */}
      {activeFolder && (
        <div className="flex items-center gap-2 mb-4 text-sm">
          <button
            onClick={() => { setActiveFolder(null); setActiveFolderName(''); }}
            className="text-electric-blue hover:underline flex items-center gap-1"
          >
            <ArrowLeft size={14} />
            Back to {activeCollection}
          </button>
          <ChevronRight size={14} className="text-gray-600" />
          <span className="text-white">{activeFolderName}</span>
        </div>
      )}

      {/* Folder View (when in Films collection and no folder selected) */}
      {activeCollection === 'films' && !activeFolder && (
        <div className="mb-6">
          <h3 className="text-gray-400 text-sm font-mono uppercase tracking-widest mb-3">Film Folders</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {folders.map(folder => (
              <button
                key={folder.id}
                onClick={() => { setActiveFolder(folder.id); setActiveFolderName(folder.name); }}
                className="bg-smoke-gray border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors text-left group"
                data-testid={`folder-${folder.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-electric-blue/10 flex items-center justify-center">
                    <Folder size={20} className="text-electric-blue group-hover:hidden" />
                    <FolderOpen size={20} className="text-electric-blue hidden group-hover:block" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-medium truncate">{folder.name}</p>
                    <p className="text-gray-500 text-xs">{getFolderAssetCount(folder.id)} assets</p>
                  </div>
                </div>
              </button>
            ))}
            {folders.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                No films found. Assets uploaded to Films will appear here.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search + Filters (show when not viewing folder list) */}
      {(activeCollection !== 'films' || activeFolder) && (
        <>
          {/* Search */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search size={16} className="absolute left-3 top-2.5 text-gray-500" />
              <input 
                type="text" 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                className="w-full bg-smoke-gray border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-white text-sm focus:border-electric-blue focus:outline-none" 
                placeholder="Search assets..." 
                data-testid="asset-search" 
              />
            </div>
          </div>

          {/* Filter Rows */}
          <div className="space-y-3 mb-6">
            {/* File Type Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-gray-500 text-xs font-mono uppercase">File Type:</span>
              {FILE_TYPE_FILTERS.map(t => (
                <button 
                  key={t.id} 
                  onClick={() => setFilterFileType(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 ${
                    filterFileType === t.id ? 'bg-white text-black' : 'bg-smoke-gray text-gray-400 hover:text-white'
                  }`}
                  data-testid={`filter-type-${t.id}`}
                >
                  {t.label}
                  {t.id !== 'all' && fileTypeCounts[t.id] > 0 && (
                    <span className="text-[10px] opacity-60">({fileTypeCounts[t.id]})</span>
                  )}
                </button>
              ))}
            </div>
            
            {/* Category Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-gray-500 text-xs font-mono uppercase">Category:</span>
              {CATEGORY_FILTERS.map(c => (
                <button 
                  key={c.id} 
                  onClick={() => setFilterCategory(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 ${
                    filterCategory === c.id ? 'bg-electric-blue text-white' : 'bg-smoke-gray text-gray-400 hover:text-white'
                  }`}
                  data-testid={`filter-category-${c.id}`}
                >
                  {c.label}
                  {c.id !== 'all' && categoryCounts[c.id] > 0 && (
                    <span className="text-[10px] opacity-60">({categoryCounts[c.id]})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Assets Grid */}
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 text-electric-blue animate-spin mx-auto" />
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-16 bg-smoke-gray border border-gray-800 rounded-lg">
              <File className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400">No assets found</p>
              <p className="text-gray-600 text-sm mt-1">Upload files to build your asset library</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredAssets.map(asset => (
                <div 
                  key={asset.id} 
                  className="bg-smoke-gray border border-gray-800 rounded-lg overflow-hidden group hover:border-gray-700 transition-colors" 
                  data-testid={`asset-${asset.id}`}
                >
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
                      <button 
                        onClick={() => setPreview(asset)} 
                        className="p-2 bg-white/10 rounded-lg hover:bg-white/20 text-white" 
                        title="Preview"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => setEditingAsset(asset)} 
                        className="p-2 bg-white/10 rounded-lg hover:bg-white/20 text-white" 
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => copyUrl(asset)} 
                        className="p-2 bg-white/10 rounded-lg hover:bg-white/20 text-white" 
                        title="Copy URL"
                      >
                        <Copy size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(asset)} 
                        className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 text-red-400" 
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
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
                    {/* Categories */}
                    {asset.categories?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {asset.categories.slice(0, 2).map((cat, i) => (
                          <span key={i} className="text-[10px] bg-electric-blue/10 text-electric-blue px-1.5 py-0.5 rounded">{cat}</span>
                        ))}
                        {asset.categories.length > 2 && (
                          <span className="text-[10px] text-gray-500">+{asset.categories.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold">{preview.original_name}</h3>
                <p className="text-gray-500 text-sm">{formatSize(preview.file_size)} · {getFileType(preview)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setPreview(null); setEditingAsset(preview); }} 
                  className="px-3 py-1.5 bg-white/10 text-white rounded text-sm hover:bg-white/20 flex items-center gap-1"
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button 
                  onClick={() => copyUrl(preview)} 
                  className="px-3 py-1.5 bg-white/10 text-white rounded text-sm hover:bg-white/20 flex items-center gap-1"
                >
                  <Copy size={14} /> Copy URL
                </button>
                <button onClick={() => setPreview(null)} className="p-2 text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
            </div>
            {isImage(preview) ? (
              <img src={imgUrl(preview.file_url)} alt={preview.original_name} className="w-full rounded-lg" />
            ) : getFileType(preview) === 'pdf' ? (
              <iframe src={imgUrl(preview.file_url)} title={preview.original_name} className="w-full h-[70vh] rounded-lg" />
            ) : (
              <div className="bg-smoke-gray rounded-lg p-12 text-center">
                <FileText size={64} className="text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Preview not available for this file type</p>
                <a href={imgUrl(preview.file_url)} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 px-4 py-2 bg-electric-blue text-white rounded-lg text-sm">
                  Download
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Asset Modal */}
      {editingAsset && (
        <EditAssetModal
          asset={editingAsset}
          films={films}
          onClose={() => setEditingAsset(null)}
          onSave={(updates) => handleUpdateAsset(editingAsset, updates)}
        />
      )}
    </div>
  );
};

// Edit Asset Modal Component
const EditAssetModal = ({ asset, films, armoryItems, blogPosts, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    original_name: asset.original_name || '',
    collection: asset.collection || 'website',
    folder: asset.folder || '',
    categories: asset.categories || [],
    visibility: asset.visibility || 'admin_only',
    tags: asset.tags?.join(', ') || ''
  });
  const [saving, setSaving] = useState(false);

  // Get folder options based on selected collection
  const getFolderOptions = () => {
    switch (formData.collection) {
      case 'films':
        return films.map(f => ({ id: f.id, name: f.title }));
      case 'armory':
        return armoryItems.map(a => ({ id: a.id, name: a.title }));
      case 'den':
        return blogPosts.map(b => ({ id: b.id, name: b.title }));
      case 'website':
        return [
          { id: 'about', name: 'About' },
          { id: 'films', name: 'Films' },
          { id: 'armory', name: 'The Armory' },
          { id: 'den', name: 'The Den' },
          { id: 'studio-portal', name: 'Studio Portal' },
          { id: 'work-with-us', name: 'Work With Us' },
        ];
      default:
        return [];
    }
  };

  // Reset folder when collection changes
  const handleCollectionChange = (newCollection) => {
    setFormData(s => ({ ...s, collection: newCollection, folder: '' }));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    });
    setSaving(false);
  };

  const folderOptions = getFolderOptions();
  const folderLabel = {
    'films': 'Film',
    'armory': 'Armory Item',
    'den': 'Blog Post',
    'website': 'Page'
  }[formData.collection] || 'Folder';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-smoke-gray border border-gray-800 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto" 
        onClick={e => e.stopPropagation()}
        data-testid="edit-asset-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 sticky top-0 bg-smoke-gray z-10">
          <div>
            <h3 className="text-lg font-bold text-white">Edit Asset</h3>
            <p className="text-gray-500 text-sm truncate max-w-[300px]">{asset.filename}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          {/* File Name */}
          <div>
            <label className="block text-gray-400 text-xs uppercase mb-2">Display Name</label>
            <input 
              type="text"
              value={formData.original_name} 
              onChange={e => setFormData(s => ({ ...s, original_name: e.target.value }))}
              className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-electric-blue focus:outline-none"
              placeholder="Enter display name for this file"
            />
            <p className="text-gray-600 text-xs mt-1">This name is shown in the asset library</p>
          </div>

          {/* Collection */}
          <div>
            <label className="block text-gray-400 text-xs uppercase mb-2">Collection</label>
            <select 
              value={formData.collection} 
              onChange={e => handleCollectionChange(e.target.value)}
              className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            >
              {COLLECTIONS.slice(1).map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>

          {/* Folder - Dynamic based on Collection */}
          <div>
            <label className="block text-gray-400 text-xs uppercase mb-2">{folderLabel}</label>
            <select 
              value={formData.folder} 
              onChange={e => setFormData(s => ({ ...s, folder: e.target.value }))}
              className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="">No {folderLabel.toLowerCase()} selected</option>
              {folderOptions.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
            <p className="text-gray-600 text-xs mt-1">
              {formData.collection === 'films' && 'Select which film this asset belongs to'}
              {formData.collection === 'armory' && 'Select which Armory item this asset belongs to'}
              {formData.collection === 'den' && 'Select which blog post this asset belongs to'}
              {formData.collection === 'website' && 'Select which page this asset belongs to'}
            </p>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-gray-400 text-xs uppercase mb-2">Categories</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_FILTERS.slice(1).map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setFormData(s => ({
                      ...s,
                      categories: s.categories.includes(c.id)
                        ? s.categories.filter(x => x !== c.id)
                        : [...s.categories, c.id]
                    }));
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                    formData.categories.includes(c.id)
                      ? 'bg-electric-blue text-white'
                      : 'bg-black border border-gray-700 text-gray-400 hover:text-white'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-gray-400 text-xs uppercase mb-2">Visibility</label>
            <select 
              value={formData.visibility} 
              onChange={e => setFormData(s => ({ ...s, visibility: e.target.value }))}
              className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            >
              {VISIBILITY.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-gray-400 text-xs uppercase mb-2">Tags (comma-separated)</label>
            <input 
              type="text" 
              value={formData.tags} 
              onChange={e => setFormData(s => ({ ...s, tags: e.target.value }))}
              className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              placeholder="hero, promotional, poster"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-gray-800 sticky bottom-0 bg-smoke-gray">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-700 text-gray-400 rounded-lg text-sm hover:text-white"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-electric-blue text-white rounded-lg text-sm disabled:opacity-50"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAssetsTab;
