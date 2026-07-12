import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { NotificationsResponse } from '../lib/types';

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<NotificationsResponse | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    api.get<NotificationsResponse>('/me/notifications').then(setData);
  }, [open]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        className="relative p-2 text-white/40 hover:text-white/70 hover:bg-white/[0.04] rounded-full transition-all"
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {data && data.unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-lg">
            {data.unreadCount > 9 ? '9+' : data.unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-80 rounded-2xl bg-[#0a0a18]/95 border border-white/[0.06] shadow-2xl shadow-black/40 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04]">
            <span className="text-sm font-semibold text-white/60">Notifications</span>
            {data && data.unreadCount > 0 && (
              <button
                className="text-[11px] font-semibold text-primary-300 hover:text-primary-200"
                onClick={async () => { await api.post('/notifications/read-all'); setData((prev) => prev ? { ...prev, unreadCount: 0, notifications: prev.notifications.map((n) => ({ ...n, read: true })) } : null); }}
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {data && data.notifications.length > 0 ? (
              data.notifications.slice(0, 10).map((n) => (
                <div key={n.id} className={`px-4 py-3 border-b border-white/[0.02] last:border-0 text-sm ${n.read ? '' : 'bg-primary-500/[0.03]'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-white/70 text-[13px]">{n.title}</p>
                    {!n.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-400" />}
                  </div>
                  <p className="mt-0.5 text-xs text-white/30 line-clamp-2">{n.message}</p>
                  <p className="mt-1 text-[10px] text-white/20 font-medium">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="px-4 py-8 text-center text-sm text-white/30">No notifications</p>
            )}
          </div>
          <Link
            to="/notifications"
            className="block border-t border-white/[0.04] px-4 py-3 text-center text-[11px] font-semibold text-primary-300 hover:text-primary-200"
            onClick={() => setOpen(false)}
          >
            View all
          </Link>
        </div>
      )}
    </div>
  );
}

export { NotificationBell };
