import { useState, useEffect } from 'react';
import { Button, Card, CardContent, Spinner } from '@demp/ui';
import { api } from '../lib/api';
import type { NotificationsResponse, NotificationItem } from '../lib/types';

function Notifications() {
  const [data, setData] = useState<NotificationsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    api.get<NotificationsResponse>('/me/notifications')
      .then(setData)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleMarkRead = async (id: string) => {
    await api.put(`/notifications/${id}/read`);
    setData((prev) => prev ? {
      ...prev,
      unreadCount: Math.max(0, prev.unreadCount - 1),
      notifications: prev.notifications.map((n) => n.id === id ? { ...n, read: true } : n),
    } : prev);
  };

  const handleMarkAllRead = async () => {
    await api.post('/notifications/read-all');
    setData((prev) => prev ? {
      ...prev,
      unreadCount: 0,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    } : prev);
  };

  if (loading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] sm:text-[28px] font-bold text-white/90 tracking-tight">Notifications</h1>
        {data && data.unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>Mark all read</Button>
        )}
      </div>

      {data && data.notifications.length > 0 ? (
        <div className="space-y-2">
          {data.notifications.map((n: NotificationItem) => (
            <Card key={n.id} className={n.read ? '' : 'border-primary-500/30 bg-primary-500/5'}>
              <CardContent className="flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-white">{n.title}</p>
                    {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary-400 shadow-lg shadow-primary-400/50" />}
                  </div>
                  <p className="text-sm text-white/50">{n.message}</p>
                  <p className="text-xs text-white/30">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.read && (
                  <Button variant="ghost" size="sm" onClick={() => handleMarkRead(n.id)} className="shrink-0">
                    Mark read
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card><CardContent><p className="text-sm text-white/40">No notifications yet.</p></CardContent></Card>
      )}
    </div>
  );
}

export default Notifications;
