import { PlatformIcon } from './PlatformIcon';

interface PlatformFilterProps {
  selectedPlatforms: string[];
  onPlatformToggle: (platform: string) => void;
}

const platforms = ['X', 'LinkedIn', 'Facebook', 'Instagram', 'YouTube', 'TikTok'];

export function PlatformFilter({ selectedPlatforms, onPlatformToggle }: PlatformFilterProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Filter by Platform
      </h3>
      <div className="flex flex-wrap gap-2">
        {platforms.map((platform) => (
          <button
            key={platform}
            onClick={() => onPlatformToggle(platform)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
              selectedPlatforms.includes(platform)
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <PlatformIcon platform={platform} size="sm" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {platform}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
