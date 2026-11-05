'use client';

import React, { useState } from 'react';
import { useSociety } from '@/context/SocietyContext';
import { Booking, BookingStatus } from '@/types';
import {
  BookmarkCheck,
  Search,
  Calendar,
  Users,
  QrCode,
  X,
  AlertTriangle
} from 'lucide-react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';

interface MyBookingsModuleProps {
  onNavigateToAmenities?: () => void;
}

export function MyBookingsModule({ onNavigateToAmenities }: MyBookingsModuleProps) {
  const { bookings, currentUser, currentRole, cancelBooking } = useSociety();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled' | 'all'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookingForPass, setSelectedBookingForPass] = useState<Booking | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);

  const myBookings = currentRole === 'admin' ? bookings : bookings.filter((b) => b.userId === currentUser.id);

  const filteredBookings = myBookings.filter((b) => {
    if (activeTab === 'upcoming' && (b.status === 'cancelled' || b.status === 'completed')) return false;
    if (activeTab === 'completed' && b.status !== 'completed' && b.status !== 'checked_in') return false;
    if (activeTab === 'cancelled' && b.status !== 'cancelled') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        b.bookingReference.toLowerCase().includes(q) ||
        b.amenityName.toLowerCase().includes(q) ||
        b.date.includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
            Confirmed
          </span>
        );
      case 'checked_in':
        return (
          <span className="text-[10px] font-bold uppercase bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full">
            Checked In
          </span>
        );
      case 'completed':
        return (
          <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="text-[10px] font-bold uppercase bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full">
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0E2628]">
            My Reservations
          </h1>
          <p className="text-xs sm:text-sm text-[#4E6E70] mt-1">
            Track your amenity reservations, show admission passes, and manage cancellation for Flat {currentUser.unit}.
          </p>
        </div>

        {onNavigateToAmenities && (
          <button
            onClick={onNavigateToAmenities}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-[#0D5C63] text-white font-semibold text-xs hover:bg-[#094449] transition-colors shadow-sm"
          >
            + New Reservation
          </button>
        )}
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-[#D5EAEB] text-xs">
          {(['upcoming', 'completed', 'cancelled', 'all'] as const).map((tab) => {
            const count = myBookings.filter((b) => {
              if (tab === 'upcoming') return b.status === 'confirmed' || b.status === 'checked_in';
              if (tab === 'completed') return b.status === 'completed';
              if (tab === 'cancelled') return b.status === 'cancelled';
              return true;
            }).length;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-colors flex items-center gap-1.5 ${
                  activeTab === tab
                    ? 'bg-[#0D5C63] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ref or amenity..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#D5EAEB] rounded-xl text-xs focus:outline-none focus:border-[#0D5C63]"
          />
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-[#D5EAEB] text-slate-400">
            <BookmarkCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No bookings found</p>
            <p className="text-xs text-slate-400 mt-1">
              You do not have any reservations under the &ldquo;{activeTab}&rdquo; filter.
            </p>
          </div>
        ) : (
          filteredBookings.map((b) => (
            <div
              key={b.id}
              className="p-5 rounded-3xl bg-white border border-[#D5EAEB] shadow-sm hover:border-purple-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              <div className="flex items-start gap-4">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden flex-shrink-0">
                  <Image src={b.amenityImage} alt={b.amenityName} fill className="object-cover" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900">{b.amenityName}</h3>
                    {getStatusBadge(b.status)}
                  </div>
                  <p className="text-xs font-mono font-semibold text-slate-500">
                    Ref: {b.bookingReference}
                  </p>
                  <p className="text-xs text-slate-600 flex items-center gap-1.5 pt-1">
                    <Calendar className="w-3.5 h-3.5 text-[#0D5C63]" />
                    <span>{b.date} • {b.timeSlot}</span>
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#0D5C63]" />
                    <span>{b.guestCount} Attendees (Flat {b.unit})</span>
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end md:self-center">
                {b.status === 'confirmed' && (
                  <button
                    onClick={() => setBookingToCancel(b)}
                    className="px-3 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
                  >
                    Cancel Slot
                  </button>
                )}

                <button
                  onClick={() => setSelectedBookingForPass(b)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D5C63] hover:bg-[#094449] text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Show Pass</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* QR Pass Drawer / Modal */}
      {selectedBookingForPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-center p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold tracking-wider uppercase text-purple-800 bg-purple-50 px-2.5 py-1 rounded-full">
                Facility QR Access
              </span>
              <button
                onClick={() => setSelectedBookingForPass(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="font-bold text-lg text-slate-900">{selectedBookingForPass.amenityName}</h3>
              <p className="text-xs text-slate-500">
                {selectedBookingForPass.date} • {selectedBookingForPass.timeSlot}
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-purple-200 inline-block shadow-inner">
              <QRCodeSVG
                value={selectedBookingForPass.qrToken}
                size={160}
                level="M"
                includeMargin
              />
              <p className="font-mono text-sm font-bold text-slate-800 mt-2">
                {selectedBookingForPass.bookingReference}
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl text-left text-xs space-y-1 text-slate-600">
              <p className="flex justify-between">
                <span>Unit:</span>
                <span className="font-semibold text-slate-800">Flat {selectedBookingForPass.unit}</span>
              </p>
              <p className="flex justify-between">
                <span>Resident:</span>
                <span className="font-semibold text-slate-800">{selectedBookingForPass.userName}</span>
              </p>
              <p className="flex justify-between">
                <span>Guests:</span>
                <span className="font-semibold text-slate-800">{selectedBookingForPass.guestCount} Attendees</span>
              </p>
              <p className="flex justify-between">
                <span>Status:</span>
                <span className="font-bold text-purple-700 uppercase">{selectedBookingForPass.status}</span>
              </p>
            </div>

            <button
              onClick={() => setSelectedBookingForPass(null)}
              className="w-full py-2.5 rounded-xl bg-[#0D5C63] text-white text-xs font-semibold hover:bg-[#094449]"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      {bookingToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="font-bold text-base text-slate-900">Cancel Reservation?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to cancel your slot for{' '}
                <strong>{bookingToCancel.amenityName}</strong> on {bookingToCancel.date}? This will release the slot for other residents.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setBookingToCancel(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Keep Booking
              </button>
              <button
                onClick={() => {
                  cancelBooking(bookingToCancel.id);
                  setBookingToCancel(null);
                }}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm"
              >
                Yes, Cancel Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
