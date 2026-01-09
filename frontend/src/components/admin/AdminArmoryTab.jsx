import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Star, StarOff, RefreshCw, X, Upload, Image, Link, FileDown } from 'lucide-react';
import { toast } from 'sonner';

const CONTENT_TYPES = ['Apps', 'Templates', 'Downloads', 'Courses', 'eBooks'];

const AdminArmoryTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('Apps');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/den-items?item_type=${selectedType}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (err) {
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selectedType]);

  const handleAddItem = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Are you sure you want to archive "${item.title}"?`)) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/den-items/${item.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        toast.success('Item archived');
        fetchItems();
      }
    } catch (err) {
      toast.error('Error archiving item');
    }
  };

  const handleToggleFeatured = async (item) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/den-items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !item.featured })
      });
      if (response.ok) {
        toast.success(item.featured ? 'Removed from featured' : 'Added to featured');
        fetchItems();
      }
    } catch (err) {
      toast.error('Error updating item');
    }
  };

  const handleSaveItem = async (itemData) => {
    try {
      const url = editingItem
        ? `${process.env.REACT_APP_BACKEND_URL}/api/den-items/${editingItem.id}`
        : `${process.env.REACT_APP_BACKEND_URL}/api/den-items`;
      
      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...itemData, item_type: selectedType })
      });

      if (response.ok) {
        toast.success(editingItem ? 'Item updated' : 'Item created');
        setIsModalOpen(false);
        fetchItems();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to save');
      }
    } catch (err) {
      toast.error('Error saving item');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div>
      {/* Content Type Tabs */}
      <div className="mb-6">
        <p className="text-gray-400 font-mono text-xs uppercase tracking-widest mb-3">Content Type:</p>
        <div className="flex gap-2 flex-wrap">
          {CONTENT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-widest transition-all ${
                selectedType === type
                  ? 'bg-electric-blue text-white'
                  : 'bg-smoke-gray text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">{selectedType}</h2>
          <p className="text-gray-500 text-sm mt-1">{items.length} items</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={fetchItems} className="p-2 text-gray-400 hover:text-white transition-colors" title="Refresh">
            <RefreshCw size={20} />
          </button>
          <button
            onClick={handleAddItem}
            className="flex items-center gap-2 bg-electric-blue hover:bg-electric-blue/90 text-white px-6 py-3 rounded-full font-mono text-sm uppercase tracking-widest transition-all"
          >
            <Plus size={18} />
            Add {selectedType.slice(0, -1)}
          </button>
        </div>
      </div>

      {/* Items Table */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-electric-blue animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-smoke-gray border border-gray-800 rounded-lg">
          <p className="text-gray-400 mb-4">No {selectedType.toLowerCase()} yet</p>
          <button onClick={handleAddItem} className="text-electric-blue hover:underline">
            Add your first {selectedType.slice(0, -1).toLowerCase()}
          </button>
        </div>
      ) : (
        <div className="bg-smoke-gray border border-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-6 py-4 text-gray-400 font-mono text-xs uppercase tracking-widest">Title</th>
                <th className="text-center px-6 py-4 text-gray-400 font-mono text-xs uppercase tracking-widest">Featured</th>
                <th className="text-left px-6 py-4 text-gray-400 font-mono text-xs uppercase tracking-widest">Last Updated</th>
                <th className="text-right px-6 py-4 text-gray-400 font-mono text-xs uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-800/50 hover:bg-black/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 bg-gray-800 flex items-center justify-center">
                        {item.thumbnail_url ? (
                          <img src={`${process.env.REACT_APP_BACKEND_URL}${item.thumbnail_url}`} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <Package size={20} className="text-gray-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{item.title}</h3>
                        <p className="text-gray-500 text-sm line-clamp-1">{item.short_description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggleFeatured(item)}
                      className={`p-2 rounded-full transition-colors ${item.featured ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-600 hover:text-gray-400'}`}
                    >
                      {item.featured ? <Star size={20} fill="currentColor" /> : <StarOff size={20} />}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(item.updated_at)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEditItem(item)} className="p-2 text-gray-400 hover:text-electric-blue transition-colors" title="Edit">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDeleteItem(item)} className="p-2 text-gray-400 hover:text-red-400 transition-colors" title="Archive">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Item Modal */}
      <ArmoryItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveItem}
        item={editingItem}
        itemType={selectedType}
      />
    </div>
  );
};

// Import Package icon for the component
const Package = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m7.5 4.27 9 5.15"/>
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
    <path d="m3.3 7 8.7 5 8.7-5"/>
    <path d="M12 22V12"/>
  </svg>
);

