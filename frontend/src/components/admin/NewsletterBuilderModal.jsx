import React, { useState, useEffect } from 'react';
import { 
  X, Save, Send, Eye, RefreshCw, Plus, Trash2, GripVertical,
  Image, Type, FileText, ChevronUp, ChevronDown, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import AssetPicker from './AssetPicker';

const API = process.env.REACT_APP_BACKEND_URL;

// Block type definitions
const BLOCK_TYPES = [
  { 
    type: 'main_story', 
    label: 'Main Story', 
    icon: FileText,
    description: 'Featured article with image, headline, body, and CTA button'
  },
  { 
    type: 'image_text', 
    label: 'Image + Text Card', 
    icon: Image,
    description: 'Card with image, title, body text, and optional link'
  },
  { 
    type: 'simple_text', 
    label: 'Text Block', 
    icon: Type,
    description: 'Simple text section with optional headline'
  }
];

const NewsletterBuilderModal = ({ issue, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    preheader: '',
    header_image_url: '',
    issue_label: '',
    date_label: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }),
    hero_title: '',
    hero_intro: '',
    hero_chips: '',
    blocks: [],
    segment: 'all',
    show_studio_cta: true
  });
  
  const [segments, setSegments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [showTestModal, setShowTestModal] = useState(false);
  const [previewHtml, setPreviewHtml] = useState(null);
  const [activeTab, setActiveTab] = useState('basics'); // basics, content, settings
  const [showAssetPicker, setShowAssetPicker] = useState(null); // null or { field, blockIndex }

  // Load issue data if editing
  useEffect(() => {
    if (issue) {
      setFormData({
        title: issue.title || '',
        subject: issue.subject || '',
        preheader: issue.preheader || '',
        header_image_url: issue.header_image_url || '',
        issue_label: issue.issue_label || '',
        date_label: issue.date_label || '',
        hero_title: issue.hero_title || '',
        hero_intro: issue.hero_intro || '',
        hero_chips: issue.hero_chips || '',
        blocks: issue.blocks || [],
        segment: issue.segment || 'all',
        show_studio_cta: issue.show_studio_cta !== false
      });
    }
  }, [issue]);

  // Fetch segments
  useEffect(() => {
    const fetchSegments = async () => {
      try {
        const response = await fetch(`${API}/api/newsletter-builder/segments`);
        if (response.ok) {
          const data = await response.json();
          setSegments(data.segments || []);
        }
      } catch (err) {
        console.error('Failed to fetch segments:', err);
      }
    };
    fetchSegments();
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Block management
  const addBlock = (type) => {
    const newBlock = createEmptyBlock(type);
    setFormData(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }));
  };

  const createEmptyBlock = (type) => {
    switch (type) {
      case 'main_story':
        return {
          type: 'main_story',
          image_url: '',
          image_alt: '',
          eyebrow: '',
          headline: '',
          body: '',
          cta_url: '',
          cta_text: '',
          cta_microcopy: ''
        };
      case 'image_text':
        return {
          type: 'image_text',
          image_url: '',
          image_alt: '',
          title: '',
          body: '',
          link_url: '',
          link_text: ''
        };
      case 'simple_text':
        return {
          type: 'simple_text',
          headline: '',
          body: ''
        };
      default:
        return { type };
    }
  };

  const updateBlock = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      blocks: prev.blocks.map((block, i) => 
        i === index ? { ...block, [field]: value } : block
      )
    }));
  };

  const removeBlock = (index) => {
    setFormData(prev => ({
      ...prev,
      blocks: prev.blocks.filter((_, i) => i !== index)
    }));
  };

  const moveBlock = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.blocks.length) return;
    
    const newBlocks = [...formData.blocks];
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    setFormData(prev => ({ ...prev, blocks: newBlocks }));
  };

  // Save draft
  const handleSave = async () => {
    if (!formData.title || !formData.subject) {
      toast.error('Title and subject are required');
      return;
    }

    setSaving(true);
    try {
      const url = issue 
        ? `${API}/api/newsletter-builder/issues/${issue.id}`
        : `${API}/api/newsletter-builder/issues`;
      
      const response = await fetch(url, {
        method: issue ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(issue ? 'Newsletter updated' : 'Newsletter created');
        onSave();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to save newsletter');
      }
    } catch (err) {
      toast.error('Error saving newsletter');
    } finally {
      setSaving(false);
    }
  };

  // Preview
  const handlePreview = async () => {
    // Save first to get latest content
    if (!formData.title || !formData.subject) {
      toast.error('Save the newsletter first to preview');
      return;
    }

    // If we have an issue ID, fetch preview
    if (issue?.id) {
      try {
        const response = await fetch(`${API}/api/newsletter-builder/issues/${issue.id}/preview`, {
          method: 'POST'
        });
        if (response.ok) {
          const data = await response.json();
          setPreviewHtml(data.html);
        }
      } catch (err) {
        toast.error('Failed to generate preview');
      }
    } else {
      toast.info('Save the newsletter first, then preview');
    }
  };

  // Send test email
  const handleSendTest = async () => {
    if (!testEmail) {
      toast.error('Enter a test email address');
      return;
    }

    if (!issue?.id) {
      toast.error('Save the newsletter first');
      return;
    }

    setSending(true);
    try {
      const response = await fetch(`${API}/api/newsletter-builder/issues/${issue.id}/send?test_email=${encodeURIComponent(testEmail)}`, {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Test email sent to ${testEmail}`);
        setShowTestModal(false);
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to send test email');
      }
    } catch (err) {
      toast.error('Error sending test email');
    } finally {
      setSending(false);
    }
  };

  // Send campaign
  const handleSendCampaign = async () => {
    if (!issue?.id) {
      toast.error('Save the newsletter first');
      return;
    }

    const segment = segments.find(s => s.id === formData.segment);
    const recipientCount = segment?.count || 0;
    
    if (!window.confirm(`Send this newsletter to ${recipientCount} subscribers? This cannot be undone.`)) {
      return;
    }

    setSending(true);
    try {
      const response = await fetch(`${API}/api/newsletter-builder/issues/${issue.id}/send`, {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Newsletter sent to ${data.sent} recipients`);
        onSave();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to send newsletter');
      }
    } catch (err) {
      toast.error('Error sending newsletter');
    } finally {
      setSending(false);
    }
  };

  // Asset picker handler
  const handleAssetSelect = (asset) => {
    if (!showAssetPicker) return;
    
    const { field, blockIndex } = showAssetPicker;
    
    if (blockIndex !== undefined && blockIndex !== null) {
      // Update block field
      updateBlock(blockIndex, field, asset.file_url);
    } else {
      // Update form field
      handleChange(field, asset.file_url);
    }
    
    setShowAssetPicker(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
      <div className="relative bg-smoke-gray border border-gray-800 rounded-lg max-w-5xl w-full my-8">
        {/* Header */}
        <div className="sticky top-0 bg-smoke-gray border-b border-gray-800 px-6 py-4 flex items-center justify-between z-20 rounded-t-lg">
          <div>
            <h2 className="text-xl font-bold text-white">
              {issue ? 'Edit Newsletter' : 'Create Newsletter'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Build your newsletter using content blocks
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-800 px-6">
          <div className="flex gap-1">
            {['basics', 'content', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'text-electric-blue border-electric-blue'
                    : 'text-gray-400 border-transparent hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Basics Tab */}
          {activeTab === 'basics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Internal Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="e.g., February 2026 Newsletter"
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none"
                    data-testid="newsletter-title-input"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Email Subject Line *</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    placeholder="e.g., Inside the Den: February Update"
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none"
                    data-testid="newsletter-subject-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Preheader Text</label>
                <input
                  type="text"
                  value={formData.preheader}
                  onChange={(e) => handleChange('preheader', e.target.value)}
                  placeholder="Preview text shown in email clients..."
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none"
                />
                <p className="text-gray-600 text-xs mt-1">This text appears after the subject in some email clients</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Issue Label</label>
                  <input
                    type="text"
                    value={formData.issue_label}
                    onChange={(e) => handleChange('issue_label', e.target.value)}
                    placeholder="e.g., INSIDE THE DEN // Issue 01"
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Date Label</label>
                  <input
                    type="text"
                    value={formData.date_label}
                    onChange={(e) => handleChange('date_label', e.target.value)}
                    placeholder="e.g., 19 Feb 2026"
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Header Image</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={formData.header_image_url}
                    onChange={(e) => handleChange('header_image_url', e.target.value)}
                    placeholder="Header image URL (leave empty for default)"
                    className="flex-1 bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAssetPicker({ field: 'header_image_url', blockIndex: null })}
                    className="px-4 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Image size={18} />
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-800 pt-6">
                <h4 className="text-white font-medium mb-4">Hero Section</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Hero Title</label>
                    <input
                      type="text"
                      value={formData.hero_title}
                      onChange={(e) => handleChange('hero_title', e.target.value)}
                      placeholder="Main newsletter title..."
                      className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Hero Introduction</label>
                    <textarea
                      value={formData.hero_intro}
                      onChange={(e) => handleChange('hero_intro', e.target.value)}
                      placeholder="Brief introduction to this newsletter issue..."
                      rows={3}
                      className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Tags/Chips</label>
                    <input
                      type="text"
                      value={formData.hero_chips}
                      onChange={(e) => handleChange('hero_chips', e.target.value)}
                      placeholder="e.g., Casting Calls • Crew Intel • Tools"
                      className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              {/* Add Block Buttons */}
              <div className="flex gap-3 flex-wrap">
                {BLOCK_TYPES.map((blockType) => {
                  const Icon = blockType.icon;
                  return (
                    <button
                      key={blockType.type}
                      onClick={() => addBlock(blockType.type)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors text-sm"
                      title={blockType.description}
                    >
                      <Plus size={16} />
                      <Icon size={16} />
                      {blockType.label}
                    </button>
                  );
                })}
              </div>

              {/* Blocks List */}
              {formData.blocks.length === 0 ? (
                <div className="text-center py-12 bg-black/30 border border-gray-800 border-dashed rounded-lg">
                  <FileText className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-400">No content blocks yet</p>
                  <p className="text-gray-600 text-sm mt-2">Click the buttons above to add content blocks</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.blocks.map((block, index) => (
                    <BlockEditor
                      key={index}
                      block={block}
                      index={index}
                      total={formData.blocks.length}
                      onUpdate={(field, value) => updateBlock(index, field, value)}
                      onRemove={() => removeBlock(index)}
                      onMove={(direction) => moveBlock(index, direction)}
                      onAssetPick={(field) => setShowAssetPicker({ field, blockIndex: index })}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Audience Segment</label>
                <select
                  value={formData.segment}
                  onChange={(e) => handleChange('segment', e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none"
                >
                  {segments.map((seg) => (
                    <option key={seg.id} value={seg.id}>
                      {seg.label} ({seg.count} recipients)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="showCta"
                  checked={formData.show_studio_cta}
                  onChange={(e) => handleChange('show_studio_cta', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-black text-electric-blue focus:ring-electric-blue"
                />
                <label htmlFor="showCta" className="text-gray-300 cursor-pointer">
                  Show "Request Studio Access" CTA block at bottom
                </label>
              </div>

              {issue?.id && (
                <div className="border-t border-gray-800 pt-6">
                  <h4 className="text-white font-medium mb-4">Send Test Email</h4>
                  <div className="flex gap-3">
                    <input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="test@example.com"
                      className="flex-1 bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none"
                    />
                    <button
                      onClick={handleSendTest}
                      disabled={sending || !testEmail}
                      className="px-6 py-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      {sending ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                      Send Test
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-smoke-gray border-t border-gray-800 px-6 py-4 flex items-center justify-between rounded-b-lg">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-700 text-gray-400 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
          
          <div className="flex gap-3">
            {issue?.id && (
              <button
                onClick={handlePreview}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Eye size={16} />
                Preview
              </button>
            )}
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
              data-testid="save-newsletter-btn"
            >
              {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              Save Draft
            </button>
            
            {issue?.id && (
              <button
                onClick={handleSendCampaign}
                disabled={sending || issue?.status === 'sent'}
                className="px-6 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                data-testid="send-newsletter-btn"
              >
                {sending ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                Send Campaign
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Asset Picker Modal */}
      {showAssetPicker && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80">
          <div className="bg-smoke-gray border border-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Select Asset</h3>
              <button onClick={() => setShowAssetPicker(null)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <AssetPicker 
                onSelect={handleAssetSelect}
                filter="image"
              />
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewHtml && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90">
          <div className="relative bg-gray-100 rounded-lg max-w-[700px] w-full max-h-[90vh] overflow-hidden">
            <div className="sticky top-0 bg-gray-200 px-4 py-3 flex items-center justify-between border-b">
              <h3 className="font-semibold text-gray-800">Newsletter Preview</h3>
              <button 
                onClick={() => setPreviewHtml(null)} 
                className="px-4 py-1.5 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700"
              >
                Close
              </button>
            </div>
            <iframe
              srcDoc={previewHtml}
              className="w-full h-[80vh] border-0"
              title="Newsletter Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
};


// Block Editor Component
const BlockEditor = ({ block, index, total, onUpdate, onRemove, onMove, onAssetPick }) => {
  const blockType = BLOCK_TYPES.find(t => t.type === block.type);
  const Icon = blockType?.icon || FileText;
  
  return (
    <div className="bg-black/50 border border-gray-800 rounded-lg overflow-hidden" data-testid={`content-block-${index}`}>
      {/* Block Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900/50 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <GripVertical size={16} className="text-gray-600" />
          <Icon size={16} className="text-electric-blue" />
          <span className="text-white font-medium text-sm">{blockType?.label || block.type}</span>
          <span className="text-gray-600 text-xs">Block {index + 1}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onMove('up')}
            disabled={index === 0}
            className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move up"
          >
            <ChevronUp size={16} />
          </button>
          <button
            onClick={() => onMove('down')}
            disabled={index === total - 1}
            className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move down"
          >
            <ChevronDown size={16} />
          </button>
          <button
            onClick={onRemove}
            className="p-1.5 text-gray-400 hover:text-red-400 ml-2"
            title="Remove block"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      {/* Block Content */}
      <div className="p-4 space-y-4">
        {block.type === 'main_story' && (
          <MainStoryBlockEditor block={block} onUpdate={onUpdate} onAssetPick={onAssetPick} />
        )}
        {block.type === 'image_text' && (
          <ImageTextBlockEditor block={block} onUpdate={onUpdate} onAssetPick={onAssetPick} />
        )}
        {block.type === 'simple_text' && (
          <SimpleTextBlockEditor block={block} onUpdate={onUpdate} />
        )}
      </div>
    </div>
  );
};


// Main Story Block Editor
const MainStoryBlockEditor = ({ block, onUpdate, onAssetPick }) => (
  <>
    <div>
      <label className="block text-gray-400 text-xs mb-1">Image</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={block.image_url || ''}
          onChange={(e) => onUpdate('image_url', e.target.value)}
          placeholder="Image URL"
          className="flex-1 bg-black border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-electric-blue focus:outline-none"
        />
        <button
          type="button"
          onClick={() => onAssetPick('image_url')}
          className="px-3 py-2 bg-gray-800 text-gray-400 rounded hover:bg-gray-700"
        >
          <Image size={16} />
        </button>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-gray-400 text-xs mb-1">Image Alt Text</label>
        <input
          type="text"
          value={block.image_alt || ''}
          onChange={(e) => onUpdate('image_alt', e.target.value)}
          placeholder="Describe the image"
          className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-electric-blue focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-gray-400 text-xs mb-1">Eyebrow</label>
        <input
          type="text"
          value={block.eyebrow || ''}
          onChange={(e) => onUpdate('eyebrow', e.target.value)}
          placeholder="e.g., THE MAIN STORY"
          className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-electric-blue focus:outline-none"
        />
      </div>
    </div>
    <div>
      <label className="block text-gray-400 text-xs mb-1">Headline *</label>
      <input
        type="text"
        value={block.headline || ''}
        onChange={(e) => onUpdate('headline', e.target.value)}
        placeholder="Main headline..."
        className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-electric-blue focus:outline-none"
      />
    </div>
    <div>
      <label className="block text-gray-400 text-xs mb-1">Body *</label>
      <textarea
        value={block.body || ''}
        onChange={(e) => onUpdate('body', e.target.value)}
        placeholder="Article body text..."
        rows={4}
        className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-electric-blue focus:outline-none resize-none"
      />
    </div>
    <div className="grid grid-cols-3 gap-4">
      <div>
        <label className="block text-gray-400 text-xs mb-1">CTA Button Text</label>
        <input
          type="text"
          value={block.cta_text || ''}
          onChange={(e) => onUpdate('cta_text', e.target.value)}
          placeholder="e.g., Read More"
          className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-electric-blue focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-gray-400 text-xs mb-1">CTA URL</label>
        <input
          type="text"
          value={block.cta_url || ''}
          onChange={(e) => onUpdate('cta_url', e.target.value)}
          placeholder="https://..."
          className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-electric-blue focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-gray-400 text-xs mb-1">CTA Microcopy</label>
        <input
          type="text"
          value={block.cta_microcopy || ''}
          onChange={(e) => onUpdate('cta_microcopy', e.target.value)}
          placeholder="Small text under button"
          className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-electric-blue focus:outline-none"
        />
      </div>
    </div>
  </>
);


// Image + Text Block Editor
const ImageTextBlockEditor = ({ block, onUpdate, onAssetPick }) => (
  <>
    <div>
      <label className="block text-gray-400 text-xs mb-1">Image</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={block.image_url || ''}
          onChange={(e) => onUpdate('image_url', e.target.value)}
          placeholder="Image URL"
          className="flex-1 bg-black border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-electric-blue focus:outline-none"
        />
        <button
          type="button"
          onClick={() => onAssetPick('image_url')}
          className="px-3 py-2 bg-gray-800 text-gray-400 rounded hover:bg-gray-700"
        >
          <Image size={16} />
        </button>
      </div>
    </div>
    <div>
      <label className="block text-gray-400 text-xs mb-1">Image Alt Text</label>
      <input
        type="text"
        value={block.image_alt || ''}
        onChange={(e) => onUpdate('image_alt', e.target.value)}
        placeholder="Describe the image"
        className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-electric-blue focus:outline-none"
      />
    </div>
    <div>
      <label className="block text-gray-400 text-xs mb-1">Title *</label>
      <input
        type="text"
        value={block.title || ''}
        onChange={(e) => onUpdate('title', e.target.value)}
        placeholder="Card title..."
        className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-electric-blue focus:outline-none"
      />
    </div>
    <div>
      <label className="block text-gray-400 text-xs mb-1">Body</label>
      <textarea
        value={block.body || ''}
        onChange={(e) => onUpdate('body', e.target.value)}
        placeholder="Card description..."
        rows={2}
        className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-electric-blue focus:outline-none resize-none"
      />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-gray-400 text-xs mb-1">Link Text</label>
        <input
          type="text"
          value={block.link_text || ''}
          onChange={(e) => onUpdate('link_text', e.target.value)}
          placeholder="e.g., Learn More"
          className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-electric-blue focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-gray-400 text-xs mb-1">Link URL</label>
        <input
          type="text"
          value={block.link_url || ''}
          onChange={(e) => onUpdate('link_url', e.target.value)}
          placeholder="https://..."
          className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-electric-blue focus:outline-none"
        />
      </div>
    </div>
  </>
);


// Simple Text Block Editor
const SimpleTextBlockEditor = ({ block, onUpdate }) => (
  <>
    <div>
      <label className="block text-gray-400 text-xs mb-1">Headline (optional)</label>
      <input
        type="text"
        value={block.headline || ''}
        onChange={(e) => onUpdate('headline', e.target.value)}
        placeholder="Section headline..."
        className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-electric-blue focus:outline-none"
      />
    </div>
    <div>
      <label className="block text-gray-400 text-xs mb-1">Body *</label>
      <textarea
        value={block.body || ''}
        onChange={(e) => onUpdate('body', e.target.value)}
        placeholder="Text content..."
        rows={4}
        className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-electric-blue focus:outline-none resize-none"
      />
    </div>
  </>
);


export default NewsletterBuilderModal;
