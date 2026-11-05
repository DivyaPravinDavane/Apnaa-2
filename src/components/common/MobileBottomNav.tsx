'use client';

import React from 'react';
import {
  Home,
  Building2,
  Bell,
  User,
  Search,
  MoreHorizontal,
  BarChart3,
  Users,
  Shield,
  Clock,
  Layers,
  Calendar,
  type LucideIcon,
} from 'lucide-react';
import { useSociety } from '@/context/SocietyContext';

interface MobileBottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenMenu: () => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
}

type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  action?: 'notifications' | 'menu';
  badge?: number;
};

export function MobileBottomNav({
  currentTab,
  onSelectTab,
  onOpenMenu,
  onOpenSearch,
  onOpenNotifications,
}: MobileBottomNavProps) {
  const { currentRole, unreadNotificationsCount } = useSociety();

  const activityBadge = Math.max(unreadNotificationsCount, 5);

  const activity: NavItem = {
    id: 'activity',
    label: 'Activity',
    icon: Bell,
    action: 'notifications',
    badge: activityBadge,
  };
  const more: NavItem = { id: 'more', label: 'More', icon: MoreHorizontal, action: 'menu' };

  const getItems = (): NavItem[] => {
    if (currentRole === 'admin') {
      return [
        { id: 'admin_dashboard', label: 'Home', icon: BarChart3 },
        { id: 'admin_residents', label: 'My Unit', icon: Users },
        activity,
        { id: 'admin_settings', label: 'Profile', icon: User },
      ];
    }
    if (currentRole === 'security') {
      return [
        { id: 'security_gate', label: 'Gate', icon: Shield },
        { id: 'security_logs', label: 'Logs', icon: Clock },
        activity,
        more,
      ];
    }
    if (currentRole === 'facility') {
      return [
        { id: 'facility_dashboard', label: 'Desk', icon: Layers },
        { id: 'facility_schedule', label: 'Schedule', icon: Calendar },
        activity,
        more,
      ];
    }
    return [
      { id: 'resident_home', label: 'Home', icon: Home },
      { id: 'resident_bookings', label: 'My Unit', icon: Building2 },
      activity,
      { id: 'resident_profile', label: 'Profile', icon: User },
    ];
  };

  const items = getItems();
  const left = items.slice(0, 2);
  const right = items.slice(2);

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = !item.action && currentTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => {
          if (item.action === 'notifications') onOpenNotifications();
          else if (item.action === 'menu') onOpenMenu();
          else onSelectTab(item.id);
        }}
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
          isActive ? 'text-[#0D5C63]' : 'text-slate-600 hover:text-[#0D5C63]'
        }`}
      >
        <div className="relative">
          <Icon className={`w-[21px] h-[21px] ${isActive ? 'stroke-[2.3]' : 'stroke-[1.75]'}`} />
          {item.badge ? (
            <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-[#0D5C63] text-white text-[9px] font-bold flex items-center justify-center shadow-2xs">
              {item.badge}
            </span>
          ) : null}
        </div>
        <span className={`text-[10px] mt-0.5 ${isActive ? 'font-bold text-[#0D5C63]' : 'font-medium'}`}>
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <div className="relative z-30 bg-white border-t border-slate-200/80 px-2 pt-1.5 pb-2 shadow-[0_-4px_16px_rgba(7,59,62,0.08)]">
      <div className="flex items-end">
        {left.map(renderItem)}

        {/* Floating Centre Search Button */}
        <div className="w-16 flex justify-center">
          <button
            onClick={onOpenSearch}
            aria-label="Search"
            className="-mt-6 w-12 h-12 rounded-full bg-white border border-slate-200/90 shadow-[0_4px_14px_rgba(7,59,62,0.16)] flex items-center justify-center text-slate-600 hover:text-[#0D5C63] active:scale-95 transition-all"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        {right.map(renderItem)}
      </div>
    </div>
  );
}
