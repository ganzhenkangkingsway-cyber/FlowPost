import { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { oauthConfig, generateOAuthUrl } from '../config/oauth';
import {
  getConnectedAccounts,
  disconnectAccount,
  saveConnectedAccount,
  type ConnectedAccount,
} from '../services/connectedAccounts';

interface PlatformStatus {
  platform: string;
  connected: boolean;
  loading: boolean;
  account?: ConnectedAccount;
}

export function ConnectedPlatforms() {
  const [platforms, setPlatforms] = useState<PlatformStatus[]>([
    { platform: 'X', connected: false, loading: false },
    { platform: 'LinkedIn', connected: false, loading: false },
    { platform: 'Facebook', connected: false, loading: false },
    { platform: 'Instagram', connected: false, loading: false },
    { platform: 'YouTube', connected: false, loading: false },
    { platform: 'TikTok', connected: false, loading: false },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConnectedAccounts();
  }, []);

  const loadConnectedAccounts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const accounts = await getConnectedAccounts();

      setPlatforms(prevPlatforms =>
        prevPlatforms.map(p => {
          const account = accounts.find(a => a.platform === p.platform);
          return {
            ...p,
            connected: !!account,
            account,
          };
        })
      );
    } catch (err) {
      console.error('Error loading connected accounts:', err);
      setPlatforms(prevPlatforms =>
        prevPlatforms.map(p => ({ ...p, connected: false, account: undefined }))
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (platformName: string) => {
    try {
      const config = oauthConfig[platformName];

      // Check if client ID is configured
      if (!config.clientId || config.clientId.includes('your_') || config.clientId.includes('_here')) {
        // Demo mode: Simulate OAuth callback with mock data
        console.log(`Demo Mode: Simulating connection for ${platformName}`);

        setPlatforms(prev =>
          prev.map(p =>
            p.platform === platformName ? { ...p, loading: true } : p
          )
        );

        const mockUserData = {
          X: { id: 'x_user_123', username: 'demo_user', email: 'demo@x.com' },
          LinkedIn: { id: 'li_user_456', username: 'Demo User', email: 'demo@linkedin.com' },
          Facebook: { id: 'fb_user_789', username: 'Demo User', email: 'demo@facebook.com' },
          Instagram: { id: 'ig_user_101', username: 'demo_user', email: null },
          YouTube: { id: 'yt_user_202', username: 'Demo Channel', email: 'demo@gmail.com' },
          TikTok: { id: 'tt_user_303', username: 'demo_user', email: null },
        };

        const userData = mockUserData[platformName as keyof typeof mockUserData];

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Save the connected account directly
        await saveConnectedAccount({
          platform: platformName,
          platform_user_id: userData.id,
          platform_username: userData.username,
          platform_email: userData.email || undefined,
          access_token: `mock_token_${Date.now()}`,
          refresh_token: `mock_refresh_${Date.now()}`,
          token_expires_at: new Date(Date.now() + 3600000).toISOString(),
        });

        // Reload connected accounts
        await loadConnectedAccounts();

        setPlatforms(prev =>
          prev.map(p =>
            p.platform === platformName ? { ...p, loading: false } : p
          )
        );
        return;
      }

      // Production mode: Redirect to OAuth provider
      console.log(`Initiating OAuth for ${platformName}`);
      console.log(`Redirect URI: ${config.redirectUri}`);

      // Generate state parameter for CSRF protection
      const state = btoa(JSON.stringify({
        platform: platformName,
        timestamp: Date.now(),
        random: Math.random().toString(36),
      }));

      // Store state in localStorage for validation
      localStorage.setItem('oauth_state', state);

      // Generate OAuth URL and redirect
      const oauthUrl = generateOAuthUrl(platformName, state);
      console.log(`Redirecting to: ${oauthUrl}`);

      window.location.href = oauthUrl;
    } catch (err) {
      console.error('Error initiating OAuth:', err);
      setError(`Failed to connect to ${platformName}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setPlatforms(prev =>
        prev.map(p =>
          p.platform === platformName ? { ...p, loading: false } : p
        )
      );
    }
  };

  const handleDisconnect = async (platformName: string) => {
    if (!confirm(`Are you sure you want to disconnect ${platformName}?`)) {
      return;
    }

    try {
      setPlatforms(prev =>
        prev.map(p =>
          p.platform === platformName ? { ...p, loading: true } : p
        )
      );

      await disconnectAccount(platformName);

      setPlatforms(prev =>
        prev.map(p =>
          p.platform === platformName
            ? { ...p, connected: false, loading: false, account: undefined }
            : p
        )
      );
    } catch (err) {
      console.error('Error disconnecting account:', err);
      setError(`Failed to disconnect ${platformName}`);
      setPlatforms(prev =>
        prev.map(p =>
          p.platform === platformName ? { ...p, loading: false } : p
        )
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm flex-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 text-xl leading-none"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {platforms.map((platform) => {
          const config = oauthConfig[platform.platform];
          if (!config) return null;

          return (
            <div
              key={platform.platform}
              className="flex flex-col p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-gray-200 dark:border-gray-600 transition-all hover:border-gray-300 dark:hover:border-gray-500"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${config.iconBgColor}`}
                >
                  <config.icon
                    className={`w-6 h-6 ${config.iconColor}`}
                    strokeWidth={2}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {config.name}
                  </h3>
                  {platform.connected && platform.account && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      @{platform.account.platform_username}
                    </p>
                  )}
                </div>
              </div>

              {platform.loading ? (
                <button
                  disabled
                  className="w-full px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting...
                </button>
              ) : platform.connected ? (
                <button
                  onClick={() => handleDisconnect(platform.platform)}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 group"
                  title="Click to disconnect"
                >
                  <CheckCircle2 className="w-4 h-4 group-hover:hidden" />
                  <span className="group-hover:hidden">Connected</span>
                  <span className="hidden group-hover:inline">Disconnect</span>
                </button>
              ) : (
                <button
                  onClick={() => handleConnect(platform.platform)}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Connect
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
