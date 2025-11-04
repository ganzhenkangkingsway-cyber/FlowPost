import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Eye, Heart, Share2, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface AnalyticsData {
  totalReach: number;
  totalEngagement: number;
  totalShares: number;
  engagementRate: number;
  reachTrend: number;
  engagementTrend: number;
  sharesTrend: number;
  rateTrend: number;
}

interface PlatformData {
  name: string;
  engagement: number;
  reach: number;
  color: string;
  trend: number;
}

interface TopPost {
  id: string;
  caption: string;
  image_url: string | null;
  video_url?: string | null;
  media_type?: 'image' | 'video' | null;
  created_at: string;
  total_engagement: number;
  total_shares: number;
  total_reach: number;
}

export function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalReach: 0,
    totalEngagement: 0,
    totalShares: 0,
    engagementRate: 0,
    reachTrend: 0,
    engagementTrend: 0,
    sharesTrend: 0,
    rateTrend: 0,
  });
  const [platforms, setPlatforms] = useState<PlatformData[]>([]);
  const [topPosts, setTopPosts] = useState<TopPost[]>([]);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      // Fetch current week analytics
      const { data: currentWeekData, error: currentError } = await supabase
        .from('post_analytics')
        .select('reach, engagement, shares, platform')
        .eq('user_id', user.id)
        .gte('recorded_at', oneWeekAgo.toISOString());

      if (currentError) throw currentError;

      // Fetch previous week analytics for trend calculation
      const { data: previousWeekData, error: previousError } = await supabase
        .from('post_analytics')
        .select('reach, engagement, shares, platform')
        .eq('user_id', user.id)
        .gte('recorded_at', twoWeeksAgo.toISOString())
        .lt('recorded_at', oneWeekAgo.toISOString());

      if (previousError) throw previousError;

      // Calculate totals for current week
      const currentTotals = {
        reach: currentWeekData?.reduce((sum, item) => sum + (item.reach || 0), 0) || 0,
        engagement: currentWeekData?.reduce((sum, item) => sum + (item.engagement || 0), 0) || 0,
        shares: currentWeekData?.reduce((sum, item) => sum + (item.shares || 0), 0) || 0,
      };

      // Calculate totals for previous week
      const previousTotals = {
        reach: previousWeekData?.reduce((sum, item) => sum + (item.reach || 0), 0) || 0,
        engagement: previousWeekData?.reduce((sum, item) => sum + (item.engagement || 0), 0) || 0,
        shares: previousWeekData?.reduce((sum, item) => sum + (item.shares || 0), 0) || 0,
      };

      // Calculate trends (percentage change)
      const calculateTrend = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
      };

      const engagementRate = currentTotals.reach > 0
        ? (currentTotals.engagement / currentTotals.reach) * 100
        : 0;

      const previousEngagementRate = previousTotals.reach > 0
        ? (previousTotals.engagement / previousTotals.reach) * 100
        : 0;

      setAnalytics({
        totalReach: currentTotals.reach,
        totalEngagement: currentTotals.engagement,
        totalShares: currentTotals.shares,
        engagementRate: Math.round(engagementRate * 10) / 10,
        reachTrend: calculateTrend(currentTotals.reach, previousTotals.reach),
        engagementTrend: calculateTrend(currentTotals.engagement, previousTotals.engagement),
        sharesTrend: calculateTrend(currentTotals.shares, previousTotals.shares),
        rateTrend: calculateTrend(engagementRate, previousEngagementRate),
      });

      // Calculate platform-specific data
      const platformMap = new Map<string, { engagement: number; reach: number }>();
      const previousPlatformMap = new Map<string, number>();

      currentWeekData?.forEach(item => {
        const current = platformMap.get(item.platform) || { engagement: 0, reach: 0 };
        platformMap.set(item.platform, {
          engagement: current.engagement + (item.engagement || 0),
          reach: current.reach + (item.reach || 0),
        });
      });

      previousWeekData?.forEach(item => {
        const current = previousPlatformMap.get(item.platform) || 0;
        previousPlatformMap.set(item.platform, current + (item.engagement || 0));
      });

      const platformColors: Record<string, string> = {
        X: 'from-gray-800 to-gray-900',
        LinkedIn: 'from-blue-600 to-blue-700',
        Facebook: 'from-blue-500 to-blue-600',
        Instagram: 'from-yellow-400 via-pink-500 to-pink-600',
        YouTube: 'from-red-500 to-red-600',
        TikTok: 'from-gray-900 to-black',
      };

      const platformsData = Array.from(platformMap.entries()).map(([name, data]) => ({
        name,
        engagement: data.engagement,
        reach: data.reach,
        color: platformColors[name] || 'from-gray-500 to-gray-600',
        trend: calculateTrend(data.engagement, previousPlatformMap.get(name) || 0),
      }));

      setPlatforms(platformsData);

      // Fetch top performing posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          caption,
          image_url,
          created_at
        `)
        .eq('user_id', user.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(10);

      if (postsError) throw postsError;

      // Get analytics for each post
      const postsWithAnalytics = await Promise.all(
        (postsData || []).map(async (post) => {
          const { data: analyticsData } = await supabase
            .from('post_analytics')
            .select('engagement, shares, reach')
            .eq('post_id', post.id);

          const totals = analyticsData?.reduce(
            (sum, item) => ({
              engagement: sum.engagement + (item.engagement || 0),
              shares: sum.shares + (item.shares || 0),
              reach: sum.reach + (item.reach || 0),
            }),
            { engagement: 0, shares: 0, reach: 0 }
          ) || { engagement: 0, shares: 0, reach: 0 };

          return {
            ...post,
            total_engagement: totals.engagement,
            total_shares: totals.shares,
            total_reach: totals.reach,
          };
        })
      );

      // Sort by total engagement and take top 3
      const sortedPosts = postsWithAnalytics
        .sort((a, b) => b.total_engagement - a.total_engagement)
        .slice(0, 3);

      setTopPosts(sortedPosts);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getTimeSince = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen gradient-bg-animated">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400">Track your social media performance</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className={`flex items-center gap-1 text-sm font-medium ${
              analytics.reachTrend >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {analytics.reachTrend >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              {Math.abs(analytics.reachTrend)}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {formatNumber(analytics.totalReach)}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Reach</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            </div>
            <span className={`flex items-center gap-1 text-sm font-medium ${
              analytics.engagementTrend >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {analytics.engagementTrend >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              {Math.abs(analytics.engagementTrend)}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {formatNumber(analytics.totalEngagement)}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Engagement</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Share2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <span className={`flex items-center gap-1 text-sm font-medium ${
              analytics.sharesTrend >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {analytics.sharesTrend >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              {Math.abs(analytics.sharesTrend)}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {formatNumber(analytics.totalShares)}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Shares</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <span className={`flex items-center gap-1 text-sm font-medium ${
              analytics.rateTrend >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {analytics.rateTrend >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              {Math.abs(analytics.rateTrend)}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {analytics.engagementRate}%
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Engagement Rate</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Platform Performance</h2>
          {platforms.length > 0 ? (
            <div className="space-y-6">
              {platforms.map((platform) => (
                <div key={platform.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{platform.name}</span>
                    <span className={`flex items-center gap-1 text-sm font-medium ${
                      platform.trend >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {platform.trend >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {Math.abs(platform.trend)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${platform.color}`}
                          style={{ width: `${Math.min((platform.engagement / (Math.max(...platforms.map(p => p.engagement)) || 1)) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white min-w-[60px] text-right">
                      {platform.engagement}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No platform data available yet. Start posting to see your analytics!
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Best Performing Posts</h2>
          {topPosts.length > 0 ? (
            <div className="space-y-4">
              {topPosts.map((post) => (
                <div key={post.id} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  {post.media_type === 'video' && post.video_url ? (
                    <video src={post.video_url} className="w-16 h-16 rounded-lg object-cover" />
                  ) : post.image_url ? (
                    <img src={post.image_url} alt="" className="w-16 h-16 rounded-lg object-cover" />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg"></div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                      {post.caption || 'Untitled Post'}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      Posted {getTimeSince(post.created_at)}
                    </p>
                    <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" /> {post.total_engagement}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="w-3 h-3" /> {post.total_shares}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {formatNumber(post.total_reach)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No posts available yet. Create and publish posts to see your top performers!
            </div>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-800 rounded-2xl border border-blue-200 dark:border-gray-700 p-8 text-center">
        <TrendingUp className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {analytics.engagementTrend > 0 ? 'Keep Growing!' : 'Stay Consistent!'}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {analytics.engagementTrend > 0
            ? `Your engagement is up ${analytics.engagementTrend}% this week. Keep posting consistently for better results.`
            : 'Keep posting quality content consistently to improve your engagement and reach.'}
        </p>
      </div>
    </div>
  );
}
