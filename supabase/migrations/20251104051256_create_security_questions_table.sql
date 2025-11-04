/*
  # Create security questions table

  1. New Tables
    - `security_questions`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (uuid, foreign key) - References auth.users
      - `question` (text) - The security question
      - `answer_hash` (text) - Hashed answer for security
      - `created_at` (timestamptz) - Timestamp of creation
      - `updated_at` (timestamptz) - Timestamp of last update

  2. Security
    - Enable RLS on `security_questions` table
    - Add policy for authenticated users to read their own security questions
    - Add policy for authenticated users to insert their own security questions
    - Add policy for authenticated users to update their own security questions
    - Add policy for authenticated users to delete their own security questions

  3. Important Notes
    - Answers are hashed for security
    - Only one security question per user (enforced by unique constraint)
*/

CREATE TABLE IF NOT EXISTS security_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE security_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own security question"
  ON security_questions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own security question"
  ON security_questions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own security question"
  ON security_questions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own security question"
  ON security_questions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);