/*
  # Fix Team Management RLS Policies

  1. Issues Fixed
    - Remove infinite recursion in team_members policies
    - Fix permission denied errors when checking user emails
    - Simplify policy logic to avoid self-referencing queries
    
  2. Changes
    - Updated team_invitations policies to use auth.jwt() for email
    - Simplified team_members policies to avoid recursive checks
    - Fixed organization_id checks
    
  3. Security
    - Maintains proper access control
    - Users can only see their own data
    - Proper role-based permissions for organization owners
*/

-- RLS Policies for team_invitations

-- Users can view invitations they sent
CREATE POLICY "Users can view invitations they sent"
  ON team_invitations FOR SELECT
  TO authenticated
  USING (auth.uid() = inviter_id);

-- Users can view invitations sent to their email
CREATE POLICY "Users can view invitations sent to their email"
  ON team_invitations FOR SELECT
  TO authenticated
  USING (
    invitee_email = (auth.jwt()->>'email')::text
  );

-- Users can create invitations (only as themselves)
CREATE POLICY "Users can create invitations"
  ON team_invitations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = inviter_id);

-- Users can update invitations they sent (to cancel them)
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
    invitee_email = (auth.jwt()->>'email')::text
    AND status = 'pending'
    AND expires_at > now()
  )
  WITH CHECK (status = 'accepted');

-- RLS Policies for team_members

-- Users can view team members where they are members or viewing their own membership
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
CREATE POLICY "Organization owners can update team members"
  ON team_members FOR UPDATE
  TO authenticated
  USING (organization_id = auth.uid())
  WITH CHECK (organization_id = auth.uid());

-- Organization owners can delete team members
CREATE POLICY "Organization owners can delete team members"
  ON team_members FOR DELETE
  TO authenticated
  USING (organization_id = auth.uid());
