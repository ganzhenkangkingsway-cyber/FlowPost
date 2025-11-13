import { supabase } from '../lib/supabase';

const YOUTUBE_CLIENT_ID = '632677070325-ct0ee7v398ni4atsajt5vsialr27j2eo.apps.googleusercontent.com';
const YOUTUBE_REDIRECT_URI = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/youtube-oauth-callback`;
const YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.force-ssl'
].join(' ');

export interface YouTubeConnection {
  id: string;
  user_id: string;
  channel_id: string | null;
  channel_name: string | null;
  email: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export function generateYouTubeAuthUrl(): string {
  const state = generateRandomState();
  sessionStorage.setItem('youtube_oauth_state', state);

  const params = new URLSearchParams({
    client_id: YOUTUBE_CLIENT_ID,
    redirect_uri: YOUTUBE_REDIRECT_URI,
    response_type: 'code',
    scope: YOUTUBE_SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    state: state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

function generateRandomState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function getYouTubeConnection(userId: string): Promise<YouTubeConnection | null> {
  const { data, error } = await supabase
    .from('youtube_connections')
    .select('id, user_id, channel_id, channel_name, email, expires_at, created_at, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching YouTube connection:', error);
    return null;
  }

  return data;
}

export async function disconnectYouTube(userId: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('youtube_connections')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('Error disconnecting YouTube:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function checkYouTubeTokenValidity(connection: YouTubeConnection): Promise<boolean> {
  const expiresAt = new Date(connection.expires_at);
  const now = new Date();

  return expiresAt > now;
}
