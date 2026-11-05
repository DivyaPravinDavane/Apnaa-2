'use client';

import React, { useState, useEffect } from 'react';
import { useSociety } from '@/context/SocietyContext';
import { Search, X, CalendarCheck, Users, BellRing, Calendar, ArrowRight } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export function GlobalSearchModal({ isOpen, onClose, onNavigate }: GlobalSearchModalProps) {
  const { amenities, notices, events, visitors } = useSociety();
  const [query, setQuery] = useState('');

  // Handle ESC and CMD+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // toggle or open
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  const filteredAmenities = trimmed
    ? amenities.filter(
        (a) => a.name.toLowerCase().includes(trimmed) || a.category.toLowerCase().includes(trimmed)
      )
    : [];

  const filteredNotices = trimmed
    ? notices.filter(
        (n) => n.title.toLowerCase().includes(trimmed) || n.category.toLowerCase().includes(trimmed)
      )
    : [];

  const filteredEvents = trimmed
    ? events.filter(
        (e) => e.title.toLowerCase().includes(trimmed) || e.category.toLowerCase().includes(trimmed)
      )
    : [];

  const filteredVisitors = trimmed
    ? visitors.filter(
        (v) =>
          v.name.toLowerCase().includes(trimmed) ||
          v.passCode.toLowerCase().includes(trimmed) ||
          v.purpose.toLowerCase().includes(trimmed)
      )
    : [];

  const hasResults =
    filteredAmenities.length > 0 ||
    filteredNotices.length > 0 ||
    filteredEvents.length > 0 ||
    filteredVisitors.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#0D5C63]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search amenities, visitors, notices, events..."
            autoFocus
            className="flex-1 bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none text-base"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-semibold px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-600"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-4">
          {!query && (
            <div className="py-8 text-center text-slate-400 text-sm">
              Type keywords to instantly search across the society platform.
            </div>
          )}

          {query && !hasResults && (
            <div className="py-8 text-center text-slate-500 text-sm">
              No results found for &ldquo;<span className="font-semibold text-slate-800">{query}</span>&rdquo;.
            </div>
          )}

          {/* Amenities results */}
          {filteredAmenities.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Amenities</p>
              <div className="space-y-1">
                {filteredAmenities.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => {
                      onNavigate('resident_amenities');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F4F9F9] text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#0D5C63] flex items-center justify-center">
                        <CalendarCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-[#0D5C63]">
                          {a.name}
                        </p>
                        <p className="text-xs text-slate-500">{a.category} • {a.operatingHours}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#0D5C63]" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notices results */}
          {filteredNotices.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Notices</p>
              <div className="space-y-1">
                {filteredNotices.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      onNavigate('resident_notices');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F4F9F9] text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                        <BellRing className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-[#0D5C63]">
                          {n.title}
                        </p>
                        <p className="text-xs text-slate-500">{n.category} • {n.publishDate}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#0D5C63]" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Events results */}
          {filteredEvents.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Events</p>
              <div className="space-y-1">
                {filteredEvents.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => {
                      onNavigate('resident_events');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F4F9F9] text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-[#0D5C63]">
                          {e.title}
                        </p>
                        <p className="text-xs text-slate-500">{e.date} • {e.venue}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#0D5C63]" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Visitors results */}
          {filteredVisitors.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Visitors</p>
              <div className="space-y-1">
                {filteredVisitors.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      onNavigate('resident_visitors');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F4F9F9] text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-[#0D5C63]">
                          {v.name} ({v.passCode})
                        </p>
                        <p className="text-xs text-slate-500">{v.purpose} • Flat {v.unit}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#0D5C63]" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
