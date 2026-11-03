'use client';

import React, { useState } from 'react';
import { useSociety } from '@/context/SocietyContext';
import { Amenity } from '@/types';
import { CalendarCheck, Search, Clock, Users, Sliders, X } from 'lucide-react';
import Image from 'next/image';

type EditDraft = {
  name: string;
  capacity: number;
  operatingHours: string;
  slotDurationMinutes: number;
  bookingHorizonDays: number;
  description: string;
  location: string;
  status: Amenity['status'];
  rules: string;
  facilities: string;
};

const toDraft = (amenity: Amenity): EditDraft => ({
  name: amenity.name,
  capacity: amenity.capacity,
  operatingHours: amenity.operatingHours,
  slotDurationMinutes: amenity.slotDurationMinutes,
  bookingHorizonDays: amenity.bookingHorizonDays,
  description: amenity.description,
  location: amenity.location,
  status: amenity.status,
  rules: amenity.rules.join('\n'),
  facilities: amenity.facilities.join('\n'),
});

export function AdminAmenityManagement() {
  const { amenities, updateAmenity, addToast } = useSociety();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
  const [draft, setDraft] = useState<EditDraft | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = amenities.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openEditor = (amenity: Amenity) => {
    setEditingAmenity(amenity);
    setDraft(toDraft(amenity));
  };

  const closeEditor = () => {
    setEditingAmenity(null);
    setDraft(null);
  };

  const toggleStatus = async (amenity: Amenity) => {
    const nextStatus = amenity.status === 'available' ? 'maintenance' : 'available';
    await updateAmenity(amenity.id, { status: nextStatus });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAmenity || !draft) return;
    if (draft.description.trim().length < 10) {
      addToast('Validation Error', 'Description must be at least 10 characters.', 'error');
      return;
    }

    setSaving(true);
    const result = await updateAmenity(editingAmenity.id, {
      name: draft.name.trim(),
      capacity: Number(draft.capacity),
      operatingHours: draft.operatingHours.trim(),
      slotDurationMinutes: Number(draft.slotDurationMinutes),
      bookingHorizonDays: Number(draft.bookingHorizonDays),
      description: draft.description.trim(),
      location: draft.location.trim(),
      status: draft.status,
      rules: draft.rules
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      facilities: draft.facilities
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    });
    setSaving(false);
    if (result.success) closeEditor();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1326]">
            Amenities Administration
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6280] mt-1">
            Configure capacity limits, operating hours, slot intervals, rules, and maintenance closures.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search amenities or categories…"
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#EAE2F2] rounded-xl text-xs focus:outline-none focus:border-[#6B21A8]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((amenity) => (
          <div
            key={amenity.id}
            className="bg-white rounded-3xl border border-[#EAE2F2] overflow-hidden shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="relative h-44 w-full">
                {amenity.coverImage ? (
                  <Image src={amenity.coverImage} alt={amenity.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#F8F6FC] flex items-center justify-center text-slate-400">
                    <CalendarCheck className="w-10 h-10" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                      amenity.status === 'available'
                        ? 'bg-emerald-600 text-white'
                        : amenity.status === 'maintenance'
                        ? 'bg-amber-600 text-white'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    {amenity.status}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-base text-slate-900">{amenity.name}</h3>
                  <span className="text-[10px] font-semibold bg-purple-50 text-[#6B21A8] px-2 py-0.5 rounded-full">
                    {amenity.category}
                  </span>
                </div>
                <div className="space-y-1 text-xs text-slate-600">
                  <p className="flex justify-between">
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Capacity</span>
                    <strong className="text-slate-800">{amenity.capacity} people</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Hours</span>
                    <strong className="text-slate-800">{amenity.operatingHours}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="flex items-center gap-1"><Sliders className="w-3.5 h-3.5" /> Slot</span>
                    <strong className="text-slate-800">{amenity.slotDurationMinutes} mins</strong>
                  </p>
                  <p className="flex justify-between">
                    <span>Booking horizon</span>
                    <strong className="text-slate-800">{amenity.bookingHorizonDays} days</strong>
                  </p>
                  <p className="flex justify-between">
                    <span>Rules configured</span>
                    <strong className="text-slate-800">{amenity.rules.length}</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => void toggleStatus(amenity)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors ${
                  amenity.status === 'available'
                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                {amenity.status === 'available' ? 'Set to Maintenance' : 'Mark Available'}
              </button>
              <button
                onClick={() => openEditor(amenity)}
                className="text-xs text-[#6B21A8] font-bold hover:underline"
              >
                Edit Rules
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingAmenity && draft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-5">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Edit {editingAmenity.name}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Changes are saved to MySQL and apply to every resident immediately.
                </p>
              </div>
              <button onClick={closeEditor} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Amenity name
                  </label>
                  <input
                    required
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6B21A8]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={draft.status}
                    onChange={(e) => setDraft({ ...draft, status: e.target.value as Amenity['status'] })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#6B21A8]"
                  >
                    <option value="available">Available</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5000}
                    required
                    value={draft.capacity}
                    onChange={(e) => setDraft({ ...draft, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6B21A8]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Slot (mins)
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={480}
                    required
                    value={draft.slotDurationMinutes}
                    onChange={(e) => setDraft({ ...draft, slotDurationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6B21A8]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Horizon (days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={90}
                    required
                    value={draft.bookingHorizonDays}
                    onChange={(e) => setDraft({ ...draft, bookingHorizonDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6B21A8]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Hours
                  </label>
                  <input
                    required
                    value={draft.operatingHours}
                    onChange={(e) => setDraft({ ...draft, operatingHours: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6B21A8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Location
                </label>
                <input
                  required
                  value={draft.location}
                  onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6B21A8]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6B21A8]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Rules (one per line)
                  </label>
                  <textarea
                    rows={5}
                    value={draft.rules}
                    onChange={(e) => setDraft({ ...draft, rules: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs leading-relaxed focus:outline-none focus:border-[#6B21A8]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Facilities (one per line)
                  </label>
                  <textarea
                    rows={5}
                    value={draft.facilities}
                    onChange={(e) => setDraft({ ...draft, facilities: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs leading-relaxed focus:outline-none focus:border-[#6B21A8]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeEditor}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-[#6B21A8] hover:bg-[#581C87] disabled:opacity-60 text-white text-xs font-semibold shadow-sm"
                >
                  {saving ? 'Saving…' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
