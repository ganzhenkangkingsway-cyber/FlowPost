/*
  # Fix Team Management RLS Policies

  1. Changes
    - Fix infinite recursion in team_members SELECT policy
    - Fix permission denied error by using profiles table instead of auth.users
    - Simplify policies to avoid complex recursive queries

  2. Security
    - Maintain secure access control
    - Users can only see invitations they sent or received
    - Users can only see team members in their organization
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view invitations they sent" ON team_invitations;
DROP POLICY IF EXISTS "Users can view invitations sent to their email" ON team_invitations;
DROP POLICY IF EXISTS "Users can create invitations" ON team_invitations;
DROP POLICY IF EXISTS "Users can update their sent invitations" ON team_invitations;
DROP POLICY IF EXISTS "Invitees can accept invitations" ON team_invitations;
DROP POLICY IF EXISTS "Users can view team members" ON team_members;
DROP POLICY IF EXISTS "Users can insert team members" ON team_members;
DROP POLICY IF EXISTS "Admins can update team members" ON team_members;
DROP POLICY IF EXISTS "Admins can delete team members" ON team_members;

-- RLS Policies for team_invitations

-- Users can view invitations they sent
CREATE POLICY "Users can view invitations they sent"
  ON team_invitations FOR SELECT
  TO authenticated
  USING (auth.uid() = inviter_id);

-- Users can view invitations sent to their email using profiles table
CREATE POLICY "Users can view invitations sent to their email"
  ON team_invitations FOR SELECT
  TO authenticated
  USING (
    invitee_email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

-- Users can create invitations
CREATE POLICY "Users can create invitations"
  ON team_invitations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = inviter_id);

-- Users can update invitations they sent
CREATE POLICY "Users can update their sent invitations"
  ON team_invitations FOR UPDATE
  TO authenticated
  USING (auth.uid() = inviter_id)
  WITH CHECK (auth.uid() = inviter_id);

-- Invitees can accept invitations sent to them
CREATE POLICY "Invitees can accept invitations"
  ON team_invitations FOR UPDATE
  TO authenticated
  USING (
    invitee_email = (SELECT email FROM profiles WHERE id = auth.uid())
    AND status = 'pending'
    AND expires_at > now()
  )
  WITH CHECK (status = 'accepted');

-- RLS Policies for team_members

-- Simplified policy: Users can view team members where they are a member OR viewing their own record
CREATE POLICY "Users can view team members"
  ON team_members FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR organization_id = auth.uid()
  );

-- Users can insert themselves as team members
CREATE POLICY "Users can insert team members"
  ON team_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Organization owners can update team member roles
CREATE POLICY "Owners can update team members"
  ON team_members FOR UPDATE
  TO authenticated
  USING (organization_id = auth.uid())
  WITH CHECK (organization_id = auth.uid());

-- Organization owners can delete team members
CREATE POLICY "Owners can delete team members"
  ON team_members FOR DELETE
  TO authenticated
  USING (organization_id = auth.uid());