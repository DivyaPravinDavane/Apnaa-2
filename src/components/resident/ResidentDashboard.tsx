'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSociety } from '@/context/SocietyContext';
import {
  SocietyApi,
  type UnitBillRecord,
  type GateUpdateRecord,
  type ServiceRequestRecord,
} from '@/lib/api';
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
    refreshData,
  } = useSociety();

  const [exploreAllOpen, setExploreAllOpen] = useState(false);
  const [activeCommunityIdx, setActiveCommunityIdx] = useState(0);
  const [billingSheet, setBillingSheet] = useState<'statement' | 'dues' | 'history' | null>(null);
  const [qrPassOpen, setQrPassOpen] = useState(false);

  // Live remote MySQL state for bills, gate updates, and service requests
  const [bills, setBills] = useState<UnitBillRecord[]>([]);
  const [gateUpdatesList, setGateUpdatesList] = useState<GateUpdateRecord[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequestRecord[]>([]);

  // Helpdesk / Service Desk modal state
  const [deskModal, setDeskModal] = useState<'Helpdesk' | 'Service Desk' | 'Request Desk' | null>(null);
  const [ticketCategory, setTicketCategory] = useState('Plumbing');
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);

  const loadServicesFromDb = useCallback(async () => {
    const res = await SocietyApi.services.list();
    if (res.data) {
      setBills(res.data.bills || []);
      setGateUpdatesList(res.data.gateUpdates || []);
      setServiceRequests(res.data.serviceRequests || []);
    }
  }, []);

  useEffect(() => {
    void loadServicesFromDb();
  }, [loadServicesFromDb]);

  const unpaidBills = bills.filter((b) => b.status === 'unpaid' || b.status === 'overdue');
  const duesPaid = bills.length > 0 ? unpaidBills.length === 0 : false;
  const totalUnpaidAmount = unpaidBills.reduce((sum, b) => sum + Number(b.amount || 0), 0);

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

  const gateUpdates: { label: 'Cab' | 'Exit pass' | 'School bus'; icon: LucideIcon; tab: string; toast: string }[] = [
    { label: 'Cab', icon: Car, tab: 'resident_visitors', toast: 'Pre-approved Cab entry recorded in gate_updates' },
    { label: 'Exit pass', icon: TicketCheck, tab: 'resident_visitors', toast: 'Gate Exit Pass stored in gate_updates' },
    { label: 'School bus', icon: Bus, tab: 'resident_visitors', toast: 'School Bus alert stored in gate_updates' },
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
    {
      label: 'Service Desk',
      icon: Wrench,
      action: () => {
        setExploreAllOpen(false);
        setDeskModal('Service Desk');
      },
    },
    {
      label: 'Request Desk',
      icon: HelpCircle,
      action: () => {
        setExploreAllOpen(false);
        setDeskModal('Request Desk');
      },
    },
    { label: 'MarketPlace', icon: ShoppingBag, tab: 'resident_events' },
  ];

  const handlePayBills = async (billId?: string, amount?: number) => {
    const res = await SocietyApi.services.payBill(billId, amount);
    if (res.error) {
      addToast('Payment Failed', res.error.message, 'error');
      return;
    }
    addToast(
      'Payment Recorded in MySQL',
      `Maintenance payment updated in unit_bills table.`,
      'success'
    );
    await loadServicesFromDb();
    void refreshData();
    setBillingSheet(null);
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deskModal || !ticketTitle.trim()) return;
    setSubmittingTicket(true);
    const res = await SocietyApi.services.createServiceRequest({
      deskType: deskModal,
      category: ticketCategory,
      title: ticketTitle.trim(),
      description: ticketDesc.trim() || `${deskModal} request submitted by ${currentUser.name} (${currentUser.unit})`,
    });
    setSubmittingTicket(false);
    if (res.error) {
      addToast('Failed to Submit', res.error.message, 'error');
      return;
    }
    addToast(
      `${deskModal} Ticket Saved`,
      `"${ticketTitle.trim()}" stored in phpMyAdmin (service_requests).`,
      'success'
    );
    setTicketTitle('');
    setTicketDesc('');
    setDeskModal(null);
    await loadServicesFromDb();
    void refreshData();
  };

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
            onClick={() => setDeskModal('Helpdesk')}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="relative w-12 h-12 rounded-2xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center group-active:scale-95 transition-transform">
              <Headset className="w-6 h-6 stroke-[1.9]" />
              {serviceRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#0D5C63] text-white text-[9px] font-bold flex items-center justify-center">
                  {serviceRequests.length}
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-[#0E2628]">Helpdesk</span>
          </button>

          {/* Explore all */}
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
          <div className="absolute inset-x-6 bottom-0 h-14 rounded-2xl bg-white border border-slate-200/80 shadow-2xs" />
          <div className="absolute inset-x-3 bottom-2 h-16 rounded-2xl bg-white border border-slate-200/90 shadow-2xs" />

          {/* Front Active Card */}
          <div
            onClick={() => onNavigate(currentCard.actionTab)}
            className="relative z-10 bg-white rounded-2xl border border-slate-200/90 shadow-[0_6px_20px_rgba(0,0,0,0.06)] p-4 cursor-pointer active:scale-[0.99] transition-all"
          >
            <div className="flex items-start gap-3">
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
          EXPLORE ALL BOTTOM SHEET
         ========================================================================= */}
      {exploreAllOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-[1px]">
          <div className="w-full bg-white rounded-t-[28px] shadow-2xl pt-3 pb-7 px-5 space-y-5 max-h-[86vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
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
                        void SocietyApi.services
                          .createGateUpdate(
                            item.label,
                            `${item.label} pass created by ${currentUser.name} (Flat ${currentUser.unit})`
                          )
                          .then((res) => {
                            if (res.data) {
                              addToast(
                                `${item.label} Saved to DB`,
                                `Pass ${res.data.passCode} stored in phpMyAdmin (gate_updates).`,
                                'success'
                              );
                              void loadServicesFromDb();
                            }
                          });
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

              {gateUpdatesList.length > 0 && (
                <div className="pt-2 space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Active Gate Updates in DB ({gateUpdatesList.length})
                  </p>
                  {gateUpdatesList.slice(0, 3).map((gu) => (
                    <div
                      key={gu.id}
                      className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px]"
                    >
                      <span className="font-semibold text-slate-700 truncate">
                        {gu.update_type}: {gu.details}
                      </span>
                      <span className="font-mono font-bold text-[#0D5C63] ml-2 flex-shrink-0">
                        {gu.pass_code}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Category 2: Community services */}
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

      {/* Interactive Bills & Payments Bottom Sheet (backed by unit_bills in MySQL) */}
      {billingSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="w-full bg-white rounded-t-[28px] p-5 space-y-4 max-h-[82vh] overflow-y-auto">
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
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-[#E6F3F3] border border-[#0D5C63]/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">
                      Flat {currentUser.unit} Outstanding Dues
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        duesPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {duesPaid ? 'All Paid' : `${unpaidBills.length} Unpaid`}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-[#0E2628]">
                    ₹{duesPaid ? '0.00' : totalUnpaidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                  {!duesPaid && (
                    <button
                      type="button"
                      onClick={() => void handlePayBills()}
                      className="w-full py-2.5 rounded-full bg-[#0D5C63] text-white text-xs font-bold shadow-xs"
                    >
                      Pay All Dues (₹{totalUnpaidAmount.toLocaleString('en-IN')}) via Instant UPI
                    </button>
                  )}
                </div>

                {unpaidBills.map((bill) => (
                  <div
                    key={bill.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{bill.title}</p>
                      <p className="text-[10px] text-slate-500">
                        {bill.invoice_no} • {bill.billing_period}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handlePayBills(bill.id, Number(bill.amount))}
                      className="px-3 py-1.5 rounded-full bg-[#0D5C63] text-white text-[11px] font-bold flex-shrink-0"
                    >
                      Pay ₹{Number(bill.amount).toLocaleString('en-IN')}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {billingSheet !== 'dues' && (
              <div className="space-y-2 text-xs">
                {(bills.length > 0
                  ? bills
                  : [
                      {
                        id: 'bill_01',
                        invoice_no: 'INV-2026-1101',
                        title: 'Monthly Society Maintenance Statement',
                        amount: 4850,
                        status: 'unpaid' as const,
                      },
                    ]
                ).map((row) => (
                  <div
                    key={row.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{row.title}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{row.invoice_no}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#0D5C63]">
                        ₹{Number(row.amount).toLocaleString('en-IN')}
                      </p>
                      <span
                        className={`text-[10px] font-semibold uppercase ${
                          row.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {row.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Helpdesk / Service Desk / Request Desk Modal (saves directly to service_requests in MySQL) */}
      {deskModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <form
            onSubmit={(e) => void handleSubmitTicket(e)}
            className="w-full bg-white rounded-t-[28px] p-5 space-y-3.5 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0E2628]">{deskModal}</h3>
                <p className="text-[11px] text-slate-500">
                  Log a ticket directly to phpMyAdmin (`service_requests`)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeskModal(null)}
                className="p-1 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Category</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option>Plumbing</option>
                  <option>Electrical</option>
                  <option>Carpentry</option>
                  <option>Housekeeping</option>
                  <option>Security / Intercom</option>
                  <option>Billing & Accounts</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Issue / Request Title *
                </label>
                <input
                  type="text"
                  required
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  placeholder="e.g. Kitchen tap leakage or parking sticker request"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Details
                </label>
                <textarea
                  rows={2}
                  value={ticketDesc}
                  onChange={(e) => setTicketDesc(e.target.value)}
                  placeholder="Preferred time slot or additional details..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            {serviceRequests.length > 0 && (
              <div className="pt-1 space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Recent Tickets in MySQL ({serviceRequests.length})
                </p>
                <div className="max-h-28 overflow-y-auto space-y-1">
                  {serviceRequests.slice(0, 4).map((sr) => (
                    <div
                      key={sr.id}
                      className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px]"
                    >
                      <span className="truncate font-medium text-slate-700">
                        [{sr.category}] {sr.title}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-[#0D5C63] ml-2">
                        {sr.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setDeskModal(null);
                  onNavigate('resident_notices');
                }}
                className="py-2.5 rounded-full border border-[#0D5C63] text-[#0D5C63] text-xs font-bold"
              >
                View Notices
              </button>
              <button
                type="submit"
                disabled={submittingTicket}
                className="py-2.5 rounded-full bg-[#0D5C63] text-white text-xs font-bold"
              >
                {submittingTicket ? 'Saving…' : 'Submit Ticket'}
              </button>
            </div>
          </form>
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
