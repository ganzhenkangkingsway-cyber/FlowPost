import { supabase } from '../lib/supabase';

export interface ConnectedAccount {
  id: string;
  user_id: string;
  platform: string;
  platform_user_id: string;
  platform_username: string;
  platform_email?: string;
  connected_at: string;
  updated_at: string;
}

export async function getConnectedAccounts(): Promise<ConnectedAccount[]> {
  const { data, error } = await supabase
    .from('connected_accounts')
    .select('id, user_id, platform, platform_user_id, platform_username, platform_email, connected_at, updated_at')
    .order('connected_at', { ascending: false });

  if (error) {
    console.error('Error fetching connected accounts:', error);
    throw error;
  }

  return data || [];
}

export async function getConnectedAccount(platform: string): Promise<ConnectedAccount | null> {
  const { data, error } = await supabase
    .from('connected_accounts')
    .select('id, user_id, platform, platform_user_id, platform_username, platform_email, connected_at, updated_at')
    .eq('platform', platform)
    .maybeSingle();

  if (error) {
    console.error('Error fetching connected account:', error);
    throw error;
  }

  return data;
}

export async function saveConnectedAccount(accountData: {
  platform: string;
  platform_user_id: string;
  platform_username: string;
  platform_email?: string;
  access_token: string;
  refresh_token?: string;
  token_expires_at?: string;
}): Promise<ConnectedAccount> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('connected_accounts')
    .upsert({
      user_id: user.id,
      platform: accountData.platform,
      platform_user_id: accountData.platform_user_id,
      platform_username: accountData.platform_username,
      platform_email: accountData.platform_email,
      access_token: accountData.access_token,
      refresh_token: accountData.refresh_token,
      token_expires_at: accountData.token_expires_at,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,platform'
    })
    .select('id, user_id, platform, platform_user_id, platform_username, platform_email, connected_at, updated_at')
    .single();

  if (error) {
    console.error('Error saving connected account:', error);
    throw error;
  }

  return data;
}

export async function disconnectAccount(platform: string): Promise<void> {
  const { error } = await supabase
    .from('connected_accounts')
    .delete()
    .eq('platform', platform);

  if (error) {
    console.error('Error disconnecting account:', error);
    throw error;
  }
}

export async function isAccountConnected(platform: string): Promise<boolean> {
  try {
    const account = await getConnectedAccount(platform);
    return account !== null;
  } catch (error) {
    return false;
  }
}
