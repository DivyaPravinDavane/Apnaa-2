'use client';

import React, { useState } from 'react';
import { useSociety } from '@/context/SocietyContext';
import { SocietyEvent, RSVPStatus } from '@/types';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  CheckCircle2,
  X,
  Share2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import Image from 'next/image';

export function EventsModule() {
  const { events, updateEventRSVP } = useSociety();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [viewMode, setViewMode] = useState<'cards' | 'calendar'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<SocietyEvent | null>(null);

  const filteredEvents = events.filter((e) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1326]">
          Events & Community
        </h1>
        <p className="text-xs sm:text-sm text-[#6E6280] mt-1">
          Join community celebrations, sports competitions, and cultural workshops at Green Valley Residency.
        </p>
      </div>

      {/* Controls: Tabs & View Mode */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-white rounded-xl border border-[#EAE2F2] text-xs">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeTab === 'upcoming'
                  ? 'bg-[#6B21A8] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Upcoming ({events.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeTab === 'past'
                  ? 'bg-[#6B21A8] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Past Events (8)
            </button>
          </div>

          <div className="flex items-center p-1 bg-white rounded-xl border border-[#EAE2F2] text-xs">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'cards' ? 'bg-[#6B21A8] text-white' : 'text-slate-600'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'calendar' ? 'bg-[#6B21A8] text-white' : 'text-slate-600'
              }`}
            >
              Calendar
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events by name or venue..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#EAE2F2] rounded-xl text-xs focus:outline-none focus:border-[#6B21A8]"
          />
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEvents.map((evt) => (
          <div
            key={evt.id}
            className="bg-white rounded-3xl border border-[#EAE2F2] overflow-hidden hover:shadow-md hover:border-purple-300 transition-all flex flex-col group"
          >
            {/* Image Header */}
            <div className="relative h-52 w-full overflow-hidden">
              <Image
                src={evt.coverImage}
                alt={evt.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3.5 left-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/95 backdrop-blur px-2.5 py-1 rounded-full text-purple-900 shadow-sm">
                  {evt.category}
                </span>
              </div>
              <div className="absolute bottom-3.5 right-3.5 bg-black/60 backdrop-blur text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-purple-300" />
                <span>{evt.attendeesCount} Attending</span>
              </div>
            </div>

            {/* Event Body */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h3 className="font-bold text-lg text-[#1C1326] group-hover:text-[#6B21A8] transition-colors leading-snug">
                  {evt.title}
                </h3>
                <p className="text-xs text-[#6E6280] line-clamp-2 leading-relaxed">
                  {evt.description}
                </p>

                <div className="space-y-1 text-xs text-[#6E6280] pt-2">
                  <p className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#6B21A8]" />
                    <span>{evt.date} • {evt.time}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#6B21A8]" />
                    <span>{evt.venue}</span>
                  </p>
                </div>
              </div>

              {/* RSVP Actions Bar */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  RSVP Deadline: <span className="font-medium text-slate-700">{evt.deadline}</span>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      updateEventRSVP(
                        evt.id,
                        evt.rsvpStatus === 'attending' ? 'none' : 'attending'
                      )
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      evt.rsvpStatus === 'attending'
                        ? 'bg-[#6B21A8] text-white shadow-sm'
                        : 'bg-purple-50 text-[#6B21A8] hover:bg-purple-100'
                    }`}
                  >
                    {evt.rsvpStatus === 'attending' ? '✓ Attending' : 'Attending'}
                  </button>

                  <button
                    onClick={() =>
                      updateEventRSVP(
                        evt.id,
                        evt.rsvpStatus === 'tentative' ? 'none' : 'tentative'
                      )
                    }
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      evt.rsvpStatus === 'tentative'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Maybe
                  </button>

                  <button
                    onClick={() => setSelectedEvent(evt)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                    title="View details"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-6">
            <div className="relative h-48 rounded-2xl overflow-hidden">
              <Image src={selectedEvent.coverImage} alt={selectedEvent.title} fill className="object-cover" />
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full">
                {selectedEvent.category}
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-2">{selectedEvent.title}</h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{selectedEvent.description}</p>
            </div>

            <div className="p-3.5 bg-[#F8F6FC] rounded-2xl text-xs space-y-1.5 text-slate-700">
              <p className="flex justify-between">
                <span>Date & Time:</span>
                <span className="font-semibold">{selectedEvent.date} ({selectedEvent.time})</span>
              </p>
              <p className="flex justify-between">
                <span>Venue:</span>
                <span className="font-semibold">{selectedEvent.venue}</span>
              </p>
              <p className="flex justify-between">
                <span>Organizer:</span>
                <span className="font-semibold">{selectedEvent.organizer}</span>
              </p>
              <p className="flex justify-between">
                <span>Capacity / RSVPs:</span>
                <span className="font-semibold text-purple-800">
                  {selectedEvent.attendeesCount} / {selectedEvent.capacity} attendees
                </span>
              </p>
            </div>

            <button
              onClick={() => setSelectedEvent(null)}
              className="w-full py-2.5 rounded-xl bg-[#6B21A8] text-white text-xs font-semibold hover:bg-[#581C87]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
