import React, { useState, useEffect } from 'react';
import { RefreshCw, Eye, Archive, Trash2, ExternalLink, Mail, User, FileText, ChevronDown, ChevronUp, X } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_OPTIONS = ['New', 'Reviewed', 'Archived'];
const STATUS_COLORS = {
  'New': 'bg-electric-blue/20 text-electric-blue border-electric-blue/40',
  'Reviewed': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  'Archived': 'bg-gray-500/20 text-gray-400 border-gray-500/40'
};

const AdminSubmissionsTab = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      let url = `${process.env.REACT_APP_BACKEND_URL}/api/submissions`;
      if (filterStatus) {
        url += `?status=${filterStatus}`;
      }
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      }
    } catch (err) {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [filterStatus]);

  const handleStatusChange = async (submission, newStatus) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/submissions/${submission.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        toast.success(`Status updated to ${newStatus}`);
        fetchSubmissions();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (submission, permanent = false) => {
    const confirmMsg = permanent 
      ? `Permanently delete submission from "${submission.name}"? This cannot be undone.`
      : `Archive submission from "${submission.name}"?`;
    
    if (!window.confirm(confirmMsg)) return;

    try {
      const url = permanent 
        ? `${process.env.REACT_APP_BACKEND_URL}/api/submissions/${submission.id}?permanent=true`
        : `${process.env.REACT_APP_BACKEND_URL}/api/submissions/${submission.id}`;
      
      const response = await fetch(url, { method: 'DELETE' });
      if (response.ok) {
        toast.success(permanent ? 'Submission deleted' : 'Submission archived');
        fetchSubmissions();
      }
    } catch (err) {
      toast.error('Failed to delete submission');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-AU', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div>
      {/* Actions Bar */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Submissions</h2>
          <p className="text-gray-500 text-sm mt-1">{submissions.length} submissions</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-electric-blue focus:outline-none"
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          
          <button 
            onClick={fetchSubmissions} 
            className="p-2 text-gray-400 hover:text-white transition-colors" 
            title="Refresh"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-electric-blue animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-12 bg-smoke-gray border border-gray-800 rounded-lg">
          <FileText className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400">No submissions found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div 
              key={submission.id} 
              className="bg-smoke-gray border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors"
            >
              {/* Header Row */}
              <div 
                className="px-6 py-4 flex items-center justify-between cursor-pointer"
                onClick={() => toggleExpand(submission.id)}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Status Badge */}
                  <span className={`px-3 py-1 rounded-full text-xs font-mono uppercase border ${STATUS_COLORS[submission.status]}`}>
                    {submission.status}
                  </span>
                  
                  {/* Name & Email */}
                  <div className="min-w-0">
                    <h3 className="text-white font-semibold truncate">{submission.name}</h3>
                    <p className="text-gray-500 text-sm truncate">{submission.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Submission Type */}
                  <div className="hidden md:block text-right">
                    <p className="text-gray-400 text-sm">{submission.submission_type}</p>
                    <p className="text-gray-600 text-xs">{submission.role}</p>
                  </div>
                  
                  {/* Date */}
                  <div className="hidden lg:block text-right">
                    <p className="text-gray-500 text-sm">{formatDate(submission.created_at)}</p>
                  </div>

                  {/* Expand Icon */}
                  {expandedId === submission.id ? (
                    <ChevronUp size={20} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {expandedId === submission.id && (
                <div className="px-6 py-6 border-t border-gray-800 bg-black/30">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-gray-500 text-xs font-mono uppercase tracking-widest">Role</label>
                        <p className="text-white mt-1">{submission.role}</p>
                      </div>
                      <div>
                        <label className="text-gray-500 text-xs font-mono uppercase tracking-widest">Type</label>
                        <p className="text-white mt-1">{submission.submission_type}</p>
                      </div>
                      <div>
                        <label className="text-gray-500 text-xs font-mono uppercase tracking-widest">Stage</label>
                        <p className="text-white mt-1">{submission.project_stage}</p>
                      </div>
                      <div>
                        <label className="text-gray-500 text-xs font-mono uppercase tracking-widest">Genres</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {submission.genres?.map((genre, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-sm">
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-gray-500 text-xs font-mono uppercase tracking-widest">Logline</label>
                        <p className="text-white mt-1 leading-relaxed">{submission.logline}</p>
                      </div>
                      {submission.external_link && (
                        <div>
                          <label className="text-gray-500 text-xs font-mono uppercase tracking-widest">External Link</label>
                          <a 
                            href={submission.external_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-electric-blue hover:underline mt-1 flex items-center gap-2"
                          >
                            View Link <ExternalLink size={14} />
                          </a>
                        </div>
                      )}
                      {submission.message && (
                        <div>
                          <label className="text-gray-500 text-xs font-mono uppercase tracking-widest">Message</label>
                          <p className="text-gray-300 mt-1">{submission.message}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-800">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-sm mr-2">Set Status:</span>
                      {STATUS_OPTIONS.filter(s => s !== submission.status).map(status => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(submission, status)}
                          className={`px-3 py-1 rounded-full text-xs font-mono uppercase border transition-colors hover:opacity-80 ${STATUS_COLORS[status]}`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <a
                        href={`mailto:${submission.email}`}
                        className="p-2 text-gray-400 hover:text-electric-blue transition-colors"
                        title="Send Email"
                      >
                        <Mail size={18} />
                      </a>
                      <button
                        onClick={() => handleDelete(submission, true)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete Permanently"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
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

export default AdminSubmissionsTab;
