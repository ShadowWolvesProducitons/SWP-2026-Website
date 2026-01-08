import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_OPTIONS = ['In Development', 'In Production', 'Released'];

const POSTER_COLORS = [
  '#8B0000', '#1a4d6f', '#5a0000', '#0f0f1a', '#D4AF37', '#1a1a2e',
  '#2d1b4e', '#1a3a1a', '#4a1a1a', '#1a2a4a'
];

const AdminFilmModal = ({ isOpen, onClose, onSave, film }) => {
  const [formData, setFormData] = useState({
    title: '',
    status: 'In Development',
    featured: false,
    poster_url: '',
    poster_color: '#1a1a2e',
    logline: '',
    synopsis: '',
    themes: [],
    imdb_url: '',
    watch_url: ''
  });
  const [themeInput, setThemeInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (film) {
      setFormData({
        title: film.title || '',
        status: film.status || 'In Development',
        featured: film.featured || false,
        poster_url: film.poster_url || '',
        poster_color: film.poster_color || '#1a1a2e',
        logline: film.logline || '',
        synopsis: film.synopsis || '',
        themes: film.themes || [],
        imdb_url: film.imdb_url || '',
        watch_url: film.watch_url || ''
      });
    } else {
      setFormData({
        title: '',
        status: 'In Development',
        featured: false,
        poster_url: '',
        poster_color: '#1a1a2e',
        logline: '',
        synopsis: '',
        themes: [],
        imdb_url: '',
        watch_url: ''
      });
    }
    setThemeInput('');
  }, [film, isOpen]);

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
        setFormData(prev => ({ ...prev, poster_url: data.url }));
        toast.success('Image uploaded successfully');
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to upload image');
      }
    } catch (err) {
      toast.error('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleAddTheme = () => {
    const theme = themeInput.trim();
    if (theme && !formData.themes.includes(theme)) {
      setFormData(prev => ({
        ...prev,
        themes: [...prev.themes, theme]
      }));
      setThemeInput('');
    }
  };

  const handleRemoveTheme = (themeToRemove) => {
    setFormData(prev => ({
      ...prev,
      themes: prev.themes.filter(t => t !== themeToRemove)
    }));
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
        {/* Header */}
        <div className="sticky top-0 bg-smoke-gray border-b border-gray-800 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-white">
            {film ? 'Edit Film' : 'Add New Film'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none transition-colors"
              placeholder="Enter film title"
              required
            />
          </div>

          {/* Status & Featured Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none transition-colors"
              >
                {STATUS_OPTIONS.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                Featured
              </label>
              <label className="flex items-center gap-3 bg-black border border-gray-700 rounded-lg px-4 py-3 cursor-pointer hover:border-gray-600 transition-colors">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-600 text-electric-blue focus:ring-electric-blue focus:ring-offset-black"
                />
                <span className="text-white">Show as featured</span>
              </label>
            </div>
          </div>

          {/* Poster Image */}
          <div>
            <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
              Poster / Hero Image
            </label>
            <div className="flex gap-4">
              <div
                className="w-24 h-32 rounded-lg overflow-hidden flex-shrink-0 border border-gray-700"
                style={{ backgroundColor: formData.poster_color }}
              >
                {formData.poster_url && (
                  <img src={`${process.env.REACT_APP_BACKEND_URL}${formData.poster_url}`} alt="Poster" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 space-y-3">
                <label className="flex items-center justify-center gap-2 bg-black border border-gray-700 border-dashed rounded-lg px-4 py-3 cursor-pointer hover:border-electric-blue transition-colors">
                  <Upload size={18} className="text-gray-400" />
                  <span className="text-gray-400 text-sm">
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                <div>
                  <p className="text-gray-500 text-xs mb-2">Or select a fallback color:</p>
                  <div className="flex flex-wrap gap-2">
                    {POSTER_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, poster_color: color }))}
                        className={`w-6 h-6 rounded border-2 transition-all ${formData.poster_color === color ? 'border-white scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logline */}
          <div>
            <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
              Logline
            </label>
            <input
              type="text"
              name="logline"
              value={formData.logline}
              onChange={handleChange}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none transition-colors"
              placeholder="A single sentence that captures the essence"
            />
          </div>

          {/* Synopsis */}
          <div>
            <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
              Synopsis
            </label>
            <textarea
              name="synopsis"
              value={formData.synopsis}
              onChange={handleChange}
              rows={6}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none transition-colors resize-none"
              placeholder="Full synopsis (use blank lines for paragraph breaks)"
            />
          </div>

          {/* Themes */}
          <div>
            <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
              Themes
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={themeInput}
                onChange={(e) => setThemeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTheme())}
                className="flex-1 bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-electric-blue focus:outline-none transition-colors text-sm"
                placeholder="Add a theme (e.g., Redemption, Identity)"
              />
              <button
                type="button"
                onClick={handleAddTheme}
                className="px-4 py-2 bg-electric-blue/20 text-electric-blue rounded-lg hover:bg-electric-blue/30 transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
            {formData.themes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.themes.map((theme, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-black border border-gray-700 rounded-full text-gray-300 text-sm"
                  >
                    {theme}
                    <button
                      type="button"
                      onClick={() => handleRemoveTheme(theme)}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* IMDb URL */}
          <div>
            <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
              IMDb URL <span className="text-gray-600">(optional)</span>
            </label>
            <input
              type="url"
              name="imdb_url"
              value={formData.imdb_url}
              onChange={handleChange}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none transition-colors"
              placeholder="https://www.imdb.com/title/tt..."
            />
          </div>

          {/* Watch URL */}
          <div>
            <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
              External Watch Link <span className="text-gray-600">(optional)</span>
            </label>
            <input
              type="url"
              name="watch_url"
              value={formData.watch_url}
              onChange={handleChange}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none transition-colors"
              placeholder="https://..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-700 text-gray-400 rounded-full hover:bg-gray-800 transition-colors font-mono text-sm uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 text-white rounded-full transition-colors font-mono text-sm uppercase tracking-widest"
            >
              {saving ? 'Saving...' : 'Save Film'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminFilmModal;
