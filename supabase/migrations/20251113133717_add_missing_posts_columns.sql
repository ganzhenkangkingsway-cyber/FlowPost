/*
  # Add Missing Columns to Posts Table

  ## Changes Made
  
  1. New Columns Added:
    - `video_url` (text, nullable) - Store video URLs for video posts
    - `media_type` (text, nullable) - Track if post contains 'image', 'video', or null
    - `scheduled_time` (text, nullable) - Store the scheduled time (HH:MM format)
    - `platform_accounts` (jsonb, default {}) - Store platform-to-username mapping
  
  2. Purpose:
    - Support video content in posts
    - Track media type for proper rendering
    - Store separate time field for scheduling
    - Map platforms to specific account usernames
  
  ## Notes
  - All columns are nullable to maintain backward compatibility
  - Existing posts will have NULL values for new columns
  - No data loss or migration of existing data required
*/

-- Add video_url column for video posts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'video_url'
  ) THEN
    ALTER TABLE posts ADD COLUMN video_url text;
  END IF;
END $$;

-- Add media_type column to track content type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'media_type'
  ) THEN
    ALTER TABLE posts ADD COLUMN media_type text;
  END IF;
END $$;

-- Add scheduled_time column for time scheduling
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'scheduled_time'
  ) THEN
    ALTER TABLE posts ADD COLUMN scheduled_time text;
  END IF;
END $$;

-- Add platform_accounts column to map platforms to usernames
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'platform_accounts'
  ) THEN
    ALTER TABLE posts ADD COLUMN platform_accounts jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add comment to document the columns
COMMENT ON COLUMN posts.video_url IS 'URL of the video if post contains video content';
COMMENT ON COLUMN posts.media_type IS 'Type of media: image, video, or null';
COMMENT ON COLUMN posts.scheduled_time IS 'Scheduled time in HH:MM format';
COMMENT ON COLUMN posts.platform_accounts IS 'JSON mapping of platform names to account usernames';
