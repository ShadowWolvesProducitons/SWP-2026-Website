import React, { useState, useEffect } from 'react';
import { RefreshCw, Trash2, Download, Users, Mail, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const AdminNewsletterTab = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const url = `${process.env.REACT_APP_BACKEND_URL}/api/newsletter?active_only=${!showInactive}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setSubscribers(data);
      }
    } catch (err) {
      toast.error('Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [showInactive]);

  const handleUnsubscribe = async (email) => {
    if (!window.confirm(`Unsubscribe "${email}"?`)) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/newsletter/${encodeURIComponent(email)}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        toast.success('Unsubscribed');
        fetchSubscribers();
      }
    } catch (err) {
      toast.error('Failed to unsubscribe');
    }
  };

  const handleExport = () => {
    const activeSubscribers = subscribers.filter(s => s.is_active);
    const emails = activeSubscribers.map(s => s.email).join('\n');
    
    const blob = new Blob([emails], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success(`Exported ${activeSubscribers.length} emails`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-AU', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric'
    });
  };

  const activeCount = subscribers.filter(s => s.is_active).length;

  return (
    <div>
      {/* Actions Bar */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            Newsletter Subscribers
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {activeCount} active subscriber{activeCount !== 1 ? 's' : ''}
            {showInactive && ` (${subscribers.length - activeCount} unsubscribed)`}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Show Inactive Toggle */}
          <label className="flex items-center gap-2 text-gray-400 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-gray-600 bg-black text-electric-blue focus:ring-electric-blue"
            />
            Show unsubscribed
          </label>
          
          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={activeCount === 0}
            className="flex items-center gap-2 px-4 py-2 bg-electric-blue/20 text-electric-blue rounded-lg hover:bg-electric-blue/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <Download size={16} />
            Export
          </button>
          
          <button 
            onClick={fetchSubscribers} 
            className="p-2 text-gray-400 hover:text-white transition-colors" 
            title="Refresh"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Subscribers List */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-electric-blue animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : subscribers.length === 0 ? (
        <div className="text-center py-12 bg-smoke-gray border border-gray-800 rounded-lg">
          <Users className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400">No subscribers yet</p>
          <p className="text-gray-600 text-sm mt-2">Subscribers will appear here when they sign up via the website.</p>
        </div>
      ) : (
        <div className="bg-smoke-gray border border-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-6 py-4 text-gray-400 font-mono text-xs uppercase tracking-widest">Email</th>
                <th className="text-left px-6 py-4 text-gray-400 font-mono text-xs uppercase tracking-widest">Source</th>
                <th className="text-left px-6 py-4 text-gray-400 font-mono text-xs uppercase tracking-widest">Status</th>
                <th className="text-left px-6 py-4 text-gray-400 font-mono text-xs uppercase tracking-widest">Subscribed</th>
                <th className="text-right px-6 py-4 text-gray-400 font-mono text-xs uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="border-b border-gray-800/50 hover:bg-black/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-gray-600" />
                      <a href={`mailto:${subscriber.email}`} className="text-white hover:text-electric-blue transition-colors">
                        {subscriber.email}
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm capitalize">
                    {subscriber.source?.replace('_', ' ') || 'Website'}
                  </td>
                  <td className="px-6 py-4">
                    {subscriber.is_active ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono uppercase bg-green-500/20 text-green-400 border border-green-500/40">
                        <CheckCircle size={12} />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono uppercase bg-gray-500/20 text-gray-400 border border-gray-500/40">
                        <XCircle size={12} />
                        Unsubscribed
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(subscriber.subscribed_at)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end">
                      {subscriber.is_active && (
                        <button
                          onClick={() => handleUnsubscribe(subscriber.email)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                          title="Unsubscribe"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminNewsletterTab;
