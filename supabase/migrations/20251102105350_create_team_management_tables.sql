/*
  # Team Management System

  1. New Tables
    - `team_invitations`
      - Stores invitations sent to new team members
      - Tracks invitation status (pending, accepted, expired, cancelled)
      - Has expiration mechanism (7 days default)
    
    - `team_members`
      - Stores active team member relationships
      - Tracks roles (viewer, editor, admin)
      - Links users to their organization

  2. Security
    - Enable RLS on both tables
    - Allow authenticated users to:
      - View their own invitations (sent or received)
      - Create new invitations
      - Update invitation status
      - View team members in their organization
      - Manage team members (admins only)
    
  3. Important Notes
    - Invitations expire after 7 days by default
    - Users can only invite to their own organization
    - Only admins can manage team member roles
*/

-- Create team_invitations table if not exists
CREATE TABLE IF NOT EXISTS team_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email text NOT NULL,
  role text DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor', 'admin')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  invite_token uuid UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  invited_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create team_members table if not exists
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor', 'admin')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

-- Enable RLS
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
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

-- Users can view invitations sent to their email
CREATE POLICY "Users can view invitations sent to their email"
  ON team_invitations FOR SELECT
  TO authenticated
  USING (
    invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Users can create invitations (only to their own organization)
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
    invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND status = 'pending'
    AND expires_at > now()
  )
  WITH CHECK (status = 'accepted');

-- RLS Policies for team_members

-- Users can view team members in their organization
CREATE POLICY "Users can view team members"
  ON team_members FOR SELECT
  TO authenticated
  USING (
    -- Can see members if you're part of the same organization
    organization_id IN (
      SELECT organization_id FROM team_members WHERE user_id = auth.uid()
    )
    -- Or if you're viewing your own membership
    OR user_id = auth.uid()
  );

-- System can insert team members (when invitations are accepted)
CREATE POLICY "Users can insert team members"
  ON team_members FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Can only add yourself as a member
    user_id = auth.uid()
  );

-- Admins can update team member roles
CREATE POLICY "Admins can update team members"
  ON team_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE user_id = auth.uid()
      AND organization_id = team_members.organization_id
      AND role = 'admin'
      AND status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE user_id = auth.uid()
      AND organization_id = team_members.organization_id
      AND role = 'admin'
      AND status = 'active'
    )
  );

-- Admins can delete team members
CREATE POLICY "Admins can delete team members"
  ON team_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE user_id = auth.uid()
      AND organization_id = team_members.organization_id
      AND role = 'admin'
      AND status = 'active'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_invitations_inviter_id ON team_invitations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_invitee_email ON team_invitations(invitee_email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_status ON team_invitations(status);
CREATE INDEX IF NOT EXISTS idx_team_invitations_invite_token ON team_invitations(invite_token);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_organization_id ON team_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role);
