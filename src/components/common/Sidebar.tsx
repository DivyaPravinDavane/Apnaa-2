'use client';

import React from 'react';
import { useSociety } from '@/context/SocietyContext';
import { UserRole } from '@/types';
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
  Clock,
  LogOut,
  RefreshCw,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ currentTab, onSelectTab, isOpen, onClose }: SidebarProps) {
  const { currentRole, setRole, currentUser, logout, resetDemoData } = useSociety();

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

    return [
      { id: 'resident_home', label: 'Home', icon: Home },
      { id: 'resident_visitors', label: 'Visitors & Passes', icon: Users },
      { id: 'resident_amenities', label: 'Book Amenities', icon: CalendarCheck },
      { id: 'resident_bookings', label: 'My Bookings', icon: BookmarkCheck },
      { id: 'resident_notices', label: 'Notices & Circulars', icon: BellRing },
      { id: 'resident_events', label: 'Community Events', icon: Calendar },
      { id: 'resident_members', label: 'Member Directory', icon: Users },
      { id: 'resident_gallery', label: 'Photo Gallery', icon: ImageIcon },
      { id: 'resident_notifications', label: 'Notifications', icon: BellRing },
      { id: 'resident_profile', label: 'My Profile', icon: User },
      { id: 'resident_settings', label: 'Privacy & Settings', icon: Settings },
    ];
  };

  const navItems = getNavItems();
  const quickRoles: { role: UserRole; label: string }[] = [
    { role: 'resident', label: 'Resident' },
    { role: 'admin', label: 'Admin' },
    { role: 'security', label: 'Security' },
    { role: 'facility', label: 'Facility' },
  ];

  return (
    <>
      {/* Backdrop inside mobile screen */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
          aria-hidden="true"
        />
      )}

      {/* Slide-over Mobile App Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[82%] max-w-[310px] bg-[#073B3E] text-white flex flex-col transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-14 px-4 border-b border-purple-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#147A7F] to-[#0D5C63] flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4 text-purple-200" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight text-white leading-tight">Smart Society</h1>
              <p className="text-[9px] text-purple-300/80 uppercase tracking-wider font-medium">
                Mobile App v2.4
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-purple-300 hover:text-white hover:bg-purple-800/50"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Card & Quick Switcher */}
        <div className="p-3 mx-3 mt-2.5 rounded-2xl bg-purple-950/80 border border-purple-800/60 space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0D5C63] flex items-center justify-center text-purple-100 font-bold text-sm">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] text-purple-300 truncate">
                Flat {currentUser.unit} • {currentRole.toUpperCase()}
              </p>
            </div>
          </div>

          <div>
            <p className="text-[9px] uppercase tracking-wider text-purple-300/70 font-bold mb-1">
              Switch App Role
            </p>
            <div className="grid grid-cols-4 gap-1">
              {quickRoles.map((r) => (
                <button
                  key={r.role}
                  onClick={() => {
                    setRole(r.role);
                    onClose();
                  }}
                  className={`py-1 rounded-lg text-[10px] font-bold transition-colors ${
                    currentRole === r.role
                      ? 'bg-[#0D5C63] text-white shadow-xs'
                      : 'bg-purple-900/50 text-purple-200 hover:bg-purple-800/60'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-2.5 space-y-1">
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
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#0D5C63] text-white shadow-sm font-semibold'
                    : 'text-purple-100/80 hover:text-white hover:bg-purple-900/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-purple-200' : 'text-purple-300/70'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-purple-800/60 space-y-1.5">
          <div className="flex gap-1.5">
            <button
              onClick={() => {
                resetDemoData();
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-purple-900/50 hover:bg-purple-800/70 text-purple-200 text-[11px] font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
            <button
              onClick={() => {
                void logout();
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-[11px] font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock App</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
