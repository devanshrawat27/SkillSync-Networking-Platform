import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  MessageSquare,
  Users,
  UsersRound,
  FolderOpen,
  GraduationCap,
  Bell,
  LogOut,
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getProfilePhotoUrl } from '@/lib/profile-photo';
import { getProfileCompletionPercent } from '@/lib/app-flow';

const PRIMARY = '#4F46E5';
const PRIMARY_GLOW = 'rgba(79, 70, 229, 0.15)';
const TEXT_SECONDARY = '#94A3B8';
const TEXT_PRIMARY = '#F1F5F9';

const Sidebar = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({ messages: 0, notifications: 0 });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUser(session.user);
      loadProfile(session.user.id);
    }
  };

  const loadProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!error && data) {
      setProfile(data);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Error signing out');
    } else {
      toast.success('Signed out successfully');
      navigate('/');
    }
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { label: 'Home', icon: LayoutDashboard, path: '/dashboard', badge: null },
    { label: 'Discover', icon: Search, path: '/find-teammates', badge: null },
    { label: 'Projects', icon: FolderOpen, path: '/projects', badge: null },
    { label: 'Connections', icon: Users, path: '/connections', badge: null },
    { label: 'Messages', icon: MessageSquare, path: '/messages', badge: 'messages' },
    { label: 'Mentors', icon: GraduationCap, path: '/mentors', badge: null },
    { label: 'Teams', icon: UsersRound, path: '/teams', badge: null },
    { label: 'Notifications', icon: Bell, path: '/notifications', badge: 'notifications' },
  ];

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    return (
      <button
        onClick={() => {
          navigate(item.path);
          onClose?.();
        }}
        style={{
          backgroundColor: active ? PRIMARY_GLOW : 'transparent',
          color: active ? TEXT_PRIMARY : TEXT_SECONDARY,
          borderLeftColor: active ? PRIMARY : 'transparent',
        }}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 border-l-[3px] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] relative"
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm font-medium flex-grow text-left">{item.label}</span>
        {item.badge && unreadCounts[item.badge] > 0 && (
          <span
            style={{ backgroundColor: PRIMARY, color: TEXT_PRIMARY }}
            className="min-w-[20px] h-5 flex items-center justify-center rounded-full text-xs font-semibold"
          >
            {unreadCounts[item.badge] > 99 ? '99+' : unreadCounts[item.badge]}
          </span>
        )}
      </button>
    );
  };

  const profileCompletionPercent = Math.round(getProfileCompletionPercent(profile));

  return (
    <div
      style={{ borderRightColor: 'var(--border)' }}
      className="flex h-screen w-60 flex-col overflow-y-auto border-r bg-[rgba(10,14,26,0.94)] backdrop-blur-xl"
    >
      {/* Top Section - Profile */}
      <div className="p-4 border-b border-[var(--border)]">
        <button
          onClick={() => {
            navigate('/profile');
            onClose?.();
          }}
          className="w-full text-left hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarImage src={getProfilePhotoUrl(profile || {}, user?.id, user?.id) || undefined} />
              <AvatarFallback>{profile?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p style={{ color: TEXT_PRIMARY }} className="text-sm font-semibold truncate">
                {profile?.name || 'User'}
              </p>
              <p style={{ color: TEXT_SECONDARY }} className="text-xs">
                {profile?.department || 'Not set'} • {profile?.year || 'N/A'}
              </p>
            </div>
          </div>
        </button>

        {/* Profile Completion */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <p style={{ color: TEXT_SECONDARY }} className="text-xs font-medium">
              Profile
            </p>
            <p style={{ color: PRIMARY }} className="text-xs font-semibold">
              {profileCompletionPercent}%
            </p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
            <div
              style={{ backgroundColor: PRIMARY, width: `${profileCompletionPercent}%` }}
              className="h-full transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-[var(--border)] space-y-2">
        <button
          onClick={handleLogout}
          style={{ color: TEXT_SECONDARY }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 border-l-[3px] border-l-transparent hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
