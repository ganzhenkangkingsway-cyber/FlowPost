/*
  # Add Video Support to Posts

  1. Changes
    - Add `media_type` column to posts table (text: 'image', 'video', or null)
    - Add `video_url` column to posts table (text, nullable)
  
  2. Notes
    - Existing posts will have media_type set to 'image' if image_url exists
    - This allows posts to contain either images or videos
*/

-- Add media_type column to posts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'media_type'
  ) THEN
    ALTER TABLE posts ADD COLUMN media_type text;
  END IF;
END $$;

-- Add video_url column to posts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'video_url'
  ) THEN
    ALTER TABLE posts ADD COLUMN video_url text;
  END IF;
END $$;

-- Update existing posts to set media_type to 'image' if they have an image_url
UPDATE posts SET media_type = 'image' WHERE image_url IS NOT NULL AND media_type IS NULL;