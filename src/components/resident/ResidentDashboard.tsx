'use client';

import React, { useState } from 'react';
import { useSociety } from '@/context/SocietyContext';
import {
  UserPlus,
  CalendarCheck,
  BellRing,
  Calendar,
  Users,
  BookmarkCheck,
  Check,
  X,
  ChevronRight,
  Sparkles,
  QrCode,
  AlertTriangle,
  Clock,
  MapPin
} from 'lucide-react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';

interface ResidentDashboardProps {
  onNavigate: (tab: string) => void;
  onOpenBookingModal?: () => void;
  onOpenVisitorModal?: () => void;
}

export function ResidentDashboard({
  onNavigate,
}: ResidentDashboardProps) {
  const {
    currentUser,
    visitors,
    approveVisitor,
    denyVisitor,
    bookings,
    notices,
    events,
    albums,
    acknowledgeNotice,
    updateEventRSVP,
  } = useSociety();

  const [activeQrPass, setActiveQrPass] = useState<{
    title: string;
    ref: string;
    sub: string;
    qrToken: string;
    details: string[];
  } | null>(null);

  // Computed data for dashboard
  const expectedVisitorsCount = visitors.filter(
    (v) => v.unit === currentUser.unit && (v.status === 'expected' || v.status === 'approved')
  ).length;

  const pendingVisitors = visitors.filter(
    (v) => v.unit === currentUser.unit && v.status === 'pending'
  );

  const upcomingBookings = bookings.filter(
    (b) => b.userId === currentUser.id && b.status === 'confirmed'
  );

  const urgentNotice = notices.find((n) => n.priority === 'urgent' && !n.isAcknowledged);

  const nextBooking = upcomingBookings[0];
  const upcomingEvents = events.slice(0, 2);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#EAE2F2] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1326]">
            Good morning, {currentUser.name.split(' ')[0]}!
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6280] mt-1 flex items-center gap-2">
            <span className="font-semibold text-[#6B21A8]">Flat {currentUser.unit}</span>
            <span>•</span>
            <span>{currentUser.societyName}</span>
          </p>
        </div>
      </div>

      {/* 2. Hero Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden shadow-sm border border-[#EAE2F2] bg-gradient-to-r from-[#240B3B] via-[#4A154B] to-[#6B21A8] text-white">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-25 lg:opacity-35 pointer-events-none hidden sm:block">
          <Image
            src="https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1000&q=80"
            alt="Clubhouse pool"
            fill
            className="object-cover mix-blend-overlay"
          />
        </div>

        <div className="relative z-10 p-6 sm:p-8 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-medium text-purple-200 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Living Experience</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-snug">
            Your community, more connected
          </h2>
          <p className="text-sm text-purple-100/90 mt-2 leading-relaxed">
            Book society amenities in real-time, pre-approve guests with instant digital passes, and stay in touch with society circulars.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('resident_amenities')}
              className="px-5 py-2.5 rounded-full bg-white text-[#240B3B] font-semibold text-sm hover:bg-purple-50 transition-all shadow-md active:scale-95"
            >
              Book an Amenity
            </button>
            <button
              onClick={() => onNavigate('resident_visitors')}
              className="px-5 py-2.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 text-white font-medium text-sm transition-all backdrop-blur active:scale-95"
            >
              Invite a Visitor
            </button>
          </div>
        </div>
      </div>

      {/* 3. Quick Actions Grid */}
      <div>
        <h3 className="text-sm font-bold text-[#1C1326] uppercase tracking-wider mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <button
            onClick={() => onNavigate('resident_visitors')}
            className="p-4 rounded-2xl bg-white border border-[#EAE2F2] hover:border-[#6B21A8]/40 hover:shadow-md transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6B21A8] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <UserPlus className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-sm text-[#1C1326] group-hover:text-[#6B21A8] transition-colors">
              Invite Visitor
            </h4>
            <p className="text-xs text-[#6E6280] mt-1 leading-snug">
              Pre-approve visitors and get QR passes
            </p>
          </button>

          <button
            onClick={() => onNavigate('resident_amenities')}
            className="p-4 rounded-2xl bg-white border border-[#EAE2F2] hover:border-[#6B21A8]/40 hover:shadow-md transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6B21A8] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-sm text-[#1C1326] group-hover:text-[#6B21A8] transition-colors">
              Book Amenity
            </h4>
            <p className="text-xs text-[#6E6280] mt-1 leading-snug">
              Reserve your favourite facilities
            </p>
          </button>

          <button
            onClick={() => onNavigate('resident_notices')}
            className="p-4 rounded-2xl bg-white border border-[#EAE2F2] hover:border-[#6B21A8]/40 hover:shadow-md transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6B21A8] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <BellRing className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-sm text-[#1C1326] group-hover:text-[#6B21A8] transition-colors">
              View Notices
            </h4>
            <p className="text-xs text-[#6E6280] mt-1 leading-snug">
              Stay updated with latest news
            </p>
          </button>

          <button
            onClick={() => onNavigate('resident_events')}
            className="p-4 rounded-2xl bg-white border border-[#EAE2F2] hover:border-[#6B21A8]/40 hover:shadow-md transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6B21A8] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-sm text-[#1C1326] group-hover:text-[#6B21A8] transition-colors">
              Explore Events
            </h4>
            <p className="text-xs text-[#6E6280] mt-1 leading-snug">
              Join community events & activities
            </p>
          </button>
        </div>
      </div>

      {/* 4. Today's Overview Counter Cards */}
      <div>
        <h3 className="text-sm font-bold text-[#182B2A] uppercase tracking-wider mb-3">
          Today&apos;s Overview
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div
            onClick={() => onNavigate('resident_visitors')}
            className="p-4 rounded-2xl bg-white border border-[#EAE2F2] cursor-pointer hover:border-purple-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-[#EDE9FE] text-[#6B21A8]">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-[#1C1326]">{expectedVisitorsCount}</span>
            </div>
            <p className="text-xs font-semibold text-[#1C1326] mt-3">Expected Visitors</p>
            <p className="text-[11px] text-[#6E6280] flex items-center gap-1 mt-0.5">
              <span>View list</span>
              <ChevronRight className="w-3 h-3" />
            </p>
          </div>

          <div
            onClick={() => onNavigate('resident_bookings')}
            className="p-4 rounded-2xl bg-white border border-[#EAE2F2] cursor-pointer hover:border-purple-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-[#EDE9FE] text-[#6B21A8]">
                <BookmarkCheck className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-[#1C1326]">{upcomingBookings.length}</span>
            </div>
            <p className="text-xs font-semibold text-[#1C1326] mt-3">Upcoming Bookings</p>
            <p className="text-[11px] text-[#6E6280] flex items-center gap-1 mt-0.5">
              <span>View all</span>
              <ChevronRight className="w-3 h-3" />
            </p>
          </div>

          <div
            onClick={() => onNavigate('resident_notices')}
            className="p-4 rounded-2xl bg-white border border-[#EAE2F2] cursor-pointer hover:border-purple-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-[#EDE9FE] text-[#6B21A8]">
                <BellRing className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-[#1C1326]">{notices.filter((n) => !n.isRead).length}</span>
            </div>
            <p className="text-xs font-semibold text-[#1C1326] mt-3">Unread Notices</p>
            <p className="text-[11px] text-[#6E6280] flex items-center gap-1 mt-0.5">
              <span>View circulars</span>
              <ChevronRight className="w-3 h-3" />
            </p>
          </div>

          <div
            onClick={() => onNavigate('resident_events')}
            className="p-4 rounded-2xl bg-white border border-[#EAE2F2] cursor-pointer hover:border-purple-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-[#EDE9FE] text-[#6B21A8]">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-[#1C1326]">{events.length}</span>
            </div>
            <p className="text-xs font-semibold text-[#1C1326] mt-3">Upcoming Events</p>
            <p className="text-[11px] text-[#6E6280] flex items-center gap-1 mt-0.5">
              <span>View calendar</span>
              <ChevronRight className="w-3 h-3" />
            </p>
          </div>
        </div>
      </div>

      {/* 5. Pending Visitor Approvals (Real-time 1-tap Approve/Deny) */}
      {pendingVisitors.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-sm text-amber-900">
                Pending Visitor Approval Request ({pendingVisitors.length})
              </h3>
            </div>
            <span className="text-xs text-amber-700 font-medium">Gate 1 Terminal</span>
          </div>

          <div className="space-y-3">
            {pendingVisitors.map((vis) => (
              <div
                key={vis.id}
                className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-slate-900">{vis.name}</p>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                      Waiting at Gate
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Purpose: <span className="font-medium text-slate-800">{vis.purpose}</span> • {vis.visitorCount} {vis.visitorCount === 1 ? 'person' : 'people'}
                  </p>
                  {vis.notes && (
                    <p className="text-xs text-slate-500 italic mt-0.5">&ldquo;{vis.notes}&rdquo;</p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => denyVisitor(vis.id, 'Resident unavailable')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Deny
                  </button>
                  <button
                    onClick={() => approveVisitor(vis.id)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#6B21A8] hover:bg-[#581C87] text-white text-xs font-semibold transition-colors shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve Entry
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Urgent Notice Banner if any */}
      {urgentNotice && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase bg-rose-600 text-white px-2 py-0.5 rounded">
                  URGENT CIRCULAR
                </span>
                <span className="text-xs text-rose-700 font-medium">{urgentNotice.category}</span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 mt-1">{urgentNotice.title}</h4>
              <p className="text-xs text-slate-600 mt-0.5 max-w-2xl line-clamp-1 sm:line-clamp-none">
                {urgentNotice.body}
              </p>
            </div>
          </div>
          <button
            onClick={() => acknowledgeNotice(urgentNotice.id)}
            className="flex-shrink-0 px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold transition-colors shadow-sm self-end sm:self-center"
          >
            Acknowledge Receipt
          </button>
        </div>
      )}

      {/* 7. Two Column Section: Upcoming Booking & Expected Visitors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Amenity Booking */}
        <div className="p-5 rounded-2xl bg-white border border-[#EAE2F2]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#1C1326] uppercase tracking-wider">
              Upcoming Booking
            </h3>
            <button
              onClick={() => onNavigate('resident_bookings')}
              className="text-xs font-semibold text-[#6B21A8] hover:underline"
            >
              View all
            </button>
          </div>

          {nextBooking ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-[#F8F6FC] border border-[#EAE2F2]">
              <div className="relative w-full sm:w-28 h-28 rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src={nextBooking.amenityImage}
                  alt={nextBooking.amenityName}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-base text-[#1C1326] truncate">
                    {nextBooking.amenityName}
                  </h4>
                  <span className="text-[11px] font-semibold bg-[#EDE9FE] text-[#6B21A8] px-2.5 py-0.5 rounded-full uppercase">
                    {nextBooking.status}
                  </span>
                </div>

                <div className="mt-2 space-y-1 text-xs text-[#6E6280]">
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#6B21A8]" />
                    <span>{nextBooking.date} • {nextBooking.timeSlot}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#6B21A8]" />
                    <span>{nextBooking.guestCount} Attendees ({nextBooking.unit})</span>
                  </p>
                  <p className="text-[11px] font-mono text-slate-500">Ref: {nextBooking.bookingReference}</p>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() =>
                      setActiveQrPass({
                        title: nextBooking.amenityName,
                        ref: nextBooking.bookingReference,
                        sub: `${nextBooking.date} • ${nextBooking.timeSlot}`,
                        qrToken: nextBooking.qrToken,
                        details: [
                          `Unit: ${nextBooking.unit}`,
                          `Guests: ${nextBooking.guestCount}`,
                          `Status: ${nextBooking.status.toUpperCase()}`,
                        ],
                      })
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6B21A8] text-white text-xs font-semibold hover:bg-[#581C87] transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    Digital Pass
                  </button>
                  <button
                    onClick={() => onNavigate('resident_bookings')}
                    className="text-xs text-[#6B21A8] font-semibold hover:underline px-2 py-1"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400">
              <CalendarCheck className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-600">No upcoming bookings</p>
              <button
                onClick={() => onNavigate('resident_amenities')}
                className="mt-3 text-xs font-semibold text-[#6B21A8] hover:underline"
              >
                + Book swimming pool or sports court
              </button>
            </div>
          )}
        </div>

        {/* Expected Visitors Card */}
        <div className="p-5 rounded-2xl bg-white border border-[#EAE2F2]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#1C1326] uppercase tracking-wider">
              Expected Visitors
            </h3>
            <button
              onClick={() => onNavigate('resident_visitors')}
              className="text-xs font-semibold text-[#6B21A8] hover:underline"
            >
              Manage all
            </button>
          </div>

          <div className="space-y-2.5">
            {visitors
              .filter(
                (v) =>
                  v.unit === currentUser.unit &&
                  (v.status === 'expected' || v.status === 'approved')
              )
              .slice(0, 3)
              .map((vis) => (
                <div
                  key={vis.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-100 text-[#6B21A8] flex items-center justify-center font-bold text-xs">
                      {vis.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{vis.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {vis.purpose} • Arriving {vis.arrivalTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setActiveQrPass({
                          title: `Visitor Gate Pass: ${vis.name}`,
                          ref: vis.passCode,
                          sub: `Valid on ${vis.visitDate} at ${vis.arrivalTime}`,
                          qrToken: `GATE-PASS-${vis.passCode}-${vis.unit}`,
                          details: [
                            `Destination: Flat ${vis.unit}`,
                            `Host: ${vis.residentName}`,
                            `Guests: ${vis.visitorCount}`,
                            `Vehicle: ${vis.vehicleNumber || 'None'}`,
                          ],
                        })
                      }
                      className="text-xs font-mono font-bold bg-white px-2 py-1 rounded border border-slate-200 text-purple-900 hover:bg-purple-50 flex items-center gap-1"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      {vis.passCode}
                    </button>
                  </div>
                </div>
              ))}

            {expectedVisitorsCount === 0 && (
              <div className="py-8 text-center text-slate-400 text-xs">
                No pre-approved visitors for today.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 8. Events & Community Preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#1C1326] uppercase tracking-wider">
            Upcoming Community Events
          </h3>
          <button
            onClick={() => onNavigate('resident_events')}
            className="text-xs font-semibold text-[#6B21A8] hover:underline"
          >
            Explore all events
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingEvents.map((evt) => (
            <div
              key={evt.id}
              className="p-4 rounded-2xl bg-white border border-[#EAE2F2] flex flex-col sm:flex-row gap-4 hover:shadow-sm transition-shadow"
            >
              <div className="relative w-full sm:w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src={evt.coverImage}
                  alt={evt.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                    {evt.category}
                  </span>
                  <h4 className="font-bold text-sm text-[#1C1326] mt-1.5 leading-snug line-clamp-1">
                    {evt.title}
                  </h4>
                  <p className="text-xs text-[#6E6280] mt-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#6B21A8]" />
                    <span>{evt.date} • {evt.time}</span>
                  </p>
                  <p className="text-xs text-[#6E6280] mt-0.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#6B21A8]" />
                    <span>{evt.venue}</span>
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500">
                    <strong className="text-slate-800 font-semibold">{evt.attendeesCount}</strong> attending
                  </span>
                  <button
                    onClick={() =>
                      updateEventRSVP(
                        evt.id,
                        evt.rsvpStatus === 'attending' ? 'none' : 'attending'
                      )
                    }
                    className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${
                      evt.rsvpStatus === 'attending'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-purple-50 text-[#6B21A8] hover:bg-purple-100'
                    }`}
                  >
                    {evt.rsvpStatus === 'attending' ? '✓ Attending' : 'RSVP Now'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 9. Gallery Preview Carousel */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#1C1326] uppercase tracking-wider">
            Moments from our Community
          </h3>
          <button
            onClick={() => onNavigate('resident_gallery')}
            className="text-xs font-semibold text-[#6B21A8] hover:underline"
          >
            View full gallery
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {albums.map((alb) => (
            <div
              key={alb.id}
              onClick={() => onNavigate('resident_gallery')}
              className="group cursor-pointer rounded-xl overflow-hidden bg-white border border-[#EAE2F2] shadow-sm hover:shadow-md transition-all"
            >
              <div className="relative aspect-square w-full">
                <Image
                  src={alb.coverImage}
                  alt={alb.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2">
                  <p className="text-[11px] font-semibold text-white truncate">{alb.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Digital QR Pass Modal */}
      {activeQrPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-center p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold tracking-wider uppercase text-purple-900 bg-purple-50 px-2.5 py-1 rounded-full">
                Smart Gate Pass (Demo)
              </span>
              <button
                onClick={() => setActiveQrPass(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="font-bold text-lg text-slate-900">{activeQrPass.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{activeQrPass.sub}</p>
            </div>

            {/* QR Code Container */}
            <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-purple-200 inline-block shadow-inner">
              <QRCodeSVG
                value={activeQrPass.qrToken}
                size={160}
                level="M"
                includeMargin
              />
              <p className="font-mono text-sm font-bold text-slate-800 mt-2">
                {activeQrPass.ref}
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl text-left text-xs space-y-1 text-slate-600">
              {activeQrPass.details.map((line, idx) => (
                <p key={idx} className="font-medium">{line}</p>
              ))}
              <p className="text-[10px] text-purple-700 italic pt-1 border-t border-slate-200">
                Show this barcode / QR to the guard at Gate 1 or facility reception.
              </p>
            </div>

            <button
              onClick={() => setActiveQrPass(null)}
              className="w-full py-2.5 rounded-xl bg-[#6B21A8] text-white font-semibold text-xs hover:bg-[#581C87] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
