/*
  # Create Connected Accounts Table

  1. New Tables
    - `connected_accounts`
      - `id` (uuid, primary key) - Unique identifier for each connection
      - `user_id` (uuid, foreign key) - References auth.users
      - `platform` (text) - Platform name (X, LinkedIn, Facebook, Instagram, YouTube, TikTok)
      - `platform_user_id` (text) - User ID on the platform
      - `platform_username` (text) - Username on the platform
      - `platform_email` (text, nullable) - Email from the platform if available
      - `access_token` (text) - OAuth access token (encrypted in production)
      - `refresh_token` (text, nullable) - OAuth refresh token if provided
      - `token_expires_at` (timestamptz, nullable) - When the access token expires
      - `connected_at` (timestamptz) - When the account was connected
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `connected_accounts` table
    - Add policy for authenticated users to read their own connections
    - Add policy for authenticated users to insert their own connections
    - Add policy for authenticated users to update their own connections
    - Add policy for authenticated users to delete their own connections

  3. Indexes
    - Index on user_id for fast lookups
    - Unique constraint on (user_id, platform) to prevent duplicate connections
*/

CREATE TABLE IF NOT EXISTS connected_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL CHECK (platform IN ('X', 'LinkedIn', 'Facebook', 'Instagram', 'YouTube', 'TikTok')),
  platform_user_id text NOT NULL,
  platform_username text NOT NULL,
  platform_email text,
  access_token text NOT NULL,
  refresh_token text,
  token_expires_at timestamptz,
  connected_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_connected_accounts_user_id ON connected_accounts(user_id);

ALTER TABLE connected_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own connected accounts"
  ON connected_accounts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connected accounts"
  ON connected_accounts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connected accounts"
  ON connected_accounts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own connected accounts"
  ON connected_accounts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);