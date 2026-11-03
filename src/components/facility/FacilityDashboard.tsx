'use client';

import React, { useState } from 'react';
import { useSociety } from '@/context/SocietyContext';
import {
  CheckCircle2,
} from 'lucide-react';

export function FacilityDashboard() {
  const {
    bookings,
    amenities,
    society,
    facilityCheckIns,
    checkInFacilityBooking,
    currentUser,
    addToast
  } = useSociety();

  const [bookingRefInput, setBookingRefInput] = useState('');
  const [filterAmenity, setFilterAmenity] = useState('All');

  const today = new Date().toISOString().slice(0, 10);
  const activeClosures = amenities.filter((a) => a.status !== 'available');
  const todaysBookings = bookings.filter((b) => b.date === today && b.status !== 'cancelled');

  const filteredBookings = todaysBookings.filter((b) => {
    if (filterAmenity !== 'All' && b.amenityName !== filterAmenity) return false;
    return true;
  });

  const nextMaintenance = society.nextMaintenanceDate
    ? new Date(`${society.nextMaintenanceDate}T00:00:00`).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
      })
    : 'None scheduled';

  const handleVerifyCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingRefInput.trim()) return;

    const res = checkInFacilityBooking(bookingRefInput);
    if (res.success) {
      setBookingRefInput('');
    } else {
      addToast('Check-In Failed', res.message, 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[#2E1065] text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Facility Management Console
            </h1>
            <span className="text-[10px] font-bold uppercase bg-purple-500/30 text-purple-200 px-2.5 py-0.5 rounded-full">
              Operations Desk
            </span>
          </div>
          <p className="text-xs text-purple-200/80 mt-1">
            Manager: <strong className="text-white">{currentUser.name}</strong> • Green Valley Clubhouse & Recreation
          </p>
        </div>

        {/* Quick Check-in input */}
        <form onSubmit={handleVerifyCheckIn} className="flex items-center gap-2">
          <input
            type="text"
            value={bookingRefInput}
            onChange={(e) => setBookingRefInput(e.target.value.toUpperCase())}
            placeholder="Enter Ref (e.g. BK-7842)"
            className="px-3.5 py-2 rounded-xl bg-white/10 border border-purple-600/50 text-white placeholder:text-purple-200/60 text-xs font-mono focus:outline-none focus:bg-white focus:text-slate-900"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#9333EA] hover:bg-[#7E22CE] text-white font-bold text-xs shadow-sm transition-colors"
          >
            Verify Admission
          </button>
        </form>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#EAE2F2] shadow-sm">
          <p className="text-xs text-slate-500 font-semibold uppercase">Total Facilities</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{amenities.length}</p>
          <p className="text-[11px] text-purple-700 font-medium mt-0.5">
            {activeClosures.length
              ? `${activeClosures.length} under maintenance`
              : 'All operating normally'}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#EAE2F2] shadow-sm">
          <p className="text-xs text-slate-500 font-semibold uppercase">Today&apos;s Bookings</p>
          <p className="text-2xl font-bold text-[#6B21A8] mt-1">{todaysBookings.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Across swimming, gym & courts</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#EAE2F2] shadow-sm">
          <p className="text-xs text-slate-500 font-semibold uppercase">Checked-In Today</p>
          <p className="text-2xl font-bold text-purple-700 mt-1">{facilityCheckIns.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Physical attendance verified</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#EAE2F2] shadow-sm">
          <p className="text-xs text-slate-500 font-semibold uppercase">Active Closures</p>
          <p className="text-2xl font-bold text-slate-700 mt-1">{activeClosures.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Next maintenance: {nextMaintenance}
            {society.nextMaintenanceNote ? ` · ${society.nextMaintenanceNote}` : ''}
          </p>
        </div>
      </div>

      {/* Today's Schedule & Check-in Table */}
      <div className="bg-white rounded-3xl border border-[#EAE2F2] overflow-hidden shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900">Today&apos;s Facility Reservations</h3>
            <p className="text-xs text-slate-500">Live roster of residents with confirmed slot passes</p>          </div>

          <select
            value={filterAmenity}
            onChange={(e) => setFilterAmenity(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#6B21A8]"
          >
            <option value="All">All Facilities</option>
            {amenities.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-[#F8F6FC] text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-[#EAE2F2]">
              <tr>
                <th className="px-5 py-3.5">Reference</th>
                <th className="px-5 py-3.5">Facility</th>
                <th className="px-5 py-3.5">Resident</th>
                <th className="px-5 py-3.5">Slot Schedule</th>
                <th className="px-5 py-3.5">Attendees</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                    {b.bookingReference}
                  </td>
                  <td className="px-5 py-3.5 font-bold text-[#6B21A8]">{b.amenityName}</td>
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-slate-800">{b.userName}</p>
                    <p className="text-[11px] text-slate-400">Flat {b.unit}</p>
                  </td>
                  <td className="px-5 py-3.5 font-medium">
                    {b.date} • {b.timeSlot}
                  </td>
                  <td className="px-5 py-3.5">{b.guestCount} guests</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        b.status === 'checked_in'
                          ? 'bg-sky-100 text-sky-800'
                          : b.status === 'confirmed'
                          ? 'bg-purple-100 text-[#6B21A8]'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {b.status === 'confirmed' ? (
                      <button
                        onClick={() => checkInFacilityBooking(b.bookingReference)}
                        className="px-3 py-1 rounded-lg bg-[#6B21A8] text-white hover:bg-[#581C87] font-semibold text-[11px] transition-colors"
                      >
                        Check In
                      </button>
                    ) : (
                      <span className="text-purple-700 text-[11px] font-bold flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
