import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PlatformIcon } from './PlatformIcon';

interface Post {
  id: string;
  scheduled_date: string;
  scheduled_time: string;
  caption: string;
  platforms: string[];
  image_url: string | null;
  status: 'scheduled' | 'published' | 'draft';
  platform_accounts: { [key: string]: string };
}

interface DayCellProps {
  date: Date | null;
  posts: Post[];
  isToday: boolean;
  isSelected: boolean;
  onClick: () => void;
  onPostClick: (post: Post) => void;
  onCreatePost: () => void;
}

export function DayCell({
  date,
  posts,
  isToday,
  isSelected,
  onClick,
  onPostClick,
  onCreatePost,
}: DayCellProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!date) {
    return <div className="min-h-[120px] p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"></div>;
  }

  const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
  const scheduledPosts = posts.filter(p => p.status === 'scheduled');
  const publishedPosts = posts.filter(p => p.status === 'published');

  const allPlatforms = [...new Set(posts.flatMap(p => p.platforms))];

  return (
    <div
      className={`min-h-[120px] p-3 rounded-lg border transition-all cursor-pointer group relative ${
        isToday
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : isSelected
          ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/10'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
      }`}
      onClick={onClick}
      onMouseEnter={() => posts.length > 0 && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex flex-col h-full">
        <div className="mb-2">
          <span
            className={`text-sm ${
              isToday
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : isPast
                ? 'text-gray-400 dark:text-gray-600'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {date.getDate()}
          </span>
        </div>

        {posts.length > 0 && (
          <div className="flex-1 flex flex-col gap-2 overflow-hidden">
            {posts.slice(0, 3).map((post) => (
              <button
                key={post.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onPostClick(post);
                }}
                className={`text-left px-2 py-1.5 rounded text-xs transition-all hover:shadow-sm font-medium flex items-center justify-between gap-2 ${
                  post.status === 'published'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span className="font-semibold whitespace-nowrap">{post.scheduled_time}</span>
                  <span className="text-xs opacity-70">-</span>
                  <span className="truncate">{post.platforms[0]}</span>
                </div>
                {post.platforms.length > 1 && (
                  <span className="text-xs opacity-70 whitespace-nowrap">+{post.platforms.length - 1}</span>
                )}
              </button>
            ))}
            {posts.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400 px-2">
                +{posts.length - 3} more
              </span>
            )}
          </div>
        )}

      </div>

      {showTooltip && posts.length > 0 && (
        <div className="absolute left-full top-0 ml-3 z-50 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="space-y-3">
            {posts.slice(0, 3).map((post) => (
              <div
                key={post.id}
                className="flex gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  onPostClick(post);
                }}
              >
                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt="Post thumbnail"
                    className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">
                      {post.scheduled_time}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        post.status === 'published'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      }`}
                    >
                      {post.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                    {post.caption}
                  </p>
                  <div className="flex gap-1 flex-wrap">
                    {post.platforms.map((platform) => (
                      <PlatformIcon key={platform} platform={platform} size="xs" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {posts.length > 3 && (
              <p className="text-xs text-center text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                +{posts.length - 3} more posts
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
