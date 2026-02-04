import React, { useState, useEffect } from 'react';
import { RefreshCw, Trash2, Download, Users, Mail, CheckCircle, XCircle, Send, X } from 'lucide-react';
import { toast } from 'sonner';

const AdminNewsletterTab = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  const [showComposeModal, setShowComposeModal] = useState(false);

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
          
          {/* Compose Email Button */}
          <button
            onClick={() => setShowComposeModal(true)}
            disabled={activeCount === 0}
            className="flex items-center gap-2 px-4 py-2 bg-electric-blue hover:bg-electric-blue/90 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            data-testid="compose-email-btn"
          >
            <Send size={16} />
            Compose Email
          </button>
          
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

      {/* Compose Email Modal */}
      <ComposeEmailModal
        isOpen={showComposeModal}
        onClose={() => setShowComposeModal(false)}
        subscriberCount={activeCount}
      />
    </div>
  );
};


// Compose Email Modal Component
const ComposeEmailModal = ({ isOpen, onClose, subscriberCount }) => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [result, setResult] = useState(null);

  const handleSend = async () => {
    if (!subject.trim()) {
      toast.error('Subject is required');
      return;
    }
    if (!content.trim()) {
      toast.error('Email content is required');
      return;
    }

    // Convert plain text to HTML paragraphs
    const htmlContent = content
      .split('\n\n')
      .map(p => `<p style="color: #9ca3af; line-height: 1.6; margin-bottom: 16px;">${p.replace(/\n/g, '<br />')}</p>`)
      .join('');

    setSending(true);
    setResult(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/newsletter/send-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          html_content: htmlContent,
          test_mode: testMode
        })
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        if (data.sent > 0) {
          toast.success(`Email sent to ${data.sent} subscriber${data.sent !== 1 ? 's' : ''}`);
        }
        if (data.failed > 0) {
          toast.error(`Failed to send to ${data.failed} subscriber${data.failed !== 1 ? 's' : ''}`);
        }
      } else {
        toast.error(data.detail || 'Failed to send emails');
      }
    } catch (err) {
      toast.error('Error sending emails');
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setSubject('');
    setContent('');
    setTestMode(false);
    setResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative bg-smoke-gray border border-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-smoke-gray border-b border-gray-800 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Send size={20} className="text-electric-blue" />
              Compose Newsletter
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Send to {subscriberCount} active subscriber{subscriberCount !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={handleClose} className="p-2 text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Subject */}
          <div>
            <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
              Subject *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Your email subject line..."
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none"
              data-testid="email-subject-input"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-gray-400 text-sm font-mono uppercase tracking-widest mb-2">
              Message *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your newsletter content here...

Use blank lines to separate paragraphs."
              rows={10}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-electric-blue focus:outline-none resize-none font-sans"
              data-testid="email-content-input"
            />
            <p className="text-gray-600 text-xs mt-2">
              Plain text will be converted to styled HTML. Use blank lines to create paragraphs.
            </p>
          </div>

          {/* Test Mode Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="testMode"
              checked={testMode}
              onChange={(e) => setTestMode(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-black text-electric-blue focus:ring-electric-blue"
            />
            <label htmlFor="testMode" className="text-gray-400 text-sm cursor-pointer">
              <span className="text-white">Test Mode</span> — Send to only one subscriber first
            </label>
          </div>

          {/* Result Display */}
          {result && (
            <div className={`rounded-lg p-4 border ${
              result.failed === 0 
                ? 'bg-green-500/10 border-green-500/30' 
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-400">Total: {result.total}</span>
                <span className="text-green-400">Sent: {result.sent}</span>
                {result.failed > 0 && <span className="text-red-400">Failed: {result.failed}</span>}
              </div>
              {result.errors && result.errors.length > 0 && (
                <div className="mt-3 text-xs text-red-400/80">
                  <p className="font-medium mb-1">Errors:</p>
                  {result.errors.map((err, i) => (
                    <p key={i} className="truncate">{err}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-smoke-gray border-t border-gray-800 px-6 py-4 flex gap-4">
          <button
            onClick={handleClose}
            className="flex-1 px-6 py-3 border border-gray-700 text-gray-400 rounded-full hover:bg-gray-800 transition-colors font-mono text-sm uppercase tracking-widest"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !subject.trim() || !content.trim()}
            className="flex-1 px-6 py-3 bg-electric-blue hover:bg-electric-blue/90 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-full transition-colors font-mono text-sm uppercase tracking-widest flex items-center justify-center gap-2"
            data-testid="send-email-btn"
          >
            {sending ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send size={16} />
                {testMode ? 'Send Test' : 'Send to All'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminNewsletterTab;
