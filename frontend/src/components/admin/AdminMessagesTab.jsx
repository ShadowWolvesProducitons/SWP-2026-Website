import React, { useState, useEffect } from 'react';
import { RefreshCw, Mail, Trash2, ChevronDown, ChevronUp, Eye, MessageSquare, Archive } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_OPTIONS = ['New', 'Read', 'Replied', 'Archived'];
const STATUS_COLORS = {
  'New': 'bg-electric-blue/20 text-electric-blue border-electric-blue/40',
  'Read': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  'Replied': 'bg-green-500/20 text-green-400 border-green-500/40',
  'Archived': 'bg-gray-500/20 text-gray-400 border-gray-500/40'
};

const AdminMessagesTab = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      let url = `${process.env.REACT_APP_BACKEND_URL}/api/contact`;
      if (filterStatus) {
        url += `?status=${filterStatus}`;
      }
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (err) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [filterStatus]);

  const handleStatusChange = async (message, newStatus) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/contact/${message.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        toast.success(`Status updated to ${newStatus}`);
        fetchMessages();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (message, permanent = false) => {
    const confirmMsg = permanent 
      ? `Permanently delete message from "${message.name}"? This cannot be undone.`
      : `Archive message from "${message.name}"?`;
    
    if (!window.confirm(confirmMsg)) return;

    try {
      const url = permanent 
        ? `${process.env.REACT_APP_BACKEND_URL}/api/contact/${message.id}?permanent=true`
        : `${process.env.REACT_APP_BACKEND_URL}/api/contact/${message.id}`;
      
      const response = await fetch(url, { method: 'DELETE' });
      if (response.ok) {
        toast.success(permanent ? 'Message deleted' : 'Message archived');
        fetchMessages();
      }
    } catch (err) {
      toast.error('Failed to delete message');
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

  const newCount = messages.filter(m => m.status === 'New').length;

  return (
    <div>
      {/* Actions Bar */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            Messages
            {newCount > 0 && (
              <span className="px-2 py-1 bg-electric-blue text-white text-xs rounded-full">
                {newCount} new
              </span>
            )}
          </h2>
          <p className="text-gray-500 text-sm mt-1">{messages.length} total messages</p>
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
            onClick={fetchMessages} 
            className="p-2 text-gray-400 hover:text-white transition-colors" 
            title="Refresh"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Messages List */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-electric-blue animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-12 bg-smoke-gray border border-gray-800 rounded-lg">
          <MessageSquare className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400">No messages found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`bg-smoke-gray border rounded-lg overflow-hidden transition-colors ${
                message.status === 'New' ? 'border-electric-blue/50' : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              {/* Header Row */}
              <div 
                className="px-6 py-4 flex items-center justify-between cursor-pointer"
                onClick={() => toggleExpand(message.id)}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Status Badge */}
                  <span className={`px-3 py-1 rounded-full text-xs font-mono uppercase border ${STATUS_COLORS[message.status]}`}>
                    {message.status}
                  </span>
                  
                  {/* Name & Email */}
                  <div className="min-w-0">
                    <h3 className="text-white font-semibold truncate">{message.name}</h3>
                    <p className="text-gray-500 text-sm truncate">{message.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Service Type */}
                  {message.service && (
                    <div className="hidden md:block text-right">
                      <p className="text-gray-400 text-sm capitalize">{message.service.replace('-', ' ')}</p>
                    </div>
                  )}
                  
                  {/* Date */}
                  <div className="hidden lg:block text-right">
                    <p className="text-gray-500 text-sm">{formatDate(message.created_at)}</p>
                  </div>

                  {/* Expand Icon */}
                  {expandedId === message.id ? (
                    <ChevronUp size={20} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {expandedId === message.id && (
                <div className="px-6 py-6 border-t border-gray-800 bg-black/30">
                  <div className="space-y-4">
                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-gray-500 text-xs font-mono uppercase tracking-widest">Email</label>
                        <p className="text-white mt-1">
                          <a href={`mailto:${message.email}`} className="text-electric-blue hover:underline">
                            {message.email}
                          </a>
                        </p>
                      </div>
                      {message.phone && (
                        <div>
                          <label className="text-gray-500 text-xs font-mono uppercase tracking-widest">Phone</label>
                          <p className="text-white mt-1">{message.phone}</p>
                        </div>
                      )}
                      {message.service && (
                        <div>
                          <label className="text-gray-500 text-xs font-mono uppercase tracking-widest">Project Type</label>
                          <p className="text-white mt-1 capitalize">{message.service.replace('-', ' ')}</p>
                        </div>
                      )}
                    </div>

                    {/* Message */}
                    <div>
                      <label className="text-gray-500 text-xs font-mono uppercase tracking-widest">Message</label>
                      <p className="text-gray-300 mt-2 whitespace-pre-wrap leading-relaxed">{message.message}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-800">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-gray-500 text-sm mr-2">Set Status:</span>
                      {STATUS_OPTIONS.filter(s => s !== message.status).map(status => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(message, status)}
                          className={`px-3 py-1 rounded-full text-xs font-mono uppercase border transition-colors hover:opacity-80 ${STATUS_COLORS[status]}`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <a
                        href={`mailto:${message.email}?subject=Re: Your inquiry to Shadow Wolves Productions`}
                        className="flex items-center gap-2 px-4 py-2 bg-electric-blue/20 text-electric-blue rounded-lg hover:bg-electric-blue/30 transition-colors text-sm"
                      >
                        <Mail size={16} />
                        Reply
                      </a>
                      <button
                        onClick={() => handleDelete(message, true)}
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

export default AdminMessagesTab;
