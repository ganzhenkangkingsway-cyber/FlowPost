/*
  # Create YouTube Connections Table

  1. New Tables
    - `youtube_connections`
      - `id` (uuid, primary key) - Unique identifier for connection
      - `user_id` (uuid, foreign key) - References auth.users
      - `access_token` (text) - OAuth access token (encrypted)
      - `refresh_token` (text) - OAuth refresh token (encrypted)
      - `expires_at` (timestamptz) - When access token expires
      - `channel_id` (text) - YouTube channel ID
      - `channel_name` (text) - YouTube channel name
      - `email` (text) - Google account email
      - `created_at` (timestamptz) - When connection was created
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `youtube_connections` table
    - Users can only view and manage their own connections
    - Add policies for select, insert, update, and delete operations
  
  3. Indexes
    - Add index on user_id for faster lookups
    - Add unique constraint on user_id to allow one YouTube connection per user
*/

-- Create youtube_connections table
CREATE TABLE IF NOT EXISTS youtube_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  expires_at timestamptz NOT NULL,
  channel_id text,
  channel_name text,
  email text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE youtube_connections ENABLE ROW LEVEL SECURITY;

-- Create index on user_id for performance
CREATE INDEX IF NOT EXISTS idx_youtube_connections_user_id ON youtube_connections(user_id);

-- RLS Policies

-- Users can view their own YouTube connections
CREATE POLICY "Users can view own YouTube connections"
  ON youtube_connections
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own YouTube connections
CREATE POLICY "Users can insert own YouTube connections"
  ON youtube_connections
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own YouTube connections
CREATE POLICY "Users can update own YouTube connections"
  ON youtube_connections
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own YouTube connections
CREATE POLICY "Users can delete own YouTube connections"
  ON youtube_connections
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_youtube_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
DROP TRIGGER IF EXISTS update_youtube_connections_updated_at_trigger ON youtube_connections;
CREATE TRIGGER update_youtube_connections_updated_at_trigger
  BEFORE UPDATE ON youtube_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_youtube_connections_updated_at();
