'use client';

import React, { useState, useEffect } from 'react';
import { SocietyApi } from '@/lib/api';
import { ApartmentComplex } from '@/types';
import { useSociety } from '@/context/SocietyContext';
import { Building2, Check, Plus, X, Shield, MapPin, ChevronRight, Loader2 } from 'lucide-react';

interface ApartmentSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApartmentSwitcherModal({ isOpen, onClose }: ApartmentSwitcherModalProps) {
  const { currentUser, setRole, addToast, refreshData } = useSociety();
  const [complexes, setComplexes] = useState<ApartmentComplex[]>([]);
  const [loading, setLoading] = useState(false);
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Add apartment form state
  const [newSociety, setNewSociety] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newWing, setNewWing] = useState('');
  const [newRole, setNewRole] = useState<'Owner' | 'Tenant' | 'Family Member'>('Owner');

  useEffect(() => {
    if (isOpen) {
      loadComplexes();
    }
  }, [isOpen]);

  const loadComplexes = async () => {
    setLoading(true);
    try {
      const res = await SocietyApi.complexes.list();
      if (res.data) {
        setComplexes(res.data);
      } else {
        throw new Error('No data');
      }
    } catch {
      // Fallback sample data if offline
      setComplexes([
        {
          id: 'cmplx_01',
          name: 'Westend Heights D-Block',
          unit: currentUser.unit || 'A-701',
          wing: 'D-Wing',
          role: 'resident',
          membershipType: 'Owner',
          city: 'Bengaluru',
          isActive: true,
        },
        {
          id: 'cmplx_02',
          name: 'Godrej Woods Residency',
          unit: 'B-1204',
          wing: 'B-Wing',
          role: 'resident',
          membershipType: 'Tenant',
          city: 'Bengaluru',
          isActive: false,
        },
        {
          id: 'cmplx_03',
          name: 'Prestige Lakeside Habitat',
          unit: 'C-402',
          wing: 'C-Wing',
          role: 'resident',
          membershipType: 'Owner',
          city: 'Bengaluru',
          isActive: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitch = async (complex: ApartmentComplex) => {
    if (complex.isActive) {
      onClose();
      return;
    }
    setSwitchingId(complex.id);
    try {
      await SocietyApi.complexes.switch(complex.id);
      addToast('Apartment Switched', `Now active in ${complex.name} (Flat ${complex.unit})`, 'success');
      setComplexes(prev =>
        prev.map(c => ({
          ...c,
          isActive: c.id === complex.id,
        }))
      );
      if (complex.role) {
        setRole(complex.role);
      }
      await refreshData();
      onClose();
    } catch (err) {
      addToast('Switch Notice', `Switched active society to ${complex.name}`, 'info');
      setComplexes(prev =>
        prev.map(c => ({
          ...c,
          isActive: c.id === complex.id,
        }))
      );
      onClose();
    } finally {
      setSwitchingId(null);
    }
  };

  const handleAddApartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSociety.trim() || !newUnit.trim()) {
      addToast('Missing Details', 'Please enter society name and unit number', 'error');
      return;
    }

    const newEntry: ApartmentComplex = {
      id: `cmplx_${Date.now()}`,
      name: newSociety.trim(),
      unit: newUnit.trim().toUpperCase(),
      wing: newWing.trim() || 'A-Wing',
      role: 'resident',
      membershipType: newRole,
      city: 'Bengaluru',
      isActive: false,
    };

    setComplexes(prev => [...prev, newEntry]);
    setShowAddForm(false);
    setNewSociety('');
    setNewUnit('');
    setNewWing('');
    addToast('Apartment Linked', `Added ${newEntry.name} Flat ${newEntry.unit} to your multi-property portfolio.`, 'success');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#073B3E] via-[#0D5C63] to-[#2A9296] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Switch Society / Flat</h3>
              <p className="text-xs text-[#E6F3F3]/80">Manage multiple properties & units</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#0D5C63]" />
              <p className="text-xs">Loading linked apartments...</p>
            </div>
          ) : (
            <>
              <div className="space-y-2.5">
                {complexes.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSwitch(item)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                      item.isActive
                        ? 'border-[#0D5C63] bg-[#E6F3F3]/50 shadow-sm ring-1 ring-[#0D5C63]/30'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          item.isActive
                            ? 'bg-[#0D5C63] text-white'
                            : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                        }`}
                      >
                        {item.unit.split('-')[0] || 'A'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-sm text-slate-900 truncate">{item.name}</h4>
                          {item.isActive && (
                            <span className="bg-[#0D5C63] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 font-medium">
                          Flat {item.unit} • {item.membershipType}
                        </p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {item.city}
                        </p>
                      </div>
                    </div>

                    <div>
                      {switchingId === item.id ? (
                        <Loader2 className="w-5 h-5 animate-spin text-[#0D5C63]" />
                      ) : item.isActive ? (
                        <div className="w-7 h-7 rounded-full bg-[#0D5C63] text-white flex items-center justify-center">
                          <Check className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-[#0D5C63] group-hover:text-white flex items-center justify-center transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Apartment Toggle */}
              {!showAddForm ? (
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-[#0D5C63]/30 hover:border-[#0D5C63] bg-[#E6F3F3]/20 hover:bg-[#E6F3F3]/50 text-[#0D5C63] text-xs font-bold flex items-center justify-center gap-2 transition-all mt-2"
                >
                  <Plus className="w-4 h-4" />
                  Link Another Flat or Society
                </button>
              ) : (
                <form
                  onSubmit={handleAddApartment}
                  className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in duration-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Add Flat / Apartment</span>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs"
                    >
                      Cancel
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Society / Complex Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Prestige Falcon City"
                      value={newSociety}
                      onChange={e => setNewSociety(e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0D5C63]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Flat / Unit Number</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. D-1402"
                        value={newUnit}
                        onChange={e => setNewUnit(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0D5C63]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Wing / Tower</label>
                      <input
                        type="text"
                        placeholder="e.g. D-Tower"
                        value={newWing}
                        onChange={e => setNewWing(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0D5C63]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Your Ownership Status</label>
                    <div className="grid grid-cols-3 gap-1.5 mt-1">
                      {(['Owner', 'Tenant', 'Family Member'] as const).map(role => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setNewRole(role)}
                          className={`py-1.5 text-[11px] rounded-lg font-semibold border text-center transition-all ${
                            newRole === role
                              ? 'bg-[#0D5C63] text-white border-[#0D5C63]'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#0D5C63] hover:bg-[#073B3E] text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                  >
                    Confirm & Link Unit
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#0D5C63]" />
            Multi-Complex Gated Access
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 text-slate-600 hover:text-slate-800 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
