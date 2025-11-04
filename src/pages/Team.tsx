import { useState, useEffect } from 'react';
import { Users, UserPlus, Crown, Edit, Shield, Mail, RefreshCw, Trash2, Loader2, Clock } from 'lucide-react';
import { InviteMemberModal } from '../components/InviteMemberModal';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface TeamMember {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'inactive';
  joined_at: string;
}

interface PendingInvite {
  id: string;
  invitee_email: string;
  role: 'admin' | 'editor' | 'viewer';
  invited_at: string;
  expires_at: string;
  status: string;
}

export function Team() {
  const { user } = useAuth();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchTeamData();
    }
  }, [user]);

  const fetchTeamData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data: membersData, error: membersError } = await supabase
        .from('team_members')
        .select(`
          id,
          user_id,
          role,
          status,
          joined_at
        `)
        .eq('organization_id', user.id)
        .eq('status', 'active');

      if (membersError) throw membersError;

      if (membersData && membersData.length > 0) {
        const userIds = membersData.map(m => m.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', userIds);

        const membersWithDetails = membersData.map(member => {
          const profile = profilesData?.find(p => p.id === member.user_id);
          return {
            ...member,
            email: profile?.email || '',
            full_name: profile?.full_name || null,
          };
        });

        setTeamMembers(membersWithDetails);
      } else {
        setTeamMembers([]);
      }

      const { data: invitesData, error: invitesError } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('inviter_id', user.id)
        .eq('status', 'pending')
        .order('invited_at', { ascending: false });

      if (invitesError) throw invitesError;

      setPendingInvites(invitesData || []);
    } catch (error) {
      console.error('Error fetching team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: 'admin' | 'editor' | 'viewer') => {
    try {
      setUpdatingRole(memberId);

      const { error } = await supabase
        .from('team_members')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', memberId);

      if (error) throw error;

      setTeamMembers(prev =>
        prev.map(m => (m.id === memberId ? { ...m, role: newRole } : m))
      );
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role. Please try again.');
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      setTeamMembers(prev => prev.filter(m => m.id !== memberId));
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Failed to remove member. Please try again.');
    }
  };

  const handleResendInvite = async (inviteId: string, inviteeEmail: string, inviteToken: string, role: string) => {
    try {
      await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-team-invitation`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            invitee_email: inviteeEmail,
            inviter_name: user?.user_metadata?.full_name || user?.email,
            invite_token: inviteToken,
            role: role,
          }),
        }
      );

      alert('Invitation resent successfully!');
    } catch (error) {
      console.error('Error resending invite:', error);
      alert('Failed to resend invitation. Please try again.');
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    if (!confirm('Are you sure you want to cancel this invitation?')) return;

    try {
      const { error } = await supabase
        .from('team_invitations')
        .update({ status: 'cancelled' })
        .eq('id', inviteId);

      if (error) throw error;

      setPendingInvites(prev => prev.filter(i => i.id !== inviteId));
    } catch (error) {
      console.error('Error cancelling invite:', error);
      alert('Failed to cancel invitation. Please try again.');
    }
  };

  const getInitials = (name: string | null, email: string): string => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (email: string): string => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-blue-600 to-blue-700',
      'from-green-500 to-green-600',
      'from-orange-500 to-orange-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
    ];
    const index = email.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      admin: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Crown },
      editor: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: Edit },
      viewer: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', icon: Shield },
    };
    return badges[role as keyof typeof badges] || badges.viewer;
  };

  const roleInfo = [
    {
      role: 'Admin',
      icon: Crown,
      color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
      description: 'Full access to all features, can manage team members and settings',
    },
    {
      role: 'Editor',
      icon: Edit,
      color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
      description: 'Can create, edit, and schedule posts but cannot manage team',
    },
    {
      role: 'Viewer',
      icon: Shield,
      color: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700',
      description: 'Can view posts and analytics but cannot make changes',
    },
  ];

  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen gradient-bg-animated">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Team & Roles</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your team members and permissions</p>
            </div>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg font-semibold transition-all shadow-lg shadow-blue-500/30"
          >
            <UserPlus className="w-5 h-5" />
            Invite Member
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8 stagger-animation">
        {roleInfo.map((info) => {
          const Icon = info.icon;
          return (
            <div key={info.role} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 faux-neon-border hover:-translate-y-1 transition-all duration-300">
              <div className={`w-12 h-12 ${info.color} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{info.role}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{info.description}</p>
            </div>
          );
        })}
      </div>

      {pendingInvites.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pending Invitations ({pendingInvites.length})</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {pendingInvites.map((invite) => {
              const badge = getRoleBadge(invite.role);
              const BadgeIcon = badge.icon;
              return (
                <div key={invite.id} className="p-6 list-item-hover">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{invite.invitee_email}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${badge.color}`}>
                            <BadgeIcon className="w-3 h-3" />
                            {invite.role}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="w-3 h-3" />
                            Invited {getTimeAgo(invite.invited_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResendInvite(invite.id, invite.invitee_email, (invite as any).invite_token, invite.role)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Resend invitation"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleCancelInvite(invite.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Cancel invitation"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Team Members ({teamMembers.length})</h2>
        </div>

        {teamMembers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No team members yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Invite your first team member to start collaborating</p>
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg font-semibold transition-all shadow-lg shadow-blue-500/30"
            >
              <UserPlus className="w-5 h-5" />
              Invite Member
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {teamMembers.map((member) => {
              const badge = getRoleBadge(member.role);
              const BadgeIcon = badge.icon;
              return (
                <div key={member.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${getAvatarColor(member.email)} rounded-xl flex items-center justify-center shadow-lg`}>
                        <span className="text-white font-bold text-sm">
                          {getInitials(member.full_name, member.email)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                          {member.full_name || member.email}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Joined {getTimeAgo(member.joined_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <select
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                        value={member.role}
                        onChange={(e) => handleUpdateRole(member.id, e.target.value as any)}
                        disabled={updatingRole === member.id}
                      >
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Collaboration Features</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              Invite team members to collaborate on your social media content. Assign roles based on responsibilities and maintain control over your brand presence.
            </p>
            <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li>• Real-time collaboration on posts</li>
              <li>• Role-based access control</li>
              <li>• Activity tracking and audit logs</li>
              <li>• Team notifications and updates</li>
            </ul>
          </div>
        </div>
      </div>

      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInviteSent={fetchTeamData}
      />
    </div>
  );
}
