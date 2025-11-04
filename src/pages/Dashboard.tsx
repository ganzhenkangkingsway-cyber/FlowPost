import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { TrendingUp, Calendar, Sparkles, Users, Clock, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getPlatformIcon } from '../config/platformIcons';

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    scheduledPosts: 0,
    totalPosts: 0,
    draftPosts: 0,
  });
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const [upcomingPosts, setUpcomingPosts] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadStats();
      loadConnectedAccounts();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    setProfile(data);
  };

  const loadStats = async () => {
    if (!user) return;
    const { data: posts } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id);

    if (posts) {
      const scheduled = posts.filter(p => p.status === 'scheduled');
      setStats({
        totalPosts: posts.length,
        scheduledPosts: scheduled.length,
        draftPosts: posts.filter(p => p.status === 'draft').length,
      });

      // Get the first 3 upcoming scheduled posts
      // Combine scheduled_date and scheduled_time into a full datetime
      const upcoming = scheduled
        .filter(p => p.scheduled_date)
        .map(p => ({
          ...p,
          fullScheduledDate: new Date(`${p.scheduled_date}T${p.scheduled_time || '12:00'}:00`)
        }))
        .filter(p => p.fullScheduledDate > new Date())
        .sort((a, b) => a.fullScheduledDate.getTime() - b.fullScheduledDate.getTime())
        .slice(0, 3);
      setUpcomingPosts(upcoming);
    }
  };

  const loadConnectedAccounts = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('user_id', user.id);

    if (data) {
      setConnectedAccounts(data);
    }
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  const formatScheduledTime = (post: any) => {
    // Combine scheduled_date and scheduled_time
    const date = post.fullScheduledDate || new Date(`${post.scheduled_date}T${post.scheduled_time || '12:00'}:00`);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffDays === 0 && diffHours < 24) {
      if (diffHours < 1) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return `In ${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
      }
      return `In ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    } else if (diffDays < 7) {
      return `In ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen gradient-bg-animated">
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {firstName}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Here's what's happening with your social media today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-850 rounded-2xl border border-gray-200 dark:border-gray-700 faux-neon-border p-6 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-blue-500/20 transition-all duration-300 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Active</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.scheduledPosts}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Scheduled Posts</p>
        </div>

        <div className="bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-850 rounded-2xl border border-gray-200 dark:border-gray-700 faux-neon-border p-6 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-green-500/20 transition-all duration-300 animate-fade-in-up animation-delay-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">Total</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.totalPosts}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Posts</p>
        </div>

        <div className="bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-850 rounded-2xl border border-gray-200 dark:border-gray-700 faux-neon-border p-6 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-blue-500/20 transition-all duration-300 animate-fade-in-up animation-delay-400">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">AI Ready</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.draftPosts}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Draft Posts</p>
        </div>

        <div className="bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-850 rounded-2xl border border-gray-200 dark:border-gray-700 faux-neon-border p-6 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-orange-500/20 transition-all duration-300 animate-fade-in-up animation-delay-600">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-500/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-sm font-medium text-orange-600 dark:text-orange-400">Connected</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{connectedAccounts.length}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Platforms</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-850 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/dashboard/create')}
            className="group p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-blue-500/20 focus-brand flex flex-col items-center justify-center text-center"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md dark:shadow-blue-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Create New Post</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Design and schedule content</p>
          </button>

          <button
            onClick={() => navigate('/dashboard/copywriting')}
            className="group p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-500 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-blue-500/20 focus-brand flex flex-col items-center justify-center text-center"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md dark:shadow-blue-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">AI Copywriting</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Optimize your captions</p>
          </button>

          <button
            onClick={() => navigate('/dashboard/analytics')}
            className="group p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-green-500 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-green-500/20 focus-brand flex flex-col items-center justify-center text-center"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md dark:shadow-green-500/30">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">View Analytics</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Track your performance</p>
          </button>

          <button
            onClick={() => navigate('/dashboard/team')}
            className="group p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-orange-500 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-orange-500/20 focus-brand flex flex-col items-center justify-center text-center"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md dark:shadow-orange-500/30">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Manage Team</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Collaborate with members</p>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-850 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upcoming Schedule</h2>
            <button
              onClick={() => navigate('/dashboard/schedule')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              View all
            </button>
          </div>

          {upcomingPosts.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">No scheduled posts yet</p>
              <button
                onClick={() => navigate('/dashboard/create')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors"
              >
                Create your first post
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl list-item-hover border border-transparent dark:border-gray-700/50 cursor-pointer"
                  onClick={() => navigate('/dashboard/schedule')}
                >
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                    {post.image_url ? (
                      <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                    ) : post.video_url ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {post.caption || 'Untitled Post'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatScheduledTime(post)}
                      </span>
                    </div>
                  </div>
                  {post.platforms && (
                    <div className="flex -space-x-2">
                      {post.platforms.slice(0, 3).map((platform: string, idx: number) => {
                        const platformInfo = getPlatformIcon(platform);
                        return (
                          <div
                            key={idx}
                            className={`w-6 h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800 ${platformInfo.bgColor}`}
                            title={platformInfo.name}
                          >
                            <img src={platformInfo.icon} alt={platformInfo.name} className={`w-3 h-3 ${platformInfo.iconClass}`} />
                          </div>
                        );
                      })}
                      {post.platforms.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center border-2 border-white dark:border-gray-800">
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">+{post.platforms.length - 3}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-850 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Performance</h2>
            <button
              onClick={() => navigate('/dashboard/analytics')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              View details
            </button>
          </div>

          {connectedAccounts.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">No connected platforms yet</p>
              <button
                onClick={() => navigate('/dashboard/settings')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors"
              >
                Connect your platforms
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {connectedAccounts.map((account) => {
                const platform = getPlatformIcon(account.platform);
                return (
                  <div key={account.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl list-item-hover border border-transparent dark:border-gray-700/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden ${platform.bgColor}`}>
                        <img src={platform.icon} alt={platform.name} className={`w-full h-full object-cover ${platform.iconClass}`} />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white block">{platform.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">@{account.platform_username}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">-</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">No data yet</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
