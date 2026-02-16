import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Plus, Image, FolderOpen, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import AssetPicker from './admin/AssetPicker';

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

const FORMAT_OPTIONS = ['Feature Film', 'Limited Series', 'Short Film', 'Documentary Feature', 'Web Series', 'Anthology'];

const LOOKING_FOR_OPTIONS = ['Producers', 'Executive Producers', 'Equity Partners', 'Distribution', 'Sales Agents', 'Co-Production Partners', 'Talent Attachments', 'Development Funding'];

const MAX_GENRES = 3;

const TABS = [
  { id: 'basics', label: 'Basics' },
  { id: 'content', label: 'Content' },
  { id: 'media', label: 'Media' },
  { id: 'studio', label: 'Studio Access' }
];

const AdminFilmModal = ({ isOpen, onClose, onSave, film }) => {
  const [activeTab, setActiveTab] = useState('basics');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    film_type: 'Feature',
    status: 'Development',
    featured: false,
    poster_url: '',
    tagline: '',
    logline: '',
    extended_synopsis: '',
    tone_style_text: '',
    mood_images: [],
    genres: [],
    format: '',
    target_audience: '',
    comparables: '',
    looking_for: [],
    target_budget_range: '',
    financing_structure: '',
    incentives: '',
    pitch_deck_url: '',
    script_url: '',
    imdb_url: '',
    watch_url: '',
    watch_url_title: '',
    studio_access_enabled: false
  });
  const [genreInput, setGenreInput] = useState('');
  const [lookingForInput, setLookingForInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [assetPickerTarget, setAssetPickerTarget] = useState('poster'); // poster, mood, pitch_deck, script
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (film) {
      setFormData({
        title: film.title || '',
        slug: film.slug || '',
        film_type: film.film_type || 'Feature',
        status: film.status || 'Development',
        featured: film.featured || false,
        poster_url: film.poster_url || '',
        tagline: film.tagline || '',
        logline: film.logline || '',
        extended_synopsis: film.extended_synopsis || '',
        tone_style_text: film.tone_style_text || '',
        mood_images: film.mood_images || [],
        genres: film.genres || [],
        format: film.format || '',
        target_audience: film.target_audience || '',
        comparables: film.comparables || '',
        looking_for: film.looking_for || [],
        target_budget_range: film.target_budget_range || '',
        financing_structure: film.financing_structure || '',
        incentives: film.incentives || '',
        pitch_deck_url: film.pitch_deck_url || '',
        script_url: film.script_url || '',
        imdb_url: film.imdb_url || '',
        watch_url: film.watch_url || '',
        watch_url_title: film.watch_url_title || '',
        studio_access_enabled: film.studio_access_enabled || false
      });
    } else {
      setFormData({
        title: '',
        slug: '',
        film_type: 'Feature',
        status: 'Development',
        featured: false,
        poster_url: '',
        tagline: '',
        logline: '',
        extended_synopsis: '',
        tone_style_text: '',
        mood_images: [],
        genres: [],
        format: '',
        target_audience: '',
        comparables: '',
        looking_for: [],
        target_budget_range: '',
        financing_structure: '',
        incentives: '',
        pitch_deck_url: '',
        script_url: '',
        imdb_url: '',
        watch_url: '',
        watch_url_title: '',
        studio_access_enabled: false
      });
    }
    setGenreInput('');
    setLookingForInput('');
    setActiveTab('basics');
  }, [film, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = async (file, target = 'poster') => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPG, PNG, GIF, WebP)');
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('source', 'films');
    formDataUpload.append('tags', `films,${target},${formData.title ? formData.title.slice(0, 20) : 'film'}`);

    setUploading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/upload/image`, {
        method: 'POST',
        body: formDataUpload
      });

      if (response.ok) {
        const data = await response.json();
        if (target === 'poster') {
          setFormData(prev => ({ ...prev, poster_url: data.url }));
        } else if (target === 'mood') {
          setFormData(prev => ({ ...prev, mood_images: [...prev.mood_images, data.url] }));
        }
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

  const handleFileUpload = async (file, target) => {
    if (!file) return;

    const validTypes = ['application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF file');
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('source', 'films');
    formDataUpload.append('tags', `films,${target},${formData.title ? formData.title.slice(0, 20) : 'film'}`);

    setUploading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/upload/file`, {
        method: 'POST',
        body: formDataUpload
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, [target]: data.url }));
        toast.success('Document uploaded successfully');
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to upload document');
      }
    } catch (err) {
      toast.error('Error uploading document');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    handleImageUpload(file, 'poster');
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
    handleImageUpload(file, 'poster');
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

  const handleAddLookingFor = (item) => {
    if (!formData.looking_for.includes(item)) {
      setFormData(prev => ({
        ...prev,
        looking_for: [...prev.looking_for, item]
      }));
    }
    setLookingForInput('');
  };

  const handleRemoveLookingFor = (item) => {
    setFormData(prev => ({
      ...prev,
      looking_for: prev.looking_for.filter(l => l !== item)
    }));
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, poster_url: '' }));
  };

  const handleRemoveMoodImage = (index) => {
    setFormData(prev => ({
      ...prev,
      mood_images: prev.mood_images.filter((_, i) => i !== index)
    }));
  };

  const handleRegenerateSlug = async () => {
    if (!film?.id) {
      // For new films, generate slug from title
      const slug = formData.title.toLowerCase().trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
      toast.success('Slug generated from title');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/films/${film.id}/regenerate-slug`, {
        method: 'POST'
      });
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, slug: data.slug }));
        toast.success('Slug regenerated');
      }
    } catch (err) {
      toast.error('Failed to regenerate slug');
    }
  };

  const handleAssetSelect = (url) => {
    if (assetPickerTarget === 'poster') {
      setFormData(prev => ({ ...prev, poster_url: url }));
    } else if (assetPickerTarget === 'mood') {
      setFormData(prev => ({ ...prev, mood_images: [...prev.mood_images, url] }));
    } else if (assetPickerTarget === 'pitch_deck_url') {
      setFormData(prev => ({ ...prev, pitch_deck_url: url }));
    } else if (assetPickerTarget === 'script_url') {
      setFormData(prev => ({ ...prev, script_url: url }));
    }
    setAssetPickerOpen(false);
    toast.success('Asset selected');
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
      <div className="relative bg-smoke-gray border border-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto my-8">
        {/* Header */}
        <div className="sticky top-0 bg-smoke-gray border-b border-gray-800 px-6 py-4 z-10">
          <div className="flex items-center justify-between mb-4">
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
          
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-mono uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-electric-blue text-white'
                    : 'bg-black text-gray-400 hover:text-white border border-gray-700'
                }`}
                data-testid={`tab-${tab.id}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* BASICS TAB */}
          {activeTab === 'basics' && (
            <>
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
                  data-testid="film-title-input"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                  URL Slug
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="flex-1 bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none transition-colors"
                    placeholder="auto-generated-from-title"
                    data-testid="film-slug-input"
                  />
                  <button
                    type="button"
                    onClick={handleRegenerateSlug}
                    className="px-4 py-3 bg-electric-blue/20 text-electric-blue rounded-lg hover:bg-electric-blue/30 transition-colors"
                    title="Regenerate slug from title"
                    data-testid="regenerate-slug-btn"
                  >
                    <RefreshCw size={18} />
                  </button>
                </div>
                <p className="text-gray-600 text-xs mt-1">URL: /films/{formData.slug || 'your-film-slug'}</p>
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

              {/* Format */}
              <div>
                <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                  Format
                </label>
                <select
                  name="format"
                  value={formData.format}
                  onChange={handleChange}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none transition-colors"
                >
                  <option value="">Select format...</option>
                  {FORMAT_OPTIONS.map(format => (
                    <option key={format} value={format}>{format}</option>
                  ))}
                </select>
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

              {/* External Links */}
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
              </div>
            </>
          )}

          {/* CONTENT TAB */}
          {activeTab === 'content' && (
            <>
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
                  data-testid="film-tagline-input"
                />
              </div>

              {/* Logline */}
              <div>
                <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                  Logline <span className="text-gray-600">(single paragraph)</span>
                </label>
                <textarea
                  name="logline"
                  value={formData.logline}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none transition-colors resize-none"
                  placeholder="One paragraph describing the story premise..."
                  data-testid="film-logline-input"
                />
              </div>

              {/* Extended Synopsis */}
              <div>
                <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                  Extended Synopsis <span className="text-gray-600">(expandable on public page)</span>
                </label>
                <textarea
                  name="extended_synopsis"
                  value={formData.extended_synopsis}
                  onChange={handleChange}
                  rows={6}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none transition-colors resize-none"
                  placeholder="Full synopsis with paragraph breaks (use blank lines for breaks)..."
                  data-testid="film-synopsis-input"
                />
              </div>

              {/* Tone & Style Text */}
              <div>
                <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                  Tone & Style <span className="text-gray-600">(3-5 paragraphs about vision)</span>
                </label>
                <textarea
                  name="tone_style_text"
                  value={formData.tone_style_text}
                  onChange={handleChange}
                  rows={6}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none transition-colors resize-none"
                  placeholder="Describe the visual tone, style references, atmosphere, influences..."
                  data-testid="film-tone-input"
                />
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                  Target Audience
                </label>
                <input
                  type="text"
                  name="target_audience"
                  value={formData.target_audience}
                  onChange={handleChange}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none transition-colors"
                  placeholder="e.g., Adults 18-35, genre enthusiasts, festival audiences"
                />
              </div>

              {/* Comparables */}
              <div>
                <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                  Comparables
                </label>
                <input
                  type="text"
                  name="comparables"
                  value={formData.comparables}
                  onChange={handleChange}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none transition-colors"
                  placeholder="e.g., Get Out meets The Witch, A24 aesthetic"
                />
              </div>

              {/* Looking For */}
              <div>
                <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                  Currently Seeking
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {LOOKING_FOR_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleAddLookingFor(option)}
                      disabled={formData.looking_for.includes(option)}
                      className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest transition-all ${
                        formData.looking_for.includes(option)
                          ? 'bg-electric-blue text-white cursor-not-allowed'
                          : 'bg-black text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-700'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {formData.looking_for.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-black/50 rounded-lg border border-gray-800">
                    <span className="text-gray-500 text-xs uppercase mr-2">Selected:</span>
                    {formData.looking_for.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-electric-blue/20 border border-electric-blue/40 rounded-full text-electric-blue text-sm"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => handleRemoveLookingFor(item)}
                          className="text-electric-blue/60 hover:text-red-400 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* MEDIA TAB */}
          {activeTab === 'media' && (
            <>
              {/* Poster Image */}
              <div>
                <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                  Poster / Hero Image <span className="text-gray-600">(2:3 ratio recommended)</span>
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
                        <span className="text-gray-500 text-xs">No Poster</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Upload Zone */}
                  <div className="flex-1 flex flex-col gap-3">
                    <div
                      className={`flex-1 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
                        isDragging 
                          ? 'border-electric-blue bg-electric-blue/10' 
                          : 'border-gray-700 hover:border-gray-500'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={20} className={`mx-auto mb-1 ${isDragging ? 'text-electric-blue' : 'text-gray-500'}`} />
                      <p className={`text-xs ${isDragging ? 'text-electric-blue' : 'text-gray-400'}`}>
                        {uploading ? 'Uploading...' : 'Drag & Drop or Click'}
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={uploading}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => { setAssetPickerTarget('poster'); setAssetPickerOpen(true); }}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-electric-blue/10 border border-electric-blue/30 rounded-lg text-electric-blue text-sm hover:bg-electric-blue/20"
                    >
                      <FolderOpen size={16} /> Browse Library
                    </button>
                  </div>
                </div>
              </div>

              {/* Mood Images */}
              <div>
                <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                  Mood Images <span className="text-gray-600">(4-6 images for Tone & Style section)</span>
                </label>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {formData.mood_images.map((url, idx) => (
                    <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-gray-700 group">
                      <img 
                        src={url.startsWith('http') ? url : `${process.env.REACT_APP_BACKEND_URL}${url}`}
                        alt={`Mood ${idx + 1}`} 
                        className="w-full h-full object-cover" 
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveMoodImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {formData.mood_images.length < 6 && (
                    <button
                      type="button"
                      onClick={() => { setAssetPickerTarget('mood'); setAssetPickerOpen(true); }}
                      className="aspect-video flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-700 rounded-lg text-gray-500 hover:border-gray-500 hover:text-gray-400 transition-colors"
                    >
                      <Plus size={20} />
                      <span className="text-xs">Add Image</span>
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* STUDIO ACCESS TAB */}
          {activeTab === 'studio' && (
            <>
              {/* Enable Studio Access */}
              <div>
                <label className="flex items-center gap-3 bg-black border border-gray-700 rounded-lg px-4 py-3 cursor-pointer hover:border-gray-600 transition-colors">
                  <input
                    type="checkbox"
                    name="studio_access_enabled"
                    checked={formData.studio_access_enabled}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gray-600 text-electric-blue focus:ring-electric-blue focus:ring-offset-black"
                  />
                  <div>
                    <span className="text-white">Enable Studio Access Page</span>
                    <p className="text-gray-500 text-xs mt-1">Allow token-gated access to confidential materials</p>
                  </div>
                </label>
              </div>

              {formData.studio_access_enabled && (
                <>
                  {/* Target Budget Range */}
                  <div>
                    <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                      Target Budget Range
                    </label>
                    <input
                      type="text"
                      name="target_budget_range"
                      value={formData.target_budget_range}
                      onChange={handleChange}
                      className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none transition-colors"
                      placeholder="e.g., $2M - $5M AUD"
                    />
                  </div>

                  {/* Financing Structure */}
                  <div>
                    <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                      Financing Structure <span className="text-gray-600">(high-level overview)</span>
                    </label>
                    <textarea
                      name="financing_structure"
                      value={formData.financing_structure}
                      onChange={handleChange}
                      rows={3}
                      className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none transition-colors resize-none"
                      placeholder="e.g., 40% pre-sales, 30% equity, 20% government incentives, 10% gap financing"
                    />
                  </div>

                  {/* Incentives */}
                  <div>
                    <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                      Tax Incentives / Rebates
                    </label>
                    <textarea
                      name="incentives"
                      value={formData.incentives}
                      onChange={handleChange}
                      rows={2}
                      className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none transition-colors resize-none"
                      placeholder="e.g., Eligible for 40% Producer Offset (Australia), Location Incentive"
                    />
                  </div>

                  {/* Pitch Deck PDF */}
                  <div>
                    <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                      Pitch Deck (PDF)
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        name="pitch_deck_url"
                        value={formData.pitch_deck_url}
                        onChange={handleChange}
                        className="flex-1 bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none transition-colors"
                        placeholder="/uploads/documents/pitch-deck.pdf"
                        readOnly
                      />
                      <button
                        type="button"
                        onClick={() => { setAssetPickerTarget('pitch_deck_url'); setAssetPickerOpen(true); }}
                        className="px-4 py-3 bg-electric-blue/20 text-electric-blue rounded-lg hover:bg-electric-blue/30 transition-colors"
                      >
                        <FolderOpen size={18} />
                      </button>
                      {formData.pitch_deck_url && (
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, pitch_deck_url: '' }))}
                          className="px-4 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Script PDF */}
                  <div>
                    <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
                      Script (PDF) <span className="text-gray-600">(NDA required for access)</span>
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        name="script_url"
                        value={formData.script_url}
                        onChange={handleChange}
                        className="flex-1 bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none transition-colors"
                        placeholder="/uploads/documents/script.pdf"
                        readOnly
                      />
                      <button
                        type="button"
                        onClick={() => { setAssetPickerTarget('script_url'); setAssetPickerOpen(true); }}
                        className="px-4 py-3 bg-electric-blue/20 text-electric-blue rounded-lg hover:bg-electric-blue/30 transition-colors"
                      >
                        <FolderOpen size={18} />
                      </button>
                      {formData.script_url && (
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, script_url: '' }))}
                          className="px-4 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-400 text-sm">
                      <strong>Note:</strong> Studio access requires a valid token. Share the URL <code className="bg-black/50 px-2 py-0.5 rounded">/studio-access/{formData.slug || 'slug'}?token=...</code> with authorized parties.
                    </p>
                  </div>
                </>
              )}
            </>
          )}

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
              data-testid="save-film-btn"
            >
              {saving ? 'Saving...' : 'Save Film'}
            </button>
          </div>
        </form>
      </div>

      {/* Asset Picker */}
      <AssetPicker 
        isOpen={assetPickerOpen}
        onClose={() => setAssetPickerOpen(false)}
        onSelect={handleAssetSelect}
        assetType={assetPickerTarget === 'pitch_deck_url' || assetPickerTarget === 'script_url' ? 'document' : 'image'}
        title={assetPickerTarget === 'poster' ? 'Select Film Poster' : assetPickerTarget === 'mood' ? 'Select Mood Image' : 'Select Document'}
      />
    </div>
  );
};

export default AdminFilmModal;