// Armory Item Modal Component
const ArmoryItemModal = ({ isOpen, onClose, onSave, item, itemType }) => {
  const [formData, setFormData] = useState({
    title: '',
    featured: false,
    short_description: '',
    long_description: '',
    thumbnail_url: '',
    primary_link_url: '',
    file_url: '',
    price: '',
    is_free: true,
    tags: [],
    sort_order: 0
  });
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || '',
        featured: item.featured || false,
        short_description: item.short_description || '',
        long_description: item.long_description || '',
        thumbnail_url: item.thumbnail_url || '',
        primary_link_url: item.primary_link_url || '',
        file_url: item.file_url || '',
        price: item.price || '',
        is_free: item.is_free !== false,
        tags: item.tags || [],
        sort_order: item.sort_order || 0
      });
    } else {
      setFormData({
        title: '',
        featured: false,
        short_description: '',
        long_description: '',
        thumbnail_url: '',
        primary_link_url: '',
        file_url: '',
        price: '',
        is_free: true,
        tags: [],
        sort_order: 0
      });
    }
    setTagInput('');
  }, [item, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    setUploading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/upload/image`, {
        method: 'POST',
        body: formDataUpload
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, thumbnail_url: data.url }));
        toast.success('Image uploaded');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (err) {
      toast.error('Error uploading');
    } finally {
      setUploading(false);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative bg-smoke-gray border border-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8">
        <div className="sticky top-0 bg-smoke-gray border-b border-gray-800 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-white">
            {item ? `Edit ${itemType.slice(0, -1)}` : `Add New ${itemType.slice(0, -1)}`}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none"
              placeholder="Enter title"
              required
            />
          </div>

          {/* Featured + Pricing Row */}
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-3 bg-black border border-gray-700 rounded-lg px-4 py-3 cursor-pointer">
              <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} className="w-5 h-5 rounded" />
              <span className="text-white">Featured</span>
            </label>
            <label className="flex items-center gap-3 bg-black border border-gray-700 rounded-lg px-4 py-3 cursor-pointer">
              <input type="checkbox" name="is_free" checked={formData.is_free} onChange={handleChange} className="w-5 h-5 rounded" />
              <span className="text-white">Free</span>
            </label>
          </div>

          {/* Price (if not free) */}
          {!formData.is_free && (
            <div>
              <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">Price</label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none"
                placeholder="e.g., $29"
              />
            </div>
          )}

          {/* Short Description */}
          <div>
            <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">Short Description</label>
            <input
              type="text"
              name="short_description"
              value={formData.short_description}
              onChange={handleChange}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none"
              placeholder="1-2 line description"
            />
          </div>

          {/* Long Description */}
          <div>
            <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">Long Description</label>
            <textarea
              name="long_description"
              value={formData.long_description}
              onChange={handleChange}
              rows={4}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none resize-none"
              placeholder="Detailed description (optional)"
            />
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">Thumbnail</label>
            <div className="flex gap-4 items-center">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center border border-gray-700">
                {formData.thumbnail_url ? (
                  <img src={`${process.env.REACT_APP_BACKEND_URL}${formData.thumbnail_url}`} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Image size={24} className="text-gray-600" />
                )}
              </div>
              <label className="flex items-center gap-2 px-4 py-2 bg-black border border-gray-700 rounded-lg cursor-pointer hover:border-gray-500 transition-colors">
                <Upload size={16} className="text-gray-400" />
                <span className="text-gray-400 text-sm">{uploading ? 'Uploading...' : 'Upload'}</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
          </div>

          {/* Primary Link URL */}
          <div>
            <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
              Primary Link URL {itemType === 'Apps' && <span className="text-red-400">*</span>}
            </label>
            <input
              type="url"
              name="primary_link_url"
              value={formData.primary_link_url}
              onChange={handleChange}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none"
              placeholder="https://..."
            />
          </div>

          {/* File/Download URL */}
          <div>
            <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">File/Download URL</label>
            <input
              type="url"
              name="file_url"
              value={formData.file_url}
              onChange={handleChange}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none"
              placeholder="External download link or file URL"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-electric-blue focus:outline-none text-sm"
                placeholder="Add a tag"
              />
              <button type="button" onClick={handleAddTag} className="px-4 py-2 bg-electric-blue/20 text-electric-blue rounded-lg">
                <Plus size={18} />
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-black border border-gray-700 rounded-full text-gray-300 text-sm">
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)} className="text-gray-500 hover:text-red-400">
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">Sort Order</label>
            <input
              type="number"
              name="sort_order"
              value={formData.sort_order}
              onChange={handleChange}
              className="w-32 bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none"
              min="0"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-gray-800">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border border-gray-700 text-gray-400 rounded-full hover:bg-gray-800 transition-colors font-mono text-sm uppercase tracking-widest">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 px-6 py-3 bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 text-white rounded-full transition-colors font-mono text-sm uppercase tracking-widest">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminArmoryTab;
