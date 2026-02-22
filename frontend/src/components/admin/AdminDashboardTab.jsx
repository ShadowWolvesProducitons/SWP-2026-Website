import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, Users, Inbox, MessageSquare, Briefcase, Film, FileText,
  TrendingUp, Mail, MousePointer, Eye, AlertCircle, CheckCircle,
  BarChart3, Activity, Clock, Check, StickyNote, X, ChevronDown, ChevronUp, Trash2, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

// Activity type filters (merged from old Activity tab)
const TYPE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'message', label: 'Messages' },
  { id: 'submission', label: 'Submissions' },
  { id: 'cineconnect', label: 'CineConnect' },
];

const STATUS_COLORS = {
  'New': 'bg-electric-blue/20 text-electric-blue border-electric-blue/40',
  'Read': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  'Replied': 'bg-green-500/20 text-green-400 border-green-500/40',
  'Reviewed': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  'Archived': 'bg-gray-500/20 text-gray-400 border-gray-500/40',
};

const TYPE_BADGE = {
  'message': 'bg-purple-500/20 text-purple-400 border-purple-500/40',
  'submission': 'bg-orange-500/20 text-orange-400 border-orange-500/40',
  'cineconnect': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
};

const AdminDashboardTab = () => {
  const [stats, setStats] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [activityItems, setActivityItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [activityFilter, setActivityFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [noteModal, setNoteModal] = useState({ open: false, item: null, text: '' });
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [bulkAction, setBulkAction] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, campaignsRes, messagesRes, submissionsRes, ccRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/dashboard`),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/campaigns`),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/contact`),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/submissions`),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/contact/cineconnect-interest`),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (campaignsRes.ok) setCampaigns(await campaignsRes.json());

      // Merge activity items
      const allItems = [];
      if (messagesRes.ok) {
        const messages = await messagesRes.json();
        messages.forEach(m => allItems.push({ ...m, _type: 'message' }));
      }
      if (submissionsRes.ok) {
        const submissions = await submissionsRes.json();
        submissions.forEach(s => allItems.push({ ...s, _type: 'submission' }));
      }
      if (ccRes.ok) {
        const interests = await ccRes.json();
        interests.forEach(i => allItems.push({ ...i, _type: 'cineconnect', status: 'New' }));
      }

      // Sort by date descending
      allItems.sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB - dateA;
      });

      setActivityItems(allItems);
      setSelectedItems(new Set());
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-AU', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateStr);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'subscriber': return <Users size={16} className="text-green-400" />;
      case 'submission': return <Inbox size={16} className="text-blue-400" />;
      case 'message': return <MessageSquare size={16} className="text-purple-400" />;
      case 'investor': return <Briefcase size={16} className="text-yellow-400" />;
      default: return <Activity size={16} className="text-gray-400" />;
    }
  };

  // Activity handlers
  const filteredActivity = activityFilter === 'all' ? activityItems : activityItems.filter(i => i._type === activityFilter);

  const handleStatusChange = async (item, newStatus, e) => {
    if (e) e.stopPropagation();
    const endpoint = item._type === 'message' ? 'contact' : 'submissions';
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/${endpoint}/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        toast.success(`Status updated to ${newStatus}`);
        fetchData();
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleSaveNote = async () => {
    if (!noteModal.item) return;
    const endpoint = noteModal.item._type === 'message' ? 'contact' : 'submissions';
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/${endpoint}/${noteModal.item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_notes: noteModal.text })
      });
      if (response.ok) {
        toast.success('Note saved');
        setNoteModal({ open: false, item: null, text: '' });
        fetchData();
      }
    } catch {
      toast.error('Failed to save note');
    }
  };

  const handleDelete = async (item, permanent = false) => {
    if (!window.confirm(permanent ? `Permanently delete from "${item.name}"?` : `Archive from "${item.name}"?`)) return;
    const endpoint = item._type === 'message' ? 'contact' : 'submissions';
    try {
      const url = permanent
        ? `${process.env.REACT_APP_BACKEND_URL}/api/${endpoint}/${item.id}?permanent=true`
        : `${process.env.REACT_APP_BACKEND_URL}/api/${endpoint}/${item.id}`;
      const response = await fetch(url, { method: 'DELETE' });
      if (response.ok) {
        toast.success(permanent ? 'Deleted' : 'Archived');
        fetchData();
      }
    } catch {
      toast.error('Failed to delete');
    }
  };

  const getStatusOptions = (type) => {
    if (type === 'message') return ['New', 'Read', 'Replied', 'Archived'];
    if (type === 'submission') return ['New', 'Reviewed', 'Archived'];
    return [];
  };

  const newCount = activityItems.filter(i => i.status === 'New').length;
  const counts = {
    all: activityItems.length,
    message: activityItems.filter(i => i._type === 'message').length,
    submission: activityItems.filter(i => i._type === 'submission').length,
    cineconnect: activityItems.filter(i => i._type === 'cineconnect').length,
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="w-8 h-8 text-electric-blue animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div data-testid="admin-dashboard-tab">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="text-electric-blue" />
            Dashboard
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Overview of site performance and activity
          </p>
        </div>
        <button 
          onClick={fetchData} 
          className="p-2 text-gray-400 hover:text-white transition-colors" 
          title="Refresh"
          data-testid="refresh-dashboard"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-800 pb-4">
        {['overview', 'activity', 'campaigns'].map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            data-testid={`section-${section}`}
            className={`px-4 py-2 rounded-lg font-mono text-sm uppercase tracking-widest transition-colors ${
              activeSection === section
                ? 'bg-electric-blue text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {section === 'overview' ? 'Overview' : section === 'activity' ? 'Activity Feed' : 'Email Campaigns'}
          </button>
        ))}
      </div>

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<Users className="text-green-400" />}
              label="Subscribers"
              value={stats?.total_subscribers || 0}
              subValue={`+${stats?.new_subscribers_30d || 0} this month`}
            />
            <StatCard
              icon={<Inbox className="text-blue-400" />}
              label="Submissions"
              value={stats?.total_submissions || 0}
              subValue={`${stats?.pending_submissions || 0} pending`}
              alert={stats?.pending_submissions > 0}
            />
            <StatCard
              icon={<MessageSquare className="text-purple-400" />}
              label="Messages"
              value={stats?.total_messages || 0}
              subValue={`${stats?.pending_messages || 0} new`}
              alert={stats?.pending_messages > 0}
            />
            <StatCard
              icon={<Briefcase className="text-yellow-400" />}
              label="Investor Inquiries"
              value={stats?.total_investor_inquiries || 0}
              subValue="Total received"
            />
          </div>

          {/* Content Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <StatCard
              icon={<Film className="text-red-400" />}
              label="Films"
              value={stats?.total_films || 0}
              subValue="In catalog"
            />
            <StatCard
              icon={<FileText className="text-cyan-400" />}
              label="Blog Posts"
              value={stats?.total_blog_posts || 0}
              subValue="Published"
            />
          </div>

          {/* Quick Activity Preview */}
          <div className="bg-smoke-gray border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock size={18} className="text-electric-blue" />
                Recent Activity
              </h3>
              <button
                onClick={() => setActiveSection('activity')}
                className="text-electric-blue text-sm hover:underline"
              >
                View All
              </button>
            </div>
            {activityItems.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {activityItems.slice(0, 5).map((activity, idx) => (
                  <div key={idx} className="flex items-center gap-3 py-2 border-b border-gray-800/50 last:border-0">
                    <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
                      {getActivityIcon(activity._type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{activity.name} - {activity._type}</p>
                    </div>
                    <span className="text-gray-500 text-xs whitespace-nowrap">
                      {formatTimeAgo(activity.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Activity Section (merged from old Activity tab) */}
      {activeSection === 'activity' && (
        <div>
          {/* Filter Chips */}
          <div className="flex gap-2 mb-6 flex-wrap" data-testid="activity-filters">
            {TYPE_FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setActivityFilter(f.id)}
                className={`px-4 py-2 rounded-full text-sm font-mono uppercase tracking-widest transition-all flex items-center gap-2 ${
                  activityFilter === f.id
                    ? 'bg-white text-black'
                    : 'bg-smoke-gray text-gray-400 border border-gray-700 hover:text-white hover:border-gray-500'
                }`}
                data-testid={`filter-${f.id}`}
              >
                {f.label}
                <span className={`text-xs px-1.5 py-0.5 rounded ${activityFilter === f.id ? 'bg-black/10' : 'bg-white/10'}`}>
                  {counts[f.id]}
                </span>
              </button>
            ))}
            {newCount > 0 && (
              <span className="px-3 py-2 bg-electric-blue text-white text-sm rounded-full">{newCount} new</span>
            )}
          </div>

          {/* Activity Items */}
          {filteredActivity.length === 0 ? (
            <div className="text-center py-12 bg-smoke-gray border border-gray-800 rounded-lg">
              <MessageSquare className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400">No activity found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredActivity.map((item) => (
                <div
                  key={`${item._type}-${item.id}`}
                  className={`bg-smoke-gray border rounded-lg overflow-hidden transition-colors ${
                    item.status === 'New' ? 'border-electric-blue/50' : 'border-gray-800 hover:border-gray-700'
                  }`}
                  data-testid={`activity-item-${item.id}`}
                >
                  {/* Header Row */}
                  <div
                    className="px-6 py-4 flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedId(expandedId === `${item._type}-${item.id}` ? null : `${item._type}-${item.id}`)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase border ${TYPE_BADGE[item._type]}`}>
                        {item._type === 'cineconnect' ? 'CineConnect' : item._type}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase border ${STATUS_COLORS[item.status] || STATUS_COLORS['New']}`}>
                        {item.status}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-white font-semibold truncate">{item.name}</h3>
                        <p className="text-gray-500 text-sm truncate">{item.email}</p>
                      </div>
                      {item.admin_notes && (
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] rounded-full" title={item.admin_notes}>Note</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {item._type !== 'cineconnect' && item.status === 'New' && (
                        <button
                          onClick={(e) => handleStatusChange(item, 'Read', e)}
                          className="p-1.5 text-gray-500 hover:text-green-400 hover:bg-green-500/10 rounded transition-colors"
                          title="Mark as Read"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      {item._type !== 'cineconnect' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setNoteModal({ open: true, item, text: item.admin_notes || '' }); }}
                          className={`p-1.5 hover:bg-amber-500/10 rounded transition-colors ${item.admin_notes ? 'text-amber-400' : 'text-gray-500 hover:text-amber-400'}`}
                          title="Add/Edit Note"
                        >
                          <StickyNote size={16} />
                        </button>
                      )}
                      <a
                        href={`mailto:${item.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 text-gray-500 hover:text-electric-blue hover:bg-electric-blue/10 rounded transition-colors"
                        title="Reply via Email"
                      >
                        <Mail size={16} />
                      </a>
                      <span className="hidden lg:block text-gray-500 text-sm ml-2">{formatDate(item.created_at)}</span>
                      {expandedId === `${item._type}-${item.id}` ? (
                        <ChevronUp size={20} className="text-gray-400 ml-2" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-400 ml-2" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedId === `${item._type}-${item.id}` && (
                    <div className="px-6 py-6 border-t border-gray-800 bg-black/30">
                      {item._type === 'message' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="text-gray-500 text-xs font-mono uppercase tracking-widest">Email</label>
                              <p className="text-white mt-1"><a href={`mailto:${item.email}`} className="text-electric-blue hover:underline">{item.email}</a></p>
                            </div>
                            {item.phone && <div><label className="text-gray-500 text-xs font-mono uppercase tracking-widest">Phone</label><p className="text-white mt-1">{item.phone}</p></div>}
                            {item.service && <div><label className="text-gray-500 text-xs font-mono uppercase tracking-widest">Project Type</label><p className="text-white mt-1 capitalize">{item.service.replace('-', ' ')}</p></div>}
                          </div>
                          <div>
                            <label className="text-gray-500 text-xs font-mono uppercase tracking-widest">Message</label>
                            <p className="text-gray-300 mt-2 whitespace-pre-wrap leading-relaxed">{item.message}</p>
                          </div>
                        </div>
                      )}

                      {item._type === 'submission' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div><label className="text-gray-500 text-xs font-mono uppercase tracking-widest">Role</label><p className="text-white mt-1">{item.role}</p></div>
                            <div><label className="text-gray-500 text-xs font-mono uppercase tracking-widest">Type</label><p className="text-white mt-1">{item.submission_type}</p></div>
                            <div><label className="text-gray-500 text-xs font-mono uppercase tracking-widest">Stage</label><p className="text-white mt-1">{item.project_stage}</p></div>
                            <div><label className="text-gray-500 text-xs font-mono uppercase tracking-widest">Genres</label>
                              <div className="flex flex-wrap gap-2 mt-1">{item.genres?.map((g, i) => <span key={i} className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-sm">{g}</span>)}</div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div><label className="text-gray-500 text-xs font-mono uppercase tracking-widest">Logline</label><p className="text-white mt-1 leading-relaxed">{item.logline}</p></div>
                            {item.external_link && <div><label className="text-gray-500 text-xs font-mono uppercase tracking-widest">Link</label><a href={item.external_link} target="_blank" rel="noopener noreferrer" className="text-electric-blue hover:underline mt-1 flex items-center gap-2">View <ExternalLink size={14} /></a></div>}
                            {item.message && <div><label className="text-gray-500 text-xs font-mono uppercase tracking-widest">Message</label><p className="text-gray-300 mt-1">{item.message}</p></div>}
                          </div>
                        </div>
                      )}

                      {item._type === 'cineconnect' && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Users size={16} className="text-cyan-400" />
                            <span className="text-gray-300">{item.name} wants to be notified when CineConnect launches.</span>
                          </div>
                          <p className="text-gray-500 text-sm">Email: <a href={`mailto:${item.email}`} className="text-electric-blue hover:underline">{item.email}</a></p>
                        </div>
                      )}

                      {/* Actions */}
                      {item._type !== 'cineconnect' && (
                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-800">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-gray-500 text-sm mr-2">Set Status:</span>
                            {getStatusOptions(item._type).filter(s => s !== item.status).map(status => (
                              <button
                                key={status}
                                onClick={() => handleStatusChange(item, status)}
                                className={`px-3 py-1 rounded-full text-xs font-mono uppercase border transition-colors hover:opacity-80 ${STATUS_COLORS[status]}`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={`mailto:${item.email}`}
                              className="p-2 text-gray-400 hover:text-electric-blue transition-colors"
                              title="Reply"
                            >
                              <Mail size={18} />
                            </a>
                            <button
                              onClick={() => handleDelete(item, true)}
                              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                              title="Delete Permanently"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Campaigns Section */}
      {activeSection === 'campaigns' && (
        <div className="space-y-6">
          {/* Campaign Stats Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-smoke-gray border border-gray-800 rounded-lg p-4 text-center">
              <Mail size={24} className="text-electric-blue mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{campaigns.length}</p>
              <p className="text-gray-500 text-sm">Total Campaigns</p>
            </div>
            <div className="bg-smoke-gray border border-gray-800 rounded-lg p-4 text-center">
              <Eye size={24} className="text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {campaigns.reduce((acc, c) => acc + c.opened, 0)}
              </p>
              <p className="text-gray-500 text-sm">Total Opens</p>
            </div>
            <div className="bg-smoke-gray border border-gray-800 rounded-lg p-4 text-center">
              <MousePointer size={24} className="text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {campaigns.reduce((acc, c) => acc + c.clicked, 0)}
              </p>
              <p className="text-gray-500 text-sm">Total Clicks</p>
            </div>
          </div>

          {/* Campaigns List */}
          {campaigns.length === 0 ? (
            <div className="text-center py-12 bg-smoke-gray border border-gray-800 rounded-lg">
              <Mail className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400">No email campaigns sent yet</p>
              <p className="text-gray-600 text-sm mt-2">Send your first newsletter from Studio &gt; Comms</p>
            </div>
          ) : (
            <div className="bg-smoke-gray border border-gray-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-6 py-4 text-gray-400 font-mono text-xs uppercase tracking-widest">Campaign</th>
                    <th className="text-center px-4 py-4 text-gray-400 font-mono text-xs uppercase tracking-widest">Sent</th>
                    <th className="text-center px-4 py-4 text-gray-400 font-mono text-xs uppercase tracking-widest">Delivered</th>
                    <th className="text-center px-4 py-4 text-gray-400 font-mono text-xs uppercase tracking-widest">Opened</th>
                    <th className="text-center px-4 py-4 text-gray-400 font-mono text-xs uppercase tracking-widest">Clicked</th>
                    <th className="text-center px-4 py-4 text-gray-400 font-mono text-xs uppercase tracking-widest">Open Rate</th>
                    <th className="text-center px-4 py-4 text-gray-400 font-mono text-xs uppercase tracking-widest">Click Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b border-gray-800/50 hover:bg-black/30 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-medium truncate max-w-[200px]">{campaign.subject}</p>
                          <p className="text-gray-500 text-xs mt-1">{formatDate(campaign.sent_at)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-white">{campaign.sent}</span>
                        {campaign.failed > 0 && (
                          <span className="text-red-400 text-xs ml-1">({campaign.failed} failed)</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center text-green-400">{campaign.delivered}</td>
                      <td className="px-4 py-4 text-center text-blue-400">{campaign.opened}</td>
                      <td className="px-4 py-4 text-center text-purple-400">{campaign.clicked}</td>
                      <td className="px-4 py-4 text-center">
                        <RateIndicator rate={campaign.open_rate} />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <RateIndicator rate={campaign.click_rate} type="click" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Webhook Setup Info */}
          <div className="bg-black/50 border border-gray-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-200 text-sm font-medium">Enable Email Tracking</p>
                <p className="text-gray-400 text-xs mt-1">
                  To track opens and clicks, set up a webhook in your Resend dashboard pointing to:
                </p>
                <code className="block mt-2 text-xs bg-black px-3 py-2 rounded text-electric-blue">
                  https://www.shadowwolvesproductions.com.au/api/webhooks/resend
                </code>
                <p className="text-gray-500 text-xs mt-2">
                  Select events: email.delivered, email.opened, email.clicked, email.bounced
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {noteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-smoke-gray border border-gray-800 rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <StickyNote size={18} className="text-amber-400" />
                Admin Note
              </h3>
              <button onClick={() => setNoteModal({ open: false, item: null, text: '' })} className="p-1 text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-400 text-sm mb-2">For: {noteModal.item?.name}</p>
              <textarea
                value={noteModal.text}
                onChange={(e) => setNoteModal(prev => ({ ...prev, text: e.target.value }))}
                rows={4}
                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none resize-none"
                placeholder="Add internal notes about this contact..."
                data-testid="note-textarea"
              />
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-gray-800">
              <button onClick={() => setNoteModal({ open: false, item: null, text: '' })} className="px-4 py-2 border border-gray-700 text-gray-400 rounded-lg hover:text-white text-sm">
                Cancel
              </button>
              <button onClick={handleSaveNote} className="px-4 py-2 bg-electric-blue text-white rounded-lg text-sm" data-testid="save-note-btn">
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, label, value, subValue, alert }) => (
  <div className="bg-smoke-gray border border-gray-800 rounded-lg p-4">
    <div className="flex items-center gap-3 mb-2">
      {icon}
      <span className="text-gray-400 text-sm">{label}</span>
    </div>
    <p className="text-3xl font-bold text-white">{value}</p>
    <p className={`text-xs mt-1 ${alert ? 'text-yellow-400' : 'text-gray-500'}`}>
      {alert && <AlertCircle size={12} className="inline mr-1" />}
      {subValue}
    </p>
  </div>
);

// Rate Indicator Component
const RateIndicator = ({ rate, type = 'open' }) => {
  const getColor = () => {
    if (type === 'click') {
      if (rate >= 5) return 'text-green-400';
      if (rate >= 2) return 'text-yellow-400';
      return 'text-gray-400';
    }
    if (rate >= 30) return 'text-green-400';
    if (rate >= 15) return 'text-yellow-400';
    return 'text-gray-400';
  };

  return (
    <span className={`font-mono ${getColor()}`}>
      {rate}%
    </span>
  );
};

export default AdminDashboardTab;
