'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Flame,
  Droplets,
  ShieldAlert,
  Radio,
  X,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { SocietyApi } from '@/lib/api';
import { useSociety } from '@/context/SocietyContext';

interface EmergencyBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PRESET_EMERGENCIES = [
  {
    type: 'Fire Alert',
    icon: Flame,
    color: 'bg-rose-600',
    title: 'FIRE ALARM ACTIVATED - WING B 4TH FLOOR',
    message:
      'Fire alarm detected in Wing B. Residents are advised to avoid lifts and evacuate calmly via emergency fire staircases. Fire service has been summoned.',
    severity: 'critical' as const,
  },
  {
    type: 'Water Tank Outage',
    icon: Droplets,
    color: 'bg-amber-600',
    title: 'EMERGENCY WATER SUPPLY SHUTDOWN (2 HOURS)',
    message:
      'Sudden main inlet pipe leakage near Gate 2. Water pumps will remain off from 03:00 PM to 05:00 PM for rapid emergency welding. Please conserve water.',
    severity: 'warning' as const,
  },
  {
    type: 'Lift Breakdown',
    icon: AlertTriangle,
    color: 'bg-purple-700',
    title: 'TOWER A ELEVATOR #1 EMERGENCY REPAIR',
    message:
      'Elevator #1 in Tower A is grounded due to a safety governor sensor fault. OTIS technicians are on site. Please utilize Service Lift #2.',
    severity: 'warning' as const,
  },
  {
    type: 'Security Lockdown',
    icon: ShieldAlert,
    color: 'bg-slate-900',
    title: 'SECURITY GATE PROTOCOL: VISITOR ENTRY RESTRICTED',
    message:
      'Heavy waterlogging on main access road. Gate 2 is closed. Only emergency vehicular traffic permitted via Gate 1 until further notice.',
    severity: 'critical' as const,
  },
];

export function EmergencyBroadcastModal({
  isOpen,
  onClose,
  onSuccess,
}: EmergencyBroadcastModalProps) {
  const { addToast } = useSociety();
  const [selectedPreset, setSelectedPreset] = useState(PRESET_EMERGENCIES[0]);
  const [title, setTitle] = useState(PRESET_EMERGENCIES[0].title);
  const [message, setMessage] = useState(PRESET_EMERGENCIES[0].message);
  const [broadcasting, setBroadcasting] = useState(false);

  if (!isOpen) return null;

  const handleSelectPreset = (p: (typeof PRESET_EMERGENCIES)[0]) => {
    setSelectedPreset(p);
    setTitle(p.title);
    setMessage(p.message);
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcasting(true);
    try {
      const res = await SocietyApi.emergency.broadcast(
        title.trim(),
        message.trim(),
        selectedPreset.severity
      );

      if (res.data) {
        addToast(
          'Emergency Alert Broadcasted',
          `Sent instant Mobile Alert & SMS to all ${res.data.notifiedCount} registered owners & residents.`,
          'error'
        );
        if (onSuccess) onSuccess();
        onClose();
      }
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl space-y-4 animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-rose-700 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 animate-pulse text-rose-200" />
            <div>
              <h2 className="text-sm font-bold tracking-tight">Emergency Society Broadcast</h2>
              <p className="text-[10px] text-rose-200">Mobile Push + SMS to All 248 Residents</p>
            </div>
          </div>
          <button onClick={onClose} className="text-rose-200 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleBroadcast} className="px-5 pb-5 space-y-3.5">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Select Emergency Template
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_EMERGENCIES.map((p) => {
                const Icon = p.icon;
                const isSelected = selectedPreset.type === p.type;
                return (
                  <button
                    key={p.type}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-rose-50 border-rose-300 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-white ${p.color}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 leading-tight">
                      {p.type}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Broadcast Headline
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 text-xs font-bold text-rose-900 bg-rose-50/40 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Urgent Message (SMS + Notification Body)
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[10px] text-amber-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              This will sound a high-priority alarm notification on all resident phones and send an SMS
              blast.
            </span>
          </div>

          <button
            type="submit"
            disabled={broadcasting}
            className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{broadcasting ? 'Broadcasting to All Residents…' : 'Send Emergency Broadcast Now'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

