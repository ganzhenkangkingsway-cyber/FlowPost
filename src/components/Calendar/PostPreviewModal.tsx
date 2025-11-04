import { useState } from 'react';
import { X, Calendar, Clock, Edit, Trash2 } from 'lucide-react';
import { PlatformIcon } from './PlatformIcon';
import { supabase } from '../../lib/supabase';

interface Post {
  id: string;
  scheduled_date: string;
  scheduled_time: string;
  caption: string;
  platforms: string[];
  image_url: string | null;
  video_url?: string | null;
  media_type?: 'image' | 'video' | null;
  status: 'scheduled' | 'published' | 'draft';
  platform_accounts: { [key: string]: string };
}

interface PostPreviewModalProps {
  post: Post;
  onClose: () => void;
  onReschedule: () => void;
}

export function PostPreviewModal({ post, onClose, onReschedule }: PostPreviewModalProps) {
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState(post.scheduled_date);
  const [newTime, setNewTime] = useState(post.scheduled_time);
  const [deleting, setDeleting] = useState(false);

  const handleReschedule = async () => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({
          scheduled_date: newDate,
          scheduled_time: newTime,
        })
        .eq('id', post.id);

      if (error) throw error;

      onReschedule();
      onClose();
    } catch (error) {
      console.error('Error rescheduling post:', error);
      alert('Failed to reschedule post');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      setDeleting(true);
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;

      onReschedule();
      onClose();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Post Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                post.status === 'published'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : post.status === 'scheduled'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
              }`}
            >
              {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
            </span>
          </div>

          {(post.image_url || post.video_url) && (
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              {post.media_type === 'video' && post.video_url ? (
                <video
                  src={post.video_url}
                  controls
                  className="w-full h-auto object-cover"
                >
                  Your browser does not support the video tag.
                </video>
              ) : post.image_url ? (
                <img
                  src={post.image_url}
                  alt="Post content"
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
                />
              ) : null}
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Caption</h3>
            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{post.caption}</p>
          </div>

          {!isRescheduling ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="font-medium">{formatDate(post.scheduled_date)}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <Clock className="w-5 h-5 text-gray-500" />
                <span className="font-medium">{post.scheduled_time}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Date
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Time
                </label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Platforms
            </h3>
            <div className="flex flex-wrap gap-3">
              {post.platforms.map((platform) => (
                <div
                  key={platform}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <PlatformIcon platform={platform} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {platform}
                    </p>
                    {post.platform_accounts[platform] && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        @{post.platform_accounts[platform]}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {post.status === 'scheduled' && (
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              {!isRescheduling ? (
                <>
                  <button
                    onClick={() => setIsRescheduling(true)}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Reschedule
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleReschedule}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setIsRescheduling(false);
                      setNewDate(post.scheduled_date);
                      setNewTime(post.scheduled_time);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
