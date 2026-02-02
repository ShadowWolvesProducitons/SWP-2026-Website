import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, Plus, Edit2, Trash2, Eye, EyeOff, Copy, Key, 
  FileText, Download, Users, Settings, ChevronDown, ChevronUp, X, Upload
} from 'lucide-react';
import { toast } from 'sonner';

const TABS = [
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'credentials', label: 'Access Codes', icon: Key },
  { id: 'projects', label: 'Slate Projects', icon: FileText },
  { id: 'documents', label: 'Documents', icon: Download },
  { id: 'inquiries', label: 'Inquiries', icon: Users },
];

const AdminInvestorTab = () => {
  const [activeTab, setActiveTab] = useState('settings');

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Investor Portal Management</h2>
      
      {/* Sub-tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-electric-blue text-white'
                  : 'bg-smoke-gray text-gray-400 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'settings' && <SettingsPanel />}
      {activeTab === 'credentials' && <CredentialsPanel />}
      {activeTab === 'projects' && <ProjectsPanel />}
      {activeTab === 'documents' && <DocumentsPanel />}
      {activeTab === 'inquiries' && <InquiriesPanel />}
    </div>
  );
};

// Settings Panel
const SettingsPanel = () => {
  const [settings, setSettings] = useState({
    portal_enabled: true,
    global_password: '',
    require_code: false,
    welcome_message: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/investors/admin/settings`);
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Failed to fetch settings');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/investors/admin/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (response.ok) {
        toast.success('Settings saved');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (err) {
      toast.error('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div className="bg-smoke-gray border border-gray-800 rounded-lg p-6 space-y-6">
        {/* Portal Enabled */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-medium">Portal Enabled</h3>
            <p className="text-gray-500 text-sm">Allow investors to access the portal</p>
          </div>
          <button
            onClick={() => setSettings(s => ({ ...s, portal_enabled: !s.portal_enabled }))}
            className={`w-12 h-6 rounded-full transition-colors ${
              settings.portal_enabled ? 'bg-electric-blue' : 'bg-gray-700'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
              settings.portal_enabled ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>

        {/* Global Password */}
        <div>
          <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
            Global Password
          </label>
          <input
            type="text"
            value={settings.global_password || ''}
            onChange={(e) => setSettings(s => ({ ...s, global_password: e.target.value }))}
            className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none font-mono"
            placeholder="Leave empty to disable"
          />
          <p className="text-gray-600 text-xs mt-1">Shared password for all investors (simpler option)</p>
        </div>

        {/* Require Code */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-medium">Require Access Code</h3>
            <p className="text-gray-500 text-sm">Only allow access with unique invite codes</p>
          </div>
          <button
            onClick={() => setSettings(s => ({ ...s, require_code: !s.require_code }))}
            className={`w-12 h-6 rounded-full transition-colors ${
              settings.require_code ? 'bg-electric-blue' : 'bg-gray-700'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
              settings.require_code ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full px-6 py-3 bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 text-white rounded-lg font-mono text-sm uppercase tracking-widest transition-all"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

// Credentials Panel
const CredentialsPanel = () => {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCred, setEditingCred] = useState(null);

  const fetchCredentials = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/investors/admin/credentials`);
      if (response.ok) {
        setCredentials(await response.json());
      }
    } catch (err) {
      toast.error('Failed to load credentials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  const handleDelete = async (cred) => {
    if (!window.confirm(`Delete access for "${cred.name}"?`)) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/investors/admin/credentials/${cred.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        toast.success('Credential deleted');
        fetchCredentials();
      }
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-500">{credentials.length} access codes</p>
        <button
          onClick={() => { setEditingCred(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-electric-blue hover:bg-electric-blue/90 text-white px-4 py-2 rounded-lg text-sm"
        >
          <Plus size={16} />
          New Access Code
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-electric-blue animate-spin mx-auto" />
        </div>
      ) : credentials.length === 0 ? (
        <div className="text-center py-12 bg-smoke-gray border border-gray-800 rounded-lg">
          <Key className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500">No access codes created yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {credentials.map((cred) => (
            <div key={cred.id} className="bg-smoke-gray border border-gray-800 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${cred.is_active ? 'bg-green-500' : 'bg-gray-600'}`} />
                <div>
                  <h4 className="text-white font-medium">{cred.name}</h4>
                  <p className="text-gray-500 text-sm">{cred.email || 'No email'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <code className="text-electric-blue bg-black px-3 py-1 rounded text-sm font-mono">
                  {cred.access_code}
                </code>
                <button onClick={() => copyCode(cred.access_code)} className="p-2 text-gray-400 hover:text-white">
                  <Copy size={16} />
                </button>
                <button onClick={() => { setEditingCred(cred); setShowModal(true); }} className="p-2 text-gray-400 hover:text-electric-blue">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(cred)} className="p-2 text-gray-400 hover:text-red-400">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CredentialModal
          credential={editingCred}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); fetchCredentials(); }}
        />
      )}
    </div>
  );
};

