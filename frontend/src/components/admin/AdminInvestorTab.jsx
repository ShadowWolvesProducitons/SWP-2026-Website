import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, Plus, Edit2, Trash2, Copy, Key, 
  FileText, Download, Users, Settings, ChevronDown, ChevronUp, X, Upload,
  Activity, Clock, User, Mail, Building, Phone, Newspaper
} from 'lucide-react';
import { toast } from 'sonner';

const TABS = [
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'credentials', label: 'Access Codes', icon: Key },
  { id: 'projects', label: 'Slate Projects', icon: FileText },
  { id: 'blog', label: 'Blog Posts', icon: Newspaper },
  { id: 'activity', label: 'Activity', icon: Activity },
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
      {activeTab === 'activity' && <ActivityPanel />}
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

// Projects Panel - Now includes documents per project
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

// Project Modal - Now includes documents management
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
  const [activeSection, setActiveSection] = useState('details');
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  useEffect(() => {
    if (project?.id) {
      fetchProjectDocuments();
    }
  }, [project?.id]);

  const fetchProjectDocuments = async () => {
    if (!project?.id) return;
    setLoadingDocs(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/investors/admin/documents?project_id=${project.id}`);
      if (response.ok) {
        const allDocs = await response.json();
        setDocuments(allDocs.filter(d => d.project_id === project.id));
      }
    } catch (err) {
      console.error('Failed to load documents');
    } finally {
      setLoadingDocs(false);
    }
  };

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
      <div className="bg-smoke-gray border border-gray-800 rounded-lg w-full max-w-2xl p-6 my-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">{project ? 'Edit' : 'Add'} Project</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Section Tabs - Only show Documents tab for existing projects */}
        {project && (
          <div className="flex gap-2 mb-6 border-b border-gray-800 pb-4">
            <button
              onClick={() => setActiveSection('details')}
              className={`px-4 py-2 rounded-lg text-sm ${activeSection === 'details' ? 'bg-electric-blue text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Project Details
            </button>
            <button
              onClick={() => setActiveSection('documents')}
              className={`px-4 py-2 rounded-lg text-sm ${activeSection === 'documents' ? 'bg-electric-blue text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Documents ({documents.length})
            </button>
          </div>
        )}

        {activeSection === 'details' && (
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
        )}

        {activeSection === 'documents' && project && (
          <ProjectDocumentsSection projectId={project.id} documents={documents} onRefresh={fetchProjectDocuments} />
        )}
      </div>
    </div>
  );
};

// Project Documents Section - Manage documents per project
const ProjectDocumentsSection = ({ projectId, documents, onRefresh }) => {
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newDoc, setNewDoc] = useState({
    title: '',
    doc_type: 'Pitch Deck',
    file_url: '',
    is_visible: true
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    setUploading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/upload/file`, {
        method: 'POST',
        body: fd
      });
      if (response.ok) {
        const data = await response.json();
        setNewDoc(s => ({ ...s, file_url: data.url }));
        toast.success('File uploaded');
      }
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleAddDocument = async () => {
    if (!newDoc.title || !newDoc.file_url) {
      toast.error('Title and file are required');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/investors/admin/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newDoc,
          project_id: projectId
        })
      });
      if (response.ok) {
        toast.success('Document added');
        setShowAddDoc(false);
        setNewDoc({ title: '', doc_type: 'Pitch Deck', file_url: '', is_visible: true });
        onRefresh();
      }
    } catch (err) {
      toast.error('Failed to add document');
    }
  };

  const handleDeleteDoc = async (doc) => {
    if (!window.confirm(`Delete "${doc.title}"?`)) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/investors/admin/documents/${doc.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        toast.success('Document deleted');
        onRefresh();
      }
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-sm">{documents.length} documents for this project</p>
        <button
          onClick={() => setShowAddDoc(!showAddDoc)}
          className="flex items-center gap-2 bg-electric-blue hover:bg-electric-blue/90 text-white px-3 py-1.5 rounded-lg text-sm"
        >
          <Plus size={14} />
          Add Document
        </button>
      </div>

      {showAddDoc && (
        <div className="bg-black border border-gray-700 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 text-xs mb-1">Title</label>
              <input
                type="text"
                value={newDoc.title}
                onChange={(e) => setNewDoc(s => ({ ...s, title: e.target.value }))}
                className="w-full bg-smoke-gray border border-gray-700 rounded px-3 py-2 text-white text-sm"
                placeholder="CROWE Pitch Deck"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Type</label>
              <select
                value={newDoc.doc_type}
                onChange={(e) => setNewDoc(s => ({ ...s, doc_type: e.target.value }))}
                className="w-full bg-smoke-gray border border-gray-700 rounded px-3 py-2 text-white text-sm"
              >
                <option>Pitch Deck</option>
                <option>Screener</option>
                <option>Script</option>
                <option>Lookbook</option>
                <option>Overview</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">File</label>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 px-3 py-2 bg-smoke-gray border border-gray-700 rounded cursor-pointer text-sm">
                <Upload size={14} className="text-gray-400" />
                <span className="text-gray-400">{uploading ? 'Uploading...' : 'Upload PDF'}</span>
                <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
              </label>
              {newDoc.file_url && <span className="text-green-400 text-xs">✓ File uploaded</span>}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddDocument}
              className="px-4 py-2 bg-electric-blue text-white rounded text-sm"
            >
              Save Document
            </button>
            <button
              onClick={() => setShowAddDoc(false)}
              className="px-4 py-2 bg-gray-700 text-white rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="text-center py-8 bg-black/50 rounded-lg border border-gray-800">
          <Download className="w-8 h-8 text-gray-700 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No documents yet</p>
          <p className="text-gray-600 text-xs">Add pitch decks, scripts, or screeners for investors to download</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-black border border-gray-700 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Download size={16} className="text-electric-blue" />
                <div>
                  <h4 className="text-white text-sm font-medium">{doc.title}</h4>
                  <p className="text-gray-500 text-xs">{doc.doc_type} • {doc.download_count || 0} downloads</p>
                </div>
              </div>
              <button onClick={() => handleDeleteDoc(doc)} className="p-1.5 text-gray-400 hover:text-red-400">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Activity Panel - Combined inquiries and download requests
const ActivityPanel = () => {
  const [activityType, setActivityType] = useState('all');
  const [inquiries, setInquiries] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const fetchActivity = async () => {
    setLoading(true);
    try {
      const [inqRes, dlRes, reqRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/investors/admin/inquiries`),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/investors/admin/downloads`),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/investors/admin/document-requests`)
      ]);

      if (inqRes.ok) setInquiries(await inqRes.json());
      if (dlRes.ok) setDownloads(await dlRes.json());
      if (reqRes.ok) setRequests(await reqRes.json());
    } catch (err) {
      toast.error('Failed to load activity');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('en-AU', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusChange = async (inquiry, newStatus) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/investors/admin/inquiries/${inquiry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        toast.success('Status updated');
        fetchActivity();
      }
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const STATUS_COLORS = {
    'New': 'bg-electric-blue/20 text-electric-blue border-electric-blue/40',
    'Contacted': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    'In Discussion': 'bg-green-500/20 text-green-400 border-green-500/40',
    'Archived': 'bg-gray-500/20 text-gray-400 border-gray-500/40',
    'pending': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    'downloaded': 'bg-green-500/20 text-green-400 border-green-500/40'
  };

  // Combine all activity into a single sorted list
  const allActivity = [
    ...inquiries.map(i => ({ ...i, type: 'inquiry', date: i.created_at })),
    ...downloads.map(d => ({ ...d, type: 'download', date: d.downloaded_at })),
    ...requests.map(r => ({ ...r, type: 'request', date: r.created_at }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const filteredActivity = activityType === 'all' 
    ? allActivity 
    : allActivity.filter(a => a.type === activityType);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'All Activity' },
            { id: 'inquiry', label: 'Inquiries' },
            { id: 'download', label: 'Downloads' },
            { id: 'request', label: 'Doc Requests' }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setActivityType(filter.id)}
              className={`px-3 py-1.5 rounded text-xs font-mono uppercase ${
                activityType === filter.id
                  ? 'bg-electric-blue text-white'
                  : 'bg-black text-gray-400 border border-gray-700 hover:text-white'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <button onClick={fetchActivity} className="p-2 text-gray-400 hover:text-white">
          <RefreshCw size={18} />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-electric-blue animate-spin mx-auto" />
        </div>
      ) : filteredActivity.length === 0 ? (
        <div className="text-center py-12 bg-smoke-gray border border-gray-800 rounded-lg">
          <Activity className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500">No activity yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActivity.map((item, idx) => (
            <div key={`${item.type}-${item.id || idx}`} className="bg-smoke-gray border border-gray-800 rounded-lg overflow-hidden">
              <div 
                className="p-4 flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedId(expandedId === `${item.type}-${item.id}` ? null : `${item.type}-${item.id}`)}
              >
                <div className="flex items-center gap-4">
                  {/* Activity Type Badge */}
                  <span className={`px-2 py-1 rounded text-xs font-mono uppercase ${
                    item.type === 'inquiry' ? 'bg-purple-500/20 text-purple-400' :
                    item.type === 'download' ? 'bg-green-500/20 text-green-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {item.type === 'inquiry' ? 'Inquiry' : item.type === 'download' ? 'Download' : 'Request'}
                  </span>
                  
                  <div>
                    {item.type === 'inquiry' && (
                      <>
                        <h4 className="text-white font-medium">{item.name}</h4>
                        <p className="text-gray-500 text-sm">{item.investor_type} • {item.area_of_interest}</p>
                      </>
                    )}
                    {item.type === 'download' && (
                      <>
                        <h4 className="text-white font-medium">{item.investor_name || 'Anonymous'}</h4>
                        <p className="text-gray-500 text-sm">{item.document_title}</p>
                      </>
                    )}
                    {item.type === 'request' && (
                      <>
                        <h4 className="text-white font-medium">{item.name}</h4>
                        <p className="text-gray-500 text-sm">{item.doc_type} • {item.project_title}</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-gray-500 text-sm">{formatDate(item.date)}</span>
                    {item.status && (
                      <span className={`ml-2 px-2 py-0.5 rounded text-xs border ${STATUS_COLORS[item.status]}`}>
                        {item.status}
                      </span>
                    )}
                  </div>
                  {expandedId === `${item.type}-${item.id}` ? 
                    <ChevronUp size={18} className="text-gray-400" /> : 
                    <ChevronDown size={18} className="text-gray-400" />
                  }
                </div>
              </div>
              
              {expandedId === `${item.type}-${item.id}` && (
                <div className="px-4 pb-4 border-t border-gray-800 pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    {item.email && (
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-gray-500" />
                        <span className="text-gray-300">{item.email}</span>
                      </div>
                    )}
                    {item.investor_email && (
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-gray-500" />
                        <span className="text-gray-300">{item.investor_email}</span>
                      </div>
                    )}
                    {item.company && (
                      <div className="flex items-center gap-2">
                        <Building size={14} className="text-gray-500" />
                        <span className="text-gray-300">{item.company}</span>
                      </div>
                    )}
                    {item.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-gray-500" />
                        <span className="text-gray-300">{item.phone}</span>
                      </div>
                    )}
                    {item.ip_address && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-xs">IP:</span>
                        <span className="text-gray-400 text-xs font-mono">{item.ip_address}</span>
                      </div>
                    )}
                  </div>
                  
                  {item.message && (
                    <p className="text-gray-300 mb-4 bg-black/50 p-3 rounded">{item.message}</p>
                  )}
                  
                  {item.type === 'inquiry' && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-sm">Set Status:</span>
                      {['New', 'Contacted', 'In Discussion', 'Archived'].map(status => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(item, status)}
                          className={`px-2 py-1 rounded text-xs border ${STATUS_COLORS[status]} ${item.status === status ? 'opacity-50' : ''}`}
                          disabled={item.status === status}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  )}
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
