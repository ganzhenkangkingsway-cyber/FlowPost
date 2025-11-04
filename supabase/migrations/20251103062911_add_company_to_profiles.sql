/*
  # Add Company Field to Profiles Table

  1. Changes
    - Add `company` column to `profiles` table
      - Type: text (nullable)
      - Allows users to optionally specify their company name
  
  2. Notes
    - Uses IF NOT EXISTS check to prevent errors if column already exists
    - No security changes needed as existing RLS policies cover this column
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'company'
  ) THEN
    ALTER TABLE profiles ADD COLUMN company text;
  END IF;
END $$;