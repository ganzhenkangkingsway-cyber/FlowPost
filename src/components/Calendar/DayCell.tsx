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
    return <div className="aspect-square p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg"></div>;
  }

  const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
  const scheduledPosts = posts.filter(p => p.status === 'scheduled');
  const publishedPosts = posts.filter(p => p.status === 'published');

  const allPlatforms = [...new Set(posts.flatMap(p => p.platforms))];

  return (
    <div
      className={`aspect-square p-2 rounded-lg border-2 transition-all cursor-pointer group relative ${
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
        <div className="flex items-center justify-between mb-1">
          <span
            className={`text-sm font-medium ${
              isToday
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : isPast
                ? 'text-gray-400 dark:text-gray-600'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {date.getDate()}
          </span>
          {posts.length === 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCreatePost();
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <Plus className="w-3 h-3 text-gray-500" />
            </button>
          )}
        </div>

        {posts.length > 0 && (
          <div className="flex-1 flex flex-col gap-1 overflow-hidden">
            {posts.slice(0, 2).map((post) => (
              <button
                key={post.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onPostClick(post);
                }}
                className={`text-left px-2 py-1 rounded text-xs truncate transition-all hover:scale-105 font-medium ${
                  post.status === 'published'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                }`}
              >
                <span className="font-bold">{post.scheduled_time}</span> • {post.platforms.join(', ')}
              </button>
            ))}
            {posts.length > 2 && (
              <span className="text-xs text-gray-500 dark:text-gray-400 px-2">
                +{posts.length - 2} more
              </span>
            )}
          </div>
        )}

        {allPlatforms.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {allPlatforms.slice(0, 4).map((platform) => (
              <PlatformIcon key={platform} platform={platform} size="xs" />
            ))}
          </div>
        )}
      </div>

      {showTooltip && posts.length > 0 && (
        <div className="absolute left-full top-0 ml-2 z-50 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 animate-fade-in">
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
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">
                      {post.scheduled_time}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        post.status === 'published'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      }`}
                    >
                      {post.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-1">
                    {post.caption}
                  </p>
                  <div className="flex gap-1">
                    {post.platforms.map((platform) => (
                      <PlatformIcon key={platform} platform={platform} size="xs" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {posts.length > 3 && (
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                +{posts.length - 3} more posts
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
