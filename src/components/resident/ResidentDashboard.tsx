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
  Shield,
  ShieldCheck,
  Lock,
  Unlock,
  UserCheck,
  Flame,
  Droplet,
  Zap,
  Users,
  Camera,
  CheckCircle2,
  Clock,
  Sparkles,
  Phone,
  MessageCircle,
  Building2,
  ChevronRight,
  Send,
  Plus,
  Radio,
  Trash2,
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
  const [complaintPhotoAttached, setComplaintPhotoAttached] = useState(false);

  // Vehicle Security: Lock & Unlock from app
  const [vehicleModal, setVehicleModal] = useState(false);
  const [newVehPlate, setNewVehPlate] = useState('');
  const [newVehModel, setNewVehModel] = useState('');
  const [newVehSlot, setNewVehSlot] = useState('');
  const [newVehType, setNewVehType] = useState('Car');
  const [vehicles, setVehicles] = useState([
    { id: 'v1', number: 'MH-12-AB-1234', type: 'Car', model: 'Honda City (White)', locked: false, parkSlot: 'P-104' },
    { id: 'v2', number: 'MH-12-CD-5678', type: 'Two-Wheeler', model: 'Activa 6G (Grey)', locked: true, parkSlot: 'B-28' },
  ]);

  const handleToggleVehicleLock = (id: string) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const next = !v.locked;
          addToast(
            next ? 'Vehicle Security Locked' : 'Vehicle Security Unlocked',
            `${v.number} is now ${next ? 'LOCKED (Security gate will prevent unauthorized exit)' : 'UNLOCKED (Free gate exit permitted)'}`,
            next ? 'info' : 'success'
          );
          return { ...v, locked: next };
        }
        return v;
      })
    );
  };

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehPlate.trim()) return;
    const newEntry = {
      id: 'v_' + Date.now(),
      number: newVehPlate.trim().toUpperCase(),
      type: newVehType,
      model: newVehModel.trim() || 'Vehicle',
      locked: false,
      parkSlot: newVehSlot.trim() || `P-${Math.floor(100 + Math.random() * 200)}`,
    };
    setVehicles((prev) => [...prev, newEntry]);
    addToast('Vehicle Registered', `${newEntry.number} linked to Flat ${currentUser.unit}.`, 'success');
    setNewVehPlate('');
    setNewVehModel('');
    setNewVehSlot('');
  };

  // Domestic Help Gate Pass & Attendance
  const [domesticHelpModal, setDomesticHelpModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Housekeeping');
  const [domesticStaff, setDomesticStaff] = useState([
    { id: 'ds1', name: 'Asha Bai', role: 'Housekeeping / Maid', phone: '+91 98220 11223', passCode: 'PASS-8841', status: 'Inside Campus', time: 'In: 08:35 AM' },
    { id: 'ds2', name: 'Ramesh Kumar', role: 'Personal Driver', phone: '+91 98450 33445', passCode: 'PASS-7729', status: 'Expected', time: 'Daily 09:00 AM' },
    { id: 'ds3', name: 'Sunita Roy', role: 'Cook', phone: '+91 98900 55667', passCode: 'PASS-9912', status: 'Pass Issued', time: 'Evening 06:30 PM' },
  ]);

  const handleIssueStaffPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim()) return;
    const code = 'PASS-' + Math.floor(1000 + Math.random() * 9000);
    setDomesticStaff((prev) => [
      ...prev,
      {
        id: 'ds_' + Date.now(),
        name: newStaffName.trim(),
        role: newStaffRole,
        phone: '+91 98' + Math.floor(10000000 + Math.random() * 90000000),
        passCode: code,
        status: 'Pass Issued',
        time: 'Valid Today',
      },
    ]);
    addToast('Gate Pass Issued', `Gate Pass ${code} issued for ${newStaffName.trim()}. Alert sent to Gate 1.`, 'success');
    setNewStaffName('');
  };

  // Facility QR Code Scanner & Malfunction Complaints
  const [facilityQrModal, setFacilityQrModal] = useState(false);
  const [scannedFacility, setScannedFacility] = useState<string | null>(null);
  const [facilityIssueTitle, setFacilityIssueTitle] = useState('');
  const [facilityIssuePhoto, setFacilityIssuePhoto] = useState(false);
  const [facilitySubmitting, setFacilitySubmitting] = useState(false);

  const sampleFacilities = [
    { code: 'FAC-TC-01', name: 'Tennis Court 1 - Floodlights & Net', location: 'Sports Arena' },
    { code: 'FAC-GYM-03', name: 'Treadmill #2 - Belt & Console', location: 'Clubhouse 1st Floor' },
    { code: 'FAC-POOL-01', name: 'Swimming Pool - Filtration System', location: 'Clubhouse Ground' },
    { code: 'FAC-LIFT-B', name: 'Wing B High-Speed Passenger Elevator', location: 'Tower B' },
  ];

  const handleFacilityComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedFacility || !facilityIssueTitle.trim()) return;
    setFacilitySubmitting(true);
    setTimeout(() => {
      setFacilitySubmitting(false);
      addToast(
        'Facility Malfunction Logged',
        `Complaint registered against ${scannedFacility} with photo evidence. Maintenance staff alerted.`,
        'success'
      );
      setScannedFacility(null);
      setFacilityIssueTitle('');
      setFacilityIssuePhoto(false);
      setFacilityQrModal(false);
    }, 600);
  };

  // Digital Utility Readings
  const [utilityModal, setUtilityModal] = useState(false);
  const [readingsState, setReadingsState] = useState({
    water: { reading: 412.8, unit: 'KL', lastBilled: 398.6, date: '10 Nov 2026', status: 'Normal' },
    gas: { reading: 89.4, unit: 'SCM', lastBilled: 82.6, date: '10 Nov 2026', status: 'Optimal' },
    electricity: { reading: 3412, unit: 'kWh', lastBilled: 3128, date: '10 Nov 2026', status: 'Active' },
  });
  const [meterInputType, setMeterInputType] = useState<'water' | 'gas' | 'electricity'>('water');
  const [meterInputValue, setMeterInputValue] = useState('');

  const handleRecordReading = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(meterInputValue);
    if (isNaN(val)) return;
    setReadingsState((prev) => ({
      ...prev,
      [meterInputType]: {
        ...prev[meterInputType],
        reading: val,
        date: 'Today (Live)',
      },
    }));
    addToast('Digital Reading Stored', `${meterInputType.toUpperCase()} meter updated to ${val} ${readingsState[meterInputType].unit}.`, 'success');
    setMeterInputValue('');
  };

  // Owners Discussion Forums & Interest Groups
  const [forumModal, setForumModal] = useState(false);
  const [forumTab, setForumTab] = useState<'discussions' | 'groups'>('discussions');
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadBody, setNewThreadBody] = useState('');
  const [joinedGroups, setJoinedGroups] = useState<string[]>(['Badminton & Sports Club', 'Organic Gardening & Composting']);
  const [forumThreads, setForumThreads] = useState([
    {
      id: 'ft1',
      title: 'Monsoon Terrace Waterproofing & Solar Panel Placement',
      author: 'Secretary (C-402)',
      category: 'Owners Forum',
      date: 'Today, 11:30 AM',
      replies: 14,
      preview: 'Quotations received from 3 vendors for terrace sealing. Please cast your vote in the active poll.',
    },
    {
      id: 'ft2',
      title: 'EV Charging Stations Setup in Basement B1 & B2',
      author: 'Sunil Rao (A-301)',
      category: 'Infrastructure',
      date: 'Yesterday, 04:15 PM',
      replies: 28,
      preview: 'Proposal to install 12 dedicated Level-2 AC chargers for 4-wheelers and 2-wheelers.',
    },
    {
      id: 'ft3',
      title: 'Annual General Body Meeting (AGM) - Agenda & Resolutions',
      author: 'Managing Committee',
      category: 'Official Notice',
      date: '08 Nov 2026',
      replies: 39,
      preview: 'Review of audited society financials and election of committee members for 2027.',
    },
  ]);

  const handleCreateThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreadTitle.trim() || !newThreadBody.trim()) return;
    setForumThreads((prev) => [
      {
        id: 'ft_' + Date.now(),
        title: newThreadTitle.trim(),
        author: `${currentUser.name} (${currentUser.unit})`,
        category: 'Discussion',
        date: 'Just now',
        replies: 0,
        preview: newThreadBody.trim(),
      },
      ...prev,
    ]);
    addToast('Forum Discussion Posted', 'Your discussion topic is published to the apartment owners forum.', 'success');
    setNewThreadTitle('');
    setNewThreadBody('');
  };

  const handleToggleJoinGroup = (name: string) => {
    setJoinedGroups((prev) => {
      const exists = prev.includes(name);
      if (exists) {
        addToast('Left Group', `Removed from ${name}.`, 'info');
        return prev.filter((g) => g !== name);
      } else {
        addToast('Joined Group', `You are now a member of ${name}!`, 'success');
        return [...prev, name];
      }
    });
  };

  const interestGroups = [
    { name: 'Badminton & Sports Club', members: 34, icon: '🏸', lastActive: '2 hrs ago', desc: 'Daily evening 7 PM matches at Court 1' },
    { name: 'Organic Gardening & Composting', members: 22, icon: '🌿', lastActive: 'Yesterday', desc: 'Terrace garden harvest & kitchen waste compost' },
    { name: 'Morning Cyclists & Runners', members: 18, icon: '🚴', lastActive: '5 hrs ago', desc: 'Weekend 6 AM 25km rides' },
    { name: 'Pet Parents Club', members: 28, icon: '🐾', lastActive: 'Just now', desc: 'Dog park timings & pet vaccination drives' },
    { name: 'Book Club & Cultural Events', members: 15, icon: '📚', lastActive: '1 day ago', desc: 'Monthly book review & celebration planning' },
  ];

  // Committee Action Items & Society Vitals
  const [actionItemsModal, setActionItemsModal] = useState(false);
  const [actionTab, setActionTab] = useState<'items' | 'vitals'>('items');
  const [newActionTask, setNewActionTask] = useState('');
  const [newActionAssignee, setNewActionAssignee] = useState('Secretary');
  const [newActionPriority, setNewActionPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

  type ActionPriority = 'High' | 'Medium' | 'Low';
  type ActionStatus = 'Open' | 'In Progress' | 'Completed';
  interface ActionItemRecord {
    id: string;
    task: string;
    assignee: string;
    dueDate: string;
    status: ActionStatus;
    priority: ActionPriority;
  }

  const committeeActionItems: ActionItemRecord[] = [
    { id: 'ai1', task: 'Fire Safety Audit & NOC Renewal', assignee: 'Secretary', dueDate: '15 Nov 2026', status: 'In Progress', priority: 'High' },
    { id: 'ai2', task: 'Swimming Pool Filter Sand Replacement', assignee: 'Facility Manager', dueDate: '18 Nov 2026', status: 'Open', priority: 'Medium' },
    { id: 'ai3', task: 'Boom Barrier RFID Sensor Calibration', assignee: 'Security Chief', dueDate: '10 Nov 2026', status: 'Completed', priority: 'High' },
    { id: 'ai4', task: 'Common Area LED Sensor Upgrades (Wing A & B)', assignee: 'Electrical Team', dueDate: '22 Nov 2026', status: 'In Progress', priority: 'Low' },
  ];
  const [itemsList, setItemsList] = useState<ActionItemRecord[]>(committeeActionItems);

  const handleToggleActionStatus = (id: string) => {
    setItemsList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const next = item.status === 'Completed' ? 'In Progress' : 'Completed';
          addToast('Action Item Updated', `Status changed to ${next}.`, 'success');
          return { ...item, status: next };
        }
        return item;
      })
    );
  };

  const handleAddActionItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionTask.trim()) return;
    const item = {
      id: 'ai_' + Date.now(),
      task: newActionTask.trim(),
      assignee: newActionAssignee.trim() || 'Committee',
      dueDate: '25 Nov 2026',
      status: 'Open' as const,
      priority: newActionPriority,
    };
    setItemsList((prev) => [item, ...prev]);
    addToast('Action Item Added', `"${item.task}" recorded for Managing Committee.`, 'success');
    setNewActionTask('');
  };

  const societyVitals = [
    { label: 'Overhead Water Tank', value: '84%', sub: '28,000 / 33,000 Litres', status: 'Good' },
    { label: 'DG Generator Diesel', value: '92%', sub: '28 hrs backup fuel', status: 'Optimal' },
    { label: 'Security Gate Inflow', value: '142', sub: 'Visitors logged today', status: 'Active' },
    { label: 'Staff Attendance', value: '18/19', sub: 'Security & Housekeeping', status: 'Normal' },
  ];

  // Local On-demand Services & Marketplace
  const [localServicesModal, setLocalServicesModal] = useState(false);
  const localServicesList = [
    { id: 'ls1', name: 'Deep Home Cleaning', provider: 'UrbanShine Co.', rating: 4.8, price: '₹1,299', icon: '✨', time: 'Within 2 hrs' },
    { id: 'ls2', name: 'Pest Control & Anti-Termite', provider: 'PestFree Services', rating: 4.9, price: '₹899', icon: '🛡️', time: 'Tomorrow 10 AM' },
    { id: 'ls3', name: 'Car Wash at Doorstep', provider: 'SpeedyWash Express', rating: 4.7, price: '₹399', icon: '🚗', time: 'Daily 07:00 AM' },
    { id: 'ls4', name: 'Appliance Repair & AC Care', provider: 'CoolBreeze Tech', rating: 4.8, price: '₹699', icon: '❄️', time: 'Today 03:00 PM' },
    { id: 'ls5', name: 'Fresh Organic Milk & Bread', provider: 'FarmToFlat Dairy', rating: 4.9, price: 'Daily Sub', icon: '🥛', time: 'Every morning 06:00 AM' },
  ];

  const handleBookLocalService = (serviceName: string, price: string) => {
    addToast(
      'Service Booked',
      `Booking request for ${serviceName} (${price}) dispatched to vendor. They will arrive at Flat ${currentUser.unit}.`,
      'success'
    );
  };

  // School Bus Tracker Modal
  const [schoolBusModal, setSchoolBusModal] = useState(false);

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
    const photoSuffix = complaintPhotoAttached ? ' [Photo Evidence Attached: issue_snap.jpg]' : '';
    const res = await SocietyApi.services.createServiceRequest({
      deskType: deskModal,
      category: ticketCategory,
      title: ticketTitle.trim(),
      description: (ticketDesc.trim() || `${deskModal} request submitted by ${currentUser.name} (${currentUser.unit})`) + photoSuffix,
    });
    setSubmittingTicket(false);
    if (res.error) {
      addToast('Failed to Submit', res.error.message, 'error');
      return;
    }
    addToast(
      `${deskModal} Ticket Saved`,
      `"${ticketTitle.trim()}" stored in phpMyAdmin (service_requests)${complaintPhotoAttached ? ' with photo evidence' : ''}.`,
      'success'
    );
    setTicketTitle('');
    setTicketDesc('');
    setComplaintPhotoAttached(false);
    setDeskModal(null);
    await loadServicesFromDb();
    void refreshData();
  };

  return (
    <div className="space-y-6 pt-2 pb-6 bg-white">
      {/* 1. QUICK ACTIONS GRID (4 Duo-Tone Icons: Gate, Facilities, Requests, Explore) */}
      <section className="px-2 pt-1">
        <div className="grid grid-cols-4 gap-2 text-center">
          {/* Gate */}
          <button
            type="button"
            onClick={() => onNavigate('resident_visitors')}
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div className="relative w-12 h-12 rounded-2xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center group-active:scale-95 transition-transform shadow-2xs">
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
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center group-active:scale-95 transition-transform shadow-2xs">
              <Building className="w-6 h-6 stroke-[1.9]" />
            </div>
            <span className="text-xs font-bold text-[#0E2628]">Facilities</span>
          </button>

          {/* Requests */}
          <button
            type="button"
            onClick={() => setDeskModal('Helpdesk')}
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div className="relative w-12 h-12 rounded-2xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center group-active:scale-95 transition-transform shadow-2xs">
              <Headset className="w-6 h-6 stroke-[1.9]" />
              {serviceRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#0D5C63] text-white text-[9px] font-bold flex items-center justify-center">
                  {serviceRequests.length}
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-[#0E2628]">Requests</span>
          </button>

          {/* Explore */}
          <button
            type="button"
            onClick={() => setExploreAllOpen(true)}
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#073B3E] text-white flex items-center justify-center shadow-sm group-active:scale-95 transition-transform">
              <MoreHorizontal className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-[#0E2628]">Explore</span>
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
                  className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                  title="Deny"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => approveVisitor(vis.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#0D5C63] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Approve
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* 2. COMMUNITY CORNER (Matching ANACITY Image 1) */}
      <section className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[15px] font-bold text-[#0E2628]">Community corner</h2>
          <button
            type="button"
            onClick={() => setForumModal(true)}
            className="text-xs font-medium text-slate-500 hover:text-[#0D5C63] cursor-pointer"
          >
            View all
          </button>
        </div>

        {/* Card matching ANACITY Screenshot */}
        <div
          onClick={() => setForumModal(true)}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm cursor-pointer hover:border-[#0D5C63]/50 transition-all active:scale-[0.99]"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center flex-shrink-0 font-bold text-sm">
              <Building2 className="w-5 h-5 text-[#0D5C63]" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-[#0E2628] leading-tight">
                ANACITY to the rescue
              </h4>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Members • 02 Aug 2026
              </p>
              <p className="text-xs text-[#0D5C63] font-medium mt-1 leading-snug line-clamp-2">
                &ldquo;ANACITY: Empowering smart living, digital gate security, and instant community connect.&rdquo;
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
          </div>
        </div>
      </section>

      {/* 3. BILLS & PAYMENTS (Matching ANACITY Screenshot Image 2) */}
      <section className="rounded-3xl bg-[#FAF6F0] p-4 space-y-3.5 -mx-1">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-[#0E2628]">Bills &amp; payments</h2>
          <button
            type="button"
            onClick={() => setBillingSheet('statement')}
            className="text-xs font-medium text-slate-500 hover:text-[#0D5C63] cursor-pointer"
          >
            View all
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Dues */}
          <button
            type="button"
            onClick={() => setBillingSheet('dues')}
            className="aspect-square rounded-2xl bg-white shadow-2xs border border-slate-100 p-4 flex flex-col items-start justify-between active:scale-95 transition-transform relative cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-10 h-10 rounded-xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              {!duesPaid && (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              )}
            </div>
            <div>
              <span className="text-xs font-bold text-[#0E2628] block">Dues</span>
              <p className="text-[11px] font-semibold text-[#0D5C63] mt-0.5">
                {duesPaid ? 'All Paid' : `₹${totalUnpaidAmount.toLocaleString('en-IN')}`}
              </p>
            </div>
          </button>

          {/* Payment history */}
          <button
            type="button"
            onClick={() => setBillingSheet('history')}
            className="aspect-square rounded-2xl bg-white shadow-2xs border border-slate-100 p-4 flex flex-col items-start justify-between active:scale-95 transition-transform cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#0E2628] block">Payment history</span>
              <p className="text-[11px] text-slate-500 mt-0.5">View receipts</p>
            </div>
          </button>
        </div>
      </section>

      {/* 4. BRAND BADGE: Managed by Smart Living (Exact match to ANACITY Image 2) */}
      <section className="pt-1">
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-[#E6F3F3]/50 border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#073B3E] text-emerald-300 flex items-center justify-center shadow-xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Managed by
            </p>
            <h3 className="text-sm font-serif font-bold text-[#073B3E] tracking-tight">
              Smart Living
            </h3>
            <p className="text-[9px] uppercase tracking-widest text-[#0D5C63] font-semibold">
              Crafting Better Experiences
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          EXPLORE ALL BOTTOM SHEET (Full ANACITY 4-Category Suite)
         ========================================================================= */}
      {exploreAllOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-[1px]">
          <div className="w-full bg-white rounded-t-[28px] shadow-2xl pt-3 pb-7 px-5 space-y-5 max-h-[86vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div
              onClick={() => setExploreAllOpen(false)}
              className="w-10 h-1 rounded-full bg-slate-400 mx-auto cursor-pointer"
            />

            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-[#0E2628]">All ANACITY Services</h3>
                <p className="text-[11px] text-slate-500">Apnaa Smart Community Suite</p>
              </div>
              <button
                type="button"
                onClick={() => setExploreAllOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Gate & Mobility */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D5C63]">
                Gate & Mobility
              </h4>
              <div className="grid grid-cols-3 gap-y-4 gap-x-2 text-center">
                {/* Cab Entry */}
                <button
                  type="button"
                  onClick={() => {
                    setExploreAllOpen(false);
                    void SocietyApi.services
                      .createGateUpdate('Cab', `Cab pre-approved by ${currentUser.name} (Flat ${currentUser.unit})`)
                      .then((res) => {
                        if (res.data) {
                          addToast('Cab Pass Generated', `Pass ${res.data.passCode} sent to security gate.`, 'success');
                          void loadServicesFromDb();
                        }
                      });
                    onNavigate('resident_visitors');
                  }}
                  className="flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center group-active:scale-95 transition-transform shadow-2xs">
                    <Car className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#0E2628]">Cab Pass</span>
                </button>

                {/* Exit Pass */}
                <button
                  type="button"
                  onClick={() => {
                    setExploreAllOpen(false);
                    void SocietyApi.services
                      .createGateUpdate('Exit pass', `Gate Exit Pass generated by ${currentUser.name} (Flat ${currentUser.unit})`)
                      .then((res) => {
                        if (res.data) {
                          addToast('Exit Pass Generated', `Pass ${res.data.passCode} ready for boom barrier exit.`, 'success');
                          void loadServicesFromDb();
                        }
                      });
                    onNavigate('resident_visitors');
                  }}
                  className="flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center group-active:scale-95 transition-transform shadow-2xs">
                    <TicketCheck className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#0E2628]">Exit Pass</span>
                </button>

                {/* School Bus Tracker */}
                <button
                  type="button"
                  onClick={() => {
                    setExploreAllOpen(false);
                    setSchoolBusModal(true);
                  }}
                  className="flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center group-active:scale-95 transition-transform shadow-2xs">
                    <Bus className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#0E2628]">School Bus</span>
                </button>

                {/* Domestic Staff Pass */}
                <button
                  type="button"
                  onClick={() => {
                    setExploreAllOpen(false);
                    setDomesticHelpModal(true);
                  }}
                  className="flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center group-active:scale-95 transition-transform shadow-2xs">
                    <UserCheck className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#0E2628]">Domestic Help</span>
                </button>

                {/* Vehicle Security Lock */}
                <button
                  type="button"
                  onClick={() => {
                    setExploreAllOpen(false);
                    setVehicleModal(true);
                  }}
                  className="flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center group-active:scale-95 transition-transform shadow-2xs">
                    <Lock className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#0E2628]">Lock Vehicle</span>
                </button>

                {/* Digital Resident QR */}
                <button
                  type="button"
                  onClick={() => {
                    setExploreAllOpen(false);
                    setQrPassOpen(true);
                  }}
                  className="flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center group-active:scale-95 transition-transform shadow-2xs">
                    <QrCode className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#0E2628]">Resident QR</span>
                </button>
              </div>
            </div>

            {/* 2. Facilities & Maintenance */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D5C63]">
                Facilities & Maintenance
              </h4>
              <div className="grid grid-cols-3 gap-y-4 gap-x-2 text-center">
                {/* Book Facilities */}
                <button
                  type="button"
                  onClick={() => {
                    setExploreAllOpen(false);
                    onNavigate('resident_amenities');
                  }}
                  className="flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center group-active:scale-95 transition-transform shadow-2xs">
                    <Building className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#0E2628]">Book Facility</span>
                </button>

                {/* Scan Facility QR */}
                <button
                  type="button"
                  onClick={() => {
                    setExploreAllOpen(false);
                    setFacilityQrModal(true);
                  }}
                  className="flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#0D5C63] text-white flex items-center justify-center group-active:scale-95 transition-transform shadow-2xs">
                    <QrCode className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-bold text-[#0D5C63]">Scan QR Defect</span>
                </button>

                {/* Service Desk */}
                <button
                  type="button"
                  onClick={() => {
                    setExploreAllOpen(false);
                    setDeskModal('Service Desk');
                  }}
                  className="flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center group-active:scale-95 transition-transform shadow-2xs">
                    <Wrench className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#0E2628]">Service Desk</span>
                </button>

                {/* Request Desk */}
                <button
                  type="button"
                  onClick={() => {
                    setExploreAllOpen(false);
                    setDeskModal('Request Desk');
                  }}
                  className="flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center group-active:scale-95 transition-transform shadow-2xs">
                    <HelpCircle className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#0E2628]">Request Desk</span>
                </button>

                {/* Digital Utility Meters */}
                <button
                  type="button"
                  onClick={() => {
                    setExploreAllOpen(false);
                    setUtilityModal(true);
                  }}
                  className="flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center group-active:scale-95 transition-transform shadow-2xs">
                    <Zap className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#0E2628]">Utility Meters</span>
                </button>

                {/* Staff Directory */}
                <button
                  type="button"
                  onClick={() => {
                    setExploreAllOpen(false);
                    onNavigate('resident_directory');
                  }}
                  className="flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center group-active:scale-95 transition-transform shadow-2xs">
                    <Headset className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#0E2628]">Staff Directory</span>
                </button>
              </div>
            </div>

            {/* 3. Community & Social */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D5C63]">
                Community & Social
              </h4>
              <div className="grid grid-cols-3 gap-y-4 gap-x-2 text-center">
                {/* Owners Forum */}
                <button
                  type="button"
                  onClick={() => {
                    setExploreAllOpen(false);
                    setForumTab('discussions');
                    setForumModal(true);
                  }}
                  className="flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center group-active:scale-95 transition-transform shadow-2xs">
                    <MessageSquarePlus className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#0E2628]">Owners Forum</span>
                </button>

                {/* Interest Groups */}
                <button
                  type="button"
                  onClick={() => {
                    setExploreAllOpen(false);
                    setForumTab('groups');
                    setForumModal(true);
                  }}
                  className="flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center group-active:scale-95 transition-transform shadow-2xs">
                    <Users className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#0E2628]">Interest Groups</span>
                </button>

                {/* Local Services */}
                <button
                  type="button"
                  onClick={() => {
                    setExploreAllOpen(false);
                    setLocalServicesModal(true);
                  }}
                  className="flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center group-active:scale-95 transition-transform shadow-2xs">
                    <ShoppingBag className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#0E2628]">Local Services</span>
                </button>

                {/* Notices */}
                <button
                  type="button"
                  onClick={() => {
                    setExploreAllOpen(false);
                    onNavigate('resident_notices');
                  }}
                  className="flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center group-active:scale-95 transition-transform shadow-2xs">
                    <FileText className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#0E2628]">Notices</span>
                </button>

                {/* Polls & Surveys */}
                <button
                  type="button"
                  onClick={() => {
                    setExploreAllOpen(false);
                    onNavigate('resident_poll');
                  }}
                  className="flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center group-active:scale-95 transition-transform shadow-2xs">
                    <BarChart2 className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#0E2628]">Polls & Survey</span>
                </button>

                {/* Gallery */}
                <button
                  type="button"
                  onClick={() => {
                    setExploreAllOpen(false);
                    onNavigate('resident_gallery');
                  }}
                  className="flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center group-active:scale-95 transition-transform shadow-2xs">
                    <ImageIcon className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#0E2628]">Gallery</span>
                </button>
              </div>
            </div>

            {/* 4. Governance & Financials */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D5C63]">
                Governance & Financials
              </h4>
              <div className="grid grid-cols-3 gap-y-4 gap-x-2 text-center">
                {/* Action Items */}
                <button
                  type="button"
                  onClick={() => {
                    setExploreAllOpen(false);
                    setActionTab('items');
                    setActionItemsModal(true);
                  }}
                  className="flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center group-active:scale-95 transition-transform shadow-2xs">
                    <ClipboardCheck className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#0E2628]">Action Items</span>
                </button>

                {/* Society Vitals */}
                <button
                  type="button"
                  onClick={() => {
                    setExploreAllOpen(false);
                    setActionTab('vitals');
                    setActionItemsModal(true);
                  }}
                  className="flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center group-active:scale-95 transition-transform shadow-2xs">
                    <ShieldCheck className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#0E2628]">Society Vitals</span>
                </button>

                {/* Dues & Bills */}
                <button
                  type="button"
                  onClick={() => {
                    setExploreAllOpen(false);
                    setBillingSheet('dues');
                  }}
                  className="flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center group-active:scale-95 transition-transform shadow-2xs">
                    <CreditCard className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#0E2628]">View Dues</span>
                </button>

                {/* Payment History */}
                <button
                  type="button"
                  onClick={() => {
                    setExploreAllOpen(false);
                    setBillingSheet('history');
                  }}
                  className="flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#E6F3F3] text-[#0D5C63] flex items-center justify-center group-active:scale-95 transition-transform shadow-2xs">
                    <History className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#0E2628]">History & Receipts</span>
                </button>
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
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Photo Evidence (ANACITY Helpdesk)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const next = !complaintPhotoAttached;
                    setComplaintPhotoAttached(next);
                    addToast(
                      next ? 'Photo Evidence Attached' : 'Photo Removed',
                      next ? 'Captured issue_snapshot.jpg attached to ticket.' : 'Photo attachment cleared.',
                      next ? 'success' : 'info'
                    );
                  }}
                  className={`w-full py-2 px-3 rounded-xl border border-dashed flex items-center justify-center gap-2 text-xs transition-colors ${
                    complaintPhotoAttached
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
                      : 'border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Camera className="w-4 h-4 text-[#0D5C63]" />
                  <span>
                    {complaintPhotoAttached
                      ? '✓ Evidence attached: complaint_pic.jpg (Tap to remove)'
                      : 'Tap to capture / attach photo of the issue'}
                  </span>
                </button>
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
                className="py-2.5 rounded-full bg-[#0D5C63] text-white text-xs font-bold shadow-xs active:scale-98"
              >
                {submittingTicket ? 'Saving…' : 'Submit Ticket'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* QR Code Scanner / Resident Gate Pass Modal */}
      {qrPassOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-[1px]">
          <div className="w-full bg-white rounded-t-[28px] p-5 text-center space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 rounded-full bg-slate-300 mx-auto" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase bg-[#E6F3F3] text-[#0D5C63] px-2.5 py-1 rounded-full">
                Resident Digital ID
              </span>
              <button onClick={() => setQrPassOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
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
              className="w-full py-2.5 rounded-full bg-[#0D5C63] text-white text-xs font-bold shadow-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 1. Vehicle Security Modal: Lock & Unlock from app */}
      {vehicleModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-[1px]">
          <div className="w-full bg-white rounded-t-[28px] p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 rounded-full bg-slate-300 mx-auto" />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0E2628] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#0D5C63]" />
                  <span>Vehicle Security & Gate Control</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Flat {currentUser.unit} • Lock vehicles to prevent unauthorized gate exits
                </p>
              </div>
              <button onClick={() => setVehicleModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {vehicles.map((v) => (
                <div
                  key={v.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    v.locked
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          v.locked ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        <Car className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 text-xs">{v.number}</span>
                          <span
                            className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                              v.locked ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {v.locked ? 'LOCKED' : 'UNLOCKED'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {v.model} • Slot: {v.parkSlot}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleVehicleLock(v.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 ${
                        v.locked
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'bg-[#0D5C63] hover:bg-[#073B3E] text-white'
                      }`}
                    >
                      {v.locked ? (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Unlock Exit</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Lock Vehicle</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-200/60 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-[#0D5C63]" />
                    {v.locked
                      ? 'Exit Gate barrier will stay LOCKED if this vehicle attempts to leave.'
                      : 'Free gate exit permitted. Lock vehicle when parked for extended hours.'}
                  </p>
                </div>
              ))}
            </div>

            {/* Add New Vehicle Form */}
            <form onSubmit={handleAddVehicle} className="p-3.5 rounded-2xl bg-[#E6F3F3]/60 border border-[#0D5C63]/20 space-y-2.5">
              <p className="text-[11px] font-bold text-[#073B3E] uppercase tracking-wide">Register Another Vehicle</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Plate (e.g. MH-12-EF-9090)"
                  value={newVehPlate}
                  onChange={(e) => setNewVehPlate(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                />
                <input
                  type="text"
                  placeholder="Model (e.g. Creta - Silver)"
                  value={newVehModel}
                  onChange={(e) => setNewVehModel(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Slot (e.g. P-208)"
                  value={newVehSlot}
                  onChange={(e) => setNewVehSlot(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                />
                <select
                  value={newVehType}
                  onChange={(e) => setNewVehType(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                >
                  <option>Car (4W)</option>
                  <option>Two-Wheeler (2W)</option>
                  <option>EV Car</option>
                  <option>EV Bike</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-[#0D5C63] text-white text-xs font-bold shadow-xs active:scale-98"
              >
                + Register Vehicle to Flat {currentUser.unit}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Domestic Help Gate Pass & Attendance */}
      {domesticHelpModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-[1px]">
          <div className="w-full bg-white rounded-t-[28px] p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 rounded-full bg-slate-300 mx-auto" />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0E2628] flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-[#0D5C63]" />
                  <span>Domestic Help & Staff Attendance</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Flat {currentUser.unit} • Issue Gate Passes & Receive In/Out Alerts
                </p>
              </div>
              <button onClick={() => setDomesticHelpModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Existing Daily Help List */}
            <div className="space-y-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Registered Staff ({domesticStaff.length})
              </p>
              {domesticStaff.map((staff) => (
                <div key={staff.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{staff.name}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        staff.status === 'Inside Campus'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {staff.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {staff.role} • {staff.phone}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-[10px] bg-[#E6F3F3] text-[#0D5C63] px-2 py-0.5 rounded-md font-bold">
                        {staff.passCode}
                      </span>
                      <span className="text-[10px] text-slate-400">{staff.time}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => addToast('Alert Sent', `Sent reminder pass to ${staff.name}`, 'info')}
                      className="px-2.5 py-1 rounded-lg bg-[#0D5C63]/10 text-[#0D5C63] font-bold hover:bg-[#0D5C63]/20"
                    >
                      Share Pass
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Issue Gate Pass Form */}
            <form onSubmit={handleIssueStaffPass} className="p-3.5 rounded-2xl bg-[#E6F3F3]/60 border border-[#0D5C63]/20 space-y-2.5">
              <p className="text-[11px] font-bold text-[#073B3E] uppercase tracking-wide">
                Issue Gate Pass to Domestic Help
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  required
                  placeholder="Staff Name (e.g. Anita Devi)"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                />
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                >
                  <option>Housekeeping / Maid</option>
                  <option>Cook</option>
                  <option>Driver</option>
                  <option>Nanny / Caretaker</option>
                  <option>Car Cleaner</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-[#0D5C63] text-white text-xs font-bold shadow-xs active:scale-98"
              >
                + Issue Gate Pass & Notify Security
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Facility QR Code Scanner & Malfunction Complaints (Unique to ANACITY) */}
      {facilityQrModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-[1px]">
          <div className="w-full bg-white rounded-t-[28px] p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 rounded-full bg-slate-300 mx-auto" />
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  ANACITY Exclusive
                </span>
                <h3 className="text-sm font-bold text-[#0E2628] mt-1">
                  Scan Facility QR & Report Malfunction
                </h3>
                <p className="text-[11px] text-slate-500">
                  Scan QR affixed on tennis court, gym equipment, or lift to report defect
                </p>
              </div>
              <button onClick={() => setFacilityQrModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* QR Viewfinder Simulation */}
            <div className="relative rounded-2xl bg-slate-900 overflow-hidden p-6 text-center text-white flex flex-col items-center justify-center min-h-[160px]">
              <div className="w-32 h-32 border-2 border-emerald-400 rounded-xl relative flex items-center justify-center">
                <div className="absolute inset-0 bg-emerald-500/10 animate-pulse" />
                <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_8px_#34d399] animate-bounce" />
                <QrCode className="w-12 h-12 text-white/40" />
              </div>
              <p className="text-[10px] text-slate-300 mt-3 font-mono">
                {scannedFacility ? `Target Locked: ${scannedFacility}` : 'Point camera at Facility Equipment QR code'}
              </p>
            </div>

            {/* Amenity QR Presets to Simulate Scanning */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Simulate QR Scan On Amenity
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {sampleFacilities.map((fac) => (
                  <button
                    key={fac.code}
                    type="button"
                    onClick={() => {
                      setScannedFacility(`${fac.name} (${fac.code})`);
                      addToast('QR Scanned', `Detected ${fac.name}`, 'info');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-colors ${
                      scannedFacility?.includes(fac.code)
                        ? 'border-[#0D5C63] bg-[#E6F3F3] text-[#073B3E] font-bold'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <p className="font-bold text-[11px] truncate">{fac.name}</p>
                    <p className="text-[9px] text-slate-500">{fac.code} • {fac.location}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Malfunction Complaint Form */}
            {scannedFacility && (
              <form onSubmit={handleFacilityComplaintSubmit} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Malfunction Description *
                  </label>
                  <input
                    type="text"
                    required
                    value={facilityIssueTitle}
                    onChange={(e) => setFacilityIssueTitle(e.target.value)}
                    placeholder="e.g. Floodlight fixture broken, safety belt torn"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setFacilityIssuePhoto(!facilityIssuePhoto);
                      addToast(!facilityIssuePhoto ? 'Photo Attached' : 'Photo Cleared', 'Evidence snapshot attached.', 'info');
                    }}
                    className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold ${
                      facilityIssuePhoto
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{facilityIssuePhoto ? 'Photo Attached (1)' : 'Attach Photo'}</span>
                  </button>
                  <span className="text-[10px] text-slate-400">Direct Alert to Facility Manager</span>
                </div>

                <button
                  type="submit"
                  disabled={facilitySubmitting}
                  className="w-full py-2.5 rounded-xl bg-[#0D5C63] text-white text-xs font-bold shadow-xs active:scale-98"
                >
                  {facilitySubmitting ? 'Dispatching Complaint…' : 'Submit Facility Malfunction Ticket'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 4. Digital Utility Readings: Water, Reticulated Gas, Energy Meters */}
      {utilityModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-[1px]">
          <div className="w-full bg-white rounded-t-[28px] p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 rounded-full bg-slate-300 mx-auto" />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0E2628] flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-[#0D5C63]" />
                  <span>Digital Utility Meter Readings</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Flat {currentUser.unit} • Recorded digitally by automated sensors & maintenance staff
                </p>
              </div>
              <button onClick={() => setUtilityModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {/* Water Meter */}
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center">
                    <Droplet className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-sky-700 tracking-wider">Water Meter</span>
                    <p className="text-lg font-bold text-slate-900">{readingsState.water.reading} {readingsState.water.unit}</p>
                    <p className="text-[10px] text-slate-500">Last Billed: {readingsState.water.lastBilled} {readingsState.water.unit} • {readingsState.water.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold bg-sky-200 text-sky-800 px-2 py-0.5 rounded-full">
                    +{Number((readingsState.water.reading - readingsState.water.lastBilled).toFixed(1))} {readingsState.water.unit}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">{readingsState.water.status}</p>
                </div>
              </div>

              {/* Reticulated Gas */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-amber-700 tracking-wider">Reticulated Gas Meter</span>
                    <p className="text-lg font-bold text-slate-900">{readingsState.gas.reading} {readingsState.gas.unit}</p>
                    <p className="text-[10px] text-slate-500">Last Billed: {readingsState.gas.lastBilled} {readingsState.gas.unit} • {readingsState.gas.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
                    +{Number((readingsState.gas.reading - readingsState.gas.lastBilled).toFixed(1))} {readingsState.gas.unit}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">{readingsState.gas.status}</p>
                </div>
              </div>

              {/* Electricity */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider">Electricity Meter</span>
                    <p className="text-lg font-bold text-slate-900">{readingsState.electricity.reading} {readingsState.electricity.unit}</p>
                    <p className="text-[10px] text-slate-500">Last Billed: {readingsState.electricity.lastBilled} {readingsState.electricity.unit} • {readingsState.electricity.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">
                    +{readingsState.electricity.reading - readingsState.electricity.lastBilled} {readingsState.electricity.unit}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">{readingsState.electricity.status}</p>
                </div>
              </div>
            </div>

            {/* Record Reading Form for Staff / Resident */}
            <form onSubmit={handleRecordReading} className="p-3.5 rounded-2xl bg-[#E6F3F3]/60 border border-[#0D5C63]/20 space-y-2 text-xs">
              <p className="text-[11px] font-bold text-[#073B3E] uppercase tracking-wide">
                Staff / Resident Digital Reading Entry
              </p>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={meterInputType}
                  onChange={(e) => setMeterInputType(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="water">Water Meter (KL)</option>
                  <option value="gas">Reticulated Gas (SCM)</option>
                  <option value="electricity">Electricity (kWh)</option>
                </select>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="New Meter Reading"
                  value={meterInputValue}
                  onChange={(e) => setMeterInputValue(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-[#0D5C63] text-white text-xs font-bold shadow-xs active:scale-98"
              >
                Log Digital Reading
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. Discussion Forums & Interest Groups (Eliminates email clutter) */}
      {forumModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-[1px]">
          <div className="w-full bg-white rounded-t-[28px] p-5 space-y-4 max-h-[86vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 rounded-full bg-slate-300 mx-auto" />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0E2628]">Community Discussions & Groups</h3>
                <p className="text-[11px] text-slate-500">Connect with neighbors & eliminate email clutter</p>
              </div>
              <button onClick={() => setForumModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab switch: Discussions vs Interest Groups */}
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setForumTab('discussions')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  forumTab === 'discussions' ? 'bg-white text-[#0D5C63] shadow-xs' : 'text-slate-600'
                }`}
              >
                Owners Forum ({forumThreads.length})
              </button>
              <button
                type="button"
                onClick={() => setForumTab('groups')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  forumTab === 'groups' ? 'bg-white text-[#0D5C63] shadow-xs' : 'text-slate-600'
                }`}
              >
                Interest Groups ({interestGroups.length})
              </button>
            </div>

            {forumTab === 'discussions' ? (
              <div className="space-y-3">
                {/* Create Thread Form */}
                <form onSubmit={handleCreateThread} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <p className="text-[11px] font-bold text-[#0D5C63] uppercase tracking-wide">
                    Start a New Owners Discussion
                  </p>
                  <input
                    type="text"
                    required
                    placeholder="Discussion Topic / Agenda"
                    value={newThreadTitle}
                    onChange={(e) => setNewThreadTitle(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                  />
                  <textarea
                    rows={2}
                    required
                    placeholder="Provide details or proposal..."
                    value={newThreadBody}
                    onChange={(e) => setNewThreadBody(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                  />
                  <button
                    type="submit"
                    className="w-full py-1.5 rounded-lg bg-[#0D5C63] text-white text-xs font-bold shadow-xs active:scale-98"
                  >
                    Post to Owners Forum
                  </button>
                </form>

                {/* Forum Thread Cards */}
                {forumThreads.map((thread) => (
                  <div key={thread.id} className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5 text-xs shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-[#E6F3F3] text-[#0D5C63] px-2 py-0.5 rounded-full">
                        {thread.category}
                      </span>
                      <span className="text-[10px] text-slate-400">{thread.date}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 leading-snug">{thread.title}</h4>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{thread.preview}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                      <span>By {thread.author}</span>
                      <button
                        type="button"
                        onClick={() => addToast('Comment Recorded', `You replied to "${thread.title}".`, 'success')}
                        className="font-bold text-[#0D5C63] flex items-center gap-1 hover:underline"
                      >
                        <MessageSquarePlus className="w-3 h-3" />
                        <span>{thread.replies} replies • Reply</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2.5">
                {interestGroups.map((group) => {
                  const isJoined = joinedGroups.includes(group.name);
                  return (
                    <div key={group.name} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{group.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{group.name}</span>
                            <span className="text-[10px] text-slate-500 font-medium">({group.members} members)</span>
                          </div>
                          <p className="text-[11px] text-slate-500">{group.desc}</p>
                          <p className="text-[9px] text-[#0D5C63] font-semibold mt-0.5">Active {group.lastActive}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleJoinGroup(group.name)}
                        className={`px-3 py-1.5 rounded-full font-bold text-xs flex-shrink-0 transition-transform active:scale-95 ${
                          isJoined
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-[#0D5C63] text-white shadow-2xs'
                        }`}
                      >
                        {isJoined ? 'Joined ✓' : 'Join Club'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Managing Committee Action Items & Society Key Vitals */}
      {actionItemsModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-[1px]">
          <div className="w-full bg-white rounded-t-[28px] p-5 space-y-4 max-h-[86vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 rounded-full bg-slate-300 mx-auto" />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0E2628]">Committee Governance & Society Vitals</h3>
                <p className="text-[11px] text-slate-500">Track actionable decisions & live campus infrastructure</p>
              </div>
              <button onClick={() => setActionItemsModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab switch: Action Items vs Vitals */}
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActionTab('items')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  actionTab === 'items' ? 'bg-white text-[#0D5C63] shadow-xs' : 'text-slate-600'
                }`}
              >
                Action Items ({itemsList.length})
              </button>
              <button
                type="button"
                onClick={() => setActionTab('vitals')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  actionTab === 'vitals' ? 'bg-white text-[#0D5C63] shadow-xs' : 'text-slate-600'
                }`}
              >
                Key Society Vitals
              </button>
            </div>

            {actionTab === 'items' ? (
              <div className="space-y-3 text-xs">
                {itemsList.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        item.priority === 'High'
                          ? 'bg-rose-100 text-rose-700'
                          : item.priority === 'Medium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {item.priority} Priority
                      </span>
                      <span className={`text-[10px] font-bold ${
                        item.status === 'Completed' ? 'text-emerald-700' : 'text-[#0D5C63]'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="font-bold text-slate-900">{item.task}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>Assignee: {item.assignee} • Due: {item.dueDate}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleActionStatus(item.id)}
                        className="font-bold text-[#0D5C63] hover:underline"
                      >
                        {item.status === 'Completed' ? 'Mark In Progress' : 'Mark Done ✓'}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add Action Item Form */}
                <form onSubmit={handleAddActionItem} className="p-3 rounded-2xl bg-[#E6F3F3]/60 border border-[#0D5C63]/20 space-y-2">
                  <p className="text-[11px] font-bold text-[#073B3E] uppercase tracking-wide">Add Committee Action Item</p>
                  <input
                    type="text"
                    required
                    placeholder="Task Title / Mandate"
                    value={newActionTask}
                    onChange={(e) => setNewActionTask(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Assignee (e.g. Facility Lead)"
                      value={newActionAssignee}
                      onChange={(e) => setNewActionAssignee(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                    <select
                      value={newActionPriority}
                      onChange={(e) => setNewActionPriority(e.target.value as any)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                    >
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full py-1.5 rounded-lg bg-[#0D5C63] text-white font-bold shadow-xs active:scale-98">
                    + Add Committee Item
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  {societyVitals.map((vit) => (
                    <div key={vit.label} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{vit.label}</span>
                      <p className="text-xl font-bold text-[#073B3E] mt-0.5">{vit.value}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{vit.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Emergency Broadcast Trigger */}
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                  <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Emergency Notification Broadcast</span>
                  </div>
                  <p className="text-[11px] text-rose-700">
                    Dispatches high-priority SMS and mobile alert sirens to all 240 flats in Apnaa Society.
                  </p>
                  <button
                    type="button"
                    onClick={() => addToast('Emergency Alert Dispatched', 'Broadcast siren & SMS sent to all 240 flats.', 'error')}
                    className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs active:scale-98"
                  >
                    Broadcast Emergency Alert to All Residents
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. Local On-demand Services */}
      {localServicesModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-[1px]">
          <div className="w-full bg-white rounded-t-[28px] p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 rounded-full bg-slate-300 mx-auto" />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0E2628] flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-[#0D5C63]" />
                  <span>Local Services & Doorstep Care</span>
                </h3>
                <p className="text-[11px] text-slate-500">Verified doorstep vendors curated for Apnaa Society</p>
              </div>
              <button onClick={() => setLocalServicesModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {localServicesList.map((service) => (
                <div key={service.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{service.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{service.name}</span>
                        <span className="text-[10px] text-amber-600 font-bold">★ {service.rating}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{service.provider} • {service.time}</p>
                      <p className="text-[11px] font-bold text-[#0D5C63] mt-0.5">{service.price}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleBookLocalService(service.name, service.price)}
                    className="px-3 py-1.5 rounded-full bg-[#0D5C63] hover:bg-[#073B3E] text-white text-xs font-bold shadow-xs active:scale-95"
                  >
                    Book Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 8. School Bus Live Tracker & Arrival Alerts */}
      {schoolBusModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-[1px]">
          <div className="w-full bg-white rounded-t-[28px] p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 rounded-full bg-slate-300 mx-auto" />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0E2628] flex items-center gap-1.5">
                  <Bus className="w-4 h-4 text-[#0D5C63]" />
                  <span>School Bus Pickup & Drop Tracker</span>
                </h3>
                <p className="text-[11px] text-slate-500">Live arrival alerts & driver gate pass for child safety</p>
              </div>
              <button onClick={() => setSchoolBusModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                  Live Status: In Transit
                </span>
                <span className="text-xs font-bold text-amber-900">Arriving in 6 mins</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Route 12 - DPS / Ryan International</h4>
              <p className="text-xs text-slate-600">
                Vehicle: <strong className="font-mono text-slate-800">Bus #14 (MH-12-EQ-8812)</strong>
              </p>
              <p className="text-xs text-slate-600">
                Driver: <strong>Suresh Patil</strong> (+91 98221 44556)
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <button
                type="button"
                onClick={() => addToast('Bus Gate Pass Sent', 'Pre-cleared entry pass issued to Gate 1 security.', 'success')}
                className="w-full py-2.5 rounded-xl bg-[#0D5C63] text-white font-bold shadow-xs active:scale-98"
              >
                Pre-Authorize School Bus at Society Gate
              </button>
              <button
                type="button"
                onClick={() => addToast('Child Drop Alert Subscribed', 'You will receive immediate alert when child is dropped off.', 'info')}
                className="w-full py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
              >
                🔔 Notify Me on Child Boarding / Drop-off
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
