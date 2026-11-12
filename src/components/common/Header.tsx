'use client';

import React, { useState } from 'react';
import { useSociety } from '@/context/SocietyContext';
import {
  User as UserIcon,
  LogOut,
  Settings,
  ChevronsDown,
  ChevronDown,
  RefreshCw,
  Shield,
  Building2,
  Check,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onOpenNotifications?: () => void;
  onOpenSearch?: () => void;
  onNavigate?: (tab: string) => void;
  onLogout?: () => void;
}

export function Header({ onToggleSidebar, onNavigate, onLogout }: HeaderProps) {
  const { currentUser, currentRole, visitors, setRole, refreshData, addToast } = useSociety();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [complexDropdownOpen, setComplexDropdownOpen] = useState(false);
  const [activeComplex, setActiveComplex] = useState('Smart Community');

  const complexes = [
    { name: 'Smart Community', unit: currentUser.unit || 'A-101', society: 'Apnaa Green Valley' },
    { name: 'Westend Heights', unit: 'C-404', society: 'Westend Residency' },
    { name: 'Royal Palms', unit: 'B-202', society: 'Royal Palms Enclave' },
  ];

  const visitorCount = visitors.filter(
    (v) =>
      (currentRole !== 'resident' || v.unit === currentUser.unit) &&
      (v.status === 'expected' || v.status === 'approved' || v.status === 'pending')
  ).length;

  const formattedVisitorCount = String(Math.max(visitorCount, 3)).padStart(2, '0');

  const handleManualSync = async () => {
    setProfileDropdownOpen(false);
    await refreshData();
    addToast('State Synchronized', 'Latest records refreshed.', 'info');
  };

  const navigateToSettings = () => {
    setProfileDropdownOpen(false);
    if (!onNavigate) return;
    onNavigate(currentRole === 'admin' ? 'admin_settings' : 'resident_profile');
  };

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-[#073B3E] via-[#0D5C63] to-[#147A7F] text-white px-4 pt-2 pb-7 relative select-none">
      {/* Phone status bar simulation (Matching ANACITY screenshot) */}
      <div className="flex items-center justify-between text-[11px] font-semibold text-white/80 mb-2 px-0.5">
        <span>12:55</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold">5G</span>
          <div className="w-5 h-2.5 rounded-xs border border-white/80 p-0.5 flex items-center">
            <div className="w-full h-full bg-emerald-400 rounded-2xs" />
          </div>
        </div>
      </div>

      {/* Top Row: Society Switcher Dropdown on Left + Role/Logout Menu on Right */}
      <div className="flex items-center justify-between gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setComplexDropdownOpen(!complexDropdownOpen)}
            className="flex items-center gap-1.5 text-left group cursor-pointer"
            title="Switch Complex / Apartment"
          >
            <h1 className="font-bold text-[17px] tracking-tight text-white flex items-center gap-1">
              <span>{activeComplex}</span>
              <ChevronDown className={`w-4 h-4 text-emerald-300 transition-transform ${complexDropdownOpen ? 'rotate-180' : ''}`} />
            </h1>
          </button>

          {/* Apartment Complex Switcher Dropdown */}
          {complexDropdownOpen && (
            <div className="absolute left-0 mt-2 w-64 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400">Switch Apartment</p>
                <p className="font-bold text-slate-900">Your Linked Properties</p>
              </div>
              {complexes.map((c) => {
                const isActive = activeComplex === c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      setActiveComplex(c.name);
                      setComplexDropdownOpen(false);
                      addToast('Apartment Switched', `Now viewing ${c.name} (Flat ${c.unit})`, 'success');
                    }}
                    className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      isActive ? 'bg-[#E6F3F3] text-[#0D5C63] font-bold' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <p className="font-bold">{c.name}</p>
                      <p className="text-[11px] text-slate-500">Flat {c.unit} • {c.society}</p>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-[#0D5C63]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="relative flex-shrink-0 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-[10px] font-bold uppercase tracking-wider text-white flex items-center gap-1 transition-colors"
          >
            <span>{currentRole}</span>
          </button>

          {/* Direct Always-Visible Logout Button */}
          <button
            type="button"
            onClick={() => {
              if (onLogout) onLogout();
              else void setRole('resident');
            }}
            className="px-2.5 py-1 rounded-full bg-rose-500/25 hover:bg-rose-500/40 border border-rose-300/40 text-[10px] font-bold text-white flex items-center gap-1 transition-all shadow-2xs active:scale-95"
            title="Logout and return to home"
          >
            <LogOut className="w-3 h-3 text-rose-200" />
            <span>Logout</span>
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 py-1.5 z-50 text-xs">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <p className="font-bold text-slate-900 truncate">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                <span className="inline-block mt-1 text-[9px] font-bold uppercase bg-[#E6F3F3] text-[#0D5C63] px-2 py-0.5 rounded-full">
                  {currentRole} • Flat {currentUser.unit}
                </span>
              </div>

              <button
                type="button"
                onClick={navigateToSettings}
                className="w-full text-left flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50"
              >
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>My Profile</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfileDropdownOpen(false);
                  if (onToggleSidebar) onToggleSidebar();
                }}
                className="w-full text-left flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50"
              >
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span>Switch Role / Drawer</span>
              </button>
              <button
                type="button"
                onClick={navigateToSettings}
                className="w-full text-left flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Preferences & Privacy</span>
              </button>
              <button
                type="button"
                onClick={() => void handleManualSync()}
                className="w-full text-left flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span>Sync Data</span>
              </button>

              <div className="border-t border-slate-100 my-1" />

              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  if (onLogout) onLogout();
                  else setRole('resident');
                }}
                className="w-full text-left flex items-center gap-2 px-3.5 py-2 text-rose-600 hover:bg-rose-50 font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Centered "Visitors(03)" with Downward Double-Chevron */}
      <button
        type="button"
        onClick={() => onNavigate && onNavigate('resident_visitors')}
        className="mx-auto mt-1 flex flex-col items-center justify-center text-white/95 hover:text-white transition-opacity"
      >
        <span className="text-xs font-semibold tracking-wide">
          Visitors({formattedVisitorCount})
        </span>
        <ChevronsDown className="w-4 h-4 text-white/90 mt-0.5 animate-pulse" />
      </button>

      {/* Curved White Sheet Top Lip + Drag Handle Bar */}
      <div className="absolute -bottom-px left-0 right-0 h-5 bg-white rounded-t-[24px] flex items-center justify-center">
        <div className="w-9 h-[3px] rounded-full bg-[#0D5C63]" />
      </div>
    </header>
  );
}
