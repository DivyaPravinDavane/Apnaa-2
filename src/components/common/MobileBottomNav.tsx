'use client';

import React from 'react';
import { Home, Users, BookmarkCheck, BellRing, MoreHorizontal } from 'lucide-react';
import { useSociety } from '@/context/SocietyContext';

interface MobileBottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenMenu: () => void;
}

export function MobileBottomNav({ currentTab, onSelectTab, onOpenMenu }: MobileBottomNavProps) {
  const { currentRole, unreadNotificationsCount } = useSociety();

  if (currentRole !== 'resident') {
    // For admin, security, facility, keep standard mobile experience or bottom bar
    return null;
  }

  const items = [
    { id: 'resident_home', label: 'Home', icon: Home },
    { id: 'resident_visitors', label: 'Visitors', icon: Users },
    { id: 'resident_bookings', label: 'Bookings', icon: BookmarkCheck },
    { id: 'resident_notices', label: 'Notices', icon: BellRing, badge: unreadNotificationsCount > 0 },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur border-t border-[#EAE2F2] px-3 py-1.5 flex items-center justify-around shadow-lg">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-colors relative ${
              isActive ? 'text-[#6B21A8]' : 'text-[#6E6280] hover:text-[#1C1326]'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.badge && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </div>
            <span className={`text-[10px] mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
              {item.label}
            </span>
          </button>
        );
      })}

      <button
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center p-1.5 rounded-lg text-[#6E6280] hover:text-[#1C1326]"
      >
        <MoreHorizontal className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-0.5">More</span>
      </button>
    </div>
  );
}
