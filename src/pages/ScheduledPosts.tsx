import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Clock, Calendar, Trash2, Edit, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getPlatformIcon } from '../config/platformIcons';

interface ScheduledPost {
  id: string;
  scheduled_date: string;
  scheduled_time: string;
  caption: string;
  platforms: string[];
  image_url: string | null;
  video_url: string | null;
  status: string;
  created_at: string;
  platform_accounts: { [key: string]: string };
}

export function ScheduledPosts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);

  useEffect(() => {
    if (user) {
      loadScheduledPosts();
    }
  }, [user]);

  const loadScheduledPosts = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'scheduled')
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true });

      if (error) throw error;

      const now = new Date();
      const futurePosts = (data || []).filter(post => {
        const postDateTime = new Date(`${post.scheduled_date}T${post.scheduled_time || '00:00'}:00`);
        return postDateTime >= now;
      });

      setPosts(futurePosts);
    } catch (error) {
      console.error('Error loading scheduled posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date: string, time: string) => {
    const dateTime = new Date(`${date}T${time || '00:00'}:00`);
    return dateTime.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getTimeUntil = (date: string, time: string) => {
    const postDateTime = new Date(`${date}T${time || '00:00'}:00`);
    const now = new Date();
    const diffMs = postDateTime.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) {
      return `In ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `In ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    } else if (diffMins > 0) {
      return `In ${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
    } else {
      return 'Very soon';
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this scheduled post?')) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(posts.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  const handleEdit = (postId: string) => {
    navigate(`/dashboard/create?edit=${postId}`);
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen gradient-bg-animated">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Scheduled Posts</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your upcoming social media posts</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Clock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No scheduled posts yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create and schedule your first post to see it here
          </p>
          <button
            onClick={() => navigate('/dashboard/create')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-medium hover:scale-105 transition-transform shadow-lg"
          >
            Create Your First Post
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex gap-6">
                <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden flex-shrink-0">
                  {post.image_url ? (
                    <img
                      src={post.image_url}
                      alt="Post preview"
                      className="w-full h-full object-cover"
                    />
                  ) : post.video_url ? (
                    <video
                      src={post.video_url}
                      className="w-full h-full object-cover"
                      muted
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
                          Scheduled
                        </span>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">{getTimeUntil(post.scheduled_date, post.scheduled_time)}</span>
                        </div>
                      </div>
                      <p className="text-gray-900 dark:text-white font-medium mb-1">
                        {formatDateTime(post.scheduled_date, post.scheduled_time)}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedPost(post)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleEdit(post.id)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Edit post"
                      >
                        <Edit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete post"
                      >
                        <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                    {post.caption || 'No caption'}
                  </p>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Posting to:</span>
                    <div className="flex gap-2">
                      {post.platforms.map((platform) => {
                        const platformInfo = getPlatformIcon(platform);
                        return (
                          <div
                            key={platform}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${platformInfo.bgColor}`}
                            title={platformInfo.name}
                          >
                            <img
                              src={platformInfo.icon}
                              alt={platformInfo.name}
                              className={`w-4 h-4 ${platformInfo.iconClass}`}
                            />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              {post.platform_accounts?.[platform] || platformInfo.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPost && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Post Details</h3>
            </div>
            <div className="p-6">
              <div className="mb-6">
                {selectedPost.image_url && (
                  <img
                    src={selectedPost.image_url}
                    alt="Post"
                    className="w-full rounded-xl mb-4"
                  />
                )}
                {selectedPost.video_url && (
                  <video
                    src={selectedPost.video_url}
                    controls
                    className="w-full rounded-xl mb-4"
                  />
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                    Scheduled For
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {formatDateTime(selectedPost.scheduled_date, selectedPost.scheduled_time)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                    Caption
                  </label>
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {selectedPost.caption || 'No caption'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">
                    Platforms
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedPost.platforms.map((platform) => {
                      const platformInfo = getPlatformIcon(platform);
                      return (
                        <div
                          key={platform}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg ${platformInfo.bgColor}`}
                        >
                          <img
                            src={platformInfo.icon}
                            alt={platformInfo.name}
                            className={`w-5 h-5 ${platformInfo.iconClass}`}
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {selectedPost.platform_accounts?.[platform] || platformInfo.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setSelectedPost(null);
                    handleEdit(selectedPost.id);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  Edit Post
                </button>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
