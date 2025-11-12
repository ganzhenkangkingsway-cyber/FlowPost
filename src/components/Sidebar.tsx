import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  Calendar as CalendarIcon,
  CalendarDays,
  BarChart3,
  Users,
  Settings,
  LogOut,
  PlusCircle,
  Sparkles,
  FileText
} from 'lucide-react';
import { Logo } from './Logo';

export function Sidebar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: CalendarIcon, label: 'Schedule Post', path: '/dashboard/schedule' },
    { icon: FileText, label: 'Draft Posts', path: '/dashboard/drafts' },
    { icon: CalendarDays, label: 'Calendar', path: '/dashboard/calendar' },
    { icon: Sparkles, label: 'AI Captions', path: '/dashboard/ai-caption' },
    { icon: BarChart3, label: 'Analytics', path: '/dashboard/analytics' },
    { icon: Users, label: 'Team & Roles', path: '/dashboard/team' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col z-50">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 w-full text-left hover:opacity-80 transition-opacity"
        >
          <Logo size="sm" showText={false} />
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">FlowPost</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">Design once. Post everywhere.</p>
          </div>
        </button>
      </div>

      <div className="p-4">
        <NavLink
          to="/dashboard/create"
          className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:scale-105 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <PlusCircle className="w-5 h-5" />
          Create New Post
        </NavLink>
      </div>

      <nav className="flex-1 px-4 py-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                  {item.label}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
