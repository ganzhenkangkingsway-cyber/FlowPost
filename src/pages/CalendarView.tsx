import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Filter, Clock, Trash2, Edit, Eye, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { PostPreviewModal } from '../components/Calendar/PostPreviewModal';
import { DayCell } from '../components/Calendar/DayCell';
import { PlatformFilter } from '../components/Calendar/PlatformFilter';
import { getPlatformIcon } from '../config/platformIcons';

interface ScheduledPost {
  id: string;
  scheduled_date: string;
  scheduled_time: string;
  caption: string;
  platforms: string[];
  image_url: string | null;
  video_url: string | null;
  status: 'scheduled' | 'published' | 'draft';
  platform_accounts: { [key: string]: string };
  created_at?: string;
}

export function CalendarView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [currentDate, user]);

  const loadPosts = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .in('status', ['scheduled', 'published'])
        .gte('scheduled_date', startOfMonth.toISOString().split('T')[0])
        .lte('scheduled_date', endOfMonth.toISOString().split('T')[0])
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getPostsForDate = (date: Date | null) => {
    if (!date) return [];

    const dateStr = date.toISOString().split('T')[0];
    let filteredPosts = posts.filter(post => post.scheduled_date === dateStr);

    if (selectedPlatforms.length > 0) {
      filteredPosts = filteredPosts.filter(post =>
        post.platforms.some(p => selectedPlatforms.includes(p))
      );
    }

    return filteredPosts;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date: Date | null) => {
    if (!date) return;
    setSelectedDate(date);
  };

  const handleCreatePost = (date?: Date) => {
    if (date) {
      const dateStr = date.toISOString().split('T')[0];
      navigate(`/dashboard/create?date=${dateStr}`);
    } else {
      navigate('/dashboard/create');
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

  const scheduledPosts = posts.filter(p => {
    const postDateTime = new Date(`${p.scheduled_date}T${p.scheduled_time || '00:00'}:00`);
    return postDateTime >= new Date() && p.status === 'scheduled';
  }).sort((a, b) => {
    const dateA = new Date(`${a.scheduled_date}T${a.scheduled_time || '00:00'}:00`);
    const dateB = new Date(`${b.scheduled_date}T${b.scheduled_time || '00:00'}:00`);
    return dateA.getTime() - dateB.getTime();
  });

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const days = getDaysInMonth();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen gradient-bg-animated">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <ChevronLeft className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendar</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your scheduled posts</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                showFilters || selectedPlatforms.length > 0
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filter
              {selectedPlatforms.length > 0 && (
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {selectedPlatforms.length}
                </span>
              )}
            </button>
            <button
              onClick={() => handleCreatePost()}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-medium hover:scale-105 transition-transform flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Create Post
            </button>
          </div>
        </div>

        {showFilters && (
          <PlatformFilter
            selectedPlatforms={selectedPlatforms}
            onPlatformToggle={(platform) => {
              setSelectedPlatforms(prev =>
                prev.includes(platform)
                  ? prev.filter(p => p !== platform)
                  : [...prev, platform]
              );
            }}
          />
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white min-w-[200px] text-center">
              {monthName}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
          >
            Today
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(day => (
            <div key={day} className="text-center font-semibold text-gray-600 dark:text-gray-400 text-sm py-2">
              {day}
            </div>
          ))}

          {days.map((day, index) => {
            const dayPosts = getPostsForDate(day);
            return (
              <DayCell
                key={index}
                date={day}
                posts={dayPosts}
                isToday={
                  day?.toDateString() === new Date().toDateString()
                }
                isSelected={
                  selectedDate?.toDateString() === day?.toDateString()
                }
                onClick={() => handleDateClick(day)}
                onPostClick={(post) => setSelectedPost(post)}
                onCreatePost={() => day && handleCreatePost(day)}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upcoming Scheduled Posts</h2>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {scheduledPosts.length} {scheduledPosts.length === 1 ? 'post' : 'posts'}
          </span>
        </div>

        {scheduledPosts.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No scheduled posts</h3>
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
          <div className="space-y-4">
            {scheduledPosts.map((post) => (
              <div
                key={post.id}
                className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:shadow-md transition-all duration-300 border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
              >
                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
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
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-semibold">
                          Scheduled
                        </span>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">{getTimeUntil(post.scheduled_date, post.scheduled_time)}</span>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatDateTime(post.scheduled_date, post.scheduled_time)}
                      </p>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setSelectedPost(post)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleEdit(post.id)}
                        className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Edit post"
                      >
                        <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete post"
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                    {post.caption || 'No caption'}
                  </p>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Posting to:</span>
                    <div className="flex gap-2 flex-wrap">
                      {post.platforms.map((platform) => {
                        const platformInfo = getPlatformIcon(platform);
                        return (
                          <div
                            key={platform}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${platformInfo.bgColor}`}
                            title={platformInfo.name}
                          >
                            <img
                              src={platformInfo.icon}
                              alt={platformInfo.name}
                              className={`w-3.5 h-3.5 ${platformInfo.iconClass}`}
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
            ))}
          </div>
        )}
      </div>

      {selectedPost && (
        <PostPreviewModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onReschedule={loadPosts}
        />
      )}
    </div>
  );
}
