import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Globe, CreditCard, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { ConnectedPlatforms } from '../components/ConnectedPlatforms';
import { supabase } from '../lib/supabase';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { SecurityQuestionModal } from '../components/SecurityQuestionModal';

export function Settings() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [emailDigest, setEmailDigest] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSecurityQuestionModal, setShowSecurityQuestionModal] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();

  const [subscriptionPlan, setSubscriptionPlan] = useState('free');
  const [subscriptionStatus, setSubscriptionStatus] = useState('active');
  const [subscriptionStartDate, setSubscriptionStartDate] = useState<string>('');
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<string>('');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [postsLimit, setPostsLimit] = useState(10);
  const [postsUsed, setPostsUsed] = useState(0);

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, email, company, subscription_plan, subscription_status, subscription_start_date, subscription_end_date, billing_cycle, posts_limit, posts_used')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      setFullName(data.full_name || '');
      setEmail(data.email || user.email || '');
      setCompany(data.company || '');
      setSubscriptionPlan(data.subscription_plan || 'free');
      setSubscriptionStatus(data.subscription_status || 'active');
      setSubscriptionStartDate(data.subscription_start_date || '');
      setSubscriptionEndDate(data.subscription_end_date || '');
      setBillingCycle(data.billing_cycle || 'monthly');
      setPostsLimit(data.posts_limit || 10);
      setPostsUsed(data.posts_used || 0);
    } else {
      setFullName('');
      setEmail(user.email || '');
      setCompany('');
      setSubscriptionPlan('free');
      setSubscriptionStatus('active');
      setSubscriptionStartDate('');
      setSubscriptionEndDate('');
      setBillingCycle('monthly');
      setPostsLimit(10);
      setPostsUsed(0);
    }
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const updates: { full_name: string; company: string; email?: string } = {
        full_name: fullName,
        company: company,
      };

      if (email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email,
        });

        if (emailError) {
          alert('Error updating email: ' + emailError.message);
          return;
        }
        updates.email = email;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (!error) {
        alert('Profile updated successfully!');
        if (email !== user.email) {
          alert('Please check your new email for a confirmation link.');
        }
      } else {
        alert('Error updating profile: ' + error.message);
      }
    } catch (err) {
      alert('Error updating profile: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen gradient-bg-animated">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl flex items-center justify-center shadow-lg">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your account and preferences</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 faux-neon-border p-6 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">A confirmation email will be sent to your new address</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                disabled={loading}
                placeholder="Your company name"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              />
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Changes
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 faux-neon-border p-6 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications about post performance</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Email Digest</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Weekly summary of your social media performance</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailDigest}
                  onChange={(e) => setEmailDigest(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 faux-neon-border p-6 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Appearance</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Theme</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => !isDarkMode || toggleDarkMode()}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    !isDarkMode
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="w-full h-20 bg-white rounded border border-gray-200 mb-3"></div>
                  <p className="font-semibold text-gray-900 dark:text-white">Light Mode</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Default theme</p>
                </button>
                <button
                  onClick={() => isDarkMode || toggleDarkMode()}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    isDarkMode
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="w-full h-20 bg-gray-900 rounded border border-gray-700 mb-3"></div>
                  <p className="font-semibold text-gray-900 dark:text-white">Dark Mode</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Available now</p>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 faux-neon-border p-6 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Subscription Plan</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{subscriptionPlan}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                      subscriptionStatus === 'active'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : subscriptionStatus === 'trial'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {subscriptionStatus === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {subscriptionStatus}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{billingCycle} billing</p>
                </div>
              </div>
              <button className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all shadow-sm">
                Upgrade
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Started</p>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {subscriptionStartDate ? new Date(subscriptionStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Renewal Date</p>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {subscriptionEndDate ? new Date(subscriptionEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Posts Usage</p>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {postsUsed} / {postsLimit}
                </p>
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((postsUsed / postsLimit) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Current Plan Features:</h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{postsLimit} posts per month</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Multiple platform support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>AI caption generation</span>
                </li>
                {subscriptionPlan !== 'free' && (
                  <>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Advanced analytics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Priority support</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 faux-neon-border p-6 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Connected Platforms</h2>
          </div>

          <ConnectedPlatforms />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 faux-neon-border p-6 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Security</h2>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full px-4 py-3 text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <p className="font-medium text-gray-900 dark:text-white">Change Password</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Update your password regularly for security</p>
            </button>

            <button
              onClick={() => setShowSecurityQuestionModal(true)}
              className="w-full px-4 py-3 text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security to your account</p>
            </button>
          </div>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />

      <SecurityQuestionModal
        isOpen={showSecurityQuestionModal}
        onClose={() => setShowSecurityQuestionModal(false)}
      />
    </div>
  );
}
