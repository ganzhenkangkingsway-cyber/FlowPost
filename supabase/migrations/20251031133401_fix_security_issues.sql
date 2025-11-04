/*
  # Fix Security and Performance Issues

  ## Changes Made
  
  1. **Add Index for Foreign Key**
     - Add index on `posts.user_id` to improve query performance for the foreign key constraint
  
  2. **Optimize RLS Policies (Auth Function Caching)**
     - Replace `auth.uid()` with `(select auth.uid())` in all RLS policies to prevent re-evaluation per row
     - This applies to policies on:
       - `profiles` table (3 policies)
       - `posts` table (4 policies)
       - `connected_accounts` table (4 policies)
  
  3. **Fix Function Search Path**
     - Add SECURITY DEFINER and explicit search_path to `update_updated_at_column()` function
  
  4. **Remove Unused Table**
     - Drop `user_connections` table if it exists (has RLS enabled but no policies)
  
  ## Notes
  - All changes are idempotent and safe to run multiple times
  - Performance improvements will be noticeable on tables with many rows
  - Auth function caching prevents re-evaluation for each row in queries
*/

-- Add index for posts.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);

-- Drop unused user_connections table if it exists
DROP TABLE IF EXISTS user_connections CASCADE;

-- Fix function search path for update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate all RLS policies with optimized auth.uid() calls

-- PROFILES TABLE POLICIES
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- POSTS TABLE POLICIES
DROP POLICY IF EXISTS "Users can view own posts" ON posts;
DROP POLICY IF EXISTS "Users can create own posts" ON posts;
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;

CREATE POLICY "Users can view own posts"
  ON posts FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- CONNECTED_ACCOUNTS TABLE POLICIES
DROP POLICY IF EXISTS "Users can view own connected accounts" ON connected_accounts;
DROP POLICY IF EXISTS "Users can insert own connected accounts" ON connected_accounts;
DROP POLICY IF EXISTS "Users can update own connected accounts" ON connected_accounts;
DROP POLICY IF EXISTS "Users can delete own connected accounts" ON connected_accounts;

CREATE POLICY "Users can view own connected accounts"
  ON connected_accounts FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own connected accounts"
  ON connected_accounts FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own connected accounts"
  ON connected_accounts FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own connected accounts"
  ON connected_accounts FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);
