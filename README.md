# FlowPost

A multi-platform social media management application that allows you to post to multiple platforms from a single dashboard. PostSync helps you schedule posts, manage drafts, analyze performance, and collaborate with team members across Twitter/X, LinkedIn, Facebook, Instagram, YouTube, and TikTok.

## Features

- Multi-platform posting to Twitter/X, LinkedIn, Facebook, Instagram, YouTube, and TikTok
- AI-powered caption generation
- Built-in design editor powered by Pixlr
- Calendar view for scheduled posts
- Draft management
- Analytics and performance tracking
- Team collaboration and role management
- Security questions for account recovery
- Dark mode support

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (version 16 or higher)
- npm (comes with Node.js)
- A Supabase account (for database and authentication)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

The project already includes a `.env` file with Supabase credentials. The required variables are:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These are already configured in the project.

### 4. Optional OAuth Configuration

To enable real OAuth connections for social media platforms, add the following environment variables to your `.env` file:

#### Twitter/X
```
VITE_X_CLIENT_ID=your_twitter_client_id
VITE_X_CLIENT_SECRET=your_twitter_client_secret
```

#### LinkedIn
```
VITE_LINKEDIN_CLIENT_ID=your_linkedin_client_id
VITE_LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
```

#### Facebook
```
VITE_FACEBOOK_APP_ID=your_facebook_app_id
VITE_FACEBOOK_APP_SECRET=your_facebook_app_secret
```

#### Instagram
```
VITE_INSTAGRAM_CLIENT_ID=your_instagram_client_id
VITE_INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
```

#### YouTube
```
VITE_YOUTUBE_CLIENT_ID=your_google_client_id
VITE_YOUTUBE_CLIENT_SECRET=your_google_client_secret
```

#### TikTok
```
VITE_TIKTOK_CLIENT_KEY=your_tiktok_client_key
VITE_TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
```

## Running the Application

### Development Mode

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

Build the application for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

### Other Commands

Run linting:
```bash
npm run lint
```

Type checking:
```bash
npm run typecheck
```

## Using the Application

### 1. Sign Up / Login

- Visit the landing page at `http://localhost:5173`
- Click "Get Started" or "Sign In"
- Create a new account with email and password
- Set up security questions for account recovery

### 2. Connect Social Media Platforms

- Navigate to Settings from the dashboard sidebar
- Scroll to "Connected Platforms"
- Click "Connect" on any platform you want to link
- If OAuth credentials are configured, you'll be redirected to authorize the platform
- If OAuth is not configured, demo mode will be activated for testing

### 3. Create and Schedule Posts

- Click "Create Post" from the sidebar
- Upload an image or video (optional)
- Use the "Design with AI" feature to create custom graphics
- Write your caption or use "Generate with AI" for AI-powered suggestions
- Select which platforms to post to
- Choose to publish immediately, save as draft, or schedule for later
- Click "Publish" or "Schedule"

### 4. Manage Scheduled Posts

- View all scheduled posts in the "Calendar View"
- Filter by platform using the platform filter buttons
- Click on any scheduled post to preview or edit
- Navigate between months to see upcoming content

### 5. Manage Drafts

- Access "Draft Posts" from the sidebar
- View all saved drafts
- Click "Edit" to continue working on a draft
- Click "Delete" to remove a draft

### 6. View Analytics

- Navigate to "Analytics" from the sidebar
- View performance metrics for your posts
- Track engagement, reach, and other key metrics

### 7. Team Collaboration

- Go to "Team" from the sidebar
- Invite team members by email
- Assign roles (Admin, Editor, Viewer)
- Manage team member permissions

### 8. Customize Settings

- Access "Settings" from the sidebar
- Update your profile information
- Change your password
- Toggle dark mode
- Manage connected platforms

## OAuth Callback URLs

When setting up OAuth applications with each platform, use the following callback URL format:

For production:
```
https://yourdomain.com/oauth/callback/{platform}
```

For local development:
```
http://localhost:5173/oauth/callback/{platform}
```

Replace `{platform}` with: `x`, `linkedin`, `facebook`, `instagram`, `youtube`, or `tiktok`

## Demo Mode

Platforms without configured OAuth credentials will automatically use demo mode with simulated data for testing purposes. This allows you to test the application's functionality without setting up real OAuth credentials.

## Database

The application uses Supabase for:
- User authentication and authorization
- User profiles and settings
- Post storage and scheduling
- Connected accounts management
- Team management
- Analytics data
- Security questions

All database migrations are located in the `supabase/migrations/` directory.

## Edge Functions

The application includes several Supabase Edge Functions:
- `generate-caption`: AI-powered caption generation
- `pixlr-generate`: Image generation and editing
- `send-team-invitation`: Team invitation email service

## Technologies Used

- React 18 with TypeScript
- Vite for build tooling
- React Router for navigation
- Supabase for backend services
- Tailwind CSS for styling
- Fabric.js for canvas editing
- Lucide React for icons

## Troubleshooting

### Port Already in Use

If port 5173 is already in use, Vite will automatically use the next available port.

### Database Connection Issues

Ensure your `.env` file contains the correct Supabase credentials and that your Supabase project is active.

### OAuth Connection Issues

- Verify OAuth credentials are correctly configured in `.env`
- Check callback URLs are registered with the OAuth provider
- Ensure your application domain is whitelisted

## Support

For issues or questions, please refer to the documentation or create an issue in the repository.
