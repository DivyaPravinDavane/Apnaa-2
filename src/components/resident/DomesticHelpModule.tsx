'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Plus,
  QrCode,
  Phone,
  Star,
  CheckCircle2,
  Clock,
  ArrowLeft,
  X,
  Share2,
  ShieldCheck,
} from 'lucide-react';
import { SocietyApi } from '@/lib/api';
import { useSociety } from '@/context/SocietyContext';
import type { DomesticStaff } from '@/types';

interface DomesticHelpModuleProps {
  onBack?: () => void;
}

export function DomesticHelpModule({ onBack }: DomesticHelpModuleProps) {
  const { currentUser, addToast } = useSociety();
  const [staffList, setStaffList] = useState<DomesticStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<DomesticStaff | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [role, setRole] = useState('House Maid & Cleaner');
  const [phone, setPhone] = useState('');

  const loadStaff = useCallback(async () => {
    setLoading(true);
    try {
      const res = await SocietyApi.domesticStaff.list();
      if (res.data) {
        setStaffList(res.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStaff();
  }, [loadStaff]);

  const handleIssuePass = async (staff: DomesticStaff) => {
    const res = await SocietyApi.domesticStaff.issuePass(staff.id);
    if (res.data) {
      setStaffList((prev) =>
        prev.map((s) =>
          s.id === staff.id
            ? { ...s, passCode: res.data!.passCode, status: 'inside', entryTime: 'Just now' }
            : s
        )
      );
      addToast(
        'Gate Pass Reissued',
        `New Pass ${res.data.passCode} issued for ${staff.name}. Gate security updated.`,
        'success'
      );
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const res = await SocietyApi.domesticStaff.add({
      name: name.trim(),
      role,
      phone: phone.trim() || '+91 98000 00000',
    });

    if (res.data) {
      setStaffList((prev) => [res.data!, ...prev]);
      setAddModalOpen(false);
      setName('');
      setPhone('');
      addToast(
        'Staff Onboarded',
        `${res.data.name} added. Digital Pass: ${res.data.passCode}`,
        'success'
      );
    }
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-base font-bold text-[#0E2628]">Daily Help &amp; Domestic Staff</h1>
            <p className="text-[11px] text-[#4E6E70]">Gate Passes, Live Attendance &amp; Ratings</p>
          </div>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="px-3 py-1.5 rounded-full bg-[#0D5C63] text-white text-xs font-bold hover:bg-[#094348] transition-colors flex items-center gap-1 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Helper</span>
        </button>
      </div>

      {/* Real-time Domestic Attendance Banner */}
      <div className="p-3.5 rounded-2xl bg-[#E6F3F3] border border-[#C4E4E6] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#0D5C63] text-white flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-xs text-[#073B3E]">Daily Attendance Alert</p>
            <p className="text-[11px] text-[#0E2628]/80">
              {staffList.filter((s) => s.status === 'inside').length} of {staffList.length} helper(s) currently inside the community
            </p>
          </div>
        </div>
      </div>

      {/* Staff Cards */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading daily staff…</div>
        ) : staffList.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No domestic staff registered for Flat {currentUser.unit}.
          </div>
        ) : (
          staffList.map((staff) => {
            const isInside = staff.status === 'inside';
            return (
              <div
                key={staff.id}
                className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#0D5C63]/40 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#0D5C63] text-white flex items-center justify-center font-bold text-base shadow-xs">
                      {staff.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#0E2628]">{staff.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            isInside
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isInside ? '● INSIDE' : 'OUTSIDE'}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#0D5C63] mt-0.5">{staff.role}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          {staff.rating}
                        </span>
                        <span>•</span>
                        <span>Flat {staff.unit}</span>
                      </div>
                    </div>
                  </div>

                  {/* QR Pass Code Tag */}
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Pass Code
                    </span>
                    <span className="font-mono font-bold text-xs text-[#0D5C63] bg-[#E6F3F3] px-2 py-0.5 rounded-md">
                      {staff.passCode}
                    </span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {isInside
                        ? `Entered: ${staff.entryTime || '08:15 AM'}`
                        : `Last Out: ${staff.exitTime || 'Yesterday'}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${staff.phone}`}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="Call helper"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => setSelectedStaff(staff)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                    >
                      <QrCode className="w-3 h-3" />
                      <span>View QR</span>
                    </button>
                    <button
                      onClick={() => handleIssuePass(staff)}
                      className="px-2.5 py-1 rounded-lg bg-[#E6F3F3] hover:bg-[#C4E4E6] text-[#0D5C63] font-bold text-[11px] transition-colors"
                    >
                      New Pass
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* QR Code Pass Modal */}
      {selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xs bg-white rounded-3xl p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0D5C63] uppercase tracking-wider">
                Digital Staff Pass
              </span>
              <button onClick={() => setSelectedStaff(null)} className="text-slate-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block shadow-inner">
              <div className="w-40 h-40 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-2 mx-auto">
                {/* SVG QR Code Simulation */}
                <QrCode className="w-32 h-32 text-[#073B3E]" />
              </div>
            </div>

            <div>
              <p className="font-bold text-base text-[#0E2628]">{selectedStaff.name}</p>
              <p className="text-xs text-[#0D5C63] font-semibold">{selectedStaff.role}</p>
              <p className="text-sm font-mono font-bold text-slate-700 mt-1">
                Pass: {selectedStaff.passCode}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Authorized for Flat {selectedStaff.unit} • Valid for Gate 1 &amp; Gate 2
              </p>
            </div>

            <button
              onClick={() => {
                addToast('Pass Link Copied', `Pass code ${selectedStaff.passCode} copied.`, 'info');
                setSelectedStaff(null);
              }}
              className="w-full py-2.5 rounded-xl bg-[#0D5C63] text-white font-bold text-xs hover:bg-[#094348]"
            >
              Share with Guard / Helper
            </button>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs">
          <div className="w-full bg-white rounded-t-[28px] p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 rounded-full bg-slate-300 mx-auto" />
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0E2628]">Add Domestic Helper</h3>
              <button onClick={() => setAddModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Helper Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunita Bai"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0D5C63]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Category / Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0D5C63]"
                >
                  <option value="House Maid & Cleaner">House Maid &amp; Cleaner</option>
                  <option value="Cook & Chef">Cook &amp; Chef</option>
                  <option value="Personal Driver">Personal Driver</option>
                  <option value="Baby Care / Nanny">Baby Care / Nanny</option>
                  <option value="Car Cleaner">Car Cleaner</option>
                  <option value="Gardener">Gardener</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  placeholder="+91 98200 00000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0D5C63]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#0D5C63] text-white font-bold text-xs hover:bg-[#094348] transition-colors shadow-md mt-2"
              >
                Generate Pass &amp; Onboard
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

