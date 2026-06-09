import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import AssetPicker from './admin/AssetPicker';
import FilmBasicsTab from './admin/FilmBasicsTab';
import FilmContentTab from './admin/FilmContentTab';
import FilmMediaTab from './admin/FilmMediaTab';
import FilmStudioTab from './admin/FilmStudioTab';

const TABS = [
  { id: 'basics', label: 'Basics' },
  { id: 'content', label: 'Content' },
  { id: 'media', label: 'Media' },
  { id: 'studio', label: 'Studio Access' }
];

const EMPTY_FORM = {
  title: '', slug: '', format: '', status: 'Development', featured: false,
  poster_url: '', tagline: '', logline: '', extended_synopsis: '', tone_style_text: '',
  mood_images: [], genres: [], target_audience: '', comparables: '',
  looking_for: [], target_budget_range: '', financing_structure: '', incentives: '',
  pitch_deck_url: '', script_url: '', imdb_url: '', watch_url: '', watch_url_title: '',
  studio_access_enabled: false
};

const AdminFilmModal = ({ isOpen, onClose, onSave, film }) => {
  const [activeTab, setActiveTab] = useState('basics');
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [genreInput, setGenreInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [assetPickerTarget, setAssetPickerTarget] = useState('poster');

  useEffect(() => {
    if (film) {
      setFormData(Object.keys(EMPTY_FORM).reduce((acc, key) => {
        acc[key] = film[key] !== undefined && film[key] !== null ? film[key] : EMPTY_FORM[key];
        return acc;
      }, {}));
    } else {
      setFormData({ ...EMPTY_FORM });
    }
    setGenreInput('');
    setActiveTab('basics');
  }, [film, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAddGenre = () => {
    const genre = genreInput.trim();
    if (formData.genres.length >= 3) { toast.error('Maximum 3 genres allowed'); return; }
    if (genre && !formData.genres.includes(genre)) {
      setFormData(prev => ({ ...prev, genres: [...prev.genres, genre] }));
      setGenreInput('');
    }
  };

  const handleRemoveGenre = (g) => setFormData(prev => ({ ...prev, genres: prev.genres.filter(x => x !== g) }));
  const handleAddLookingFor = (item) => { if (!formData.looking_for.includes(item)) setFormData(prev => ({ ...prev, looking_for: [...prev.looking_for, item] })); };
  const handleRemoveLookingFor = (item) => setFormData(prev => ({ ...prev, looking_for: prev.looking_for.filter(x => x !== item) }));

  const handleRegenerateSlug = async () => {
    if (!film?.id) {
      const slug = formData.title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
      toast.success('Slug generated from title');
      return;
    }
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/films/${film.id}/regenerate-slug`, { method: 'POST' });
      if (res.ok) { const data = await res.json(); setFormData(prev => ({ ...prev, slug: data.slug })); toast.success('Slug regenerated'); }
    } catch { toast.error('Failed to regenerate slug'); }
  };

  const handleAssetSelect = (url) => {
    if (assetPickerTarget === 'poster') setFormData(prev => ({ ...prev, poster_url: url }));
    else if (assetPickerTarget === 'mood') setFormData(prev => ({ ...prev, mood_images: [...prev.mood_images, url] }));
    else if (assetPickerTarget === 'pitch_deck_url') setFormData(prev => ({ ...prev, pitch_deck_url: url }));
    else if (assetPickerTarget === 'script_url') setFormData(prev => ({ ...prev, script_url: url }));
    setAssetPickerOpen(false);
    toast.success('Asset selected');
  };

  const openAssetPicker = (target) => { setAssetPickerTarget(target); setAssetPickerOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-swp-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative bg-swp-surface border border-swp-border rounded-swp max-w-3xl w-full max-h-[90vh] overflow-y-auto my-8">
        {/* Header */}
        <div className="sticky top-0 bg-swp-surface border-b border-swp-border px-6 py-4 z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">{film ? 'Edit Film' : 'Add New Film'}</h2>
            <button onClick={onClose} className="p-2 text-swp-white-ghost hover:text-swp-white transition-colors"><X size={20} /></button>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} data-testid={`tab-${tab.id}`}
                className={`px-4 py-2 rounded-sm text-sm font-mono uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-swp-ice text-white' : 'bg-swp-black text-swp-white-ghost hover:text-swp-white border border-swp-border'}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {activeTab === 'basics' && <FilmBasicsTab formData={formData} handleChange={handleChange} handleRegenerateSlug={handleRegenerateSlug} />}
          {activeTab === 'content' && <FilmContentTab formData={formData} handleChange={handleChange} genreInput={genreInput} setGenreInput={setGenreInput} handleAddGenre={handleAddGenre} handleRemoveGenre={handleRemoveGenre} />}
          {activeTab === 'media' && <FilmMediaTab formData={formData} setFormData={setFormData} onOpenAssetPicker={openAssetPicker} />}
          {activeTab === 'studio' && <FilmStudioTab formData={formData} handleChange={handleChange} setFormData={setFormData} handleAddLookingFor={handleAddLookingFor} handleRemoveLookingFor={handleRemoveLookingFor} onOpenAssetPicker={openAssetPicker} />}

          <div className="flex gap-4 pt-4 border-t border-swp-border">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border border-swp-border text-swp-white-ghost rounded-sm hover:bg-gray-800 transition-colors font-mono text-sm uppercase tracking-widest">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-6 py-3 bg-swp-ice hover:bg-swp-ice disabled:bg-swp-muted text-white rounded-sm transition-colors font-mono text-sm uppercase tracking-widest" data-testid="save-film-btn">
              {saving ? 'Saving...' : 'Save Film'}
            </button>
          </div>
        </form>
      </div>

      <AssetPicker isOpen={assetPickerOpen} onClose={() => setAssetPickerOpen(false)} onSelect={handleAssetSelect}
        assetType={assetPickerTarget === 'pitch_deck_url' || assetPickerTarget === 'script_url' ? 'all' : 'image'}
        title={assetPickerTarget === 'poster' ? 'Select Film Poster' : assetPickerTarget === 'mood' ? 'Select Mood Image' : 'Select Document'} />
    </div>
  );
};

export default AdminFilmModal;
