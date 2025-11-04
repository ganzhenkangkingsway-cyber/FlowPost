PostSync

A multi-platform social media management application that allows you to post to multiple platforms from a single dashboard.

## OAuth Configuration

To enable real OAuth connections for social media platforms, add the following environment variables to your `.env` file:

### Twitter/X
```
VITE_X_CLIENT_ID=your_twitter_client_id
VITE_X_CLIENT_SECRET=your_twitter_client_secret
```

### LinkedIn
```
VITE_LINKEDIN_CLIENT_ID=your_linkedin_client_id
VITE_LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
```

### Facebook
```
VITE_FACEBOOK_APP_ID=your_facebook_app_id
VITE_FACEBOOK_APP_SECRET=your_facebook_app_secret
```

### Instagram
```
VITE_INSTAGRAM_CLIENT_ID=your_instagram_client_id
VITE_INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
```

### YouTube
```
VITE_YOUTUBE_CLIENT_ID=your_google_client_id
VITE_YOUTUBE_CLIENT_SECRET=your_google_client_secret
```

### TikTok
```
VITE_TIKTOK_CLIENT_KEY=your_tiktok_client_key
VITE_TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
```

## OAuth Callback URLs

When setting up OAuth applications with each platform, use the following callback URL format:

```
https://yourdomain.com/oauth/callback/{platform}
```

For local development:
```
http://localhost:5173/oauth/callback/{platform}
```

Replace `{platform}` with: `x`, `linkedin`, `facebook`, `instagram`, `youtube`, or `tiktok`

## Demo Mode

Platforms without configured OAuth credentials will automatically use demo mode with simulated data for testing purposes.

## How OAuth Flow Works

1. User clicks "Connect" on a platform card
2. If OAuth credentials are configured:
   - A secure state token is generated and stored in localStorage
   - User is redirected to the platform's OAuth authorization page
   - User grants permissions on the platform
   - Platform redirects back to `/oauth/callback/{platform}` with an authorization code
   - The callback page validates the state token and exchanges the code for access tokens
   - Connected account is saved to the database
   - User is redirected back to settings
3. If OAuth credentials are NOT configured:
   - Demo mode activates with simulated connection
   - Mock account data is saved for testing purposes
