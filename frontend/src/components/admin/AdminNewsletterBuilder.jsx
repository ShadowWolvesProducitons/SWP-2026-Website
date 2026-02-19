import React, { useState, useEffect } from 'react';
import { 
  Plus, Mail, Send, RefreshCw, FileText, Edit2, Trash2, 
  Eye, Clock, CheckCircle, AlertCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import NewsletterBuilderModal from './NewsletterBuilderModal';

const API = process.env.REACT_APP_BACKEND_URL;

const AdminNewsletterBuilder = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingIssue, setEditingIssue] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewHtml, setPreviewHtml] = useState(null);
  const [filter, setFilter] = useState('all'); // all, draft, sent

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const url = filter === 'all' 
        ? `${API}/api/newsletter-builder/issues`
        : `${API}/api/newsletter-builder/issues?status=${filter}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setIssues(data);
      }
    } catch (err) {
      toast.error('Failed to load newsletter issues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleCreate = () => {
    setEditingIssue(null);
    setShowCreateModal(true);
  };

  const handleEdit = (issue) => {
    setEditingIssue(issue);
    setShowCreateModal(true);
  };

  const handleDelete = async (issueId) => {
    if (!window.confirm('Delete this newsletter draft? This cannot be undone.')) return;
    
    try {
      const response = await fetch(`${API}/api/newsletter-builder/issues/${issueId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        toast.success('Newsletter deleted');
        fetchIssues();
      }
    } catch (err) {
      toast.error('Failed to delete newsletter');
    }
  };

  const handlePreview = async (issueId) => {
    try {
      const response = await fetch(`${API}/api/newsletter-builder/issues/${issueId}/preview`, {
        method: 'POST'
      });
      if (response.ok) {
        const data = await response.json();
        setPreviewHtml(data.html);
      }
    } catch (err) {
      toast.error('Failed to generate preview');
    }
  };

  const handleSave = async () => {
    setShowCreateModal(false);
    setEditingIssue(null);
    fetchIssues();
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono uppercase bg-green-500/20 text-green-400 border border-green-500/40">
            <CheckCircle size={12} />
            Sent
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono uppercase bg-yellow-500/20 text-yellow-400 border border-yellow-500/40">
            <FileText size={12} />
            Draft
          </span>
        );
    }
  };

  return (
    <div data-testid="newsletter-builder">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Mail size={18} className="text-electric-blue" />
            Newsletter Builder
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Create and send newsletters using the block editor
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-smoke-gray border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:border-electric-blue focus:outline-none"
          >
            <option value="all">All Issues</option>
            <option value="draft">Drafts Only</option>
            <option value="sent">Sent Only</option>
          </select>
          
          <button
            onClick={handleCreate}
            data-testid="create-newsletter-btn"
            className="flex items-center gap-2 px-4 py-2 bg-electric-blue hover:bg-electric-blue/90 text-white rounded-lg transition-colors"
          >
            <Plus size={18} />
            New Newsletter
          </button>
          
          <button 
            onClick={fetchIssues}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Issues List */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-electric-blue animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading newsletters...</p>
        </div>
      ) : issues.length === 0 ? (
        <div className="text-center py-12 bg-smoke-gray border border-gray-800 rounded-lg">
          <Mail className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400">No newsletters yet</p>
          <p className="text-gray-600 text-sm mt-2">Create your first newsletter using the builder.</p>
          <button
            onClick={handleCreate}
            className="mt-4 px-6 py-2 bg-electric-blue hover:bg-electric-blue/90 text-white rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <Plus size={16} />
            Create Newsletter
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className="bg-smoke-gray border border-gray-800 rounded-lg p-5 hover:border-gray-700 transition-colors"
              data-testid={`newsletter-issue-${issue.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-white font-semibold truncate">{issue.title}</h4>
                    {getStatusBadge(issue.status)}
                  </div>
                  <p className="text-gray-400 text-sm truncate mb-2">
                    Subject: {issue.subject}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatDate(issue.created_at)}
                    </span>
                    {issue.status === 'sent' && issue.sent_count && (
                      <span className="flex items-center gap-1 text-green-400">
                        <Send size={12} />
                        Sent to {issue.sent_count} recipients
                      </span>
                    )}
                    <span className="text-gray-600">
                      {issue.blocks?.length || 0} content block{(issue.blocks?.length || 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handlePreview(issue.id)}
                    className="p-2 text-gray-400 hover:text-electric-blue transition-colors"
                    title="Preview"
                    data-testid={`preview-btn-${issue.id}`}
                  >
                    <Eye size={18} />
                  </button>
                  
                  {issue.status !== 'sent' && (
                    <>
                      <button
                        onClick={() => handleEdit(issue)}
                        className="p-2 text-gray-400 hover:text-electric-blue transition-colors"
                        title="Edit"
                        data-testid={`edit-btn-${issue.id}`}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(issue.id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete"
                        data-testid={`delete-btn-${issue.id}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <NewsletterBuilderModal
          issue={editingIssue}
          onClose={() => {
            setShowCreateModal(false);
            setEditingIssue(null);
          }}
          onSave={handleSave}
        />
      )}

      {/* Preview Modal */}
      {previewHtml && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
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

export default AdminNewsletterBuilder;
