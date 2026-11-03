'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSociety } from '@/context/SocietyContext';
import { SocietyApi } from '@/lib/api';
import { Amenity } from '@/types';
import {
  Search,
  Users,
  Clock,
  MapPin,
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';

function parseTimeToMinutes(value: string): number | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hours += 12;
  return hours * 60 + Number(match[2]);
}

function formatMinutes(minutes: number): string {
  const hours24 = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  const suffix = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${String(mins).padStart(2, '0')} ${suffix}`;
}

function buildSlots(operatingHours: string, slotDurationMinutes: number): string[] {
  const [startRaw, endRaw] = operatingHours.split('-').map((part) => part.trim());
  const start = parseTimeToMinutes(startRaw);
  const end = parseTimeToMinutes(endRaw);
  if (start === null || end === null || end <= start) return [];

  const duration = slotDurationMinutes > 0 ? slotDurationMinutes : 60;
  const slots: string[] = [];
  for (let cursor = start; cursor + duration <= end && slots.length < 48; cursor += duration) {
    slots.push(`${formatMinutes(cursor)} - ${formatMinutes(cursor + duration)}`);
  }
  return slots;
}

function addDays(date: string, days: number): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  parsed.setUTCDate(parsed.getUTCDate() + Math.max(0, days));
  return parsed.toISOString().slice(0, 10);
}

export function AmenitiesModule() {
  const { amenities, bookings, currentUser, createBooking } = useSociety();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);

  // Booking Flow State
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [guestCount, setGuestCount] = useState<number>(2);
  const [bookingNotes, setBookingNotes] = useState<string>('');
  const [confirmedBookingRef, setConfirmedBookingRef] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'rules' | 'facilities' | 'availability'>('overview');

  const categories = ['All', 'Sports', 'Fitness', 'Indoor', 'Outdoor', 'Events'];

  // Filter Amenities
  const filteredAmenities = amenities.filter((a) => {
    if (selectedCategory !== 'All' && a.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Slot availability is fetched from the API so residents cannot pick a slot
  // another resident already holds.
  const [remoteSlots, setRemoteSlots] = useState<Record<string, boolean> | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const timeSlots = useMemo(
    () =>
      selectedAmenity
        ? buildSlots(selectedAmenity.operatingHours, selectedAmenity.slotDurationMinutes)
        : [],
    [selectedAmenity]
  );

  const today = new Date().toISOString().split('T')[0];
  const maxDate = selectedAmenity
    ? addDays(today, selectedAmenity.bookingHorizonDays)
    : today;

  useEffect(() => {
    if (!selectedAmenity || !SocietyApi.isApiMode()) {
      queueMicrotask(() => {
        setRemoteSlots(null);
        setSlotsLoading(false);
      });
      return;
    }

    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setSlotsLoading(true);
      setRemoteSlots(null);
    });

    SocietyApi.amenities
      .getAvailability(selectedAmenity.id, selectedDate)
      .then((result) => {
        if (!active) return;
        if (result.data) {
          setRemoteSlots(
            Object.fromEntries(
              result.data.slots.map((slot) => [
                `${slot.startTime} - ${slot.endTime}`,
                slot.isAvailable,
              ])
            )
          );
        }
        setSlotsLoading(false);
      })
      .catch(() => {
        if (active) setSlotsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedAmenity, selectedDate]);

  // Helper to check if a slot is booked
  const isSlotBooked = (amenityId: string, date: string, slot: string) => {
    if (remoteSlots) return !remoteSlots[slot];
    return bookings.some(
      (b) =>
        b.amenityId === amenityId &&
        b.date === date &&
        b.timeSlot === slot &&
        b.status !== 'cancelled'
    );
  };

  const handleSelectAmenity = (amenity: Amenity) => {
    const min = new Date().toISOString().split('T')[0];
    const max = addDays(min, amenity.bookingHorizonDays);
    setSelectedAmenity(amenity);
    setSelectedDate(selectedDate < min || selectedDate > max ? min : selectedDate);
    setSelectedTimeSlot('');
    setConfirmedBookingRef(null);
  };

  const handleConfirmReservation = () => {
    if (!selectedAmenity || !selectedTimeSlot) return;

    const res = createBooking({
      amenityId: selectedAmenity.id,
      amenityName: selectedAmenity.name,
      amenityImage: selectedAmenity.coverImage,
      unit: currentUser.unit,
      userId: currentUser.id,
      userName: currentUser.name,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      guestCount,
      notes: bookingNotes,
    });

    if (res.success && res.booking) {
      setConfirmedBookingRef(res.booking.bookingReference);
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore if canvas not supported
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1326]">
          Amenities & Facilities
        </h1>
        <p className="text-xs sm:text-sm text-[#6E6280] mt-1">
          Explore world-class society facilities and reserve slots with live availability for Flat {currentUser.unit}.
        </p>
      </div>

      {/* If an amenity is selected, show its full detail & booking interface */}
      {selectedAmenity ? (
        <div className="space-y-6">
          {/* Back button */}
          <button
            onClick={() => {
              setSelectedAmenity(null);
              setConfirmedBookingRef(null);
              setSelectedTimeSlot('');
            }}
            className="flex items-center gap-2 text-xs font-semibold text-[#6B21A8] hover:text-[#581C87] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Amenities Catalogue</span>
          </button>

          {/* Two-Column Detail Layout: Left Info & Calendar, Right Booking Summary Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8 Columns */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-[#EAE2F2] overflow-hidden shadow-sm">
              {/* Cover Banner */}
              <div className="relative h-64 sm:h-80 w-full">
                <Image
                  src={selectedAmenity.coverImage}
                  alt={selectedAmenity.name}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute top-4 right-4">
                  <span className="text-xs font-bold uppercase bg-purple-700 text-white px-3 py-1 rounded-full shadow">
                    {selectedAmenity.status}
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                      {selectedAmenity.category}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                      {selectedAmenity.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-200 flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4 text-purple-400" />
                      <span>{selectedAmenity.location}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Specs Bar */}
              <div className="grid grid-cols-3 border-b border-[#EAE2F2] divide-x divide-[#EAE2F2] bg-[#F8F6FC] p-3 text-center">
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase">Capacity</p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                    {selectedAmenity.capacity} people
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase">Operating Hours</p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                    {selectedAmenity.operatingHours}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase">Slot Duration</p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                    {selectedAmenity.slotDurationMinutes} mins / slot
                  </p>
                </div>
              </div>

              {/* Detail Tabs */}
              <div className="px-6 pt-4 border-b border-[#EAE2F2] flex items-center gap-6 text-sm">
                {(['overview', 'rules', 'facilities', 'availability'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 font-semibold capitalize transition-colors relative ${
                      activeTab === tab
                        ? 'text-[#6B21A8] border-b-2 border-[#6B21A8]'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {selectedAmenity.description}
                    </p>

                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Gallery
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedAmenity.galleryImages.map((img, i) => (
                          <div key={i} className="relative h-24 rounded-xl overflow-hidden border">
                            <Image src={img} alt="Gallery" fill className="object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'rules' && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Facility Usage Guidelines
                    </h4>
                    <ul className="space-y-2">
                      {selectedAmenity.rules.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-[#6B21A8] flex-shrink-0 mt-0.5" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === 'facilities' && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Included Amenities & Equipment
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {selectedAmenity.facilities.map((fac, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-800 flex items-center gap-2"
                        >
                          <Sparkles className="w-4 h-4 text-[#6B21A8]" />
                          <span>{fac}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'availability' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-600">
                      Select date and preview slot status. Purple slots are open for reservations.
                    </p>
                  </div>
                )}

                {/* Always show Date & Time Slot Selector inside this card */}
                <div className="mt-6 pt-6 border-t border-[#EAE2F2] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <CalendarCheck className="w-4 h-4 text-[#6B21A8]" />
                      <span>Select Reservation Date & Slot</span>
                    </h4>
                    <input
                      type="date"
                      value={selectedDate}
                      min={today}
                      max={maxDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setSelectedTimeSlot('');
                      }}
                      className="px-3 py-1.5 rounded-xl border border-[#EAE2F2] text-xs font-semibold text-slate-800 bg-white"
                    />
                  </div>

                  {/* Slot pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pt-2">
                    {slotsLoading && (
                      <p className="col-span-full text-xs text-slate-500">
                        Checking live availability…
                      </p>
                    )}
                    {!slotsLoading && timeSlots.length === 0 && (
                      <p className="col-span-full text-xs text-slate-500">
                        No bookable slots are configured for this amenity.
                      </p>
                    )}
                    {!slotsLoading && timeSlots.map((slot) => {
                      const booked = isSlotBooked(selectedAmenity.id, selectedDate, slot);
                      const isSelected = selectedTimeSlot === slot;

                      return (
                        <button
                          key={slot}
                          disabled={booked}
                          onClick={() => setSelectedTimeSlot(slot)}
                          className={`p-2.5 rounded-xl text-xs font-semibold transition-all border text-center ${
                            booked
                              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through'
                              : isSelected
                              ? 'bg-[#6B21A8] border-[#6B21A8] text-white shadow-sm'
                              : 'bg-white border-[#EAE2F2] text-slate-700 hover:border-purple-300 hover:bg-purple-50/50'
                          }`}
                        >
                          {slot}
                          <span className="block text-[9px] mt-0.5 opacity-80">
                            {booked ? 'Booked' : isSelected ? 'Selected' : 'Available'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right 4 Columns: Booking Checkout Panel */}
            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-[#EAE2F2] shadow-sm space-y-5">
              <h3 className="font-bold text-base text-[#1C1326] pb-3 border-b border-[#EAE2F2]">
                Booking Summary
              </h3>

              {confirmedBookingRef ? (
                <div className="text-center py-4 space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-full bg-purple-100 text-[#6B21A8] flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-slate-900">Slot Confirmed!</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Reference: <span className="font-mono font-bold text-slate-800">{confirmedBookingRef}</span>
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-dashed border-purple-300 inline-block">
                    <QRCodeSVG
                      value={`SOCIETY-${confirmedBookingRef}-${selectedAmenity.id}`}
                      size={130}
                    />
                  </div>

                  <p className="text-[11px] text-slate-600 bg-purple-50 p-3 rounded-xl leading-relaxed">
                    Pass added to <strong>My Bookings</strong>. Show this QR code at the facility reception for 1-tap entry.
                  </p>

                  <button
                    onClick={() => {
                      setSelectedAmenity(null);
                      setConfirmedBookingRef(null);
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#6B21A8] text-white text-xs font-semibold hover:bg-[#581C87]"
                  >
                    Return to Amenities
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-[#F8F6FC] p-3.5 rounded-xl text-xs space-y-1.5 text-slate-700">
                    <p className="flex justify-between">
                      <span className="text-slate-500">Amenity:</span>
                      <span className="font-bold text-slate-900">{selectedAmenity.name}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-500">Date:</span>
                      <span className="font-bold text-slate-900">{selectedDate}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-500">Selected Slot:</span>
                      <span className="font-bold text-[#6B21A8]">
                        {selectedTimeSlot || 'Please select a slot'}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-500">Unit:</span>
                      <span className="font-semibold text-slate-800">Flat {currentUser.unit}</span>
                    </p>
                  </div>

                  {/* Guest Count */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Number of Attendees
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={selectedAmenity.capacity}
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-[#EAE2F2] text-xs font-semibold focus:outline-none focus:border-[#6B21A8]"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Maximum allowed per unit: {selectedAmenity.capacity} guests
                    </p>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      placeholder="e.g. Training session or guest practice..."
                      className="w-full px-3 py-2 rounded-xl border border-[#EAE2F2] text-xs focus:outline-none focus:border-[#6B21A8]"
                    />
                  </div>

                  {/* Policy reminder */}
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-800 leading-relaxed">
                    <strong>Cancellation Policy:</strong> Free cancellation up to 2 hours before the slot. No fee or financial checkout required.
                  </div>

                  {/* Confirm CTA */}
                  <button
                    disabled={!selectedTimeSlot}
                    onClick={handleConfirmReservation}
                    className="w-full py-3 rounded-xl bg-[#6B21A8] hover:bg-[#581C87] disabled:opacity-40 text-white font-semibold text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Reservation</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Catalogue Grid View */
        <div className="space-y-6">
          {/* Controls: Search & Category Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-[#6B21A8] text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-[#EAE2F2] hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search amenities..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#EAE2F2] rounded-full text-xs focus:outline-none focus:border-[#6B21A8]"
              />
            </div>
          </div>

          {/* Grid of Amenity Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAmenities.map((amenity) => (
              <div
                key={amenity.id}
                className="bg-white rounded-3xl border border-[#EAE2F2] overflow-hidden hover:shadow-lg hover:border-purple-300 transition-all flex flex-col group"
              >
                {/* Cover Image */}
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={amenity.coverImage}
                    alt={amenity.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-slate-800 shadow-sm">
                      {amenity.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-700 text-white px-2.5 py-1 rounded-full shadow-sm">
                      {amenity.status}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-lg text-[#1C1326] group-hover:text-[#6B21A8] transition-colors">
                      {amenity.name}
                    </h3>
                    <p className="text-xs text-[#6E6280] mt-1 line-clamp-2 leading-relaxed">
                      {amenity.description}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-[#6E6280]">
                    <p className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-[#6B21A8]" />
                      <span>Capacity: {amenity.capacity} people</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#6B21A8]" />
                      <span>Hours: {amenity.operatingHours}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleSelectAmenity(amenity)}
                    className="w-full py-2.5 rounded-xl bg-[#F8F6FC] hover:bg-[#6B21A8] hover:text-white text-[#6B21A8] font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>View Details & Book</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
