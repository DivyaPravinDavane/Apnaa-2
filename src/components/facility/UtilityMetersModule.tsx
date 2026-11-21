'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Gauge,
  Droplets,
  Flame,
  Zap,
  Plus,
  ArrowLeft,
  X,
  CheckCircle2,
  Calendar,
  FileSpreadsheet,
} from 'lucide-react';
import { SocietyApi } from '@/lib/api';
import { useSociety } from '@/context/SocietyContext';
import type { UtilityReading } from '@/types';

interface UtilityMetersModuleProps {
  onBack?: () => void;
}

export function UtilityMetersModule({ onBack }: UtilityMetersModuleProps) {
  const { currentUser, currentRole, addToast } = useSociety();
  const [readings, setReadings] = useState<UtilityReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [activeMeterFilter, setActiveMeterFilter] = useState<'all' | 'water' | 'gas' | 'electricity'>('all');

  // Record Form state
  const [unit, setUnit] = useState(currentUser.unit || 'A-1204');
  const [meterType, setMeterType] = useState<'water' | 'gas' | 'electricity'>('water');
  const [previousReading, setPreviousReading] = useState(1420.5);
  const [currentReading, setCurrentReading] = useState(1455.0);

  const loadReadings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await SocietyApi.utilities.list();
      if (res.data) {
        setReadings(res.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReadings();
  }, [loadReadings]);

  const unitsConsumed = Math.max(0, currentReading - previousReading);

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await SocietyApi.utilities.record({
      unit: unit.trim(),
      meterType,
      meterNumber: `${meterType.toUpperCase()}-${unit.trim()}`,
      previousReading,
      currentReading,
      unitsConsumed,
    });

    if (res.data) {
      setReadings((prev) => [res.data!, ...prev]);
      setRecordModalOpen(false);
      addToast(
        'Meter Reading Recorded',
        `Logged ${unitsConsumed} units for ${meterType} in Flat ${unit}. Stored in MySQL.`,
        'success'
      );
    }
  };

  const filteredReadings = readings.filter((r) =>
    activeMeterFilter === 'all' ? true : r.meterType === activeMeterFilter
  );

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
            <h1 className="text-base font-bold text-[#0E2628]">Digital Utility Readings</h1>
            <p className="text-[11px] text-[#4E6E70]">Water, Reticulated PNG Gas &amp; Sub-Meters</p>
          </div>
        </div>

        <button
          onClick={() => setRecordModalOpen(true)}
          className="px-3 py-1.5 rounded-full bg-[#0D5C63] text-white text-xs font-bold hover:bg-[#094348] transition-colors flex items-center gap-1 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Reading</span>
        </button>
      </div>

      {/* Meter Filter Pills */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
        {(['all', 'water', 'gas', 'electricity'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveMeterFilter(filter)}
            className={`py-1.5 rounded-xl text-[11px] font-bold capitalize transition-all ${
              activeMeterFilter === filter
                ? 'bg-[#0D5C63] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Meter Readings List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading utility logs…</div>
        ) : filteredReadings.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No readings recorded for this filter.
          </div>
        ) : (
          filteredReadings.map((reading) => {
            const isWater = reading.meterType === 'water';
            const isGas = reading.meterType === 'gas';
            const unitSuffix = isWater ? 'kL' : isGas ? 'SCM' : 'kWh';

            return (
              <div
                key={reading.id}
                className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#0D5C63]/40 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white ${
                        isWater ? 'bg-sky-600' : isGas ? 'bg-amber-600' : 'bg-emerald-600'
                      }`}
                    >
                      {isWater ? (
                        <Droplets className="w-5 h-5" />
                      ) : isGas ? (
                        <Flame className="w-5 h-5" />
                      ) : (
                        <Zap className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#0E2628] capitalize">
                          {reading.meterType} Meter
                        </span>
                        <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-md text-slate-600">
                          Flat {reading.unit}
                        </span>
                      </div>
                      <p className="font-mono text-xs text-slate-500 mt-0.5">
                        Meter #{reading.meterNumber}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      reading.status === 'billed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {reading.status}
                  </span>
                </div>

                {/* Meter Reading Value Grid */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">
                      Prev Reading
                    </span>
                    <span className="font-mono font-bold text-xs text-slate-700">
                      {reading.previousReading}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">
                      Current Reading
                    </span>
                    <span className="font-mono font-bold text-xs text-[#0D5C63]">
                      {reading.currentReading}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">
                      Consumed
                    </span>
                    <span className="font-mono font-bold text-xs text-emerald-700">
                      {reading.unitsConsumed} {unitSuffix}
                    </span>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Recorded by {reading.recordedByName}</span>
                  <span>{reading.recordedDate}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Record Meter Reading Modal */}
      {recordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs">
          <div className="w-full bg-white rounded-t-[28px] p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 rounded-full bg-slate-300 mx-auto" />
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0E2628]">Digital Meter Reading</h3>
              <button onClick={() => setRecordModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecord} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Apartment Unit
                </label>
                <input
                  type="text"
                  required
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g. A-1204 / B-302"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0D5C63]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Utility Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['water', 'gas', 'electricity'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setMeterType(t)}
                      className={`py-2 rounded-xl text-xs font-bold border capitalize transition-colors ${
                        meterType === t
                          ? 'bg-[#0D5C63] text-white border-[#0D5C63]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Previous Reading
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={previousReading}
                    onChange={(e) => setPreviousReading(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#0D5C63]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Current Reading
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={currentReading}
                    onChange={(e) => setCurrentReading(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#0D5C63]"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#E6F3F3] border border-[#C4E4E6] flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Calculated Consumption:</span>
                <span className="font-mono font-bold text-[#0D5C63]">
                  {unitsConsumed.toFixed(2)} units
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#0D5C63] text-white font-bold text-xs hover:bg-[#094348] transition-colors shadow-md mt-2"
              >
                Save Digital Reading to MySQL
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

