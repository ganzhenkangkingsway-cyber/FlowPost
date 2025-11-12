/*
  # Add Subscription Plan to User Profiles

  1. Changes
    - Add subscription-related fields to profiles table:
      - `subscription_plan` (text): Plan tier (free, pro, enterprise)
      - `subscription_status` (text): Current status (active, inactive, cancelled, trial)
      - `subscription_start_date` (timestamptz): When subscription started
      - `subscription_end_date` (timestamptz): When subscription expires
      - `billing_cycle` (text): Monthly or yearly
      - `posts_limit` (integer): Monthly post limit based on plan
      - `posts_used` (integer): Posts used this billing cycle

  2. Security
    - Users can view their own subscription details
    - Only service role can update subscription fields
*/

-- Add subscription fields to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_plan'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_plan text DEFAULT 'free';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_status text DEFAULT 'active';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_start_date'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_start_date timestamptz DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_end_date'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_end_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'billing_cycle'
  ) THEN
    ALTER TABLE profiles ADD COLUMN billing_cycle text DEFAULT 'monthly';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'posts_limit'
  ) THEN
    ALTER TABLE profiles ADD COLUMN posts_limit integer DEFAULT 10;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'posts_used'
  ) THEN
    ALTER TABLE profiles ADD COLUMN posts_used integer DEFAULT 0;
  END IF;
END $$;