// Credential Modal
const CredentialModal = ({ credential, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: credential?.name || '',
    email: credential?.email || '',
    access_code: credential?.access_code || '',
    is_active: credential?.is_active ?? true,
    notes: credential?.notes || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = credential
        ? `${process.env.REACT_APP_BACKEND_URL}/api/investors/admin/credentials/${credential.id}`
        : `${process.env.REACT_APP_BACKEND_URL}/api/investors/admin/credentials`;
      
      const response = await fetch(url, {
        method: credential ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        toast.success(credential ? 'Updated' : 'Created');
        onSave();
      } else {
        toast.error('Failed to save');
      }
    } catch (err) {
      toast.error('Error saving');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="bg-smoke-gray border border-gray-800 rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">{credential ? 'Edit' : 'New'} Access Code</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(s => ({ ...s, name: e.target.value }))}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(s => ({ ...s, email: e.target.value }))}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Access Code (auto-generated if empty)</label>
            <input
              type="text"
              value={formData.access_code}
              onChange={(e) => setFormData(s => ({ ...s, access_code: e.target.value }))}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white font-mono"
              placeholder="Leave empty to auto-generate"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData(s => ({ ...s, is_active: e.target.checked }))}
              className="rounded"
            />
            <label className="text-gray-400 text-sm">Active</label>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full px-4 py-2 bg-electric-blue text-white rounded-lg"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Projects Panel
const ProjectsPanel = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/investors/admin/projects`);
      if (response.ok) {
        setProjects(await response.json());
      }
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (project) => {
    if (!window.confirm(`Delete "${project.title}"?`)) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/investors/admin/projects/${project.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        toast.success('Project deleted');
        fetchProjects();
      }
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-500">{projects.length} projects in slate</p>
        <button
          onClick={() => { setEditingProject(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-electric-blue hover:bg-electric-blue/90 text-white px-4 py-2 rounded-lg text-sm"
        >
          <Plus size={16} />
          Add Project
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-electric-blue animate-spin mx-auto" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 bg-smoke-gray border border-gray-800 rounded-lg">
          <FileText className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500">No projects in development slate</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <div key={project.id} className="bg-smoke-gray border border-gray-800 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${project.is_visible ? 'bg-green-500' : 'bg-gray-600'}`} />
                <div>
                  <h4 className="text-white font-medium">{project.title}</h4>
                  <p className="text-gray-500 text-sm">{project.genre} • {project.status}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setEditingProject(project); setShowModal(true); }} className="p-2 text-gray-400 hover:text-electric-blue">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(project)} className="p-2 text-gray-400 hover:text-red-400">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ProjectModal
          project={editingProject}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); fetchProjects(); }}
        />
      )}
    </div>
  );
};

