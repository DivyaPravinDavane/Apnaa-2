'use client';

import React from 'react';
import { useSociety } from '@/context/SocietyContext';
import {
  Home,
  Users,
  CalendarCheck,
  BookmarkCheck,
  BellRing,
  Calendar,
  Image as ImageIcon,
  User,
  Settings,
  Shield,
  QrCode,
  FileText,
  BarChart3,
  Sliders,
  X,
  Sparkles,
  ClipboardList,
  Layers,
  Clock
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ currentTab, onSelectTab, isOpen, onClose }: SidebarProps) {
  const { currentRole, currentUser } = useSociety();

  // Navigation Items mapped by role
  const getNavItems = () => {
    if (currentRole === 'admin') {
      return [
        { id: 'admin_dashboard', label: 'Overview', icon: BarChart3 },
        { id: 'admin_residents', label: 'Residents & Units', icon: Users },
        { id: 'admin_visitors', label: 'Visitor Logs', icon: Shield },
        { id: 'admin_amenities', label: 'Amenities & Rules', icon: CalendarCheck },
        { id: 'admin_bookings', label: 'All Bookings', icon: BookmarkCheck },
        { id: 'admin_notices', label: 'Notices & Circulars', icon: BellRing },
        { id: 'admin_events', label: 'Events & Programs', icon: Calendar },
        { id: 'admin_gallery', label: 'Gallery Moderation', icon: ImageIcon },
        { id: 'admin_audit', label: 'Audit Logs & Reports', icon: FileText },
        { id: 'admin_settings', label: 'Society Settings', icon: Sliders },
      ];
    }

    if (currentRole === 'security') {
      return [
        { id: 'security_gate', label: 'Gate Dashboard', icon: Shield },
        { id: 'security_scan', label: 'Scan QR Pass', icon: QrCode },
        { id: 'security_register', label: 'Register Walk-in', icon: Users },
        { id: 'security_lookup', label: 'Manual Pass Lookup', icon: ClipboardList },
        { id: 'security_logs', label: "Today's Gate Log", icon: Clock },
      ];
    }

    if (currentRole === 'facility') {
      return [
        { id: 'facility_dashboard', label: 'Facility Dashboard', icon: Layers },
        { id: 'facility_schedule', label: "Today's Schedule", icon: Calendar },
        { id: 'facility_verify', label: 'Verify Booking', icon: QrCode },
        { id: 'facility_closures', label: 'Closures & Rules', icon: Sliders },
      ];
    }

    // Default: Resident
    return [
      { id: 'resident_home', label: 'Home', icon: Home },
      { id: 'resident_visitors', label: 'Visitors', icon: Users },
      { id: 'resident_amenities', label: 'Amenities', icon: CalendarCheck },
      { id: 'resident_bookings', label: 'My Bookings', icon: BookmarkCheck },
      { id: 'resident_notices', label: 'Notices', icon: BellRing },
      { id: 'resident_events', label: 'Events', icon: Calendar },
      { id: 'resident_members', label: 'Members', icon: Users },
      { id: 'resident_gallery', label: 'Gallery', icon: ImageIcon },
      { id: 'resident_notifications', label: 'Notifications', icon: BellRing },
      { id: 'resident_profile', label: 'My Profile', icon: User },
      { id: 'resident_settings', label: 'Settings', icon: Settings },
    ];
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#240B3B] text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-purple-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#9333EA] to-[#6B21A8] flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-white leading-tight">Smart Society</h1>
              <p className="text-[10px] text-purple-300/80 uppercase tracking-wider font-medium">
                Connected • Secure
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-purple-300 hover:text-white hover:bg-purple-800/50"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Card */}
        <div className="p-3.5 mx-3 my-2.5 rounded-xl bg-purple-950/70 border border-purple-800/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#6B21A8] flex items-center justify-center text-purple-200 font-bold text-xs">
            {currentUser.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
            <p className="text-[11px] text-purple-300 truncate">{currentUser.unit} • {currentRole.toUpperCase()}</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#6B21A8] text-white shadow-sm font-semibold'
                    : 'text-purple-100/80 hover:text-white hover:bg-purple-900/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-purple-200' : 'text-purple-300/70'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-purple-800/60 text-[11px] text-purple-300/70 flex items-center justify-between">
          <span>Green Valley Residency</span>
          <span className="font-mono text-[10px] bg-purple-900/60 px-1.5 py-0.5 rounded text-purple-200">v2.4</span>
        </div>
      </aside>
    </>
  );
}
