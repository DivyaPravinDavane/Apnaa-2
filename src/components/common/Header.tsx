'use client';

import React, { useState } from 'react';
import { useSociety } from '@/context/SocietyContext';
import { 
  Bell, 
  Search, 
  CloudSun, 
  User as UserIcon, 
  LogOut, 
  Settings, 
  Menu,
} from 'lucide-react';
import Image from 'next/image';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onOpenNotifications?: () => void;
  onOpenSearch?: () => void;
  onLogout?: () => void;
}

export function Header({ onToggleSidebar, onOpenNotifications, onOpenSearch, onLogout }: HeaderProps) {
  const { currentUser, currentRole, unreadNotificationsCount, setRole } = useSociety();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const formattedDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur border-b border-[#E4EBE7] px-4 lg:px-8 flex items-center justify-between">
      {/* Left: Mobile Toggle & Search Bar */}
      <div className="flex items-center gap-3 lg:gap-4 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search trigger button */}
        <button
          onClick={onOpenSearch}
          className="w-full max-w-md flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[#F8F6FC] hover:bg-[#F1ECF9] border border-[#EAE2F2] text-left text-sm text-slate-500 transition-colors cursor-pointer group"
        >
          <Search className="w-4 h-4 text-[#6B21A8] group-hover:scale-110 transition-transform" />
          <span className="truncate">Search amenities, visitors, notices, events...</span>
          <kbd className="hidden sm:inline-block ml-auto text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-400 font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Date, Weather, Notifications, Profile */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Date & Weather widget */}
        <div className="hidden md:flex items-center gap-3 text-xs text-[#6E6280] border-r border-[#EAE2F2] pr-4">
          <span>{formattedDate}</span>
          <div className="flex items-center gap-1.5 font-medium text-[#1C1326] bg-[#F8F6FC] px-2 py-1 rounded-md">
            <CloudSun className="w-4 h-4 text-amber-500" />
            <span>28°C Mumbai</span>
          </div>
        </div>

        {/* Notifications Icon with Badge */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-[#F8F6FC] transition-colors focus:outline-none"
          aria-label="View notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#DC4444] text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 p-1 rounded-full hover:ring-2 hover:ring-[#6B21A8]/30 transition-all focus:outline-none"
          >
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#EAE2F2]">
              {currentUser.avatar ? (
                <Image
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#6B21A8] text-white flex items-center justify-center font-bold text-xs">
                  {currentUser.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="hidden sm:block text-left text-xs leading-tight">
              <p className="font-semibold text-[#1C1326]">{currentUser.name}</p>
              <p className="text-[11px] text-[#6E6280]">{currentUser.unit}</p>
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-sm">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="font-semibold text-slate-900">{currentUser.name}</p>
                <p className="text-xs text-slate-500">{currentUser.email}</p>
                <span className="inline-block mt-1 text-[10px] font-bold uppercase bg-purple-50 text-[#6B21A8] px-2 py-0.5 rounded-full">
                  {currentRole.toUpperCase()} • {currentUser.unit}
                </span>
              </div>

              <a
                href="#profile"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50"
              >
                <UserIcon className="w-4 h-4 text-slate-400" />
                <span>My Household Profile</span>
              </a>

              <a
                href="#settings"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Preferences & Privacy</span>
              </a>

              <div className="border-t border-slate-100 my-1" />

              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  if (onLogout) {
                    onLogout();
                  } else {
                    setRole('resident');
                  }
                }}
                className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Return to Landing / Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