// Project Modal
const ProjectModal = ({ project, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    genre: project?.genre || '',
    status: project?.status || 'Script',
    hook: project?.hook || '',
    description: project?.description || '',
    poster_url: project?.poster_url || '',
    budget_range: project?.budget_range || '',
    is_visible: project?.is_visible ?? true,
    sort_order: project?.sort_order || 0
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    setUploading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/upload/image`, {
        method: 'POST',
        body: fd
      });
      if (response.ok) {
        const data = await response.json();
        setFormData(s => ({ ...s, poster_url: data.url }));
      }
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = project
        ? `${process.env.REACT_APP_BACKEND_URL}/api/investors/admin/projects/${project.id}`
        : `${process.env.REACT_APP_BACKEND_URL}/api/investors/admin/projects`;
      
      const response = await fetch(url, {
        method: project ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        toast.success(project ? 'Updated' : 'Created');
        onSave();
      }
    } catch (err) {
      toast.error('Error saving');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 overflow-y-auto">
      <div className="bg-smoke-gray border border-gray-800 rounded-lg w-full max-w-lg p-6 my-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">{project ? 'Edit' : 'Add'} Project</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(s => ({ ...s, title: e.target.value }))}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Genre *</label>
              <input
                type="text"
                value={formData.genre}
                onChange={(e) => setFormData(s => ({ ...s, genre: e.target.value }))}
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(s => ({ ...s, status: e.target.value }))}
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white"
              >
                <option>Script</option>
                <option>Proof</option>
                <option>Financing</option>
                <option>In Development</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">One-Line Hook *</label>
            <input
              type="text"
              value={formData.hook}
              onChange={(e) => setFormData(s => ({ ...s, hook: e.target.value }))}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(s => ({ ...s, description: e.target.value }))}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white resize-none"
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Budget Range</label>
            <input
              type="text"
              value={formData.budget_range}
              onChange={(e) => setFormData(s => ({ ...s, budget_range: e.target.value }))}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white"
              placeholder="e.g., $500K - $1M"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Poster Image</label>
            <div className="flex items-center gap-4">
              {formData.poster_url && (
                <img src={`${process.env.REACT_APP_BACKEND_URL}${formData.poster_url}`} alt="" className="w-16 h-24 object-cover rounded" />
              )}
              <label className="flex items-center gap-2 px-4 py-2 bg-black border border-gray-700 rounded-lg cursor-pointer">
                <Upload size={16} className="text-gray-400" />
                <span className="text-gray-400 text-sm">{uploading ? 'Uploading...' : 'Upload'}</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_visible}
              onChange={(e) => setFormData(s => ({ ...s, is_visible: e.target.checked }))}
              className="rounded"
            />
            <label className="text-gray-400 text-sm">Visible to investors</label>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full px-4 py-2 bg-electric-blue text-white rounded-lg"
          >
            {saving ? 'Saving...' : 'Save Project'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Documents Panel
const DocumentsPanel = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/investors/admin/documents`);
      if (response.ok) {
        setDocuments(await response.json());
      }
    } catch (err) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (doc) => {
    if (!window.confirm(`Delete "${doc.title}"?`)) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/investors/admin/documents/${doc.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        toast.success('Document deleted');
        fetchDocuments();
      }
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-500">{documents.length} documents</p>
        <button
          onClick={() => { setEditingDoc(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-electric-blue hover:bg-electric-blue/90 text-white px-4 py-2 rounded-lg text-sm"
        >
          <Plus size={16} />
          Add Document
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-electric-blue animate-spin mx-auto" />
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12 bg-smoke-gray border border-gray-800 rounded-lg">
          <Download className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500">No documents uploaded</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-smoke-gray border border-gray-800 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${doc.is_visible ? 'bg-green-500' : 'bg-gray-600'}`} />
                <div>
                  <h4 className="text-white font-medium">{doc.title}</h4>
                  <p className="text-gray-500 text-sm">{doc.doc_type} • {doc.download_count} downloads</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setEditingDoc(doc); setShowModal(true); }} className="p-2 text-gray-400 hover:text-electric-blue">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(doc)} className="p-2 text-gray-400 hover:text-red-400">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <DocumentModal
          document={editingDoc}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); fetchDocuments(); }}
        />
      )}
    </div>
  );
};

