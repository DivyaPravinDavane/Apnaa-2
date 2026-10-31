'use client';

import React, { useState } from 'react';
import { useSociety } from '@/context/SocietyContext';
import { Amenity } from '@/types';
import { CalendarCheck, Search, Plus, Clock, Users, Sliders, CheckCircle2, XCircle, X } from 'lucide-react';
import Image from 'next/image';

export function AdminAmenityManagement() {
  const { amenities, addToast } = useSociety();
  const [amenityList, setAmenityList] = useState<Amenity[]>(amenities);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);

  const filtered = amenityList.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleStatus = (id: string) => {
    setAmenityList((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const nextStatus = a.status === 'available' ? 'maintenance' : 'available';
          addToast('Amenity Status Changed', `${a.name} is now ${nextStatus.toUpperCase()}`, 'info');
          return { ...a, status: nextStatus };
        }
        return a;
      })
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1326]">
            Amenities Administration
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6280] mt-1">
            Configure capacity limits, operating hours, slot intervals, and schedule maintenance closures.
          </p>
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
                <Image src={amenity.coverImage} alt={amenity.name} fill className="object-cover" />
                <div className="absolute top-3 right-3">
                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                      amenity.status === 'available'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-600 text-white'
                    }`}
                  >
                    {amenity.status}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <h3 className="font-bold text-base text-slate-900">{amenity.name}</h3>
                <div className="space-y-1 text-xs text-slate-600">
                  <p className="flex justify-between">
                    <span>Capacity:</span>
                    <strong className="text-slate-800">{amenity.capacity} people</strong>
                  </p>
                  <p className="flex justify-between">
                    <span>Operating Hours:</span>
                    <strong className="text-slate-800">{amenity.operatingHours}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span>Slot Duration:</span>
                    <strong className="text-slate-800">{amenity.slotDurationMinutes} mins</strong>
                  </p>
                  <p className="flex justify-between">
                    <span>Booking Horizon:</span>
                    <strong className="text-slate-800">{amenity.bookingHorizonDays} days advance</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => toggleStatus(amenity.id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors ${
                  amenity.status === 'available'
                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                {amenity.status === 'available' ? 'Set to Maintenance' : 'Mark Available'}
              </button>
              <button
                onClick={() => addToast('Config Saved', 'Policy rules synced with database.', 'info')}
                className="text-xs text-[#6B21A8] font-bold hover:underline"
              >
                Edit Rules
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
