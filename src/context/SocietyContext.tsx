'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { SocietyApi, type ApiResult, type PublicOverviewData } from '@/lib/api';
import {
  User,
  UserRole,
  Visitor,
  Amenity,
  Booking,
  Notice,
  SocietyEvent,
  Member,
  Album,
  NotificationItem,
  SecurityLog,
  FacilityCheckIn,
  AuditLog,
  RSVPStatus,
  SocietyInfo,
} from '@/types';
import {
  INITIAL_USERS,
  INITIAL_AMENITIES,
  INITIAL_VISITORS,
  INITIAL_BOOKINGS,
  INITIAL_NOTICES,
  INITIAL_EVENTS,
  INITIAL_MEMBERS,
  INITIAL_ALBUMS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SECURITY_LOGS,
  INITIAL_FACILITY_CHECKINS,
  INITIAL_AUDIT_LOGS,
} from '@/lib/mock-data';

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface SocietyContextType {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: User;
  authReady: boolean;
  isAuthenticated: boolean;
  loginWithPassword: (login: string, password: string) => Promise<{ success: boolean; message?: string }>;
  requestOtp: (mobile: string) => Promise<{ success: boolean; message?: string; devOtp?: string }>;
  verifyOtp: (mobile: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;

  // Society
  society: SocietyInfo;
  dbConnected: boolean;
  publicOverview: PublicOverviewData | null;
  refreshData: () => Promise<void>;
  
  // Visitors
  visitors: Visitor[];
  approveVisitor: (id: string) => void;
  denyVisitor: (id: string, reason?: string) => void;
  createVisitor: (visitorData: Partial<Visitor>) => Visitor;
  checkInVisitor: (idOrPassCode: string, gate?: string) => { success: boolean; message: string; visitor?: Visitor };
  checkOutVisitor: (idOrPassCode: string) => { success: boolean; message: string; visitor?: Visitor };
  
  // Amenities & Bookings
  amenities: Amenity[];
  bookings: Booking[];
  createBooking: (bookingData: Omit<Booking, 'id' | 'bookingReference' | 'status' | 'qrToken' | 'createdAt'>) => { success: boolean; message: string; booking?: Booking };
  cancelBooking: (id: string) => void;
  checkInFacilityBooking: (bookingRef: string) => { success: boolean; message: string; checkIn?: FacilityCheckIn };
  updateAmenity: (id: string, patch: Partial<Amenity>) => Promise<{ success: boolean; message: string }>;
  
  // Notices
  notices: Notice[];
  markNoticeRead: (id: string) => void;
  acknowledgeNotice: (id: string) => void;
  createNotice: (noticeData: Omit<Notice, 'id' | 'isRead' | 'isAcknowledged' | 'acknowledgedCount' | 'totalResidentsCount'>) => Notice;
  
  // Events
  events: SocietyEvent[];
  updateEventRSVP: (id: string, status: RSVPStatus) => void;
  createEvent: (eventData: Omit<SocietyEvent, 'id' | 'attendeesCount' | 'rsvpStatus'>) => SocietyEvent;
  
  // Members
  members: Member[];
  updateUserProfile: (profileData: Partial<User>) => void;
  createResident: (data: {
    name: string;
    email: string;
    phone: string;
    unit: string;
    wing: string;
    floor: string;
    role: 'resident' | 'admin' | 'security' | 'facility';
    membershipType: 'Owner' | 'Tenant' | 'Family Member';
    password?: string;
  }) => Promise<{ success: boolean; message: string; member?: Member }>;
  updateResident: (id: string, patch: Record<string, unknown>) => Promise<{ success: boolean; message: string }>;
  updateResidentAccess: (id: string, isActive: boolean) => Promise<{ success: boolean; message: string }>;
  removeResident: (id: string) => Promise<{ success: boolean; message: string }>;
  
  // Gallery
  albums: Album[];
  moderateMedia: (albumId: string, mediaId: string, action: 'approved' | 'rejected') => void;
  uploadMedia: (albumId: string, title: string, url: string) => void;
  
  // Notifications
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  
  // Logs & Audits
  securityLogs: SecurityLog[];
  facilityCheckIns: FacilityCheckIn[];
  auditLogs: AuditLog[];
  
  // Toasts
  toasts: ToastMessage[];
  addToast: (title: string, message?: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  
  // Demo Reset
  resetDemoData: () => void;
}

const SocietyContext = createContext<SocietyContextType | undefined>(undefined);

/** When the API is the source of truth, start empty instead of showing seed data. */
const API_MODE = SocietyApi.isApiMode();
const seed = <T,>(value: T, empty: T): T => (API_MODE ? empty : value);

const MOCK_SOCIETY: SocietyInfo = {
  id: 'soc_green_valley_01',
  name: 'Green Valley Residency',
  address: 'Green Valley Road, Powai, Mumbai 400076',
  totalHouseholds: 248,
  totalUnits: 180,
  activeResidents: INITIAL_MEMBERS.length,
  pendingApprovals: INITIAL_VISITORS.filter((v) => v.status === 'pending').length,
  activeClosures: INITIAL_AMENITIES.filter((a) => a.status !== 'available').length,
  nextMaintenanceDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  nextMaintenanceNote: 'Quarterly fire safety audit & lift servicing',
};

let toastSequence = 0;
function nextToastId(): string {
  toastSequence += 1;
  return `toast_${toastSequence}`;
}

export function SocietyProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setRoleState] = useState<UserRole>('resident');
  const [authReady, setAuthReady] = useState(!API_MODE);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dbConnected, setDbConnected] = useState(!API_MODE);
  const [publicOverview, setPublicOverview] = useState<PublicOverviewData | null>(null);
  const [users, setUsers] = useState<Record<string, User>>(INITIAL_USERS);
  const [society, setSociety] = useState<SocietyInfo>(seed(MOCK_SOCIETY, MOCK_SOCIETY));
  const [visitors, setVisitors] = useState<Visitor[]>(seed(INITIAL_VISITORS, []));
  const [amenities, setAmenities] = useState<Amenity[]>(seed(INITIAL_AMENITIES, []));
  const [bookings, setBookings] = useState<Booking[]>(seed(INITIAL_BOOKINGS, []));
  const [notices, setNotices] = useState<Notice[]>(seed(INITIAL_NOTICES, []));
  const [events, setEvents] = useState<SocietyEvent[]>(seed(INITIAL_EVENTS, []));
  const [members, setMembers] = useState<Member[]>(seed(INITIAL_MEMBERS, []));
  const [albums, setAlbums] = useState<Album[]>(seed(INITIAL_ALBUMS, []));
  const [notifications, setNotifications] = useState<NotificationItem[]>(seed(INITIAL_NOTIFICATIONS, []));
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>(seed(INITIAL_SECURITY_LOGS, []));
  const [facilityCheckIns, setFacilityCheckIns] = useState<FacilityCheckIn[]>(seed(INITIAL_FACILITY_CHECKINS, []));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(seed(INITIAL_AUDIT_LOGS, []));
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const currentUser = useMemo(() => {
    return users[currentRole] || users.resident;
  }, [currentRole, users]);

  const addToast = (title: string, message?: string, type: ToastMessage['type'] = 'success') => {
    const id = nextToastId();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  /**
   * Pull the authoritative state from MySQL. Role-scoped endpoints mean each
   * user only ever receives data the server allows them to see.
   */
  const hydrate = async (role: UserRole = currentRole) => {
    if (!API_MODE) return;

    const [
      overviewRes,
      me,
      visitorRes,
      amenityRes,
      bookingRes,
      noticeRes,
      eventRes,
      memberRes,
      albumRes,
      notificationRes,
      societyRes,
    ] = await Promise.all([
      SocietyApi.public.overview(),
      SocietyApi.auth.getMe(),
      SocietyApi.visitors.list(),
      SocietyApi.amenities.list(),
      SocietyApi.bookings.list(),
      SocietyApi.notices.list(),
      SocietyApi.events.list(),
      SocietyApi.directory.list(),
      SocietyApi.gallery.albums(),
      SocietyApi.notifications.list(),
      SocietyApi.society.get(),
    ]);

    if (overviewRes.data) {
      setDbConnected(true);
      setPublicOverview(overviewRes.data);
      setSociety(overviewRes.data.society);
      setAmenities(overviewRes.data.amenities);
    }

    if (me.error?.code === 'UNAUTHENTICATED') return;

    let effectiveRole = role;
    if (me.data) {
      setDbConnected(true);
      effectiveRole = me.data.role;
      setUsers((prev) => ({ ...prev, [me.data!.role]: me.data! }));
      setRoleState(me.data.role);
    }

    if (visitorRes.data) setVisitors(visitorRes.data);
    if (amenityRes.data) setAmenities(amenityRes.data);
    if (bookingRes.data) setBookings(bookingRes.data);
    if (noticeRes.data) setNotices(noticeRes.data);
    if (eventRes.data) setEvents(eventRes.data);
    if (memberRes.data) setMembers(memberRes.data);
    if (albumRes.data) setAlbums(albumRes.data);
    if (notificationRes.data) setNotifications(notificationRes.data);
    if (societyRes.data) setSociety(societyRes.data);

    if (effectiveRole === 'admin') {
      const residents = await SocietyApi.admin.residents.list();
      if (residents.data) setMembers(residents.data);
      const audit = await SocietyApi.audit.list();
      if (audit.data) setAuditLogs(audit.data);
    }

    if (effectiveRole === 'admin' || effectiveRole === 'security') {
      const logs = await SocietyApi.security.logs();
      if (logs.data) setSecurityLogs(logs.data);
    }
    if (effectiveRole === 'facility' || effectiveRole === 'admin' || effectiveRole === 'security') {
      const checkIns = await SocietyApi.facility.checkIns();
      if (checkIns.data) setFacilityCheckIns(checkIns.data);
    }
  };

  const refreshData = async () => {
    await hydrate(currentRole);
  };

  /** Fire an API mutation, then reconcile with the server (or revert on error). */
  const apiSync = (request: Promise<ApiResult<unknown>>, role: UserRole = currentRole) => {
    if (!API_MODE) return;
    void request
      .then(async (result) => {
        if (result.error) {
          addToast('Action Failed', result.error.message, 'error');
        }
        await hydrate(role);
      })
      .catch(() => {
        addToast('Action Failed', 'The server could not be reached. Please try again.', 'error');
      });
  };

  // Restore an existing HTTP-only session and load public MySQL overview on page load.
  useEffect(() => {
    if (!API_MODE) return;
    let active = true;

    (async () => {
      try {
        const [overviewRes, session] = await Promise.all([
          SocietyApi.public.overview(),
          SocietyApi.auth.session(),
        ]);
        if (!active) return;
        if (overviewRes.data) {
          setDbConnected(true);
          setPublicOverview(overviewRes.data);
          setSociety(overviewRes.data.society);
          setAmenities(overviewRes.data.amenities);
        }
        if (session.data) {
          setRoleState(session.data.role);
          setUsers((prev) => ({ ...prev, [session.data!.role]: session.data! }));
          setIsAuthenticated(true);
          await hydrate(session.data.role);
        }
      } finally {
        if (active) setAuthReady(true);
      }
    })();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep MySQL data dynamically synchronized in real-time across tabs and role views.
  useEffect(() => {
    if (!API_MODE) return;

    const refresh = () => {
      if (isAuthenticated) {
        void hydrate(currentRole);
      } else {
        void SocietyApi.public.overview().then((res) => {
          if (res.data) {
            setDbConnected(true);
            setPublicOverview(res.data);
            setSociety(res.data.society);
            setAmenities(res.data.amenities);
          }
        });
      }
    };

    const interval = window.setInterval(refresh, 10000);
    window.addEventListener('focus', refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, currentRole]);

  const logAudit = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: `aud_${Date.now()}`,
      action,
      actor: currentUser.name,
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const applySessionUser = async (user: User) => {
    setUsers((prev) => ({ ...prev, [user.role]: user }));
    setRoleState(user.role);
    setIsAuthenticated(true);
    await hydrate(user.role);
  };

  const loginWithPassword = async (login: string, password: string) => {
    if (!API_MODE) {
      setIsAuthenticated(true);
      return { success: true };
    }
    const result = await SocietyApi.auth.loginWithPassword(login, password);
    if (result.error || !result.data) {
      return { success: false, message: result.error?.message || 'Unable to sign in.' };
    }
    await applySessionUser(result.data);
    addToast('Welcome Back', `Signed in as ${result.data.name}.`);
    return { success: true };
  };

  const requestOtp = async (mobile: string) => {
    if (!API_MODE) {
      return { success: true, devOtp: '123456' };
    }
    const result = await SocietyApi.auth.requestOtp(mobile);
    if (result.error || !result.data) {
      return { success: false, message: result.error?.message || 'Unable to send the code.' };
    }
    return {
      success: true,
      devOtp: result.data.devOtp,
      message: 'If the number belongs to a resident, a 6-digit code has been sent.',
    };
  };

  const verifyOtp = async (mobile: string, otp: string) => {
    if (!API_MODE) {
      setIsAuthenticated(true);
      return { success: true };
    }
    const result = await SocietyApi.auth.verifyOtp(mobile, otp);
    if (result.error || !result.data) {
      return { success: false, message: result.error?.message || 'Invalid or expired code.' };
    }
    await applySessionUser(result.data);
    addToast('Welcome Back', `Signed in as ${result.data.name}.`);
    return { success: true };
  };

  const logout = async () => {
    if (API_MODE) {
      await SocietyApi.auth.logout();
    }
    setIsAuthenticated(false);
    setRoleState('resident');
    addToast('Signed Out', 'Your secure session has ended.', 'info');
  };

  const setRole = (role: UserRole) => {
    setRoleState(role);
    addToast('Demonstration Role Changed', `Now viewing as ${role.toUpperCase()}: ${users[role]?.name || role}`, 'info');

    if (!API_MODE) {
      setIsAuthenticated(true);
      return;
    }
    void (async () => {
      const result = await SocietyApi.auth.demoLogin(role);
      if (result.error) {
        addToast('Sign-in Failed', result.error.message, 'error');
        return;
      }
      if (result.data) {
        setUsers((prev) => ({ ...prev, [result.data!.role]: result.data! }));
      }
      setIsAuthenticated(true);
      await hydrate(role);
    })();
  };

  // Visitor actions
  const approveVisitor = (id: string) => {
    setVisitors((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          return {
            ...v,
            status: 'approved',
            approvedAt: new Date().toISOString(),
          };
        }
        return v;
      })
    );
    const visitor = visitors.find((v) => v.id === id);
    const visitorName = visitor ? visitor.name : 'Visitor';
    logAudit('Visitor Approved', `Approved gate pass for ${visitorName}`);
    addToast('Visitor Approved', `${visitorName} has been approved for entry. Pass ${visitor?.passCode || ''} is now active.`);
    apiSync(SocietyApi.visitors.approve(id));
  };

  const denyVisitor = (id: string, reason?: string) => {
    setVisitors((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          return {
            ...v,
            status: 'denied',
            notes: reason || v.notes,
          };
        }
        return v;
      })
    );
    const visitor = visitors.find((v) => v.id === id);
    const visitorName = visitor ? visitor.name : 'Visitor';
    logAudit('Visitor Denied', `Declined access for ${visitorName}${reason ? ` (${reason})` : ''}`);
    addToast('Visitor Request Denied', `Entry request for ${visitorName} was declined.`, 'warning');
    apiSync(SocietyApi.visitors.deny(id, reason));
  };

  const createVisitor = (data: Partial<Visitor>): Visitor => {
    const randomCodeNum = Math.floor(1000 + Math.random() * 9000);
    const passCode = `V-${randomCodeNum}`;
    const newVisitor: Visitor = {
      id: `vis_${Date.now()}`,
      name: data.name || 'Anonymous Guest',
      phone: data.phone || '+91 99999 00000',
      visitDate: data.visitDate || new Date().toISOString().split('T')[0],
      arrivalTime: data.arrivalTime || '10:00 AM',
      departureTime: data.departureTime,
      purpose: data.purpose || 'Visit',
      visitorCount: Number(data.visitorCount) || 1,
      vehicleType: data.vehicleType || 'None',
      vehicleNumber: data.vehicleNumber || '',
      unit: data.unit || currentUser.unit,
      residentId: currentUser.id,
      residentName: currentUser.name,
      status: currentRole === 'security' ? 'pending' : 'expected',
      passCode,
      createdAt: new Date().toISOString(),
      notes: data.notes || '',
    };

    setVisitors((prev) => [newVisitor, ...prev]);

    if (currentRole === 'security') {
      // Add notification for resident
      const notif: NotificationItem = {
        id: `notif_${Date.now()}`,
        title: 'Walk-in Visitor Pending Approval',
        message: `${newVisitor.name} is at Gate 1 requesting entry to Flat ${newVisitor.unit}.`,
        type: 'visitor',
        time: 'Just now',
        isRead: false,
        link: '/visitors',
      };
      setNotifications((prev) => [notif, ...prev]);
      logAudit('Walk-in Visitor Registered', `Security guard registered ${newVisitor.name} for unit ${newVisitor.unit}`);
      addToast('Visitor Registered', `Approval request sent to resident of ${newVisitor.unit}.`, 'info');
    } else {
      logAudit('Visitor Pre-Approved', `Resident pre-approved ${newVisitor.name} (Pass: ${passCode})`);
      addToast('Visitor Pass Created', `Digital entry pass generated: ${passCode}`);
    }

    apiSync(
      SocietyApi.visitors.create({
        name: newVisitor.name,
        phone: newVisitor.phone,
        visitDate: newVisitor.visitDate,
        arrivalTime: newVisitor.arrivalTime,
        departureTime: newVisitor.departureTime,
        purpose: newVisitor.purpose,
        visitorCount: newVisitor.visitorCount,
        vehicleType: newVisitor.vehicleType,
        vehicleNumber: newVisitor.vehicleNumber,
        unit: newVisitor.unit,
        notes: newVisitor.notes,
        passCode: newVisitor.passCode,
      })
    );

    return newVisitor;
  };

  const checkInVisitor = (idOrPassCode: string, gate: string = 'Gate 1 - Main Entrance') => {
    const trimmed = idOrPassCode.trim().toUpperCase();
    const visitor = visitors.find(
      (v) => v.id === idOrPassCode || v.passCode.toUpperCase() === trimmed
    );

    if (!visitor) {
      if (API_MODE) {
        apiSync(SocietyApi.visitors.checkIn(trimmed, gate));
        return { success: true, message: `Verifying pass ${trimmed} against MySQL database...` };
      }
      return { success: false, message: 'Pass not found or invalid barcode/QR.' };
    }

    if (visitor.status === 'checked_in') {
      return { success: false, message: `Pass ${visitor.passCode} is already checked in.`, visitor };
    }

    if (visitor.status === 'denied') {
      return { success: false, message: `Access denied by resident for ${visitor.name}.`, visitor };
    }

    if (visitor.status === 'cancelled') {
      return { success: false, message: `Pass ${visitor.passCode} has been cancelled by host.`, visitor };
    }

    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    setVisitors((prev) =>
      prev.map((v) => (v.id === visitor.id ? { ...v, status: 'checked_in', entryTime: timeStr } : v))
    );

    const newLog: SecurityLog = {
      id: `log_${Date.now()}`,
      visitorName: visitor.name,
      unit: visitor.unit,
      gate,
      entryTime: timeStr,
      status: 'entry',
      guardName: currentUser.name,
      passCode: visitor.passCode,
    };
    setSecurityLogs((prev) => [newLog, ...prev]);
    logAudit('Pass Verified & Check-in', `Recorded entry for ${visitor.name} (${visitor.passCode}) at ${gate}`);
    addToast('Visitor Checked In', `Entry approved for ${visitor.name} -> ${visitor.unit}`);
    apiSync(SocietyApi.visitors.checkIn(visitor.passCode, gate));

    return { success: true, message: `Entry authorized for ${visitor.name}`, visitor };
  };

  const checkOutVisitor = (idOrPassCode: string) => {
    const trimmed = idOrPassCode.trim().toUpperCase();
    const visitor = visitors.find(
      (v) => v.id === idOrPassCode || v.passCode.toUpperCase() === trimmed
    );

    if (!visitor) {
      return { success: false, message: 'Pass not found.' };
    }

    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    setVisitors((prev) =>
      prev.map((v) => (v.id === visitor.id ? { ...v, status: 'checked_out', exitTime: timeStr } : v))
    );

    const newLog: SecurityLog = {
      id: `log_${Date.now()}`,
      visitorName: visitor.name,
      unit: visitor.unit,
      gate: 'Gate 1 - Main Entrance',
      exitTime: timeStr,
      status: 'exit',
      guardName: currentUser.name,
      passCode: visitor.passCode,
    };
    setSecurityLogs((prev) => [newLog, ...prev]);
    logAudit('Visitor Checked Out', `Recorded exit for ${visitor.name} (${visitor.passCode})`);
    addToast('Visitor Checked Out', `Exit recorded for ${visitor.name}`);
    apiSync(SocietyApi.visitors.checkOut(visitor.id));

    return { success: true, message: `Exit logged for ${visitor.name}`, visitor };
  };

  // Amenity Bookings
  const createBooking = (
    data: Omit<Booking, 'id' | 'bookingReference' | 'status' | 'qrToken' | 'createdAt'>
  ): { success: boolean; message: string; booking?: Booking } => {
    // Concurrency / Conflict Check in mock state
    const existingConflict = bookings.find(
      (b) =>
        b.amenityId === data.amenityId &&
        b.date === data.date &&
        b.timeSlot === data.timeSlot &&
        b.status !== 'cancelled'
    );

    if (existingConflict) {
      const msg = `This time slot (${data.timeSlot}) is already booked by another resident. Please select a different slot.`;
      addToast('Booking Conflict', msg, 'error');
      return { success: false, message: msg };
    }

    const refNumber = Math.floor(1000 + Math.random() * 9000);
    const bookingReference = `BK-${refNumber}`;
    const qrToken = `SOCIETY-${bookingReference}-${data.amenityId.toUpperCase()}-${data.date}`;

    const newBooking: Booking = {
      id: `bk_${Date.now()}`,
      bookingReference,
      amenityId: data.amenityId,
      amenityName: data.amenityName,
      amenityImage: data.amenityImage,
      unit: data.unit,
      userId: data.userId,
      userName: data.userName,
      date: data.date,
      timeSlot: data.timeSlot,
      guestCount: data.guestCount,
      status: 'confirmed',
      qrToken,
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };

    setBookings((prev) => [newBooking, ...prev]);

    // Add in-app notification
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title: 'Amenity Reservation Confirmed',
      message: `Your reservation for ${newBooking.amenityName} on ${newBooking.date} (${newBooking.timeSlot}) is confirmed.`,
      type: 'booking',
      time: 'Just now',
      isRead: false,
      link: '/bookings',
    };
    setNotifications((prev) => [notif, ...prev]);

    logAudit('Amenity Booked', `Booked ${newBooking.amenityName} on ${newBooking.date} (${newBooking.bookingReference})`);
    addToast('Booking Confirmed!', `Reservation ${bookingReference} for ${newBooking.amenityName} successfully confirmed.`);
    apiSync(
      SocietyApi.bookings.create({
        amenityId: data.amenityId,
        date: data.date,
        timeSlot: data.timeSlot,
        guestCount: data.guestCount,
        notes: data.notes,
        bookingReference: newBooking.bookingReference,
      })
    );

    return { success: true, message: 'Booking confirmed successfully', booking: newBooking };
  };

  const cancelBooking = (id: string) => {
    const booking = bookings.find((b) => b.id === id);
    if (!booking) return;

    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b))
    );

    logAudit('Booking Cancelled', `Cancelled reservation ${booking.bookingReference} for ${booking.amenityName}`);
    addToast('Booking Cancelled', `Reservation ${booking.bookingReference} has been cancelled and slot released.`);
    apiSync(SocietyApi.bookings.cancel(id));
  };

  const checkInFacilityBooking = (bookingRef: string) => {
    const trimmed = bookingRef.trim().toUpperCase();
    const booking = bookings.find((b) => b.bookingReference.toUpperCase() === trimmed);

    if (!booking) {
      if (API_MODE) {
        apiSync(SocietyApi.bookings.checkIn(trimmed));
        return { success: true, message: `Verifying booking ${trimmed} against MySQL database...` };
      }
      return { success: false, message: 'Reservation reference not found.' };
    }

    if (booking.status === 'cancelled') {
      return { success: false, message: 'This reservation has been cancelled.' };
    }

    if (booking.status === 'checked_in') {
      return { success: false, message: 'This reservation is already checked in.' };
    }

    setBookings((prev) =>
      prev.map((b) => (b.id === booking.id ? { ...b, status: 'checked_in' } : b))
    );

    const checkIn: FacilityCheckIn = {
      id: `fac_${Date.now()}`,
      bookingReference: booking.bookingReference,
      amenityName: booking.amenityName,
      residentName: booking.userName,
      unit: booking.unit,
      timeSlot: booking.timeSlot,
      attendeeCount: booking.guestCount,
      status: 'checked_in',
      checkedInAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setFacilityCheckIns((prev) => [checkIn, ...prev]);
    logAudit('Facility Check-In', `Verified reservation ${booking.bookingReference} for ${booking.userName}`);
    addToast('Check-In Verified', `Attendance recorded for ${booking.userName} at ${booking.amenityName}`);
    apiSync(SocietyApi.bookings.checkIn(booking.bookingReference));

    return { success: true, message: `Check-in recorded for ${booking.userName}`, checkIn };
  };

  const updateAmenity = async (
    id: string,
    patch: Partial<Amenity>
  ): Promise<{ success: boolean; message: string }> => {
    const amenity = amenities.find((a) => a.id === id);
    if (!amenity) return { success: false, message: 'Amenity not found.' };

    const previous = amenities;
    setAmenities((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    addToast('Amenity Updated', `${amenity.name} configuration has been saved.`);
    logAudit('Amenity Updated', `Updated ${amenity.name} (${Object.keys(patch).join(', ')})`);

    if (!API_MODE) return { success: true, message: 'Saved.' };

    const result = await SocietyApi.amenities.update(id, patch as Record<string, unknown>);
    if (result.error || !result.data) {
      setAmenities(previous);
      addToast('Update Failed', result.error?.message || 'Could not save the amenity.', 'error');
      return { success: false, message: result.error?.message || 'Could not save the amenity.' };
    }
    setAmenities((prev) => prev.map((a) => (a.id === id ? result.data! : a)));
    await hydrate();
    return { success: true, message: 'Saved.' };
  };

  // Notices
  const markNoticeRead = (id: string) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    if (API_MODE) void SocietyApi.notices.markRead(id);
  };

  const acknowledgeNotice = (id: string) => {
    setNotices((prev) =>
      prev.map((n) => {
        if (n.id === id && !n.isAcknowledged) {
          return {
            ...n,
            isAcknowledged: true,
            isRead: true,
            acknowledgedCount: (n.acknowledgedCount || 0) + 1,
          };
        }
        return n;
      })
    );
    logAudit('Notice Acknowledged', `Resident acknowledged circular ${id}`);
    addToast('Notice Acknowledged', 'Your acknowledgement has been recorded by the management committee.');
    apiSync(SocietyApi.notices.acknowledge(id));
  };

  const createNotice = (data: Omit<Notice, 'id' | 'isRead' | 'isAcknowledged' | 'acknowledgedCount' | 'totalResidentsCount'>): Notice => {
    const newNotice: Notice = {
      ...data,
      id: `not_${Date.now()}`,
      isRead: false,
      isAcknowledged: false,
      acknowledgedCount: 0,
      totalResidentsCount: society.totalHouseholds || society.activeResidents || 0,
    };
    setNotices((prev) => [newNotice, ...prev]);
    logAudit('Notice Published', `Published notice: "${newNotice.title}" (${newNotice.priority})`);
    addToast('Notice Published', `"${newNotice.title}" has been broadcast to all residents.`);
    apiSync(
      SocietyApi.notices.create({
        title: newNotice.title,
        body: newNotice.body,
        category: newNotice.category,
        priority: newNotice.priority,
        publishDate: newNotice.publishDate,
        expiryDate: newNotice.expiryDate,
        attachmentName: newNotice.attachmentName,
        attachmentSize: newNotice.attachmentSize,
        requiresAcknowledgement: newNotice.requiresAcknowledgement,
      })
    );
    return newNotice;
  };

  // Events
  const updateEventRSVP = (id: string, status: RSVPStatus) => {
    setEvents((prev) =>
      prev.map((evt) => {
        if (evt.id === id) {
          const wasAttending = evt.rsvpStatus === 'attending';
          const nowAttending = status === 'attending';
          let newCount = evt.attendeesCount;
          if (!wasAttending && nowAttending) newCount += 1;
          if (wasAttending && !nowAttending) newCount = Math.max(0, newCount - 1);
          return {
            ...evt,
            rsvpStatus: status,
            attendeesCount: newCount,
          };
        }
        return evt;
      })
    );
    const evt = events.find((e) => e.id === id);
    const eventTitle = evt ? evt.title : 'Event';
    logAudit('Event RSVP', `Updated RSVP for "${eventTitle}" to ${status.toUpperCase()}`);
    addToast('RSVP Updated', `Your response for "${eventTitle}" has been set to ${status.replace('_', ' ').toUpperCase()}.`);
    apiSync(SocietyApi.events.updateRsvp(id, status));
  };

  const createEvent = (data: Omit<SocietyEvent, 'id' | 'attendeesCount' | 'rsvpStatus'>): SocietyEvent => {
    const newEvent: SocietyEvent = {
      ...data,
      id: `evt_${Date.now()}`,
      attendeesCount: 0,
      rsvpStatus: 'none',
    };
    setEvents((prev) => [newEvent, ...prev]);
    logAudit('Event Created', `Created event: "${newEvent.title}" on ${newEvent.date}`);
    addToast('Event Published', `"${newEvent.title}" is now visible to all residents.`);
    apiSync(
      SocietyApi.events.create({
        title: newEvent.title,
        description: newEvent.description,
        category: newEvent.category,
        date: newEvent.date,
        time: newEvent.time,
        venue: newEvent.venue,
        capacity: newEvent.capacity,
        coverImage: newEvent.coverImage,
        organizer: newEvent.organizer,
        deadline: newEvent.deadline,
      })
    );
    return newEvent;
  };

  // Profile
  const updateUserProfile = (data: Partial<User>) => {
    setUsers((prev) => ({
      ...prev,
      [currentRole]: {
        ...prev[currentRole],
        ...data,
      },
    }));
    addToast('Profile Updated', 'Your profile information and preferences have been updated.');
    apiSync(SocietyApi.auth.updateProfile(data));
  };

  // Resident administration (admin only)
  const createResident: SocietyContextType['createResident'] = async (data) => {
    if (!API_MODE) {
      const member: Member = {
        id: `mem_${Date.now()}`,
        name: data.name,
        unit: data.unit,
        wing: data.wing,
        floor: data.floor,
        role:
          data.role === 'admin'
            ? 'Committee Secretary'
            : `Resident (${data.membershipType})`,
        roleKey: data.role,
        membershipType: data.membershipType,
        isActive: true,
        avatar: '',
        bio: `Resident of Flat ${data.unit}`,
        interests: [],
        email: data.email,
        phone: data.phone,
        isPhonePublic: false,
        isEmailPublic: false,
      };
      setMembers((prev) => [member, ...prev]);
      addToast('Resident Onboarded', `${member.name} assigned to Flat ${member.unit}.`);
      return { success: true, message: 'Resident created.', member };
    }

    const result = await SocietyApi.admin.residents.create(data as unknown as Record<string, unknown>);
    if (result.error || !result.data) {
      const message = result.error?.message || 'Could not onboard the resident.';
      addToast('Onboarding Failed', message, 'error');
      return { success: false, message };
    }
    setMembers((prev) => [result.data!, ...prev.filter((m) => m.id !== result.data!.id)]);
    await hydrate();
    const temp = result.data.temporaryPassword;
    addToast(
      'Resident Onboarded',
      temp
        ? `${result.data.name} added. Temporary password: ${temp}`
        : `${result.data.name} can now sign in with the password you set.`
    );
    return { success: true, message: 'Resident created.', member: result.data };
  };

  const updateResident: SocietyContextType['updateResident'] = async (id, patch) => {
    if (!API_MODE) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                ...(patch.name ? { name: String(patch.name) } : {}),
                ...(patch.unit ? { unit: String(patch.unit) } : {}),
                ...(patch.isActive !== undefined ? { isActive: Boolean(patch.isActive) } : {}),
              }
            : m
        )
      );
      addToast('Resident Updated', 'Household record saved.');
      return { success: true, message: 'Saved.' };
    }

    const result = await SocietyApi.admin.residents.update(id, patch);
    if (result.error || !result.data) {
      const message = result.error?.message || 'Could not update the resident.';
      addToast('Update Failed', message, 'error');
      return { success: false, message };
    }
    setMembers((prev) => prev.map((m) => (m.id === id ? result.data! : m)));
    await hydrate();
    addToast('Resident Updated', `${result.data.name}'s record has been saved.`);
    return { success: true, message: 'Saved.' };
  };

  const updateResidentAccess: SocietyContextType['updateResidentAccess'] = async (id, isActive) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, isActive } : m)));
    const result = await updateResident(id, { isActive });
    if (!result.success) {
      setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, isActive: !isActive } : m)));
      return result;
    }
    addToast(
      isActive ? 'Portal Access Restored' : 'Portal Access Suspended',
      isActive ? 'The resident can sign in again.' : 'Active sessions were revoked immediately.'
    );
    return result;
  };

  const removeResident: SocietyContextType['removeResident'] = async (id) => {
    if (!API_MODE) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
      addToast('Resident Removed', 'Household record removed from the directory.');
      return { success: true, message: 'Removed.' };
    }
    const result = await SocietyApi.admin.residents.remove(id);
    if (result.error) {
      const message = result.error.message || 'Could not remove the resident.';
      addToast('Removal Failed', message, 'error');
      return { success: false, message };
    }
    setMembers((prev) => prev.filter((m) => m.id !== id));
    await hydrate();
    addToast('Resident Removed', 'Household record removed from the directory.');
    return { success: true, message: 'Removed.' };
  };

  // Gallery
  const moderateMedia = (albumId: string, mediaId: string, action: 'approved' | 'rejected') => {
    setAlbums((prev) =>
      prev.map((alb) => {
        if (alb.id === albumId) {
          return {
            ...alb,
            mediaItems: alb.mediaItems.map((item) =>
              item.id === mediaId ? { ...item, status: action } : item
            ),
          };
        }
        return alb;
      })
    );
    logAudit('Media Moderation', `${action === 'approved' ? 'Approved' : 'Rejected'} media item ${mediaId}`);
    addToast(`Media ${action === 'approved' ? 'Approved' : 'Rejected'}`, `Content has been ${action}.`);
    apiSync(SocietyApi.gallery.moderate(albumId, mediaId, action));
  };

  const uploadMedia = (albumId: string, title: string, url: string) => {
    const newItem = {
      id: `m_${Date.now()}`,
      url,
      title,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      uploader: currentUser.name,
      status: currentRole === 'admin' ? ('approved' as const) : ('pending' as const),
    };

    setAlbums((prev) =>
      prev.map((alb) => {
        if (alb.id === albumId) {
          return {
            ...alb,
            count: alb.count + 1,
            mediaItems: [newItem, ...alb.mediaItems],
          };
        }
        return alb;
      })
    );

    if (currentRole === 'admin') {
      addToast('Photo Added', `"${title}" has been published to the gallery.`);
    } else {
      addToast('Photo Submitted', 'Your photo has been sent to the society administrator for review.');
    }
    apiSync(SocietyApi.gallery.upload(albumId, title, url));
  };

  // Notifications
  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    if (API_MODE) void SocietyApi.notifications.markRead(id);
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    addToast('Notifications Cleared', 'All notifications marked as read.');
    if (API_MODE) void SocietyApi.notifications.markAllRead();
  };

  // Reset
  const resetDemoData = () => {
    if (API_MODE) {
      void hydrate(currentRole).then(() =>
        addToast('Reloaded From Database', 'Fresh data has been loaded from MySQL.', 'info')
      );
      return;
    }

    setVisitors(INITIAL_VISITORS);
    setAmenities(INITIAL_AMENITIES);
    setBookings(INITIAL_BOOKINGS);
    setNotices(INITIAL_NOTICES);
    setEvents(INITIAL_EVENTS);
    setMembers(INITIAL_MEMBERS);
    setAlbums(INITIAL_ALBUMS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSecurityLogs(INITIAL_SECURITY_LOGS);
    setFacilityCheckIns(INITIAL_FACILITY_CHECKINS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setSociety(MOCK_SOCIETY);
    addToast('Demo State Reset', 'Restored all seed data and state to original demonstration defaults.', 'info');
  };

  return (
    <SocietyContext.Provider
      value={{
        currentRole,
        setRole,
        currentUser,
        authReady,
        isAuthenticated,
        loginWithPassword,
        requestOtp,
        verifyOtp,
        logout,
        society,
        dbConnected,
        publicOverview,
        refreshData,
        visitors,
        approveVisitor,
        denyVisitor,
        createVisitor,
        checkInVisitor,
        checkOutVisitor,
        amenities,
        bookings,
        createBooking,
        cancelBooking,
        checkInFacilityBooking,
        updateAmenity,
        notices,
        markNoticeRead,
        acknowledgeNotice,
        createNotice,
        events,
        updateEventRSVP,
        createEvent,
        members,
        updateUserProfile,
        createResident,
        updateResident,
        updateResidentAccess,
        removeResident,
        albums,
        moderateMedia,
        uploadMedia,
        notifications,
        unreadNotificationsCount,
        markNotificationRead,
        markAllNotificationsRead,
        securityLogs,
        facilityCheckIns,
        auditLogs,
        toasts,
        addToast,
        removeToast,
        resetDemoData,
      }}
    >
      {children}
    </SocietyContext.Provider>
  );
}

export function useSociety() {
  const context = useContext(SocietyContext);
  if (!context) {
    throw new Error('useSociety must be used within a SocietyProvider');
  }
  return context;
}
