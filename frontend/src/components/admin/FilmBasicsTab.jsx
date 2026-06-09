import React from 'react';
import { RefreshCw } from 'lucide-react';

const STATUS_OPTIONS = ['Development', 'Packaging', 'Pre-Production', 'Filming', 'Post-Production', 'Marketing', 'Released'];
const FORMAT_OPTIONS = ['Feature Film', 'Limited Series', 'Short Film', 'Documentary Feature', 'Web Series', 'Anthology'];

const FilmBasicsTab = ({ formData, handleChange, handleRegenerateSlug }) => (
  <>
    <div>
      <label className="block text-swp-white-ghost text-sm font-mono uppercase tracking-widest mb-2">Title *</label>
      <input type="text" name="title" value={formData.title} onChange={handleChange}
        className="w-full bg-swp-black border border-swp-border rounded-swp px-4 py-3 text-white focus:border-swp-ice focus:outline-none transition-colors"
        placeholder="Enter film title" required data-testid="film-title-input" />
    </div>

    <div>
      <label className="block text-swp-white-ghost text-sm font-mono uppercase tracking-widest mb-2">URL Slug</label>
      <div className="flex gap-2">
        <input type="text" name="slug" value={formData.slug} onChange={handleChange}
          className="flex-1 bg-swp-black border border-swp-border rounded-swp px-4 py-3 text-white focus:border-swp-ice focus:outline-none transition-colors"
          placeholder="auto-generated-from-title" data-testid="film-slug-input" />
        <button type="button" onClick={handleRegenerateSlug}
          className="px-4 py-3 bg-swp-ice/15 text-swp-ice rounded-swp hover:bg-swp-ice/30 transition-colors"
          title="Regenerate slug from title" data-testid="regenerate-slug-btn">
          <RefreshCw size={18} />
        </button>
      </div>
      <p className="text-swp-white-ghost/50 text-xs mt-1">URL: /films/{formData.slug || 'your-film-slug'}</p>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-swp-white-ghost text-sm font-mono uppercase tracking-widest mb-2">Format</label>
        <select name="format" value={formData.format} onChange={handleChange}
          className="w-full bg-swp-black border border-swp-border rounded-swp px-4 py-3 text-white focus:border-swp-ice focus:outline-none transition-colors">
          <option value="">Select format...</option>
          {FORMAT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-swp-white-ghost text-sm font-mono uppercase tracking-widest mb-2">Status</label>
        <select name="status" value={formData.status} onChange={handleChange}
          className="w-full bg-swp-black border border-swp-border rounded-swp px-4 py-3 text-white focus:border-swp-ice focus:outline-none transition-colors">
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>

    <div>
      <label className="flex items-center gap-3 bg-swp-black border border-swp-border rounded-swp px-4 py-3 cursor-pointer hover:border-gray-600 transition-colors">
        <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange}
          className="w-5 h-5 rounded border-gray-600 text-swp-ice focus:ring-swp-ice focus:ring-offset-black" />
        <span className="text-white">Show as featured film</span>
      </label>
    </div>
  </>
);

export default FilmBasicsTab;
