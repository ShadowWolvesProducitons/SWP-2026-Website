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

const MAX_GENRES = 3;

const AdminFilmModal = ({ isOpen, onClose, onSave, film }) => {
  const [formData, setFormData] = useState({
    title: '',
    film_type: 'Feature',
    status: 'Development',
    featured: false,
    poster_url: '',
    tagline: '',
    logline: '',
    genres: [],
    imdb_url: '',
    watch_url: '',
    watch_url_title: ''
  });
  const [genreInput, setGenreInput] = useState('');
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
        tagline: film.tagline || '',
        logline: film.logline || '',
        genres: film.genres || [],
        imdb_url: film.imdb_url || '',
        watch_url: film.watch_url || '',
        watch_url_title: film.watch_url_title || ''
      });
    } else {
      setFormData({
        title: '',
        film_type: 'Feature',
        status: 'Development',
        featured: false,
        poster_url: '',
        tagline: '',
        logline: '',
        genres: [],
        imdb_url: '',
        watch_url: '',
        watch_url_title: ''
      });
    }
    setGenreInput('');
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

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPG, PNG, GIF, WebP)');
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('source', 'films');
    formDataUpload.append('tags', `films,poster,${formData.title ? formData.title.slice(0, 20) : 'film'}`);

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
    if (formData.genres.length >= MAX_GENRES) {
      toast.error(`Maximum ${MAX_GENRES} genres allowed`);
      return;
    }
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

          {/* Tagline */}
          <div>
            <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
              Tagline
            </label>
            <input
              type="text"
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none transition-colors"
              placeholder="A punchy one-liner hook (e.g., 'Some secrets should stay buried.')"
            />
          </div>

          {/* Logline */}
          <div>
            <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
              Logline
            </label>
            <textarea
              name="logline"
              value={formData.logline}
              onChange={handleChange}
              rows={5}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none transition-colors resize-none"
              placeholder="Full logline / synopsis (use blank lines for paragraph breaks)"
            />
          </div>

          {/* Genres */}
          <div>
            <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
              Genres <span className="text-gray-600">(max {MAX_GENRES})</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={genreInput}
                onChange={(e) => setGenreInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGenre())}
                className="flex-1 bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-electric-blue focus:outline-none transition-colors text-sm"
                placeholder="Add a genre (e.g., Horror, Drama, Thriller)"
                disabled={formData.genres.length >= MAX_GENRES}
              />
              <button
                type="button"
                onClick={handleAddGenre}
                disabled={formData.genres.length >= MAX_GENRES}
                className="px-4 py-2 bg-electric-blue/20 text-electric-blue rounded-lg hover:bg-electric-blue/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* External Link with Title */}
          <div>
            <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
              External Link <span className="text-gray-600">(optional)</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                name="watch_url_title"
                value={formData.watch_url_title}
                onChange={handleChange}
                className="col-span-1 bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none transition-colors"
                placeholder="Title (e.g., Trailer)"
              />
              <input
                type="url"
                name="watch_url"
                value={formData.watch_url}
                onChange={handleChange}
                className="col-span-2 bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none transition-colors"
                placeholder="https://..."
              />
            </div>
            <p className="text-gray-600 text-xs mt-1">e.g., "Pitch Deck", "Trailer", "Watch Now"</p>
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
