import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, Users, Inbox, MessageSquare, Briefcase, Film, FileText,
  TrendingUp, Mail, MousePointer, Eye, AlertCircle, CheckCircle,
  BarChart3, Activity, Clock
} from 'lucide-react';
import { toast } from 'sonner';

const AdminAnalyticsTab = () => {
  const [stats, setStats] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, campaignsRes, activityRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/dashboard`),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/campaigns`),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/recent-activity?limit=15`)
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (campaignsRes.ok) setCampaigns(await campaignsRes.json());
      if (activityRes.ok) setRecentActivity(await activityRes.json());
    } catch (err) {
      toast.error('Failed to load analytics');
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="w-8 h-8 text-electric-blue animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="text-electric-blue" />
            Analytics Dashboard
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Overview of site performance and email campaigns
          </p>
        </div>
        <button 
          onClick={fetchData} 
          className="p-2 text-gray-400 hover:text-white transition-colors" 
          title="Refresh"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-800 pb-4">
        {['overview', 'campaigns'].map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`px-4 py-2 rounded-lg font-mono text-sm uppercase tracking-widest transition-colors ${
              activeSection === section
                ? 'bg-electric-blue text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {section === 'overview' ? 'Overview' : 'Email Campaigns'}
          </button>
        ))}
      </div>

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

          {/* Recent Activity */}
          <div className="bg-smoke-gray border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock size={18} className="text-electric-blue" />
              Recent Activity
            </h3>
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-center gap-3 py-2 border-b border-gray-800/50 last:border-0">
                    <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{activity.description}</p>
                    </div>
                    <span className="text-gray-500 text-xs whitespace-nowrap">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

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
              <p className="text-gray-600 text-sm mt-2">Send your first newsletter from the Newsletter tab</p>
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
    // Open rate
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

export default AdminAnalyticsTab;
