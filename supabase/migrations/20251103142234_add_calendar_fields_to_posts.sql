/*
  # Add Calendar Fields to Posts Table

  1. Changes
    - Split `scheduled_date` into separate date and time fields for better calendar management
    - Add `scheduled_time` field to store time separately from date
    - Add `platform_accounts` field to store account names for each platform
    - Update existing scheduled_date to date-only format

  2. New Columns
    - `scheduled_time` (text) - Time in HH:MM format (e.g., "14:30")
    - `platform_accounts` (jsonb) - Object mapping platform names to account handles

  3. Notes
    - Existing data will have time extracted from scheduled_date
    - Default time is set to "12:00" for posts without specific time
*/

-- Add new columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'scheduled_time'
  ) THEN
    ALTER TABLE posts ADD COLUMN scheduled_time text DEFAULT '12:00';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'platform_accounts'
  ) THEN
    ALTER TABLE posts ADD COLUMN platform_accounts jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Update scheduled_date to be date type instead of timestamptz
-- First, migrate existing data by extracting time into scheduled_time
DO $$
BEGIN
  -- Only update if the column type needs changing
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' 
    AND column_name = 'scheduled_date'
    AND data_type = 'timestamp with time zone'
  ) THEN
    -- Extract time from existing scheduled_date entries
    UPDATE posts 
    SET scheduled_time = to_char(scheduled_date, 'HH24:MI')
    WHERE scheduled_date IS NOT NULL AND scheduled_time = '12:00';
    
    -- Change column type to date
    ALTER TABLE posts ALTER COLUMN scheduled_date TYPE date USING scheduled_date::date;
  END IF;
END $$;

-- Add index for faster calendar queries
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_date ON posts(scheduled_date) WHERE scheduled_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_user_status ON posts(user_id, status);
