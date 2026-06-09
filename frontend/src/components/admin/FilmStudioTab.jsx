import React from 'react';
import { X, FolderOpen, Trash2 } from 'lucide-react';

const LOOKING_FOR_OPTIONS = ['Producers', 'Executive Producers', 'Equity Partners', 'Distribution', 'Sales Agents', 'Co-Production Partners', 'Talent Attachments', 'Development Funding'];

const FilmStudioTab = ({ formData, handleChange, setFormData, handleAddLookingFor, handleRemoveLookingFor, onOpenAssetPicker }) => (
  <>
    <div>
      <label className="flex items-center gap-3 bg-swp-black border border-swp-border rounded-swp px-4 py-3 cursor-pointer hover:border-gray-600 transition-colors">
        <input type="checkbox" name="studio_access_enabled" checked={formData.studio_access_enabled} onChange={handleChange}
          className="w-5 h-5 rounded border-gray-600 text-swp-ice focus:ring-swp-ice focus:ring-offset-black" />
        <div>
          <span className="text-white">Enable Studio Access Page</span>
          <p className="text-swp-white-ghost/70 text-xs mt-1">Allow portal users to access confidential materials</p>
        </div>
      </label>
    </div>

    <div>
      <label className="block text-swp-white-ghost text-sm font-mono uppercase tracking-widest mb-2">Target Audience</label>
      <input type="text" name="target_audience" value={formData.target_audience} onChange={handleChange}
        className="w-full bg-swp-black border border-swp-border rounded-swp px-4 py-3 text-white focus:border-swp-ice focus:outline-none transition-colors"
        placeholder="e.g., Adults 18-35, genre enthusiasts, festival audiences" />
    </div>

    <div>
      <label className="block text-swp-white-ghost text-sm font-mono uppercase tracking-widest mb-2">Comparables</label>
      <input type="text" name="comparables" value={formData.comparables} onChange={handleChange}
        className="w-full bg-swp-black border border-swp-border rounded-swp px-4 py-3 text-white focus:border-swp-ice focus:outline-none transition-colors"
        placeholder="e.g., Get Out meets The Witch, A24 aesthetic" />
    </div>

    {/* Looking For */}
    <div>
      <label className="block text-swp-white-ghost text-sm font-mono uppercase tracking-widest mb-2">Currently Seeking</label>
      <div className="flex flex-wrap gap-2 mb-3">
        {LOOKING_FOR_OPTIONS.map(option => (
          <button key={option} type="button" onClick={() => handleAddLookingFor(option)} disabled={formData.looking_for.includes(option)}
            className={`px-3 py-1.5 rounded-sm text-xs font-mono uppercase tracking-widest transition-all ${formData.looking_for.includes(option) ? 'bg-swp-ice text-white cursor-not-allowed' : 'bg-swp-black text-swp-white-ghost hover:bg-gray-800 hover:text-swp-white border border-swp-border'}`}>
            {option}
          </button>
        ))}
      </div>
      {formData.looking_for.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-swp-deep/70 rounded-swp border border-swp-border">
          <span className="text-swp-white-ghost/70 text-xs uppercase mr-2">Selected:</span>
          {formData.looking_for.map(item => (
            <span key={item} className="inline-flex items-center gap-1 px-3 py-1 bg-swp-ice/15 border border-swp-ice/25 rounded-sm text-swp-ice text-sm">
              {item}
              <button type="button" onClick={() => handleRemoveLookingFor(item)} className="text-swp-ice/60 hover:text-red-400 transition-colors"><X size={14} /></button>
            </span>
          ))}
        </div>
      )}
    </div>

    <div>
      <label className="block text-swp-white-ghost text-sm font-mono uppercase tracking-widest mb-2">
        Tone & Style <span className="text-swp-white-ghost/50">(3-5 paragraphs about vision)</span>
      </label>
      <textarea name="tone_style_text" value={formData.tone_style_text} onChange={handleChange} rows={6}
        className="w-full bg-swp-black border border-swp-border rounded-swp px-4 py-3 text-white focus:border-swp-ice focus:outline-none transition-colors resize-none"
        placeholder="Describe the visual tone, style references, atmosphere, influences..." data-testid="film-tone-input" />
    </div>

    <div>
      <label className="block text-swp-white-ghost text-sm font-mono uppercase tracking-widest mb-2">
        Extended Synopsis <span className="text-swp-white-ghost/50">(for studio portal)</span>
      </label>
      <textarea name="extended_synopsis" value={formData.extended_synopsis} onChange={handleChange} rows={6}
        className="w-full bg-swp-black border border-swp-border rounded-swp px-4 py-3 text-white focus:border-swp-ice focus:outline-none transition-colors resize-none"
        placeholder="Full synopsis with paragraph breaks (use blank lines for breaks)..." data-testid="film-synopsis-input" />
    </div>

    {formData.studio_access_enabled && (
      <>
        <div>
          <label className="block text-swp-white-ghost text-sm font-mono uppercase tracking-widest mb-2">Target Budget Range</label>
          <input type="text" name="target_budget_range" value={formData.target_budget_range} onChange={handleChange}
            className="w-full bg-swp-black border border-swp-border rounded-swp px-4 py-3 text-white focus:border-swp-ice focus:outline-none transition-colors"
            placeholder="e.g., $2M - $5M AUD" />
        </div>

        <div>
          <label className="block text-swp-white-ghost text-sm font-mono uppercase tracking-widest mb-2">
            Financing Structure <span className="text-swp-white-ghost/50">(high-level overview)</span>
          </label>
          <textarea name="financing_structure" value={formData.financing_structure} onChange={handleChange} rows={3}
            className="w-full bg-swp-black border border-swp-border rounded-swp px-4 py-3 text-white focus:border-swp-ice focus:outline-none transition-colors resize-none"
            placeholder="e.g., 40% pre-sales, 30% equity, 20% government incentives, 10% gap financing" />
        </div>

        <div>
          <label className="block text-swp-white-ghost text-sm font-mono uppercase tracking-widest mb-2">Tax Incentives / Rebates</label>
          <textarea name="incentives" value={formData.incentives} onChange={handleChange} rows={2}
            className="w-full bg-swp-black border border-swp-border rounded-swp px-4 py-3 text-white focus:border-swp-ice focus:outline-none transition-colors resize-none"
            placeholder="e.g., Eligible for 40% Producer Offset (Australia), Location Incentive" />
        </div>

        {/* Document pickers */}
        {['pitch_deck_url', 'script_url'].map(field => (
          <div key={field}>
            <label className="block text-swp-white-ghost text-sm font-mono uppercase tracking-widest mb-2">
              {field === 'pitch_deck_url' ? 'Pitch Deck (PDF)' : 'Script (PDF)'}
              {field === 'script_url' && <span className="text-swp-white-ghost/50"> (NDA required for access)</span>}
            </label>
            <div className="flex gap-3">
              <input type="text" name={field} value={formData[field]} readOnly
                className="flex-1 bg-swp-black border border-swp-border rounded-swp px-4 py-3 text-white focus:border-swp-ice focus:outline-none transition-colors"
                placeholder={`/uploads/documents/${field === 'pitch_deck_url' ? 'pitch-deck' : 'script'}.pdf`} />
              <button type="button" onClick={() => onOpenAssetPicker(field)}
                className="px-4 py-3 bg-swp-ice/15 text-swp-ice rounded-swp hover:bg-swp-ice/30 transition-colors">
                <FolderOpen size={18} />
              </button>
              {formData[field] && (
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, [field]: '' }))}
                  className="px-4 py-3 bg-red-500/20 text-red-400 rounded-swp hover:bg-red-500/30 transition-colors">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </>
    )}
  </>
);

export default FilmStudioTab;
