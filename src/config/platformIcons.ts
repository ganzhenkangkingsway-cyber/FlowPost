export interface PlatformIconConfig {
  name: string;
  icon: string;
  bgColor: string;
  iconClass: string;
}

export const platformIcons: Record<string, PlatformIconConfig> = {
  X: {
    name: 'X',
    icon: 'https://cdn.simpleicons.org/x/000000',
    bgColor: 'bg-gray-100 dark:bg-gray-700',
    iconClass: 'dark:invert',
  },
  Twitter: {
    name: 'Twitter',
    icon: 'https://cdn.simpleicons.org/x/000000',
    bgColor: 'bg-gray-100 dark:bg-gray-700',
    iconClass: 'dark:invert',
  },
  LinkedIn: {
    name: 'LinkedIn',
    icon: '/linkedin-logo.svg',
    bgColor: 'bg-[#0A66C2] dark:bg-[#0A66C2]',
    iconClass: '',
  },
  Facebook: {
    name: 'Facebook',
    icon: 'https://cdn.simpleicons.org/facebook/1877F2',
    bgColor: 'bg-blue-50 dark:bg-[#1877F2]',
    iconClass: 'dark:brightness-0 dark:invert',
  },
  Instagram: {
    name: 'Instagram',
    icon: 'https://cdn.simpleicons.org/instagram/E4405F',
    bgColor: 'bg-gradient-to-tr from-purple-100 via-pink-100 to-orange-100 dark:bg-gradient-to-tr dark:from-[#833AB4] dark:via-[#E1306C] dark:to-[#FCAF45]',
    iconClass: 'dark:brightness-0 dark:invert',
  },
  YouTube: {
    name: 'YouTube',
    icon: 'https://cdn.simpleicons.org/youtube/FF0000',
    bgColor: 'bg-red-50 dark:bg-red-600',
    iconClass: 'dark:brightness-0 dark:invert',
  },
  TikTok: {
    name: 'TikTok',
    icon: 'https://cdn.simpleicons.org/tiktok/000000',
    bgColor: 'bg-gray-100 dark:bg-gray-700',
    iconClass: 'dark:invert',
  },
};

export function getPlatformIcon(platformName: string): PlatformIconConfig {
  return platformIcons[platformName] || {
    name: platformName,
    icon: '',
    bgColor: 'bg-gray-500',
    iconClass: '',
  };
}
