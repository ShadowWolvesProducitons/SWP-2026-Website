import React, { useRef, useState } from 'react';
import { X, Upload, Plus, Image, FolderOpen, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const FilmMediaTab = ({ formData, setFormData, onOpenAssetPicker }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (file, target = 'poster') => {
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) { toast.error('Please upload a valid image file'); return; }

    const fd = new FormData();
    fd.append('file', file);
    fd.append('source', 'films');
    fd.append('tags', `films,${target},${formData.title ? formData.title.slice(0, 20) : 'film'}`);

    setUploading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/upload/image`, { method: 'POST', body: fd });
      if (res.ok) {
        const data = await res.json();
        if (target === 'poster') setFormData(prev => ({ ...prev, poster_url: data.url }));
        else if (target === 'mood') setFormData(prev => ({ ...prev, mood_images: [...prev.mood_images, data.url] }));
        toast.success('Image uploaded successfully');
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Failed to upload image');
      }
    } catch { toast.error('Error uploading image'); }
    finally { setUploading(false); }
  };

  return (
    <>
      {/* Poster Image */}
      <div>
        <label className="block text-swp-white-ghost text-sm font-mono uppercase tracking-widest mb-2">
          Poster / Hero Image <span className="text-swp-white-ghost/50">(2:3 ratio recommended)</span>
        </label>
        <div className="flex gap-4">
          <div className="w-28 h-40 rounded-swp overflow-hidden flex-shrink-0 border border-swp-border bg-gray-900 flex items-center justify-center">
            {formData.poster_url ? (
              <div className="relative w-full h-full group">
                <img src={`${process.env.REACT_APP_BACKEND_URL}${formData.poster_url}`} alt="Poster" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, poster_url: '' }))}
                  className="absolute top-1 right-1 p-1 bg-swp-black/70 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="text-center p-2">
                <Image size={24} className="mx-auto text-swp-white-ghost/50 mb-1" />
                <span className="text-swp-white-ghost/70 text-xs">No Poster</span>
              </div>
            )}
          </div>
          <div className="flex-1 flex flex-col gap-3">
            <div className={`flex-1 border-2 border-dashed rounded-swp p-4 text-center cursor-pointer transition-all ${isDragging ? 'border-swp-ice bg-swp-ice/10' : 'border-swp-border hover:border-gray-500'}`}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
              onDrop={e => { e.preventDefault(); setIsDragging(false); handleImageUpload(e.dataTransfer.files[0], 'poster'); }}
              onClick={() => fileInputRef.current?.click()}>
              <Upload size={20} className={`mx-auto mb-1 ${isDragging ? 'text-swp-ice' : 'text-swp-white-ghost/70'}`} />
              <p className={`text-xs ${isDragging ? 'text-swp-ice' : 'text-swp-white-ghost'}`}>
                {uploading ? 'Uploading...' : 'Drag & Drop or Click'}
              </p>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={e => handleImageUpload(e.target.files[0], 'poster')} className="hidden" disabled={uploading} />
            </div>
            <button type="button" onClick={() => onOpenAssetPicker('poster')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-swp-ice/10 border border-swp-ice/30 rounded-swp text-swp-ice text-sm hover:bg-swp-ice/15">
              <FolderOpen size={16} /> Browse Library
            </button>
          </div>
        </div>
      </div>

      {/* Mood Images */}
      <div>
        <label className="block text-swp-white-ghost text-sm font-mono uppercase tracking-widest mb-2">
          Mood Images <span className="text-swp-white-ghost/50">(4-6 images for Tone & Style section)</span>
        </label>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {formData.mood_images.map((url, idx) => (
            <div key={url} className="relative aspect-video rounded-swp overflow-hidden border border-swp-border group">
              <img src={url.startsWith('http') ? url : `${process.env.REACT_APP_BACKEND_URL}${url}`} alt={`Mood ${idx + 1}`} className="w-full h-full object-cover" />
              <button type="button" onClick={() => setFormData(prev => ({ ...prev, mood_images: prev.mood_images.filter((_, i) => i !== idx) }))}
                className="absolute top-1 right-1 p-1 bg-swp-black/70 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {formData.mood_images.length < 6 && (
            <button type="button" onClick={() => onOpenAssetPicker('mood')}
              className="aspect-video flex flex-col items-center justify-center gap-2 border-2 border-dashed border-swp-border rounded-swp text-swp-white-ghost/70 hover:border-gray-500 hover:text-swp-white-ghost transition-colors">
              <Plus size={20} /><span className="text-xs">Add Image</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default FilmMediaTab;
