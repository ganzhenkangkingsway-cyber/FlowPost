/*
  # Add Onboarding Status to User Profiles

  1. Changes
    - Add onboarding tracking fields to profiles table:
      - `onboarding_completed` (boolean): Whether user has completed onboarding
      - `onboarding_skipped` (boolean): Whether user skipped onboarding
      - `tutorial_type` (text): Which tutorial was chosen (step-by-step, video, or none)
      - `onboarding_completed_at` (timestamptz): When onboarding was completed

  2. Security
    - Users can view and update their own onboarding status
*/

-- Add onboarding fields to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'onboarding_completed'
  ) THEN
    ALTER TABLE profiles ADD COLUMN onboarding_completed boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'onboarding_skipped'
  ) THEN
    ALTER TABLE profiles ADD COLUMN onboarding_skipped boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'tutorial_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN tutorial_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'onboarding_completed_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN onboarding_completed_at timestamptz;
  END IF;
END $$;