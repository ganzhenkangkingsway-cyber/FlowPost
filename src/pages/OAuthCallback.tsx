import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { saveConnectedAccount } from '../services/connectedAccounts';

export function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const { platform: platformParam } = useParams<{ platform: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        console.log('OAuth Callback - Platform:', platformParam);
        console.log('OAuth Callback - Code:', code ? 'present' : 'missing');
        console.log('OAuth Callback - State:', state ? 'present' : 'missing');
        console.log('OAuth Callback - Error:', error);
        console.log('OAuth Callback - Error Description:', errorDescription);

        if (error) {
          setStatus('error');
          setMessage(`Authentication failed: ${errorDescription || error}`);
          setTimeout(() => navigate('/dashboard/settings'), 3000);
          return;
        }

        if (!code || !state) {
          setStatus('error');
          setMessage('Invalid callback parameters');
          setTimeout(() => navigate('/dashboard/settings'), 3000);
          return;
        }

        const savedState = localStorage.getItem('oauth_state');
        if (savedState !== state) {
          console.error('State mismatch:', { saved: savedState, received: state });
          setStatus('error');
          setMessage('Invalid state parameter - possible CSRF attack');
          setTimeout(() => navigate('/dashboard/settings'), 3000);
          return;
        }

        const stateData = JSON.parse(atob(state));
        const platform = stateData.platform;

        console.log('OAuth Callback - Platform from state:', platform);

        const mockUserData = {
          X: { id: 'x_user_123', username: 'demo_user', email: 'demo@x.com' },
          LinkedIn: { id: 'li_user_456', username: 'Demo User', email: 'demo@linkedin.com' },
          Facebook: { id: 'fb_user_789', username: 'Demo User', email: 'demo@facebook.com' },
          Instagram: { id: 'ig_user_101', username: 'demo_user', email: null },
          YouTube: { id: 'yt_user_202', username: 'Demo Channel', email: 'demo@gmail.com' },
          TikTok: { id: 'tt_user_303', username: 'demo_user', email: null },
        };

        const userData = mockUserData[platform as keyof typeof mockUserData];

        await saveConnectedAccount({
          platform: platform,
          platform_user_id: userData.id,
          platform_username: userData.username,
          platform_email: userData.email || undefined,
          access_token: `mock_token_${Date.now()}`,
          refresh_token: `mock_refresh_${Date.now()}`,
          token_expires_at: new Date(Date.now() + 3600000).toISOString(),
        });

        localStorage.removeItem('oauth_state');

        console.log('OAuth Callback - Success! Connected to', platform);
        setStatus('success');
        setMessage(`Successfully connected to ${platform}!`);
        setTimeout(() => navigate('/dashboard/settings'), 2000);
      } catch (err) {
        console.error('OAuth callback error:', err);
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Failed to complete authentication');
        setTimeout(() => navigate('/dashboard/settings'), 3000);
      }
    };

    handleOAuthCallback();
  }, [searchParams, platformParam, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex flex-col items-center text-center">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Connecting Account
              </h2>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-green-900 dark:text-green-100 mb-2">
                Success!
              </h2>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">
                Connection Failed
              </h2>
            </>
          )}

          <p className="text-gray-600 dark:text-gray-400">{message}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
            Redirecting to settings...
          </p>
        </div>
      </div>
    </div>
  );
}