// Document Modal
const DocumentModal = ({ document, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: document?.title || '',
    doc_type: document?.doc_type || 'Pitch Deck',
    description: document?.description || '',
    file_url: document?.file_url || '',
    is_watermarked: document?.is_watermarked ?? false,
    is_visible: document?.is_visible ?? true
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = document
        ? `${process.env.REACT_APP_BACKEND_URL}/api/investors/admin/documents/${document.id}`
        : `${process.env.REACT_APP_BACKEND_URL}/api/investors/admin/documents`;
      
      const response = await fetch(url, {
        method: document ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        toast.success(document ? 'Updated' : 'Created');
        onSave();
      }
    } catch (err) {
      toast.error('Error saving');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="bg-smoke-gray border border-gray-800 rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">{document ? 'Edit' : 'Add'} Document</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(s => ({ ...s, title: e.target.value }))}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Type</label>
            <select
              value={formData.doc_type}
              onChange={(e) => setFormData(s => ({ ...s, doc_type: e.target.value }))}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white"
            >
              <option>Pitch Deck</option>
              <option>Lookbook</option>
              <option>Screener</option>
              <option>Overview</option>
              <option>Financial</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">File URL *</label>
            <input
              type="url"
              value={formData.file_url}
              onChange={(e) => setFormData(s => ({ ...s, file_url: e.target.value }))}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white"
              placeholder="https://..."
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(s => ({ ...s, description: e.target.value }))}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white resize-none"
              rows={2}
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_watermarked}
                onChange={(e) => setFormData(s => ({ ...s, is_watermarked: e.target.checked }))}
                className="rounded"
              />
              <span className="text-gray-400 text-sm">Watermarked</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_visible}
                onChange={(e) => setFormData(s => ({ ...s, is_visible: e.target.checked }))}
                className="rounded"
              />
              <span className="text-gray-400 text-sm">Visible</span>
            </label>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full px-4 py-2 bg-electric-blue text-white rounded-lg"
          >
            {saving ? 'Saving...' : 'Save Document'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Inquiries Panel
const InquiriesPanel = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/investors/admin/inquiries`);
      if (response.ok) {
        setInquiries(await response.json());
      }
    } catch (err) {
      toast.error('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleStatusChange = async (inquiry, newStatus) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/investors/admin/inquiries/${inquiry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        toast.success('Status updated');
        fetchInquiries();
      }
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const STATUS_COLORS = {
    'New': 'bg-electric-blue/20 text-electric-blue border-electric-blue/40',
    'Contacted': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    'In Discussion': 'bg-green-500/20 text-green-400 border-green-500/40',
    'Archived': 'bg-gray-500/20 text-gray-400 border-gray-500/40'
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-500">{inquiries.length} inquiries</p>
        <button onClick={fetchInquiries} className="p-2 text-gray-400 hover:text-white">
          <RefreshCw size={18} />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-electric-blue animate-spin mx-auto" />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="text-center py-12 bg-smoke-gray border border-gray-800 rounded-lg">
          <Users className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500">No investor inquiries yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inquiry) => (
            <div key={inquiry.id} className="bg-smoke-gray border border-gray-800 rounded-lg overflow-hidden">
              <div 
                className="p-4 flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedId(expandedId === inquiry.id ? null : inquiry.id)}
              >
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded text-xs border ${STATUS_COLORS[inquiry.status]}`}>
                    {inquiry.status}
                  </span>
                  <div>
                    <h4 className="text-white font-medium">{inquiry.name}</h4>
                    <p className="text-gray-500 text-sm">{inquiry.investor_type} • {inquiry.area_of_interest}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-500 text-sm">{formatDate(inquiry.created_at)}</span>
                  {expandedId === inquiry.id ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </div>
              </div>
              {expandedId === inquiry.id && (
                <div className="px-4 pb-4 border-t border-gray-800 pt-4">
                  <p className="text-gray-300 mb-4">{inquiry.message || 'No additional message'}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-sm">Set Status:</span>
                    {['New', 'Contacted', 'In Discussion', 'Archived'].map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(inquiry, status)}
                        className={`px-2 py-1 rounded text-xs border ${STATUS_COLORS[status]} ${inquiry.status === status ? 'opacity-50' : ''}`}
                        disabled={inquiry.status === status}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminInvestorTab;
