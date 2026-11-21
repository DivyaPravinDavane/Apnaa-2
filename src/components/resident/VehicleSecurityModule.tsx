'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Car,
  Shield,
  Lock,
  Unlock,
  Plus,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowLeft,
  KeyRound,
  Zap,
} from 'lucide-react';
import { SocietyApi } from '@/lib/api';
import { useSociety } from '@/context/SocietyContext';
import type { Vehicle } from '@/types';

interface VehicleSecurityModuleProps {
  onBack?: () => void;
}

export function VehicleSecurityModule({ onBack }: VehicleSecurityModuleProps) {
  const { currentUser, addToast } = useSociety();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [vehicleType, setVehicleType] = useState<'Car' | 'Two-Wheeler' | 'EV'>('Car');
  const [makeModel, setMakeModel] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [parkingSlot, setParkingSlot] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await SocietyApi.vehicles.list();
      if (res.data) {
        setVehicles(res.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadVehicles();
  }, [loadVehicles]);

  const handleToggleLock = async (vehicle: Vehicle) => {
    const nextLocked = !vehicle.isLocked;
    setTogglingId(vehicle.id);
    try {
      const res = await SocietyApi.vehicles.toggleLock(vehicle.id, nextLocked);
      if (res.data) {
        setVehicles((prev) =>
          prev.map((v) =>
            v.id === vehicle.id
              ? {
                  ...v,
                  isLocked: nextLocked,
                  lastMovement: nextLocked
                    ? `Digital Lock Activated (Gate alerted)`
                    : `Unlocked • Ready for Gate Exit`,
                }
              : v
          )
        );
        addToast(
          nextLocked ? 'Vehicle Secured & Locked' : 'Vehicle Unlocked',
          nextLocked
            ? `${vehicle.makeModel} (${vehicle.vehicleNumber}) is locked. Security Gate will prevent exit.`
            : `${vehicle.makeModel} is unlocked. Ready to exit gate.`,
          nextLocked ? 'success' : 'info'
        );
      }
    } finally {
      setTogglingId(null);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!makeModel.trim() || !vehicleNumber.trim()) return;

    const res = await SocietyApi.vehicles.add({
      vehicleType,
      makeModel: makeModel.trim(),
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      parkingSlot: parkingSlot.trim() || `Slot-${currentUser.unit}`,
    });

    if (res.data) {
      setVehicles((prev) => [res.data!, ...prev]);
      setAddModalOpen(false);
      setMakeModel('');
      setVehicleNumber('');
      setParkingSlot('');
      addToast(
        'Vehicle Registered',
        `${res.data.makeModel} (${res.data.vehicleNumber}) saved to MySQL database.`,
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
            <h1 className="text-base font-bold text-[#0E2628]">Vehicle Security &amp; Lock</h1>
            <p className="text-[11px] text-[#4E6E70]">
              Anti-Theft Wheel Clamp &amp; Gate Exit Protection
            </p>
          </div>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="px-3 py-1.5 rounded-full bg-[#0D5C63] text-white text-xs font-bold hover:bg-[#094348] transition-colors flex items-center gap-1 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* Feature Explainer Banner */}
      <div className="p-3.5 rounded-2xl bg-[#E6F3F3] border border-[#C4E4E6] flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#0D5C63] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
          <KeyRound className="w-5 h-5" />
        </div>
        <div className="flex-1 text-xs">
          <p className="font-bold text-[#073B3E]">Digital Vehicle Wheel Clamp</p>
          <p className="text-[#0E2628]/80 text-[11px] mt-0.5 leading-relaxed">
            Lock your vehicle right from the app when parked. If anyone attempts to take the vehicle
            out, the Security Gate terminal will sound an alarm and refuse exit clearance.
          </p>
        </div>
      </div>

      {/* Vehicles List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading vehicles…</div>
        ) : vehicles.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No registered vehicles found. Tap + Add Vehicle to register.
          </div>
        ) : (
          vehicles.map((veh) => {
            const isToggling = togglingId === veh.id;
            return (
              <div
                key={veh.id}
                className={`p-4 rounded-2xl border transition-all ${
                  veh.isLocked
                    ? 'bg-rose-50/60 border-rose-200 shadow-sm'
                    : 'bg-white border-slate-200/90 shadow-2xs hover:border-[#0D5C63]/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white ${
                        veh.isLocked ? 'bg-rose-600' : 'bg-[#0D5C63]'
                      }`}
                    >
                      {veh.vehicleType === 'EV' ? (
                        <Zap className="w-5 h-5" />
                      ) : (
                        <Car className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#0E2628]">{veh.makeModel}</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600 uppercase">
                          {veh.vehicleType}
                        </span>
                      </div>
                      <p className="font-mono font-bold text-xs text-[#0D5C63] mt-0.5">
                        {veh.vehicleNumber}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Slot: {veh.parkingSlot || `Flat ${veh.unit}`}
                      </p>
                    </div>
                  </div>

                  {/* Lock/Unlock Toggle Button */}
                  <button
                    onClick={() => handleToggleLock(veh)}
                    disabled={isToggling}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs ${
                      veh.isLocked
                        ? 'bg-rose-600 text-white hover:bg-rose-700'
                        : 'bg-[#E6F3F3] text-[#0D5C63] hover:bg-[#C4E4E6]'
                    }`}
                  >
                    {veh.isLocked ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>LOCKED</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5" />
                        <span>UNLOCKED</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[260px]">{veh.lastMovement}</span>
                  </div>
                  {veh.isLocked ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                      <Shield className="w-3 h-3" />
                      Clamp On
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      Gate Allowed
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Vehicle Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs">
          <div className="w-full bg-white rounded-t-[28px] p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 rounded-full bg-slate-300 mx-auto" />
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0E2628]">Register Resident Vehicle</h3>
              <button onClick={() => setAddModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Vehicle Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Car', 'Two-Wheeler', 'EV'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setVehicleType(t)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                        vehicleType === t
                          ? 'bg-[#0D5C63] text-white border-[#0D5C63]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Make &amp; Model
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Honda City White / Ather 450X"
                  value={makeModel}
                  onChange={(e) => setMakeModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0D5C63]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  License Plate / Registration No.
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MH 02 BG 4421"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 uppercase focus:outline-none focus:border-[#0D5C63]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Assigned Parking Slot (Optional)
                </label>
                <input
                  type="text"
                  placeholder={`Default: Slot-${currentUser.unit}`}
                  value={parkingSlot}
                  onChange={(e) => setParkingSlot(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0D5C63]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#0D5C63] text-white font-bold text-xs hover:bg-[#094348] transition-colors shadow-md mt-2"
              >
                Save Vehicle &amp; Enable Lock
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

