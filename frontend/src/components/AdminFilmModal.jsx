import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Plus, Image } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_OPTIONS = [
  'Development',
  'Packaging',
  'Pre-Production',
  'Filming',
  'Post-Production',
  'Marketing',
  'Released'
];

const TYPE_OPTIONS = ['Short', 'Feature', 'Series', 'Documentary', 'Other'];

const AdminFilmModal = ({ isOpen, onClose, onSave, film }) => {
  const [formData, setFormData] = useState({
    title: '',
    film_type: 'Feature',
    status: 'Development',
    featured: false,
    poster_url: '',
    logline: '',
    synopsis: '',
    genres: [],
    themes: [],
    imdb_url: '',
    watch_url: ''
  });
  const [genreInput, setGenreInput] = useState('');
  const [themeInput, setThemeInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (film) {
      setFormData({
        title: film.title || '',
        film_type: film.film_type || 'Feature',
        status: film.status || 'Development',
        featured: film.featured || false,
        poster_url: film.poster_url || '',
        logline: film.logline || '',
        synopsis: film.synopsis || '',
        genres: film.genres || [],
        themes: film.themes || [],
        imdb_url: film.imdb_url || '',
        watch_url: film.watch_url || ''
      });
    } else {
      setFormData({
        title: '',
        film_type: 'Feature',
        status: 'Development',
        featured: false,
        poster_url: '',
        logline: '',
        synopsis: '',
        genres: [],
        themes: [],
        imdb_url: '',
        watch_url: ''
      });
    }
    setGenreInput('');
    setThemeInput('');
  }, [film, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPG, PNG, GIF, WebP)');
      return;
    }

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

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    handleImageUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleImageUpload(file);
  };

  const handleAddGenre = () => {
    const genre = genreInput.trim();
    if (genre && !formData.genres.includes(genre)) {
      setFormData(prev => ({
        ...prev,
        genres: [...prev.genres, genre]
      }));
      setGenreInput('');
    }
  };

  const handleRemoveGenre = (genreToRemove) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.filter(g => g !== genreToRemove)
    }));
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

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, poster_url: '' }));
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

          {/* Type & Status Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                Type
              </label>
              <select
                name="film_type"
                value={formData.film_type}
                onChange={handleChange}
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none transition-colors"
              >
                {TYPE_OPTIONS.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
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
          </div>

          {/* Featured */}
          <div>
            <label className="flex items-center gap-3 bg-black border border-gray-700 rounded-lg px-4 py-3 cursor-pointer hover:border-gray-600 transition-colors">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-600 text-electric-blue focus:ring-electric-blue focus:ring-offset-black"
              />
              <span className="text-white">Show as featured film</span>
            </label>
          </div>

          {/* Poster Image - Drag & Drop */}
          <div>
            <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
              Poster / Hero Image
            </label>
            <div className="flex gap-4">
              {/* Preview */}
              <div className="w-28 h-40 rounded-lg overflow-hidden flex-shrink-0 border border-gray-700 bg-gray-900 flex items-center justify-center">
                {formData.poster_url ? (
                  <div className="relative w-full h-full group">
                    <img 
                      src={`${process.env.REACT_APP_BACKEND_URL}${formData.poster_url}`} 
                      alt="Poster" 
                      className="w-full h-full object-cover" 
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-1 right-1 p-1 bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-2">
                    <Image size={24} className="mx-auto text-gray-600 mb-1" />
                    <span className="text-gray-500 text-xs">Poster Coming Soon</span>
                  </div>
                )}
              </div>
              
              {/* Upload Zone */}
              <div
                className={`flex-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-electric-blue bg-electric-blue/10' 
                    : 'border-gray-700 hover:border-gray-500'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={24} className={`mx-auto mb-2 ${isDragging ? 'text-electric-blue' : 'text-gray-500'}`} />
                <p className={`text-sm ${isDragging ? 'text-electric-blue' : 'text-gray-400'}`}>
                  {uploading ? 'Uploading...' : 'Drag & Drop or Click to Upload'}
                </p>
                <p className="text-xs text-gray-600 mt-1">JPG, PNG, GIF, WebP</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading}
                />
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
              rows={5}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none transition-colors resize-none"
              placeholder="Full synopsis (use blank lines for paragraph breaks)"
            />
          </div>

          {/* Genres */}
          <div>
            <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
              Genres
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={genreInput}
                onChange={(e) => setGenreInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGenre())}
                className="flex-1 bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-electric-blue focus:outline-none transition-colors text-sm"
                placeholder="Add a genre (e.g., Horror, Drama, Thriller)"
              />
              <button
                type="button"
                onClick={handleAddGenre}
                className="px-4 py-2 bg-electric-blue/20 text-electric-blue rounded-lg hover:bg-electric-blue/30 transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
            {formData.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.genres.map((genre, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-electric-blue/20 border border-electric-blue/40 rounded-full text-electric-blue text-sm"
                  >
                    {genre}
                    <button
                      type="button"
                      onClick={() => handleRemoveGenre(genre)}
                      className="text-electric-blue/60 hover:text-red-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
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
