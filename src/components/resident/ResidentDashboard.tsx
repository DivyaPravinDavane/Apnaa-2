'use client';

import React, { useState } from 'react';
import { useSociety } from '@/context/SocietyContext';
import {
  DoorOpen,
  Building,
  Headset,
  MoreHorizontal,
  Receipt,
  CreditCard,
  History,
  Car,
  TicketCheck,
  Bus,
  FileText,
  MessageSquarePlus,
  BarChart2,
  ClipboardCheck,
  Image as ImageIcon,
  QrCode,
  Wrench,
  HelpCircle,
  ShoppingBag,
  Check,
  X,
  AlertTriangle,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface ResidentDashboardProps {
  onNavigate: (tab: string) => void;
  onOpenBookingModal?: () => void;
  onOpenVisitorModal?: () => void;
}

export function ResidentDashboard({ onNavigate }: ResidentDashboardProps) {
  const {
    currentUser,
    visitors,
    approveVisitor,
    denyVisitor,
    notices,
    events,
    addToast,
  } = useSociety();

  const [exploreAllOpen, setExploreAllOpen] = useState(false);
  const [activeCommunityIdx, setActiveCommunityIdx] = useState(0);
  const [billingSheet, setBillingSheet] = useState<'statement' | 'dues' | 'history' | null>(null);
  const [duesPaid, setDuesPaid] = useState(false);
  const [qrPassOpen, setQrPassOpen] = useState(false);

  const pendingVisitors = visitors.filter(
    (v) => v.unit === currentUser.unit && v.status === 'pending'
  );

  // Stacked Community Corner Cards (Poll + Notices + Events)
  const communityCards = [
    {
      id: 'comm_poll_1',
      badge: 'Poll',
      group: 'Owners',
      timestamp: '07 Dec 2023 | 05:06 PM',
      title: 'Executive Committee WHCA... — TEST POLL',
      subtitle: 'Tap to e-Vote • Answer limit: Min 15, Max 15',
      actionTab: 'resident_poll',
    },
    ...notices.slice(0, 2).map((n) => ({
      id: n.id,
      badge: n.category,
      group: 'Owners',
      timestamp: n.publishDate,
      title: n.title,
      subtitle: n.body,
      actionTab: 'resident_notices',
    })),
    ...events.slice(0, 1).map((e) => ({
      id: e.id,
      badge: 'Event',
      group: 'Residents',
      timestamp: `${e.date} | ${e.time}`,
      title: e.title,
      subtitle: `${e.venue} • ${e.attendeesCount} attending`,
      actionTab: 'resident_events',
    })),
  ];

  const currentCard = communityCards[activeCommunityIdx % communityCards.length];

  const gateUpdates: { label: string; icon: LucideIcon; tab: string; toast?: string }[] = [
    { label: 'Cab', icon: Car, tab: 'resident_visitors', toast: 'Pre-approve a Cab entry at Gate 1' },
    { label: 'Exit pass', icon: TicketCheck, tab: 'resident_visitors', toast: 'Create a Gate Exit Pass' },
    { label: 'School bus', icon: Bus, tab: 'resident_visitors', toast: 'School Bus arrival alerts active' },
  ];

  const communityServices: { label: string; icon: LucideIcon; tab?: string; action?: () => void }[] = [
    { label: 'Notice', icon: FileText, tab: 'resident_notices' },
    { label: 'Post', icon: MessageSquarePlus, tab: 'resident_poll' },
    { label: 'Poll', icon: BarChart2, tab: 'resident_poll' },
    { label: 'Survey', icon: ClipboardCheck, tab: 'resident_poll' },
    { label: 'Gallery', icon: ImageIcon, tab: 'resident_gallery' },
    {
      label: 'QR code scanner',
      icon: QrCode,
      action: () => {
        setExploreAllOpen(false);
        setQrPassOpen(true);
      },
    },
    { label: 'Facilities', icon: Building, tab: 'resident_amenities' },
    { label: 'Service Desk', icon: Wrench, tab: 'resident_notices' },
    { label: 'Request Desk', icon: HelpCircle, tab: 'resident_notices' },
    { label: 'MarketPlace', icon: ShoppingBag, tab: 'resident_events' },
  ];

  return (
    <div className="space-y-6 pt-2 pb-6 bg-white">
      {/* 1. QUICK ACTIONS GRID (4 Duo-Tone Icons: Gate, Facilities, Helpdesk, Explore all) */}
      <section className="px-2 pt-1">
        <div className="grid grid-cols-3 gap-y-5 gap-x-4 text-center">
          {/* Gate */}
          <button
            type="button"
            onClick={() => onNavigate('resident_visitors')}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="relative w-12 h-12 rounded-2xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center group-active:scale-95 transition-transform">
              <DoorOpen className="w-6 h-6 stroke-[1.9]" />
              {pendingVisitors.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {pendingVisitors.length}
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-[#0E2628]">Gate</span>
          </button>

          {/* Facilities */}
          <button
            type="button"
            onClick={() => onNavigate('resident_amenities')}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center group-active:scale-95 transition-transform">
              <Building className="w-6 h-6 stroke-[1.9]" />
            </div>
            <span className="text-xs font-bold text-[#0E2628]">Facilities</span>
          </button>

          {/* Helpdesk */}
          <button
            type="button"
            onClick={() => onNavigate('resident_notices')}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center group-active:scale-95 transition-transform">
              <Headset className="w-6 h-6 stroke-[1.9]" />
            </div>
            <span className="text-xs font-bold text-[#0E2628]">Helpdesk</span>
          </button>

          {/* Explore all (Placed in 2nd row left column exactly as shown in 00:00:00 video frame!) */}
          <button
            type="button"
            onClick={() => setExploreAllOpen(true)}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-11 h-11 rounded-full bg-[#073B3E] text-white flex items-center justify-center shadow-sm group-active:scale-95 transition-transform">
              <MoreHorizontal className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-[#0E2628]">Explore all</span>
          </button>
        </div>
      </section>

      {/* Live Gate Approval Alert if a Walk-in Visitor is Waiting */}
      {pendingVisitors.length > 0 && (
        <section className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-amber-900">
                Visitor waiting at Gate ({pendingVisitors.length})
              </span>
            </div>
            <span className="text-[10px] font-semibold text-amber-700">1-Tap Action</span>
          </div>
          {pendingVisitors.map((vis) => (
            <div
              key={vis.id}
              className="p-3 rounded-xl bg-white border border-amber-200/80 flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{vis.name}</p>
                <p className="text-[11px] text-slate-500 truncate">
                  {vis.purpose} • Flat {vis.unit}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => denyVisitor(vis.id, 'Resident unavailable')}
                  className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                  title="Deny"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => approveVisitor(vis.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#0D5C63] text-white text-[11px] font-bold flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  Approve
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* 2. COMMUNITY CORNER (Stacked Horizontal Card Carousel) */}
      <section className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[15px] font-bold text-[#0E2628]">Community corner</h2>
          <button
            type="button"
            onClick={() => onNavigate('resident_poll')}
            className="text-xs font-medium text-slate-500 hover:text-[#0D5C63]"
          >
            View all
          </button>
        </div>

        {/* Stacked Card Deck Container */}
        <div className="relative pb-4 pt-1">
          {/* 3rd back card in stack */}
          <div className="absolute inset-x-6 bottom-0 h-14 rounded-2xl bg-white border border-slate-200/80 shadow-2xs" />
          {/* 2nd middle card in stack */}
          <div className="absolute inset-x-3 bottom-2 h-16 rounded-2xl bg-white border border-slate-200/90 shadow-2xs" />

          {/* Front Active Card */}
          <div
            onClick={() => onNavigate(currentCard.actionTab)}
            className="relative z-10 bg-white rounded-2xl border border-slate-200/90 shadow-[0_6px_20px_rgba(0,0,0,0.06)] p-4 cursor-pointer active:scale-[0.99] transition-all"
          >
            <div className="flex items-start gap-3">
              {/* Left Badge / Thumbnail */}
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#E6F3F3] to-[#C4E4E6] border border-[#0D5C63]/20 flex flex-col items-center justify-center flex-shrink-0 text-[#0D5C63]">
                <span className="text-[9px] font-extrabold uppercase tracking-tighter">
                  {currentCard.badge}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-[#0D5C63] uppercase tracking-wider">
                    ••• {currentCard.badge}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCommunityIdx((prev) => prev + 1);
                    }}
                    className="text-[10px] font-semibold text-slate-400 hover:text-[#0D5C63]"
                  >
                    Next ({((activeCommunityIdx % communityCards.length) + 1)}/{communityCards.length})
                  </button>
                </div>

                <p className="text-xs font-semibold text-[#0E2628] mt-0.5 truncate">
                  {currentCard.group} •{' '}
                  <span className="font-normal text-slate-500">{currentCard.timestamp}</span>
                </p>

                <p className="text-xs font-bold text-[#0D5C63] mt-1 truncate">
                  {currentCard.title}
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-1">
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. BILLS & PAYMENTS SECTION (3 Square Cards: Statement, Dues, Payment history) */}
      <section className="rounded-3xl bg-[#FAF6F0] p-4 space-y-3.5 -mx-1">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-[#0E2628]">Bills &amp; payments</h2>
          <button
            type="button"
            onClick={() => setBillingSheet('statement')}
            className="text-xs font-medium text-slate-500 hover:text-[#0D5C63]"
          >
            View all
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* Statement */}
          <button
            type="button"
            onClick={() => setBillingSheet('statement')}
            className="aspect-square rounded-2xl bg-white shadow-2xs border border-slate-100 p-3 flex flex-col items-center justify-center gap-2.5 active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#0E2628] leading-tight text-center">
              Statement
            </span>
          </button>

          {/* Dues */}
          <button
            type="button"
            onClick={() => setBillingSheet('dues')}
            className="aspect-square rounded-2xl bg-white shadow-2xs border border-slate-100 p-3 flex flex-col items-center justify-center gap-2.5 active:scale-95 transition-transform relative"
          >
            {!duesPaid && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500" />
            )}
            <div className="w-10 h-10 rounded-xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#0E2628] leading-tight text-center">
              Dues
            </span>
          </button>

          {/* Payment history */}
          <button
            type="button"
            onClick={() => setBillingSheet('history')}
            className="aspect-square rounded-2xl bg-white shadow-2xs border border-slate-100 p-3 flex flex-col items-center justify-center gap-2.5 active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#0E2628] leading-tight text-center">
              Payment history
            </span>
          </button>
        </div>
      </section>

      {/* =========================================================================
          2. EXPLORE ALL BOTTOM SHEET [00:00:18]
         ========================================================================= */}
      {exploreAllOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-[1px]">
          <div className="w-full bg-white rounded-t-[28px] shadow-2xl pt-3 pb-7 px-5 space-y-5 max-h-[86vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            {/* Top Drag Handle */}
            <div
              onClick={() => setExploreAllOpen(false)}
              className="w-10 h-1 rounded-full bg-slate-400 mx-auto cursor-pointer"
            />

            {/* Category 1: Gate updates (Cab, Exit pass, School bus) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0E2628]">Gate updates</h3>
                <button
                  type="button"
                  onClick={() => setExploreAllOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center pt-1">
                {gateUpdates.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setExploreAllOpen(false);
                        if (item.toast) addToast(item.label, item.toast, 'info');
                        void fetch('/api/v1/services', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            type: 'gate_update',
                            updateType: item.label,
                            details: item.toast || `${item.label} gate pass created from Explore All`,
                          }),
                        }).catch(() => undefined);
                        onNavigate(item.tab);
                      }}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center group-active:scale-95 transition-transform">
                        <Icon className="w-6 h-6 stroke-[1.8]" />
                      </div>
                      <span className="text-xs font-medium text-[#0E2628]">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category 2: Community services (3-column grid: Notice, Post, Poll, Survey, Gallery, QR code scanner, Facilities, Service Desk, Request Desk, MarketPlace) */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h3 className="text-sm font-bold text-[#0E2628]">Community services</h3>

              <div className="grid grid-cols-3 gap-y-5 gap-x-4 text-center pt-1">
                {communityServices.map((service) => {
                  const Icon = service.icon;
                  return (
                    <button
                      key={service.label}
                      type="button"
                      onClick={() => {
                        if (service.action) {
                          service.action();
                          return;
                        }
                        setExploreAllOpen(false);
                        if (service.tab) onNavigate(service.tab);
                      }}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center group-active:scale-95 transition-transform ${
                          service.label === 'Poll'
                            ? 'bg-[#0D5C63] text-white shadow-sm ring-2 ring-[#E6F3F3]'
                            : 'bg-[#E6F3F3] text-[#0D5C63]'
                        }`}
                      >
                        <Icon className="w-6 h-6 stroke-[1.8]" />
                      </div>
                      <span className="text-xs font-medium text-[#0E2628] leading-tight">
                        {service.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Bills & Payments Bottom Sheet */}
      {billingSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="w-full bg-white rounded-t-[28px] p-5 space-y-4">
            <div className="w-10 h-1 rounded-full bg-slate-300 mx-auto" />
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0E2628] capitalize">
                {billingSheet === 'history' ? 'Payment History' : `Unit ${billingSheet}`}
              </h3>
              <button onClick={() => setBillingSheet(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {billingSheet === 'dues' && (
              <div className="p-4 rounded-2xl bg-[#E6F3F3] border border-[#0D5C63]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">
                    Flat {currentUser.unit} Quarterly Maintenance
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      duesPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {duesPaid ? 'Paid' : 'Due Now'}
                  </span>
                </div>
                <p className="text-2xl font-bold text-[#0E2628]">
                  {duesPaid ? '₹0.00' : '₹4,850.00'}
                </p>
                {!duesPaid && (
                  <button
                    type="button"
                    onClick={() => {
                      setDuesPaid(true);
                      setBillingSheet(null);
                      addToast('Payment Successful', 'Maintenance dues of ₹4,850 paid.', 'success');
                      void fetch('/api/v1/services', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ type: 'pay_bill', billId: 'bill_01', amount: 4850 }),
                      }).catch(() => undefined);
                    }}
                    className="w-full py-2.5 rounded-full bg-[#0D5C63] text-white text-xs font-bold"
                  >
                    Pay ₹4,850 Instant UPI
                  </button>
                )}
              </div>
            )}

            {billingSheet !== 'dues' && (
              <div className="space-y-2 text-xs">
                {[
                  { id: 'INV-2026-10', label: 'Oct 2026 Maintenance', amount: '₹4,850', status: 'Paid' },
                  { id: 'INV-2026-09', label: 'Sep 2026 Maintenance', amount: '₹4,850', status: 'Paid' },
                  { id: 'INV-2026-08', label: 'Clubhouse Amenity Pass', amount: '₹500', status: 'Paid' },
                ].map((row) => (
                  <div
                    key={row.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{row.label}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{row.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#0D5C63]">{row.amount}</p>
                      <span className="text-[10px] text-emerald-600 font-semibold">{row.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* QR Code Scanner / Resident Gate Pass Modal */}
      {qrPassOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="w-full bg-white rounded-t-[28px] p-5 text-center space-y-4">
            <div className="w-10 h-1 rounded-full bg-slate-300 mx-auto" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase bg-[#E6F3F3] text-[#0D5C63] px-2.5 py-1 rounded-full">
                Resident Digital ID
              </span>
              <button onClick={() => setQrPassOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0E2628]">{currentUser.name}</h3>
              <p className="text-xs text-slate-500">
                Flat {currentUser.unit} • PIN: 107864
              </p>
            </div>
            <div className="p-3 rounded-2xl border-2 border-dashed border-[#0D5C63]/40 inline-block">
              <QRCodeSVG value={`RESIDENT-${currentUser.unit}-107864`} size={148} />
            </div>
            <button
              onClick={() => setQrPassOpen(false)}
              className="w-full py-2.5 rounded-full bg-[#0D5C63] text-white text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
