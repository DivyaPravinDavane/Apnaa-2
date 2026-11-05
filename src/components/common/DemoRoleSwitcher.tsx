'use client';

import React, { useState } from 'react';
import { useSociety } from '@/context/SocietyContext';
import { UserRole } from '@/types';
import { Shield, Home, Building2, UserCheck, RefreshCw, ChevronUp, ChevronDown, Sparkles, type LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DemoRoleSwitcherProps {
  onOpenLanding?: () => void;
  onSelectRole?: (role: UserRole) => void;
}

export function DemoRoleSwitcher({ onOpenLanding, onSelectRole }: DemoRoleSwitcherProps) {
  const { currentRole, setRole, currentUser, resetDemoData, publicOverview } = useSociety();
  const [isOpen, setIsOpen] = useState(false);

  const personas = publicOverview?.personas;

  const roles: { role: UserRole; title: string; subtitle: string; icon: LucideIcon; color: string }[] = [
    {
      role: 'resident',
      title: 'Resident',
      subtitle: `Flat ${personas?.resident.unit || 'A-1204'} (${personas?.resident.name || 'Priya Sharma'})`,
      icon: Home,
      color: 'bg-[#0D5C63] text-white',
    },
    {
      role: 'admin',
      title: 'Administrator',
      subtitle: `${personas?.admin.membershipType || 'Secretary'} (${personas?.admin.name || 'Rajesh Nair'})`,
      icon: Building2,
      color: 'bg-[#073B3E] text-white',
    },
    {
      role: 'security',
      title: 'Security Guard',
      subtitle: `${personas?.security.unit || 'Gate 1'} (${personas?.security.name || 'Vikram Singh'})`,
      icon: Shield,
      color: 'bg-slate-900 text-white',
    },
    {
      role: 'facility',
      title: 'Facility Manager',
      subtitle: `${personas?.facility.unit || 'Clubhouse'} (${personas?.facility.name || 'Anand Verma'})`,
      icon: UserCheck,
      color: 'bg-[#147A7F] text-white',
    },
  ];

  return (
    <div className="fixed bottom-20 right-3 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="mb-2.5 w-72 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden"
          >
            <div className="px-3.5 py-2.5 bg-[#073B3E] text-white flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                <span className="text-[11px] font-semibold tracking-wide uppercase">Switch App Role</span>
              </div>
              <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full font-medium">Live Demo</span>
            </div>

            <div className="p-2.5 space-y-1">
              {roles.map((item) => {
                const Icon = item.icon;
                const isActive = currentRole === item.role;
                return (
                  <button
                    key={item.role}
                    onClick={() => {
                      setRole(item.role);
                      if (onSelectRole) onSelectRole(item.role);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-all ${
                      isActive
                        ? 'bg-[#E6F3F3] border border-[#C4E4E6] shadow-xs'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isActive ? 'text-[#073B3E]' : 'text-slate-800'}`}>
                          {item.title}
                        </span>
                        {isActive && (
                          <span className="text-[9px] font-bold bg-[#0D5C63] text-white px-1.5 py-0.5 rounded-full">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{item.subtitle}</p>
                    </div>
                  </button>
                );
              })}
              {onOpenLanding && (
                <button
                  onClick={() => {
                    onOpenLanding();
                    setIsOpen(false);
                  }}
                  className="w-full mt-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-[#E6F3F3] hover:bg-[#C4E4E6] text-[#0D5C63] text-[11px] font-bold transition-colors border border-[#C4E4E6]"
                >
                  <span>Welcome / Sign-In Screen</span>
                </button>
              )}
            </div>

            <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Fresh state?</span>
              <button
                onClick={() => {
                  resetDemoData();
                  setIsOpen(false);
                }}
                className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-lg transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact Floating Pill Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#073B3E]/95 hover:bg-[#0D5C63] text-white shadow-lg transition-all border border-emerald-400/40 focus:outline-none"
        aria-label="Toggle Demo Role Menu"
      >
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">
          {currentRole}
        </span>
        <span className="text-[10px] opacity-75">({currentUser.name.split(' ')[0]})</span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-emerald-300" /> : <ChevronUp className="w-3.5 h-3.5 text-emerald-300" />}
      </button>
    </div>
  );
}
