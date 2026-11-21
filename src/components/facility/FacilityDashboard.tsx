'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSociety } from '@/context/SocietyContext';
import {
  CheckCircle2,
  Layers,
  Wrench,
  Gauge,
  ClipboardList,
  Calendar,
  Camera,
  QrCode,
  Clock,
  Check,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import { SocietyApi, type ServiceRequestRecord } from '@/lib/api';
import { UtilityMetersModule } from './UtilityMetersModule';
import { CommitteeActionItemsModule } from '../admin/CommitteeActionItemsModule';

export function FacilityDashboard() {
  const {
    bookings,
    amenities,
    society,
    facilityCheckIns,
    checkInFacilityBooking,
    currentUser,
    addToast,
  } = useSociety();

  const [activeConsoleTab, setActiveConsoleTab] = useState<'reservations' | 'helpdesk' | 'utilities' | 'committee'>('reservations');
  const [bookingRefInput, setBookingRefInput] = useState('');
  const [filterAmenity, setFilterAmenity] = useState('All');

  // Helpdesk State
  const [tickets, setTickets] = useState<ServiceRequestRecord[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<ServiceRequestRecord | null>(null);
  const [resolutionPhoto, setResolutionPhoto] = useState(true);
  const [resolutionNotes, setResolutionNotes] = useState('Repaired and tested normal operation.');
  const [submittingResolution, setSubmittingResolution] = useState(false);

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

  const loadTickets = useCallback(async () => {
    setLoadingTickets(true);
    try {
      const res = await SocietyApi.services.list();
      if (res.data && res.data.serviceRequests) {
        setTickets(res.data.serviceRequests);
      }
    } finally {
      setLoadingTickets(false);
    }
  }, []);

  useEffect(() => {
    if (activeConsoleTab === 'helpdesk') {
      void loadTickets();
    }
  }, [activeConsoleTab, loadTickets]);

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

  const handleResolveTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setSubmittingResolution(true);
    try {
      const res = await SocietyApi.services.updateServiceRequest({
        ticketId: selectedTicket.id,
        status: 'resolved',
        photoAfter: resolutionPhoto ? '/images/smart_society_campus_isometric.jpg' : undefined,
        resolutionNotes,
      });

      if (res.data) {
        addToast(
          'Issue Resolved & Closed',
          `Ticket #${selectedTicket.id} marked as RESOLVED with resolution photo attached.`,
          'success'
        );
        setSelectedTicket(null);
        await loadTickets();
      }
    } finally {
      setSubmittingResolution(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-12">
      {/* Console Header */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#073B3E] via-[#0D5C63] to-[#2A9296] text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Facility Management Console
            </h1>
            <span className="text-[10px] font-bold uppercase bg-white/20 text-[#E6F3F3] px-2.5 py-0.5 rounded-full border border-white/20">
              Operations Desk
            </span>
          </div>
          <p className="text-xs text-[#E6F3F3]/90 mt-1">
            Manager: <strong className="text-white">{currentUser.name}</strong> • ANACITY Helpdesk &amp; Utilities
          </p>
        </div>

        {/* Quick Check-in input */}
        <form onSubmit={handleVerifyCheckIn} className="flex items-center gap-2">
          <input
            type="text"
            value={bookingRefInput}
            onChange={(e) => setBookingRefInput(e.target.value.toUpperCase())}
            placeholder="Enter Ref (e.g. BK-7842)"
            className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/60 text-xs font-mono focus:outline-none focus:bg-white focus:text-slate-900"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#073B3E] hover:bg-[#094449] border border-white/25 text-white font-bold text-xs shadow-sm transition-colors"
          >
            Verify Admission
          </button>
        </form>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveConsoleTab('reservations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeConsoleTab === 'reservations'
              ? 'bg-[#0D5C63] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Facility Reservations ({todaysBookings.length})</span>
        </button>

        <button
          onClick={() => setActiveConsoleTab('helpdesk')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeConsoleTab === 'helpdesk'
              ? 'bg-[#0D5C63] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Helpdesk &amp; Photo Resolution</span>
        </button>

        <button
          onClick={() => setActiveConsoleTab('utilities')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeConsoleTab === 'utilities'
              ? 'bg-[#0D5C63] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Gauge className="w-4 h-4" />
          <span>Digital Utility Meters</span>
        </button>

        <button
          onClick={() => setActiveConsoleTab('committee')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeConsoleTab === 'committee'
              ? 'bg-[#0D5C63] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Assigned Action Items</span>
        </button>
      </div>

      {/* TAB 1: RESERVATIONS */}
      {activeConsoleTab === 'reservations' && (
        <div className="space-y-5">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-[#D5EAEB] shadow-sm">
              <p className="text-xs text-slate-500 font-semibold uppercase">Total Facilities</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{amenities.length}</p>
              <p className="text-[11px] text-[#0D5C63] font-medium mt-0.5">
                {activeClosures.length
                  ? `${activeClosures.length} under maintenance`
                  : 'All operating normally'}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#D5EAEB] shadow-sm">
              <p className="text-xs text-slate-500 font-semibold uppercase">Today&apos;s Bookings</p>
              <p className="text-2xl font-bold text-[#0D5C63] mt-1">{todaysBookings.length}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Across swimming, gym &amp; courts</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#D5EAEB] shadow-sm">
              <p className="text-xs text-slate-500 font-semibold uppercase">Checked-In Today</p>
              <p className="text-2xl font-bold text-[#0D5C63] mt-1">{facilityCheckIns.length}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Physical attendance verified</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#D5EAEB] shadow-sm">
              <p className="text-xs text-slate-500 font-semibold uppercase">Active Closures</p>
              <p className="text-2xl font-bold text-slate-700 mt-1">{activeClosures.length}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Next: {nextMaintenance}
              </p>
            </div>
          </div>

          {/* Today's Schedule & Check-in Table */}
          <div className="bg-white rounded-3xl border border-[#D5EAEB] overflow-hidden shadow-sm p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Today&apos;s Facility Reservations</h3>
                <p className="text-xs text-slate-500">Live roster of residents with confirmed slot passes</p>
              </div>

              <select
                value={filterAmenity}
                onChange={(e) => setFilterAmenity(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#0D5C63]"
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
                <thead className="bg-[#F4F9F9] text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-[#D5EAEB]">
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
                      <td className="px-5 py-3.5 font-bold text-[#0D5C63]">{b.amenityName}</td>
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
                              ? 'bg-emerald-100 text-emerald-800'
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
                            className="px-3 py-1 rounded-lg bg-[#0D5C63] text-white hover:bg-[#094449] font-semibold text-[11px] transition-colors"
                          >
                            Check In
                          </button>
                        ) : (
                          <span className="text-[#0D5C63] text-[11px] font-bold flex items-center justify-end gap-1">
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
      )}

      {/* TAB 2: HELPDESK OPERATIONS & BEFORE/AFTER PHOTO RESOLUTION */}
      {activeConsoleTab === 'helpdesk' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Maintenance Helpdesk &amp; Work Orders</h3>
              <p className="text-xs text-slate-500">
                Staff can log complaints, view facility QR scans, and attach before/after photos upon resolution.
              </p>
            </div>
            <span className="text-xs font-bold text-[#0D5C63] bg-[#E6F3F3] px-3 py-1.5 rounded-xl border border-[#0D5C63]/20">
              {tickets.length} Registered Issues
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        {ticket.category}
                      </span>
                      {ticket.qr_scanned ? (
                        <span className="text-[10px] font-bold uppercase bg-[#E6F3F3] text-[#0D5C63] px-2 py-0.5 rounded-md flex items-center gap-1">
                          <QrCode className="w-3 h-3" />
                          QR Scanned
                        </span>
                      ) : null}
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          ticket.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 mt-1">{ticket.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{ticket.description}</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Reported for Flat <strong>{ticket.unit}</strong> • {ticket.created_at?.slice(0, 16)}
                    </p>
                  </div>
                </div>

                {/* Before / After Photo Previews */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="font-bold text-slate-700">Before Photo</p>
                      <span className="text-[10px] text-emerald-600 font-semibold">
                        {ticket.photo_before ? 'Attached' : 'None'}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0D5C63]" />
                    <div>
                      <p className="font-bold text-slate-700">After Photo</p>
                      <span className="text-[10px] font-semibold text-slate-600">
                        {ticket.photo_after ? 'Verified' : 'Pending resolution'}
                      </span>
                    </div>
                  </div>
                </div>

                {ticket.status !== 'resolved' && (
                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    className="w-full py-2 bg-[#0D5C63] hover:bg-[#073B3E] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Take After Photo &amp; Resolve
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Ticket Resolution Modal with After-Photo */}
          {selectedTicket && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
              <form
                onSubmit={handleResolveTicket}
                className="bg-white w-full max-w-md rounded-3xl p-5 space-y-4 shadow-2xl border border-slate-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Resolve Complaint</h3>
                    <p className="text-xs text-slate-500">Attach after-work picture to close ticket</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    Cancel
                  </button>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <p className="font-bold text-slate-800">{selectedTicket.title}</p>
                  <p className="text-slate-600 text-[11px]">{selectedTicket.description}</p>
                  <span className="inline-block text-[10px] font-bold text-[#0D5C63]">
                    Flat {selectedTicket.unit}
                  </span>
                </div>

                {/* Photo Simulation */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Work Resolution Photo *
                  </label>
                  <div
                    onClick={() => setResolutionPhoto(!resolutionPhoto)}
                    className="p-3 rounded-2xl border-2 border-dashed border-[#0D5C63]/40 bg-[#E6F3F3]/30 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Camera className="w-5 h-5 text-[#0D5C63]" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          {resolutionPhoto ? 'after_resolution_proof.jpg' : 'Tap to take picture'}
                        </p>
                        <p className="text-[10px] text-slate-500">High-resolution camera capture</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#0D5C63] uppercase bg-white px-2 py-1 rounded-lg border border-[#0D5C63]/30">
                      {resolutionPhoto ? 'Captured' : 'Capture'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Staff Notes / Summary
                  </label>
                  <textarea
                    rows={2}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                    placeholder="Details of fix applied..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingResolution}
                  className="w-full py-2.5 bg-[#0D5C63] hover:bg-[#073B3E] text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {submittingResolution ? 'Saving to Database...' : 'Confirm Resolution & Close Ticket'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: UTILITY METERS */}
      {activeConsoleTab === 'utilities' && (
        <UtilityMetersModule />
      )}

      {/* TAB 4: COMMITTEE ACTION ITEMS */}
      {activeConsoleTab === 'committee' && (
        <CommitteeActionItemsModule />
      )}
    </div>
  );
}
