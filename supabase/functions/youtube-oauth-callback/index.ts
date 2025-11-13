import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface ChannelInfo {
  id: string;
  snippet: {
    title: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      return new Response(null, {
        status: 302,
        headers: {
          'Location': `${url.origin}/dashboard/settings?youtube_error=${encodeURIComponent(error)}`,
        },
      });
    }

    if (!code) {
      return new Response(JSON.stringify({ error: 'No authorization code provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const YOUTUBE_CLIENT_ID = Deno.env.get('YOUTUBE_CLIENT_ID')!;
    const YOUTUBE_CLIENT_SECRET = Deno.env.get('YOUTUBE_CLIENT_SECRET')!;
    const YOUTUBE_REDIRECT_URI = Deno.env.get('YOUTUBE_REDIRECT_URI')!;
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: YOUTUBE_CLIENT_ID,
        client_secret: YOUTUBE_CLIENT_SECRET,
        redirect_uri: YOUTUBE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return new Response(null, {
        status: 302,
        headers: {
          'Location': `${url.origin}/dashboard/settings?youtube_error=token_exchange_failed`,
        },
      });
    }

    const tokens: TokenResponse = await tokenResponse.json();

    const channelResponse = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
      {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
        },
      }
    );

    let channelId = null;
    let channelName = null;
    let email = null;

    if (channelResponse.ok) {
      const channelData = await channelResponse.json();
      if (channelData.items && channelData.items.length > 0) {
        const channel: ChannelInfo = channelData.items[0];
        channelId = channel.id;
        channelName = channel.snippet.title;
      }
    }

    const userInfoResponse = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
        },
      }
    );

    if (userInfoResponse.ok) {
      const userInfo = await userInfoResponse.json();
      email = userInfo.email;
    }

    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    const authHeader = req.headers.get('Authorization');
    let userId = null;

    if (authHeader) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    const stateParam = url.searchParams.get('state');
    if (stateParam) {
      const decoded = atob(stateParam);
      const stateData = JSON.parse(decoded);
      userId = stateData.userId;
    }

    if (!userId) {
      return new Response(null, {
        status: 302,
        headers: {
          'Location': `${url.origin}/dashboard/settings?youtube_error=authentication_required`,
        },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { error: upsertError } = await supabase
      .from('youtube_connections')
      .upsert({
        user_id: userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt,
        channel_id: channelId,
        channel_name: channelName,
        email: email,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (upsertError) {
      console.error('Database error:', upsertError);
      return new Response(null, {
        status: 302,
        headers: {
          'Location': `${url.origin}/dashboard/settings?youtube_error=database_error`,
        },
      });
    }

    return new Response(null, {
      status: 302,
      headers: {
        'Location': `${url.origin}/dashboard/settings?youtube_connected=true`,
      },
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    const url = new URL(req.url);
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `${url.origin}/dashboard/settings?youtube_error=unexpected_error`,
      },
    });
  }
});