import React from 'react';
import { X, Plus } from 'lucide-react';

const MAX_GENRES = 3;

const FilmContentTab = ({ formData, handleChange, genreInput, setGenreInput, handleAddGenre, handleRemoveGenre }) => (
  <>
    <div>
      <label className="block text-swp-white-ghost text-sm font-mono uppercase tracking-widest mb-2">Tagline</label>
      <input type="text" name="tagline" value={formData.tagline} onChange={handleChange}
        className="w-full bg-swp-black border border-swp-border rounded-swp px-4 py-3 text-white focus:border-swp-ice focus:outline-none transition-colors"
        placeholder="A punchy one-liner hook (e.g., 'Some secrets should stay buried.')" data-testid="film-tagline-input" />
    </div>

    <div>
      <label className="block text-swp-white-ghost text-sm font-mono uppercase tracking-widest mb-2">
        Logline <span className="text-swp-white-ghost/50">(single paragraph)</span>
      </label>
      <textarea name="logline" value={formData.logline} onChange={handleChange} rows={3}
        className="w-full bg-swp-black border border-swp-border rounded-swp px-4 py-3 text-white focus:border-swp-ice focus:outline-none transition-colors resize-none"
        placeholder="One paragraph describing the story premise..." data-testid="film-logline-input" />
    </div>

    <div>
      <label className="block text-swp-white-ghost text-sm font-mono uppercase tracking-widest mb-2">
        Genres <span className="text-swp-white-ghost/50">(max {MAX_GENRES})</span>
      </label>
      <div className="flex gap-2 mb-2">
        <input type="text" value={genreInput} onChange={e => setGenreInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddGenre())}
          className="flex-1 bg-swp-black border border-swp-border rounded-swp px-4 py-2 text-white focus:border-swp-ice focus:outline-none transition-colors text-sm"
          placeholder="Add a genre (e.g., Horror, Drama, Thriller)"
          disabled={formData.genres.length >= MAX_GENRES} />
        <button type="button" onClick={handleAddGenre} disabled={formData.genres.length >= MAX_GENRES}
          className="px-4 py-2 bg-swp-ice/15 text-swp-ice rounded-swp hover:bg-swp-ice/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <Plus size={18} />
        </button>
      </div>
      {formData.genres.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {formData.genres.map(genre => (
            <span key={genre} className="inline-flex items-center gap-1 px-3 py-1 bg-swp-ice/15 border border-swp-ice/25 rounded-sm text-swp-ice text-sm">
              {genre}
              <button type="button" onClick={() => handleRemoveGenre(genre)} className="text-swp-ice/60 hover:text-red-400 transition-colors">
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>

    <div>
      <label className="block text-swp-white-ghost text-sm font-mono uppercase tracking-widest mb-2">
        IMDb URL <span className="text-swp-white-ghost/50">(optional)</span>
      </label>
      <input type="url" name="imdb_url" value={formData.imdb_url} onChange={handleChange}
        className="w-full bg-swp-black border border-swp-border rounded-swp px-4 py-3 text-white focus:border-swp-ice focus:outline-none transition-colors"
        placeholder="https://www.imdb.com/title/tt..." />
    </div>

    <div>
      <label className="block text-swp-white-ghost text-sm font-mono uppercase tracking-widest mb-2">
        External Link <span className="text-swp-white-ghost/50">(optional)</span>
      </label>
      <div className="grid grid-cols-3 gap-3">
        <input type="text" name="watch_url_title" value={formData.watch_url_title} onChange={handleChange}
          className="col-span-1 bg-swp-black border border-swp-border rounded-swp px-4 py-3 text-white focus:border-swp-ice focus:outline-none transition-colors"
          placeholder="Title (e.g., Trailer)" />
        <input type="url" name="watch_url" value={formData.watch_url} onChange={handleChange}
          className="col-span-2 bg-swp-black border border-swp-border rounded-swp px-4 py-3 text-white focus:border-swp-ice focus:outline-none transition-colors"
          placeholder="https://..." />
      </div>
    </div>
  </>
);

export default FilmContentTab;
