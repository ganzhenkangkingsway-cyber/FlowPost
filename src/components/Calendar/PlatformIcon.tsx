import { Twitter, Linkedin, Facebook, Instagram, Youtube } from 'lucide-react';
import { TikTokIcon } from '../icons/TikTokIcon';

interface PlatformIconProps {
  platform: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function PlatformIcon({ platform, size = 'sm' }: PlatformIconProps) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const containerSizes = {
    xs: 'w-5 h-5',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const getIcon = () => {
    switch (platform) {
      case 'X':
        return <Twitter className={sizeClasses[size]} />;
      case 'LinkedIn':
        return <Linkedin className={sizeClasses[size]} />;
      case 'Facebook':
        return <Facebook className={sizeClasses[size]} />;
      case 'Instagram':
        return <Instagram className={sizeClasses[size]} />;
      case 'YouTube':
        return <Youtube className={sizeClasses[size]} />;
      case 'TikTok':
        return <TikTokIcon className={sizeClasses[size]} />;
      default:
        return null;
    }
  };

  const getColors = () => {
    switch (platform) {
      case 'X':
        return 'bg-black dark:bg-gray-700 text-white';
      case 'LinkedIn':
        return 'bg-blue-600 text-white';
      case 'Facebook':
        return 'bg-blue-700 text-white';
      case 'Instagram':
        return 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white';
      case 'YouTube':
        return 'bg-red-600 text-white';
      case 'TikTok':
        return 'bg-black dark:bg-gray-700 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div
      className={`${containerSizes[size]} ${getColors()} rounded flex items-center justify-center flex-shrink-0`}
      title={platform}
    >
      {getIcon()}
    </div>
  );
}
