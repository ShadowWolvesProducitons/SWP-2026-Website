import React, { useState, useEffect, useCallback } from 'react';
import { Users, Shield, Eye, Download, Search, Filter, ChevronDown, X, Check, AlertTriangle, Clock, UserCheck, UserX, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const ADMIN_PASSWORD = 'shadowwolves2024';

// Helper to get admin headers
const getAdminHeaders = () => ({
  'Content-Type': 'application/json',
  'X-Admin-Password': ADMIN_PASSWORD
});

// Role and Status options
const ROLES = [
  { value: 'viewer', label: 'Viewer', color: 'gray' },
  { value: 'investor', label: 'Investor', color: 'green' },
  { value: 'director', label: 'Director', color: 'blue' },
  { value: 'producer', label: 'Producer', color: 'purple' },
  { value: 'cast', label: 'Cast', color: 'pink' },
  { value: 'crew', label: 'Crew', color: 'orange' },
  { value: 'admin', label: 'Admin', color: 'red' }
];

const STATUSES = [
  { value: 'active', label: 'Active', color: 'green', icon: UserCheck },
  { value: 'pending_verification', label: 'Pending', color: 'yellow', icon: Clock },
  { value: 'revoked', label: 'Revoked', color: 'red', icon: UserX }
];

// Helper to get role/status styling
const getRoleStyle = (role) => {
  const r = ROLES.find(r => r.value === role);
  return r ? `bg-${r.color}-500/20 text-${r.color}-400 border-${r.color}-500/30` : 'bg-gray-500/20 text-gray-400';
};

const getStatusStyle = (status) => {
  const s = STATUSES.find(s => s.value === status);
  return s ? `bg-${s.color}-500/20 text-${s.color}-400` : 'bg-gray-500/20 text-gray-400';
};

// ============ USER CARD ============
const UserCard = ({ user, projects, onUpdate, onViewDetails }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    role: user.role,
    status: user.status,
    has_all_projects_access: user.has_all_projects_access || false,
    project_permissions: user.project_permissions || []
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = sessionStorage.getItem('studioToken');
      const response = await fetch(`${API_URL}/api/admin/studio-portal/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      });

      if (response.ok) {
        toast.success('User updated successfully');
        setEditMode(false);
        onUpdate();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to update user');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleRevoke = async () => {
    if (!window.confirm(`Revoke access for ${user.full_name}?`)) return;
    
    try {
      const token = sessionStorage.getItem('studioToken');
      const response = await fetch(`${API_URL}/api/admin/studio-portal/users/${user.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Access revoked');
        onUpdate();
      } else {
        toast.error('Failed to revoke access');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const toggleProject = (projectId) => {
    setEditData(prev => ({
      ...prev,
      project_permissions: prev.project_permissions.includes(projectId)
        ? prev.project_permissions.filter(id => id !== projectId)
        : [...prev.project_permissions, projectId]
    }));
  };

  return (
    <div className="bg-smoke-gray border border-gray-800 rounded-lg overflow-hidden" data-testid={`user-card-${user.id}`}>
      {/* Header Row */}
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-black/20"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-electric-blue/20 flex items-center justify-center text-electric-blue font-bold">
            {user.full_name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <h4 className="text-white font-medium">{user.full_name}</h4>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 rounded text-xs uppercase ${
            user.role === 'admin' ? 'bg-red-500/20 text-red-400' :
            user.role === 'investor' ? 'bg-green-500/20 text-green-400' :
            user.role === 'director' ? 'bg-blue-500/20 text-blue-400' :
            user.role === 'producer' ? 'bg-purple-500/20 text-purple-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {user.role}
          </span>
          <span className={`px-2 py-1 rounded text-xs uppercase ${
            user.status === 'active' ? 'bg-green-500/20 text-green-400' :
            user.status === 'pending_verification' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {user.status === 'pending_verification' ? 'Pending' : user.status}
          </span>
          <ChevronDown size={18} className={`text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-800 p-4 space-y-4">
          {/* Info Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500 block">Company</span>
              <span className="text-white">{user.company || '-'}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Joined</span>
              <span className="text-white">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Last Login</span>
              <span className="text-white">{user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Project Access</span>
              <span className="text-white">
                {user.has_all_projects_access ? 'All Projects' : `${user.project_permissions?.length || 0} projects`}
              </span>
            </div>
          </div>

          {/* Edit Mode */}
          {editMode ? (
            <div className="space-y-4 pt-4 border-t border-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Role Select */}
                <div>
                  <label className="block text-gray-400 text-xs uppercase mb-2">Role</label>
                  <select
                    value={editData.role}
                    onChange={(e) => setEditData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-electric-blue focus:outline-none"
                  >
                    {ROLES.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>

                {/* Status Select */}
                <div>
                  <label className="block text-gray-400 text-xs uppercase mb-2">Status</label>
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-electric-blue focus:outline-none"
                  >
                    {STATUSES.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* All Projects Access Toggle */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editData.has_all_projects_access}
                    onChange={(e) => setEditData(prev => ({ ...prev, has_all_projects_access: e.target.checked }))}
                    className="rounded border-gray-600 bg-black text-electric-blue focus:ring-electric-blue"
                  />
                  <span className="text-gray-300 text-sm">Grant access to all projects</span>
                </label>
              </div>

              {/* Project Permissions (if not all access) */}
              {!editData.has_all_projects_access && projects.length > 0 && (
                <div>
                  <label className="block text-gray-400 text-xs uppercase mb-2">Project Access</label>
                  <div className="flex flex-wrap gap-2">
                    {projects.map(project => (
                      <button
                        key={project.id}
                        type="button"
                        onClick={() => toggleProject(project.id)}
                        className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                          editData.project_permissions.includes(project.id)
                            ? 'bg-electric-blue text-white'
                            : 'bg-black border border-gray-700 text-gray-400 hover:border-gray-500'
                        }`}
                      >
                        {project.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Save/Cancel Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 text-white rounded-lg text-sm transition-all"
                >
                  {saving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setEditData({
                      role: user.role,
                      status: user.status,
                      has_all_projects_access: user.has_all_projects_access || false,
                      project_permissions: user.project_permissions || []
                    });
                  }}
                  className="px-4 py-2 border border-gray-700 text-gray-400 hover:text-white rounded-lg text-sm transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* Action Buttons */
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-electric-blue/10 hover:bg-electric-blue/20 text-electric-blue rounded-lg text-sm transition-all"
              >
                <Shield size={14} />
                Edit Access
              </button>
              {user.status !== 'revoked' && user.role !== 'admin' && (
                <button
                  onClick={handleRevoke}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm transition-all"
                >
                  <UserX size={14} />
                  Revoke Access
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============ STATS CARD ============
const StatsCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }) => (
  <div className="bg-smoke-gray border border-gray-800 rounded-lg p-4">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
        {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
      </div>
      <div className={`p-2 rounded-lg bg-${color}-500/10`}>
        <Icon size={20} className={`text-${color}-400`} />
      </div>
    </div>
  </div>
);

// ============ MAIN COMPONENT ============
const AdminStudioPortalTab = () => {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('users');

  const getToken = () => sessionStorage.getItem('studioToken');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const token = getToken();
    
    if (!token) {
      toast.error('Please login to Studio Portal first');
      setLoading(false);
      return;
    }

    try {
      // Fetch users, stats, and projects in parallel
      const [usersRes, statsRes, projectsRes, logsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/studio-portal/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/admin/studio-portal/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/films`),
        fetch(`${API_URL}/api/admin/studio-portal/audit-logs?limit=50`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }

      if (projectsRes.ok) {
        const data = await projectsRes.json();
        setProjects(data.films || []);
      }

      if (logsRes.ok) {
        const data = await logsRes.json();
        setAuditLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      toast.error('Failed to load portal data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || user.role === filterRole;
    const matchesStatus = !filterStatus || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw size={32} className="text-electric-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-studio-portal-tab">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white font-cinzel">Studio Portal Management</h2>
          <p className="text-gray-500 text-sm">Manage users, roles, and access permissions</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-electric-blue/10 hover:bg-electric-blue/20 text-electric-blue rounded-lg text-sm transition-all"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard 
            title="Total Users" 
            value={stats.users?.total || 0} 
            icon={Users} 
            color="blue" 
          />
          <StatsCard 
            title="Active Users" 
            value={stats.users?.active || 0}
            subtitle={`${stats.users?.pending || 0} pending`}
            icon={UserCheck} 
            color="green" 
          />
          <StatsCard 
            title="Downloads" 
            value={stats.activity?.total_downloads || 0} 
            icon={Download} 
            color="purple" 
          />
          <StatsCard 
            title="Revoked" 
            value={stats.users?.revoked || 0} 
            icon={UserX} 
            color="red" 
          />
        </div>
      )}

      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-gray-800">
        {['users', 'audit'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-4 py-2 font-mono text-sm uppercase tracking-widest border-b-2 transition-all ${
              activeSubTab === tab
                ? 'text-electric-blue border-electric-blue'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            {tab === 'users' ? 'User Management' : 'Audit Log'}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {activeSubTab === 'users' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 bg-smoke-gray border border-gray-700 rounded-lg text-white text-sm focus:border-electric-blue focus:outline-none"
                data-testid="user-search-input"
              />
            </div>

            {/* Role Filter */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 bg-smoke-gray border border-gray-700 rounded-lg text-gray-300 text-sm focus:border-electric-blue focus:outline-none"
            >
              <option value="">All Roles</option>
              {ROLES.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-smoke-gray border border-gray-700 rounded-lg text-gray-300 text-sm focus:border-electric-blue focus:outline-none"
            >
              <option value="">All Statuses</option>
              {STATUSES.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>

            {/* Clear Filters */}
            {(searchTerm || filterRole || filterStatus) && (
              <button
                onClick={() => { setSearchTerm(''); setFilterRole(''); setFilterStatus(''); }}
                className="flex items-center gap-1 px-3 py-2 text-gray-400 hover:text-white text-sm"
              >
                <X size={14} />
                Clear
              </button>
            )}
          </div>

          {/* User Count */}
          <p className="text-gray-500 text-sm">
            Showing {filteredUsers.length} of {users.length} users
          </p>

          {/* User List */}
          <div className="space-y-3">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                <p>No users found</p>
              </div>
            ) : (
              filteredUsers.map(user => (
                <UserCard
                  key={user.id}
                  user={user}
                  projects={projects}
                  onUpdate={fetchData}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Audit Log Tab */}
      {activeSubTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-smoke-gray border border-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-black/30">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">Time</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">Event</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">User</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-xs uppercase">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      No audit logs found
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-black/20">
                      <td className="px-4 py-3 text-gray-500 text-sm">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs uppercase ${
                          log.event_type?.includes('download') ? 'bg-purple-500/20 text-purple-400' :
                          log.event_type?.includes('login') ? 'bg-green-500/20 text-green-400' :
                          log.event_type?.includes('revoked') ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {log.event_type?.replace(/_/g, ' ') || 'unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white text-sm">
                        {log.user_email || '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm max-w-xs truncate">
                        {log.details ? JSON.stringify(log.details).substring(0, 100) : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudioPortalTab;
