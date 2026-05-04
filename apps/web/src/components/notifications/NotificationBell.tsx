'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, Circle } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function fetchNotifications() {
    const [notifRes, countRes] = await Promise.all([
      fetch('/api/notifications'),
      fetch('/api/notifications/unread-count'),
    ]);
    if (notifRes.ok) setNotifications((await notifRes.json()).slice(0, 10));
    if (countRes.ok) setUnreadCount((await countRes.json()).count ?? 0);
  }

  async function markAsRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    fetchNotifications();
  }

  async function markAllAsRead() {
    await fetch('/api/notifications/read-all', { method: 'PATCH' });
    fetchNotifications();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setShowDropdown(v => !v)}
        className="relative p-2 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-stone-200 shadow-dropdown z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
            <h3 className="text-sm font-semibold text-stone-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="text-sm text-stone-500">No notifications</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (!notif.isRead) markAsRead(notif.id);
                    if (notif.link) window.location.href = notif.link;
                    else setShowDropdown(false);
                  }}
                  className={`px-4 py-3 hover:bg-stone-50 cursor-pointer transition-colors ${
                    notif.isRead ? '' : 'bg-emerald-50/40'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {!notif.isRead && (
                      <Circle className="w-2 h-2 text-emerald-500 fill-current mt-1.5 shrink-0" />
                    )}
                    <div className={notif.isRead ? 'ml-4' : ''}>
                      <p className="text-sm font-medium text-stone-900 leading-snug">
                        {notif.title}
                      </p>
                      <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>
                      <p className="text-xs text-stone-400 mt-1">
                        {new Date(notif.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
