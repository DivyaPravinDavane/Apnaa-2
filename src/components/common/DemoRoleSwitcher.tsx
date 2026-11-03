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
  const { currentRole, setRole, currentUser, resetDemoData } = useSociety();
  const [isOpen, setIsOpen] = useState(false);

  const roles: { role: UserRole; title: string; subtitle: string; icon: LucideIcon; color: string }[] = [
    {
      role: 'resident',
      title: 'Resident',
      subtitle: 'Flat A-1204 (Priya Sharma)',
      icon: Home,
      color: 'bg-purple-700 text-white',
    },
    {
      role: 'admin',
      title: 'Administrator',
      subtitle: 'Secretary (Rajesh Nair)',
      icon: Building2,
      color: 'bg-purple-900 text-white',
    },
    {
      role: 'security',
      title: 'Security Guard',
      subtitle: 'Gate 1 (Vikram Singh)',
      icon: Shield,
      color: 'bg-slate-900 text-white',
    },
    {
      role: 'facility',
      title: 'Facility Manager',
      subtitle: 'Clubhouse Desk (Anand Verma)',
      icon: UserCheck,
      color: 'bg-purple-800 text-white',
    },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="mb-3 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden"
          >
            <div className="px-4 py-3 bg-[#240B3B] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-300" />
                <span className="text-xs font-semibold tracking-wide uppercase">Demonstration Switcher</span>
              </div>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium">Demo Mode</span>
            </div>

            <div className="p-3 space-y-1.5">
              <p className="text-[11px] font-medium text-slate-500 px-2 uppercase tracking-wider">Select Experience</p>
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
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${
                      isActive
                        ? 'bg-purple-50 border border-purple-200 shadow-sm'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-semibold ${isActive ? 'text-purple-950' : 'text-slate-800'}`}>
                          {item.title}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-bold bg-[#6B21A8] text-white px-2 py-0.5 rounded-full">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate">{item.subtitle}</p>
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
                  className="w-full mt-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#6B21A8] text-xs font-bold transition-colors border border-purple-200"
                >
                  <span>View Society Overview & Campus</span>
                </button>
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Need fresh test data?</span>
              <button
                onClick={() => {
                  resetDemoData();
                  setIsOpen(false);
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Data
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pill Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-[#240B3B] hover:bg-[#6B21A8] text-white shadow-xl hover:shadow-2xl transition-all border border-purple-500/40 focus:outline-none"
        aria-label="Toggle Demo Role Menu"
      >
        <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
        <span className="text-xs font-semibold uppercase tracking-wider">
          Role: <span className="font-bold text-purple-200">{currentRole}</span>
        </span>
        <span className="text-xs opacity-70">({currentUser.name.split(' ')[0]})</span>
        {isOpen ? <ChevronDown className="w-4 h-4 text-purple-300" /> : <ChevronUp className="w-4 h-4 text-purple-300" />}
      </button>
    </div>
  );
}
