import React, { useState, useEffect, useRef } from 'react';
import { Gift, Upload, Save, RefreshCw, Link as LinkIcon, FileText, Trash2, Image } from 'lucide-react';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;

const AdminLeadMagnetSettings = () => {
  const [settings, setSettings] = useState({
    enabled: true,
    title: "Producer's Playbook",
    description: "Download our comprehensive guide to independent film production.",
    button_text: "Get Your Free Copy",
    image_url: '',
    file_url: '',
    file_type: 'pdf', // 'pdf', 'link'
    external_link: '',
    popup_delay_seconds: 15,
    show_on_exit_intent: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API}/api/site-settings/lead-magnet`);
      if (response.ok) {
        const data = await response.json();
        if (data && Object.keys(data).length > 0) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch lead magnet settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API}/api/site-settings/lead-magnet`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        toast.success('Lead magnet settings saved!');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('convert_webp', 'false'); // Don't convert PDFs

    try {
      const response = await fetch(`${API}/api/assets`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({ ...prev, file_url: data.file_url }));
        toast.success('File uploaded successfully!');
      } else {
        toast.error('Failed to upload file');
      }
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('convert_webp', 'true');

    try {
      const response = await fetch(`${API}/api/assets`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({ ...prev, image_url: data.file_url }));
        toast.success('Image uploaded successfully!');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 text-electric-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-smoke-gray border border-gray-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Gift className="text-electric-blue" size={24} />
        <div>
          <h3 className="text-lg font-semibold text-white">Lead Magnet Settings</h3>
          <p className="text-sm text-gray-500">Configure the free download popup for newsletter signups</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Enable Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-white font-medium">Enable Lead Magnet</label>
            <p className="text-sm text-gray-500">Show the popup on The Den (blog) page</p>
          </div>
          <button
            onClick={() => setSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
            className={`w-12 h-6 rounded-full transition-colors ${settings.enabled ? 'bg-electric-blue' : 'bg-gray-700'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {/* Title */}
        <div>
          <label className="text-sm text-gray-400 mb-2 block">Title</label>
          <input
            type="text"
            value={settings.title}
            onChange={(e) => setSettings(prev => ({ ...prev, title: e.target.value }))}
            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-electric-blue focus:outline-none"
            placeholder="Producer's Playbook"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm text-gray-400 mb-2 block">Description</label>
          <textarea
            value={settings.description}
            onChange={(e) => setSettings(prev => ({ ...prev, description: e.target.value }))}
            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-electric-blue focus:outline-none resize-none"
            rows={3}
            placeholder="Download our comprehensive guide..."
          />
        </div>

        {/* Button Text */}
        <div>
          <label className="text-sm text-gray-400 mb-2 block">Button Text</label>
          <input
            type="text"
            value={settings.button_text}
            onChange={(e) => setSettings(prev => ({ ...prev, button_text: e.target.value }))}
            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-electric-blue focus:outline-none"
            placeholder="Get Your Free Copy"
          />
        </div>

        {/* Cover Image */}
        <div>
          <label className="text-sm text-gray-400 mb-2 block">Cover Image (optional)</label>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={imageInputRef}
            onChange={(e) => handleImageUpload(e.target.files?.[0])}
          />
          
          {settings.image_url ? (
            <div className="relative rounded-lg overflow-hidden border border-gray-700">
              <img 
                src={settings.image_url.startsWith('http') ? settings.image_url : `${API}${settings.image_url}`}
                alt="Lead magnet cover"
                className="w-full h-40 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-3 right-3 flex gap-2">
                <button
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="p-2 bg-gray-800/90 hover:bg-gray-700 rounded-lg text-white transition-colors"
                >
                  <Image size={16} />
                </button>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, image_url: '' }))}
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => imageInputRef.current?.click()}
              disabled={uploadingImage}
              className="w-full h-32 border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-white hover:border-gray-600 transition-colors disabled:opacity-50"
            >
              {uploadingImage ? (
                <>
                  <RefreshCw size={24} className="animate-spin" />
                  <span className="text-sm">Uploading...</span>
                </>
              ) : (
                <>
                  <Image size={24} />
                  <span className="text-sm">Upload Cover Image</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Delivery Type */}
        <div>
          <label className="text-sm text-gray-400 mb-2 block">Delivery Type</label>
          <div className="flex gap-4">
            <button
              onClick={() => setSettings(prev => ({ ...prev, file_type: 'pdf' }))}
              className={`flex-1 px-4 py-3 rounded-lg border ${
                settings.file_type === 'pdf' 
                  ? 'border-electric-blue bg-electric-blue/10 text-electric-blue' 
                  : 'border-gray-700 text-gray-400 hover:text-white'
              } flex items-center justify-center gap-2 transition-colors`}
            >
              <FileText size={18} />
              Upload PDF/File
            </button>
            <button
              onClick={() => setSettings(prev => ({ ...prev, file_type: 'link' }))}
              className={`flex-1 px-4 py-3 rounded-lg border ${
                settings.file_type === 'link' 
                  ? 'border-electric-blue bg-electric-blue/10 text-electric-blue' 
                  : 'border-gray-700 text-gray-400 hover:text-white'
              } flex items-center justify-center gap-2 transition-colors`}
            >
              <LinkIcon size={18} />
              External Link
            </button>
          </div>
        </div>

        {/* File Upload or External Link */}
        {settings.file_type === 'pdf' ? (
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Upload File (PDF, etc.)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.zip"
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => handleFileUpload(e.target.files?.[0])}
            />
            
            {settings.file_url ? (
              <div className="flex items-center gap-3 bg-black border border-gray-700 rounded-lg p-3">
                <FileText className="text-electric-blue" size={24} />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{settings.file_url.split('/').pop()}</p>
                  <p className="text-gray-500 text-xs">Current file</p>
                </div>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, file_url: '' }))}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ) : null}
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full mt-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  {settings.file_url ? 'Replace File' : 'Upload File'}
                </>
              )}
            </button>
          </div>
        ) : (
          <div>
            <label className="text-sm text-gray-400 mb-2 block">External Link URL</label>
            <input
              type="url"
              value={settings.external_link}
              onChange={(e) => setSettings(prev => ({ ...prev, external_link: e.target.value }))}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-electric-blue focus:outline-none"
              placeholder="https://example.com/your-guide"
            />
          </div>
        )}

        {/* Popup Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Popup Delay (seconds)</label>
            <input
              type="number"
              min="0"
              max="120"
              value={settings.popup_delay_seconds}
              onChange={(e) => setSettings(prev => ({ ...prev, popup_delay_seconds: parseInt(e.target.value) || 0 }))}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-electric-blue focus:outline-none"
            />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.show_on_exit_intent}
                onChange={(e) => setSettings(prev => ({ ...prev, show_on_exit_intent: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-600 text-electric-blue focus:ring-electric-blue"
              />
              <span className="text-sm text-gray-400">Show on exit intent</span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full px-4 py-3 bg-electric-blue hover:bg-electric-blue/90 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Lead Magnet Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AdminLeadMagnetSettings;
