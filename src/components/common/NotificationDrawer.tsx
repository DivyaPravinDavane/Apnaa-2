'use client';

import React, { useState } from 'react';
import { useSociety } from '@/context/SocietyContext';
import { X, CheckCheck, Bell, Shield, BookmarkCheck, Calendar, BellRing } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export function NotificationDrawer({ isOpen, onClose, onNavigate }: NotificationDrawerProps) {
  const { notifications, markNotificationRead, markAllNotificationsRead, unreadNotificationsCount } = useSociety();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!isOpen) return null;

  const displayedNotifications = filter === 'unread'
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  const getIcon = (type: string) => {
    switch (type) {
      case 'visitor':
        return <Shield className="w-4 h-4 text-emerald-600" />;
      case 'booking':
        return <BookmarkCheck className="w-4 h-4 text-[#6B21A8]" />;
      case 'event':
        return <Calendar className="w-4 h-4 text-purple-600" />;
      default:
        return <BellRing className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-[#240B3B] text-white">
            <div className="flex items-center gap-2.5">
              <Bell className="w-5 h-5 text-purple-300" />
              <h2 className="font-semibold text-base">Notifications</h2>
              {unreadNotificationsCount > 0 && (
                <span className="text-xs font-bold bg-[#DC4444] text-white px-2 py-0.5 rounded-full">
                  {unreadNotificationsCount} new
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-purple-200 hover:text-white hover:bg-purple-800/60 transition-colors"
              aria-label="Close notifications panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subheader Filters & Mark All */}
          <div className="px-6 py-3 bg-[#F8F6FC] border-b border-[#EAE2F2] flex items-center justify-between text-xs">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-[#6B21A8] text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 rounded-full font-medium transition-colors ${
                  filter === 'unread'
                    ? 'bg-[#6B21A8] text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                Unread ({unreadNotificationsCount})
              </button>
            </div>

            {unreadNotificationsCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="flex items-center gap-1 text-[#6B21A8] hover:text-[#581C87] font-semibold"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
            {displayedNotifications.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-medium">No notifications</p>
                <p className="text-xs text-slate-500 mt-1">You are all caught up!</p>
              </div>
            ) : (
              displayedNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    markNotificationRead(notif.id);
                    if (notif.type === 'visitor') onNavigate('resident_visitors');
                    if (notif.type === 'booking') onNavigate('resident_bookings');
                    if (notif.type === 'notice') onNavigate('resident_notices');
                    if (notif.type === 'event') onNavigate('resident_events');
                    onClose();
                  }}
                  className={`p-4 rounded-xl transition-all cursor-pointer flex items-start gap-3.5 ${
                    notif.isRead
                      ? 'hover:bg-slate-50 opacity-80'
                      : 'bg-[#F8F6FC]/70 hover:bg-[#F1ECF9] border-l-4 border-[#6B21A8]'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white shadow-sm border border-slate-100 flex-shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                        {notif.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
