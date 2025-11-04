/*
  # Create Post Analytics Table

  1. New Tables
    - `post_analytics`
      - `id` (uuid, primary key)
      - `post_id` (uuid, foreign key to posts)
      - `user_id` (uuid, foreign key to auth.users)
      - `platform` (text) - which platform (X, LinkedIn, Facebook, Instagram)
      - `reach` (integer) - number of people who saw the post
      - `engagement` (integer) - likes, comments, reactions combined
      - `shares` (integer) - number of shares/retweets
      - `clicks` (integer) - number of clicks on links
      - `recorded_at` (timestamptz) - when this analytics data was recorded
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `post_analytics` table
    - Add policies for authenticated users to:
      - Read their own analytics data
      - Insert their own analytics data
      - Update their own analytics data
*/

-- Create post_analytics table
CREATE TABLE IF NOT EXISTS post_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL CHECK (platform IN ('X', 'LinkedIn', 'Facebook', 'Instagram', 'YouTube', 'TikTok')),
  reach integer DEFAULT 0,
  engagement integer DEFAULT 0,
  shares integer DEFAULT 0,
  clicks integer DEFAULT 0,
  recorded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE post_analytics ENABLE ROW LEVEL SECURITY;

-- Policies for post_analytics
CREATE POLICY "Users can view own analytics"
  ON post_analytics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics"
  ON post_analytics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics"
  ON post_analytics FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own analytics"
  ON post_analytics FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_post_analytics_user_id ON post_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_post_analytics_post_id ON post_analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_post_analytics_platform ON post_analytics(platform);
CREATE INDEX IF NOT EXISTS idx_post_analytics_recorded_at ON post_analytics(recorded_at);
