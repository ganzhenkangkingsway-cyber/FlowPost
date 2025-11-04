import { useState } from 'react';

interface PlatformPreviewsProps {
  uploadedImage: string;
}

interface Platform {
  name: string;
  aspectRatio: string;
  dimensions: string;
  color: string;
}

export function PlatformPreviews({ uploadedImage }: PlatformPreviewsProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('Instagram');

  const platforms: Platform[] = [
    { name: 'Instagram', aspectRatio: '1:1', dimensions: '1080x1080', color: 'from-yellow-400 via-pink-500 to-pink-600' },
    { name: 'LinkedIn', aspectRatio: '1.91:1', dimensions: '1200x627', color: 'from-blue-600 to-blue-700' },
    { name: 'Twitter', aspectRatio: '16:9', dimensions: '1200x675', color: 'from-gray-800 to-gray-900' },
    { name: 'Facebook', aspectRatio: '1.91:1', dimensions: '1200x630', color: 'from-blue-500 to-blue-600' },
  ];

  const currentPlatform = platforms.find(p => p.name === selectedPlatform) || platforms[0];

  const getAspectRatioClass = (ratio: string) => {
    switch (ratio) {
      case '1:1':
        return 'aspect-square';
      case '1.91:1':
        return 'aspect-[1.91/1]';
      case '16:9':
        return 'aspect-video';
      default:
        return 'aspect-square';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Platform Previews</p>
        <span className="text-xs text-gray-500 dark:text-gray-400">{currentPlatform.dimensions}px</span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {platforms.map((platform) => (
          <button
            key={platform.name}
            onClick={() => setSelectedPlatform(platform.name)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              selectedPlatform === platform.name
                ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {platform.name}
          </button>
        ))}
      </div>

      <div className="relative bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-8 h-8 bg-gradient-to-br ${currentPlatform.color} rounded-lg`}></div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{currentPlatform.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Aspect ratio: {currentPlatform.aspectRatio}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 shadow-sm">
          <img
            src={uploadedImage}
            alt={`${currentPlatform.name} preview`}
            className={`w-full object-cover ${getAspectRatioClass(currentPlatform.aspectRatio)}`}
          />
        </div>

        <div className="mt-3 text-center">
          <span className="inline-flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full"></span>
            Auto-resized for {currentPlatform.name}
          </span>
        </div>
      </div>
    </div>
  );
}
