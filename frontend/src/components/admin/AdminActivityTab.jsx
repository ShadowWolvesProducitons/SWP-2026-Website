import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, Mail, Trash2, ChevronDown, ChevronUp, MessageSquare, 
  FileText, ExternalLink, Users, Check, StickyNote, X, CheckCheck, 
  MoreHorizontal, Reply
} from 'lucide-react';
import { toast } from 'sonner';

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

const AdminActivityTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [noteModal, setNoteModal] = useState({ open: false, item: null, text: '' });
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [bulkAction, setBulkAction] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [messagesRes, submissionsRes, ccRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/contact`),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/submissions`),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/contact/cineconnect-interest`),
      ]);

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

      setItems(allItems);
      setSelectedItems(new Set());
    } catch {
      toast.error('Failed to load activity');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = activeFilter === 'all' ? items : items.filter(i => i._type === activeFilter);

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
        toast.success(`Marked as ${newStatus}`);
        fetchAll();
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
        fetchAll();
      }
    } catch {
      toast.error('Failed to save note');
    }
  };

  const handleDelete = async (item, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Delete this ${item._type} from "${item.name}"?`)) return;
    const endpoint = item._type === 'message' ? 'contact' : item._type === 'submission' ? 'submissions' : 'contact/cineconnect-interest';
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/${endpoint}/${item.id}?permanent=true`, { 
        method: 'DELETE' 
      });
      if (response.ok) {
        toast.success('Deleted');
        fetchAll();
      }
    } catch {
      toast.error('Failed to delete');
    }
  };

  // Bulk actions
  const handleSelectItem = (itemKey, e) => {
    e.stopPropagation();
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemKey)) {
        newSet.delete(itemKey);
      } else {
        newSet.add(itemKey);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filtered.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filtered.map(i => `${i._type}-${i.id}`)));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedItems.size === 0) return;
    
    const selectedList = filtered.filter(i => selectedItems.has(`${i._type}-${i.id}`));
    
    if (bulkAction === 'delete') {
      if (!window.confirm(`Delete ${selectedList.length} items? This cannot be undone.`)) return;
    }

    let successCount = 0;
    for (const item of selectedList) {
      if (item._type === 'cineconnect' && bulkAction !== 'delete') continue;
      
      const endpoint = item._type === 'message' ? 'contact' : item._type === 'submission' ? 'submissions' : 'contact/cineconnect-interest';
      
      try {
        if (bulkAction === 'delete') {
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/${endpoint}/${item.id}?permanent=true`, { 
            method: 'DELETE' 
          });
          if (response.ok) successCount++;
        } else if (bulkAction === 'read') {
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/${endpoint}/${item.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Read' })
          });
          if (response.ok) successCount++;
        } else if (bulkAction === 'archive') {
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/${endpoint}/${item.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Archived' })
          });
          if (response.ok) successCount++;
        }
      } catch {}
    }

    toast.success(`${bulkAction === 'delete' ? 'Deleted' : 'Updated'} ${successCount} items`);
    setBulkAction('');
    fetchAll();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-AU', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusOptions = (type) => {
    if (type === 'message') return ['New', 'Read', 'Replied', 'Archived'];
    if (type === 'submission') return ['New', 'Reviewed', 'Archived'];
    return [];
  };

  const newCount = items.filter(i => i.status === 'New').length;
  const counts = {
    all: items.length,
    message: items.filter(i => i._type === 'message').length,
    submission: items.filter(i => i._type === 'submission').length,
    cineconnect: items.filter(i => i._type === 'cineconnect').length,
  };

  return (
    <div data-testid="admin-activity-tab">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3" data-testid="activity-title">
            Activity
            {newCount > 0 && (
              <span className="px-2 py-1 bg-electric-blue text-white text-xs rounded-full">{newCount} new</span>
            )}
          </h2>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} items</p>
        </div>
        <button onClick={fetchAll} className="p-2 text-gray-400 hover:text-white transition-colors" title="Refresh">
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 mb-6 flex-wrap" data-testid="activity-filters">
        {TYPE_FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`px-4 py-2 rounded-full text-sm font-mono uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeFilter === f.id
                ? 'bg-white text-black'
                : 'bg-smoke-gray text-gray-400 border border-gray-700 hover:text-white hover:border-gray-500'
            }`}
            data-testid={`filter-${f.id}`}
          >
            {f.label}
            <span className={`text-xs px-1.5 py-0.5 rounded ${activeFilter === f.id ? 'bg-black/10' : 'bg-white/10'}`}>
              {counts[f.id]}
            </span>
          </button>
        ))}
      </div>

      {/* Bulk Actions Bar */}
      {filtered.length > 0 && (
        <div className="flex items-center gap-4 mb-4 p-3 bg-smoke-gray border border-gray-800 rounded-lg">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedItems.size === filtered.length && filtered.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded border-gray-600 bg-black text-electric-blue focus:ring-electric-blue"
            />
            <span className="text-gray-400 text-sm">
              {selectedItems.size > 0 ? `${selectedItems.size} selected` : 'Select all'}
            </span>
          </label>
          
          {selectedItems.size > 0 && (
            <>
              <div className="h-4 w-px bg-gray-700" />
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="bg-black border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-300 focus:border-electric-blue focus:outline-none"
              >
                <option value="">Bulk Actions...</option>
                <option value="read">Mark as Read</option>
                <option value="archive">Archive All</option>
                <option value="delete">Delete All</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className="px-3 py-1.5 bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm rounded transition-colors"
              >
                Apply
              </button>
            </>
          )}
        </div>
      )}

      {/* Items List */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-electric-blue animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-smoke-gray border border-gray-800 rounded-lg">
          <MessageSquare className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400">No activity found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const itemKey = `${item._type}-${item.id}`;
            const isSelected = selectedItems.has(itemKey);
            
            return (
              <div
                key={itemKey}
                className={`bg-smoke-gray border rounded-lg overflow-hidden transition-colors ${
                  isSelected ? 'border-electric-blue' : item.status === 'New' ? 'border-electric-blue/50' : 'border-gray-800 hover:border-gray-700'
                }`}
                data-testid={`activity-item-${item.id}`}
              >
                {/* Header Row */}
                <div
                  className="px-4 py-3 flex items-center gap-3 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === itemKey ? null : itemKey)}
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => handleSelectItem(itemKey, e)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 rounded border-gray-600 bg-black text-electric-blue focus:ring-electric-blue flex-shrink-0"
                  />
                  
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Type Badge */}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase border ${TYPE_BADGE[item._type]}`}>
                      {item._type === 'cineconnect' ? 'CC' : item._type.charAt(0).toUpperCase()}
                    </span>
                    {/* Status Badge */}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase border ${STATUS_COLORS[item.status] || STATUS_COLORS['New']}`}>
                      {item.status}
                    </span>
                    {/* Name & Email */}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-white font-medium text-sm truncate">{item.name}</h3>
                      <p className="text-gray-500 text-xs truncate">{item.email}</p>
                    </div>
                  </div>

                  {/* Quick Action Icons */}
                  <div className="flex items-center gap-1">
                    {/* Mark as Read */}
                    {item._type !== 'cineconnect' && item.status === 'New' && (
                      <button
                        onClick={(e) => handleStatusChange(item, 'Read', e)}
                        className="p-1.5 text-gray-500 hover:text-green-400 hover:bg-green-500/10 rounded transition-colors"
                        title="Mark as Read"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    
                    {/* Reply via Email */}
                    <a
                      href={`mailto:${item.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 text-gray-500 hover:text-electric-blue hover:bg-electric-blue/10 rounded transition-colors"
                      title="Reply via Email"
                    >
                      <Reply size={16} />
                    </a>
                    
                    {/* Delete */}
                    <button
                      onClick={(e) => handleDelete(item, e)}
                      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                    
                    {/* Note indicator */}
                    {item.admin_notes && (
                      <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] rounded" title={item.admin_notes}>Note</span>
                    )}
                    
                    <span className="hidden md:block text-gray-500 text-xs ml-2">{formatDate(item.created_at)}</span>
                    
                    {expandedId === itemKey ? (
                      <ChevronUp size={18} className="text-gray-400 ml-1" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-400 ml-1" />
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedId === itemKey && (
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
                          <button
                            onClick={(e) => { e.stopPropagation(); setNoteModal({ open: true, item, text: item.admin_notes || '' }); }}
                            className={`p-2 hover:bg-amber-500/10 rounded transition-colors ${item.admin_notes ? 'text-amber-400' : 'text-gray-400 hover:text-amber-400'}`}
                            title="Add/Edit Note"
                          >
                            <StickyNote size={18} />
                          </button>
                          <a
                            href={`mailto:${item.email}`}
                            className="p-2 text-gray-400 hover:text-electric-blue transition-colors"
                            title="Reply"
                          >
                            <Mail size={18} />
                          </a>
                          <button
                            onClick={(e) => handleDelete(item, e)}
                            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
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
              />
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-gray-800">
              <button onClick={() => setNoteModal({ open: false, item: null, text: '' })} className="px-4 py-2 border border-gray-700 text-gray-400 rounded-lg hover:text-white text-sm">
                Cancel
              </button>
              <button onClick={handleSaveNote} className="px-4 py-2 bg-electric-blue text-white rounded-lg text-sm">
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminActivityTab;
