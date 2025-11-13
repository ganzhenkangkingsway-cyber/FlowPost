/*
  # Update Default Subscription Plan to Basic

  1. Changes
    - Change default subscription_plan from 'free' to 'basic'
    - Update existing 'free' plans to 'basic' for consistency
    
  2. Notes
    - All new users will automatically get the 'basic' plan
    - Existing users on 'free' plan will be updated to 'basic'
*/

-- Update the default value for subscription_plan column
ALTER TABLE profiles 
ALTER COLUMN subscription_plan SET DEFAULT 'basic';

-- Update existing users with 'free' plan to 'basic' plan
UPDATE profiles 
SET subscription_plan = 'basic' 
WHERE subscription_plan = 'free';
