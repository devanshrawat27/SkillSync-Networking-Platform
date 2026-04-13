import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Bell, Check } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';

const Notifications = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }

    setUser(session.user);
    loadNotifications(session.user.id);
  };

  const loadNotifications = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId, link) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification,
        ),
      );

      if (link) {
        navigate(link);
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, is_read: true })),
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-[var(--bg-primary)] p-6">
        <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 style={{ color: 'var(--text-primary)' }} className="text-3xl font-bold">Notifications</h1>
            <p style={{ color: 'var(--text-secondary)' }} className="text-sm mt-1">Your recent account activity appears here.</p>
          </div>
          {notifications.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4 opacity-30" />
              <p style={{ color: 'var(--text-muted)' }} className="text-lg">No notifications yet</p>
              <p style={{ color: 'var(--text-muted)' }} className="text-sm mt-2">When someone interacts with you, it will show up here</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border)',
                }}
                className="border rounded-lg p-4 flex items-center justify-between hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                onClick={() => handleMarkAsRead(notification.id, notification.link)}
              >
                <div className="flex-1">
                  <p style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">
                    {notification.title}
                  </p>
                  {notification.message && (
                    <p style={{ color: 'var(--text-secondary)' }} className="text-sm mt-1">
                      {notification.message}
                    </p>
                  )}
                  <p style={{ color: 'var(--text-muted)' }} className="text-xs mt-2">
                    {new Date(notification.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {notification.is_read ? (
                    <p style={{ color: 'var(--text-muted)' }} className="text-sm">Read</p>
                  ) : (
                    <>
                      <div className="w-2 h-2 rounded-full bg-[var(--primary)]" />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id, notification.link);
                        }}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Mark read
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      </div>
    </AppLayout>
  );
};

export default Notifications;
