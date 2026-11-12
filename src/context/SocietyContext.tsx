'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
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
  enterWithSocietyCode: (
    code: string,
    role?: UserRole,
    details?: { name?: string; phone?: string; unit?: string }
  ) => Promise<{ success: boolean; message?: string }>;
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
  updateUserProfile: (profileData: Partial<User>) => Promise<void>;
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
const STORAGE_KEY = 'apnaa_dynamic_state_v1';

const BASE_SOCIETY: SocietyInfo = {
  id: 'soc_green_valley_01',
  name: 'Green Valley Residency',
  address: 'Green Valley Road, Powai, Mumbai 400076',
  totalHouseholds: 248,
  totalUnits: 180,
  activeResidents: INITIAL_MEMBERS.filter((m) => m.isActive !== false).length,
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

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '').slice(-10);
}

interface PersistedSocietyState {
  currentRole?: UserRole;
  isAuthenticated?: boolean;
  users?: Record<string, User>;
  visitors?: Visitor[];
  amenities?: Amenity[];
  bookings?: Booking[];
  notices?: Notice[];
  events?: SocietyEvent[];
  members?: Member[];
  albums?: Album[];
  notifications?: NotificationItem[];
  securityLogs?: SecurityLog[];
  facilityCheckIns?: FacilityCheckIn[];
  auditLogs?: AuditLog[];
}

export function SocietyProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setRoleState] = useState<UserRole>('resident');
  const [authReady, setAuthReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dbConnected, setDbConnected] = useState(true);
  const [remotePublicOverview, setRemotePublicOverview] = useState<PublicOverviewData | null>(null);
  const [users, setUsers] = useState<Record<string, User>>(INITIAL_USERS);
  const [baseSociety, setBaseSociety] = useState<SocietyInfo>(seed(BASE_SOCIETY, BASE_SOCIETY));
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

  const hydratedLocalRef = useRef(false);

  const currentUser = useMemo(() => {
    return users[currentRole] || users.resident;
  }, [currentRole, users]);

  // Dynamically derive society KPIs from live state so every screen reflects real-time mutations
  const society = useMemo<SocietyInfo>(() => {
    const activeMembersCount = members.filter((m) => m.isActive !== false).length;
    const pendingVisCount = visitors.filter((v) => v.status === 'pending').length;
    const closuresCount = amenities.filter((a) => a.status !== 'available').length;
    const memberDelta = members.length - INITIAL_MEMBERS.length;

    return {
      ...baseSociety,
      totalHouseholds: Math.max(activeMembersCount, (baseSociety.totalHouseholds || 248) + memberDelta),
      activeResidents: activeMembersCount || baseSociety.activeResidents,
      pendingApprovals: pendingVisCount,
      activeClosures: closuresCount,
    };
  }, [baseSociety, members, visitors, amenities]);

  // Dynamically compute publicOverview from live state so Landing Page & Role Switcher are 100% reactive
  const publicOverview = useMemo<PublicOverviewData>(() => {
    const today = new Date().toISOString().slice(0, 10);
    const availableAmenities = amenities.filter((a) => a.status === 'available').length;
    const confirmedBookings = bookings.filter((b) => b.status === 'confirmed').length;
    const todaysBookings = bookings.filter((b) => b.date === today && b.status !== 'cancelled').length;
    const expectedVisitors = visitors.filter((v) => v.status === 'expected' || v.status === 'approved').length;
    const pendingVisitors = visitors.filter((v) => v.status === 'pending').length;
    const checkedInToday = securityLogs.filter((l) => l.status === 'entry').length;
    const upcomingEvents = events.filter((e) => e.date >= today).length;
    const pendingMedia = albums.reduce(
      (sum, alb) => sum + alb.mediaItems.filter((m) => m.status === 'pending').length,
      0
    );

    if (API_MODE && remotePublicOverview && !isAuthenticated) {
      return remotePublicOverview;
    }

    return {
      society,
      amenities,
      stats: {
        totalHouseholds: society.totalHouseholds,
        totalUnits: society.totalUnits,
        totalAmenities: amenities.length,
        availableAmenities,
        activeResidents: society.activeResidents,
        confirmedBookings,
        todaysBookings,
        expectedVisitors,
        pendingVisitors,
        checkedInToday,
        upcomingEvents,
        pendingMedia,
      },
      personas: {
        resident: {
          name: users.resident?.name || 'Resident Member',
          unit: users.resident?.unit || 'A-101',
          membershipType: users.resident?.membershipType || 'Owner',
        },
        admin: {
          name: users.admin?.name || 'Rajesh Nair',
          unit: users.admin?.unit || 'C-402',
          membershipType: 'Secretary',
        },
        security: {
          name: (users.security?.name || 'Vikram Singh').replace(/\s*\(.*\)$/, ''),
          unit: 'Gate 1',
          membershipType: 'Head Guard',
        },
        facility: {
          name: users.facility?.name || 'Anand Verma',
          unit: 'Clubhouse',
          membershipType: 'Manager',
        },
      },
    };
  }, [
    API_MODE,
    remotePublicOverview,
    isAuthenticated,
    society,
    amenities,
    bookings,
    visitors,
    securityLogs,
    events,
    albums,
    users,
  ]);

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

  // Load persisted state from localStorage & listen for cross-tab storage updates when in local/mock mode
  useEffect(() => {
    if (API_MODE) return;

    const applyPersisted = (raw: string | null) => {
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw) as PersistedSocietyState;
        if (parsed.currentRole) setRoleState(parsed.currentRole);
        if (typeof parsed.isAuthenticated === 'boolean') setIsAuthenticated(parsed.isAuthenticated);
        if (parsed.users) setUsers(parsed.users);
        if (parsed.visitors) setVisitors(parsed.visitors);
        if (parsed.amenities) setAmenities(parsed.amenities);
        if (parsed.bookings) setBookings(parsed.bookings);
        if (parsed.notices) setNotices(parsed.notices);
        if (parsed.events) setEvents(parsed.events);
        if (parsed.members) setMembers(parsed.members);
        if (parsed.albums) setAlbums(parsed.albums);
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (parsed.securityLogs) setSecurityLogs(parsed.securityLogs);
        if (parsed.facilityCheckIns) setFacilityCheckIns(parsed.facilityCheckIns);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
      } catch {
        // Ignore corrupted storage
      }
    };

    // Always start unauthenticated so society passcode must be manually typed
    setIsAuthenticated(false);
    hydratedLocalRef.current = true;
    setAuthReady(true);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        applyPersisted(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Persist changes to localStorage whenever state updates in local/mock mode
  useEffect(() => {
    if (API_MODE || !hydratedLocalRef.current) return;
    try {
      const payload: PersistedSocietyState = {
        currentRole,
        isAuthenticated,
        users,
        visitors,
        amenities,
        bookings,
        notices,
        events,
        members,
        albums,
        notifications,
        securityLogs,
        facilityCheckIns,
        auditLogs,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore quota errors
    }
  }, [
    currentRole,
    isAuthenticated,
    users,
    visitors,
    amenities,
    bookings,
    notices,
    events,
    members,
    albums,
    notifications,
    securityLogs,
    facilityCheckIns,
    auditLogs,
  ]);

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
      setRemotePublicOverview(overviewRes.data);
      setBaseSociety(overviewRes.data.society);
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
    if (societyRes.data) setBaseSociety(societyRes.data);

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
    if (!API_MODE) {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as PersistedSocietyState;
          if (parsed.visitors) setVisitors(parsed.visitors);
          if (parsed.amenities) setAmenities(parsed.amenities);
          if (parsed.bookings) setBookings(parsed.bookings);
          if (parsed.notices) setNotices(parsed.notices);
          if (parsed.events) setEvents(parsed.events);
          if (parsed.members) setMembers(parsed.members);
          if (parsed.albums) setAlbums(parsed.albums);
          if (parsed.notifications) setNotifications(parsed.notifications);
          if (parsed.securityLogs) setSecurityLogs(parsed.securityLogs);
          if (parsed.facilityCheckIns) setFacilityCheckIns(parsed.facilityCheckIns);
          if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
        } catch {
          // ignore
        }
      }
      return;
    }
    await hydrate(currentRole);
  };

  /** Fire an API mutation, then reconcile with the server (or revert on error). */
  const apiSync = (request: Promise<ApiResult<unknown>>, role: UserRole = currentRole) => {
    void request
      .then(async (result) => {
        if (!API_MODE) return;
        if (result.error) {
          addToast('Action Failed', result.error.message, 'error');
        }
        await hydrate(role);
      })
      .catch(() => {
        if (!API_MODE) return;
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
          setRemotePublicOverview(overviewRes.data);
          setBaseSociety(overviewRes.data.society);
          setAmenities(overviewRes.data.amenities);
        }
        // Always require manually entering the society passcode
        setIsAuthenticated(false);
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
            setRemotePublicOverview(res.data);
            setBaseSociety(res.data.society);
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

  const logAudit = (action: string, details: string, actorOverride?: string) => {
    const newLog: AuditLog = {
      id: `aud_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      action,
      actor: actorOverride || currentUser.name,
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const applySessionUser = async (user: User) => {
    setUsers((prev) => ({
      ...prev,
      [user.role]: user,
      resident: user.role === 'resident' ? user : prev.resident,
    }));
    setRoleState(user.role);
    setIsAuthenticated(true);
    await hydrate(user.role);
  };

  const findDynamicAccount = (loginRaw: string): { user: User; suspended?: boolean } | null => {
    const trimmed = loginRaw.trim().toLowerCase();
    const digits = normalizePhone(loginRaw);

    // 1. Check members list (includes newly onboarded residents & updated profiles)
    const matchedMember = members.find(
      (m) =>
        m.email.toLowerCase() === trimmed ||
        (digits.length >= 10 && normalizePhone(m.phone) === digits)
    );
    if (matchedMember) {
      if (matchedMember.isActive === false) {
        return {
          user: users.resident,
          suspended: true,
        };
      }
      const role: UserRole = matchedMember.roleKey || (matchedMember.role.toLowerCase().includes('secretary') ? 'admin' : 'resident');
      return {
        user: {
          id: matchedMember.id === 'mem_01' ? 'usr_res_01' : matchedMember.id === 'mem_02' ? 'usr_adm_01' : matchedMember.id,
          name: matchedMember.name,
          email: matchedMember.email,
          phone: matchedMember.phone,
          role,
          unit: matchedMember.unit,
          wing: matchedMember.wing,
          floor: matchedMember.floor,
          societyName: society.name,
          avatar: matchedMember.avatar || '',
          membershipType: matchedMember.membershipType || 'Owner',
          bio: matchedMember.bio,
          interests: matchedMember.interests,
          isPhonePublic: matchedMember.isPhonePublic,
          isEmailPublic: matchedMember.isEmailPublic,
        },
      };
    }

    // 2. Check role accounts (resident, admin, security, facility)
    for (const u of Object.values(users)) {
      if (
        u.email.toLowerCase() === trimmed ||
        (digits.length >= 10 && normalizePhone(u.phone) === digits)
      ) {
        return { user: u };
      }
    }

    return null;
  };

  const loginWithPassword = async (login: string, password: string) => {
    if (!API_MODE) {
      if (!login.trim() || !password.trim()) {
        return { success: false, message: 'Please enter your email/phone and password.' };
      }
      const match = findDynamicAccount(login);
      if (match?.suspended) {
        return {
          success: false,
          message: 'Your portal access has been suspended by the society administrator.',
        };
      }
      if (!match) {
        return {
          success: false,
          message: 'No account found matching that email or phone number.',
        };
      }
      setUsers((prev) => ({ ...prev, [match.user.role]: match.user }));
      setRoleState(match.user.role);
      setIsAuthenticated(true);
      logAudit('User Signed In', `${match.user.name} signed in via password (${match.user.role})`, match.user.name);
      addToast('Welcome Back', `Signed in as ${match.user.name} (${match.user.unit}).`);
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
      const digits = normalizePhone(mobile);
      if (digits.length < 10) {
        return { success: false, message: 'Please enter a valid 10-digit mobile number.' };
      }
      const match = findDynamicAccount(mobile);
      if (match?.suspended) {
        return {
          success: false,
          message: 'Your portal access has been suspended by the society administrator.',
        };
      }
      return {
        success: true,
        devOtp: '123456',
        message: 'Development OTP generated: 123456',
      };
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
      if (otp.trim().length < 6) {
        return { success: false, message: 'Please enter the 6-digit verification code.' };
      }
      const match = findDynamicAccount(mobile);
      if (match?.suspended) {
        return {
          success: false,
          message: 'Your portal access has been suspended by the society administrator.',
        };
      }
      const targetUser = match?.user || users.resident;
      setUsers((prev) => ({ ...prev, [targetUser.role]: targetUser }));
      setRoleState(targetUser.role);
      setIsAuthenticated(true);
      logAudit('User Signed In (OTP)', `${targetUser.name} signed in via mobile OTP`, targetUser.name);
      addToast('Welcome Back', `Signed in as ${targetUser.name} (${targetUser.unit}).`);
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

  const enterWithSocietyCode = async (
    code: string,
    role: UserRole = currentRole,
    details?: { name?: string; phone?: string; unit?: string }
  ) => {
    if (code.trim() !== '1234') {
      addToast('Access Denied', 'Incorrect Society Passcode. Please try again.', 'error');
      return { success: false, message: 'Incorrect Society Passcode. Please try again.' };
    }


    if (API_MODE) {
      try {
        const result = await SocietyApi.auth.societyCodeLogin({
          code,
          role,
          name: details?.name,
          phone: details?.phone,
          unit: details?.unit,
        });
        if (result.error) {
          addToast('Access Denied', result.error.message, 'error');
          return { success: false, message: result.error.message };
        }
        if (result.data) {
          await applySessionUser(result.data);
          addToast('Access Granted', `Welcome ${result.data.name}!`, 'success');
          return { success: true };
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Authentication failed';
        addToast('Access Denied', msg, 'error');
        return { success: false, message: msg };
      }
    }

    // Local / offline fallback
    const fallbackUser: User = {
      id: 'usr_res_' + Date.now(),
      name: details?.name || users[role]?.name || 'Resident',
      email: `${details?.name?.toLowerCase().replace(/\s+/g, '.') || 'resident'}@apnaaentry.local`,
      phone: details?.phone || '+91 98765 00000',
      role,
      unit: details?.unit || 'A-101',
      wing: 'A Wing',
      floor: '1st Floor',
      societyName: society.name,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(details?.name || 'Resident')}&background=0D5C63&color=fff&size=200`,
      membershipType: 'Owner',
      pinCode: '107864',
      gender: 'Not Specified',
      dateOfBirth: 'Not Available',
      bloodGroup: 'O+',
      govtIdNumber: 'NOT_SET',
      interests: [],
      isPhonePublic: true,
      isEmailPublic: false,
    };
    setUsers((prev) => ({ ...prev, [role]: fallbackUser }));
    setRoleState(role);
    setIsAuthenticated(true);
    addToast('Access Granted', `Welcome ${fallbackUser.name}!`, 'success');
    return { success: true };
  };

  const logout = async () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.clear();
      window.localStorage.removeItem(STORAGE_KEY);
    }
    if (API_MODE) {
      await SocietyApi.auth.logout().catch(() => undefined);
    }
    setIsAuthenticated(false);
    setRoleState('resident');
    setUsers(INITIAL_USERS);
    addToast('Portal Locked', 'Please manually type society passcode to enter.', 'info');
  };

  const setRole = (role: UserRole) => {
    setRoleState(role);
    addToast('Role Changed', `Now viewing as ${role.toUpperCase()}: ${users[role]?.name || role}`, 'info');

    if (!API_MODE) {
      setIsAuthenticated(true);
      return;
    }

    // Preserve custom dynamic resident profile if entered
    if (role === 'resident' && users.resident && users.resident.id !== 'usr_res_01' && users.resident.name !== 'Resident Member') {
      setIsAuthenticated(true);
      void hydrate(role);
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
    logAudit('Visitor Approved', `Approved gate pass for ${visitorName} (${visitor?.passCode || ''})`);
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
    const targetUnit = data.unit || currentUser.unit;

    // Look up the host resident dynamically from members when a security guard registers a walk-in
    const hostMember = members.find((m) => m.unit.toLowerCase() === targetUnit.toLowerCase());
    const hostId = data.residentId || hostMember?.id || currentUser.id;
    const hostName =
      data.residentName ||
      hostMember?.name ||
      (currentRole === 'security' ? `Resident (${targetUnit})` : currentUser.name);

    const newVisitor: Visitor = {
      id: `vis_${Date.now()}`,
      name: data.name || 'Anonymous Guest',
      phone: data.phone || '+91 99999 00000',
      visitDate: data.visitDate || new Date().toISOString().split('T')[0],
      arrivalTime: data.arrivalTime || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      departureTime: data.departureTime,
      purpose: data.purpose || 'Visit',
      visitorCount: Number(data.visitorCount) || 1,
      vehicleType: data.vehicleType || 'None',
      vehicleNumber: data.vehicleNumber || '',
      unit: targetUnit,
      residentId: hostId,
      residentName: hostName,
      status: currentRole === 'security' ? 'pending' : 'expected',
      passCode,
      createdAt: new Date().toISOString(),
      notes: data.notes || '',
    };

    setVisitors((prev) => [newVisitor, ...prev]);

    if (currentRole === 'security') {
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
      logAudit('Walk-in Visitor Registered', `Security guard registered ${newVisitor.name} for Flat ${newVisitor.unit} (${hostName})`);
      addToast('Visitor Registered', `Approval request sent to ${hostName} (Flat ${newVisitor.unit}).`, 'info');
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
    addToast('Visitor Checked In', `Entry approved for ${visitor.name} -> Flat ${visitor.unit}`);
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

    if (!API_MODE) {
      void SocietyApi.amenities.update(id, patch as Record<string, unknown>);
      return { success: true, message: 'Saved.' };
    }

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

    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title: `New Notice: ${newNotice.title}`,
      message: `${newNotice.category} circular published by ${newNotice.author}.`,
      type: 'notice',
      time: 'Just now',
      isRead: false,
      link: '/notices',
    };
    setNotifications((prev) => [notif, ...prev]);

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
      attendeesCount: 1,
      rsvpStatus: 'attending',
    };
    setEvents((prev) => [newEvent, ...prev]);

    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title: `New Event: ${newEvent.title}`,
      message: `${newEvent.date} at ${newEvent.venue}. RSVP is now open!`,
      type: 'event',
      time: 'Just now',
      isRead: false,
      link: '/events',
    };
    setNotifications((prev) => [notif, ...prev]);

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

  // Profile - updates both currentUser AND the corresponding member record in the directory
  const updateUserProfile = async (data: Partial<User>) => {
    const active = users[currentRole] || users.resident;
    const updatedUser: User = {
      ...active,
      ...data,
    };

    setUsers((prev) => ({
      ...prev,
      [currentRole]: updatedUser,
      resident: currentRole === 'resident' ? updatedUser : prev.resident,
    }));

    setMembers((prev) =>
      prev.map((m) => {
        const matchesUser =
          m.id === active.id ||
          m.unit.toLowerCase() === active.unit.toLowerCase() ||
          m.email.toLowerCase() === active.email.toLowerCase();
        if (!matchesUser) return m;
        return {
          ...m,
          name: data.name ?? m.name,
          email: data.email ?? m.email,
          phone: data.phone ?? m.phone,
          bio: data.bio ?? m.bio,
          avatar: data.avatar ?? m.avatar,
          interests: data.interests ?? m.interests,
          isPhonePublic: data.isPhonePublic ?? m.isPhonePublic,
          isEmailPublic: data.isEmailPublic ?? m.isEmailPublic,
        };
      })
    );

    logAudit('Profile Updated', `Updated household profile and privacy settings for Flat ${active.unit}`);
    addToast('Profile Updated', 'Your profile details have been saved to the database.', 'success');

    if (API_MODE) {
      try {
        const res = await SocietyApi.auth.updateProfile(data);
        if (res.data) {
          setUsers((prev) => ({
            ...prev,
            [currentRole]: res.data!,
            resident: currentRole === 'resident' ? res.data! : prev.resident,
          }));
        }
      } catch (err) {
        console.error('Failed to sync profile to database:', err);
      }
    }
  };

  // Resident administration (admin only)
  const createResident: SocietyContextType['createResident'] = async (data) => {
    if (!API_MODE) {
      const duplicateUnit = members.find(
        (m) =>
          m.unit.toLowerCase() === data.unit.trim().toLowerCase() ||
          m.email.toLowerCase() === data.email.trim().toLowerCase()
      );
      if (duplicateUnit) {
        const msg = 'A resident with that flat unit or email already exists.';
        addToast('Duplicate Record', msg, 'error');
        return { success: false, message: msg };
      }

      const member: Member = {
        id: `mem_${Date.now()}`,
        name: data.name.trim(),
        unit: data.unit.trim(),
        wing: data.wing.trim(),
        floor: data.floor.trim(),
        role:
          data.role === 'admin'
            ? 'Committee Secretary'
            : `Resident (${data.membershipType})`,
        roleKey: data.role,
        membershipType: data.membershipType,
        isActive: true,
        avatar: '',
        bio: `Resident of Flat ${data.unit.trim()} (${data.wing.trim()})`,
        interests: ['Community', 'Wellness'],
        email: data.email.trim(),
        phone: data.phone.trim(),
        isPhonePublic: false,
        isEmailPublic: false,
      };
      setMembers((prev) => [member, ...prev]);
      logAudit('Resident Onboarded', `Onboarded ${member.name} to Flat ${member.unit} (${member.membershipType})`);
      addToast('Resident Onboarded', `${member.name} assigned to Flat ${member.unit}. Can now sign in immediately.`);
      void SocietyApi.admin.residents.create(data as unknown as Record<string, unknown>);
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
      const target = members.find((m) => m.id === id);
      setMembers((prev) =>
        prev.map((m) => {
          if (m.id !== id) return m;
          const nextMembership =
            (patch.membershipType as Member['membershipType']) || m.membershipType || 'Owner';
          return {
            ...m,
            ...(patch.name ? { name: String(patch.name) } : {}),
            ...(patch.unit ? { unit: String(patch.unit) } : {}),
            ...(patch.wing ? { wing: String(patch.wing) } : {}),
            ...(patch.floor ? { floor: String(patch.floor) } : {}),
            ...(patch.membershipType
              ? {
                  membershipType: nextMembership,
                  role: m.roleKey === 'admin' ? 'Committee Secretary' : `Resident (${nextMembership})`,
                }
              : {}),
            ...(patch.isActive !== undefined ? { isActive: Boolean(patch.isActive) } : {}),
          };
        })
      );

      if (target) {
        setUsers((prev) => {
          const next = { ...prev };
          for (const key of Object.keys(next)) {
            const u = next[key];
            if (u.email.toLowerCase() === target.email.toLowerCase() || u.unit === target.unit) {
              next[key] = {
                ...u,
                ...(patch.name ? { name: String(patch.name) } : {}),
                ...(patch.unit ? { unit: String(patch.unit) } : {}),
                ...(patch.wing ? { wing: String(patch.wing) } : {}),
                ...(patch.floor ? { floor: String(patch.floor) } : {}),
                ...(patch.membershipType
                  ? { membershipType: patch.membershipType as User['membershipType'] }
                  : {}),
              };
            }
          }
          return next;
        });
        logAudit('Resident Updated', `Updated household record for ${patch.name || target.name} (Flat ${patch.unit || target.unit})`);
      }

      addToast('Resident Updated', 'Household record saved.');
      void SocietyApi.admin.residents.update(id, patch);
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
      const removed = members.find((m) => m.id === id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
      if (removed) {
        logAudit('Resident Removed', `Removed ${removed.name} (Flat ${removed.unit}) from society directory`);
      }
      addToast('Resident Removed', 'Household record removed from the directory.');
      void SocietyApi.admin.residents.remove(id);
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
          const updatedItems = alb.mediaItems.map((item) =>
            item.id === mediaId ? { ...item, status: action } : item
          );
          return {
            ...alb,
            count: updatedItems.filter((item) => item.status !== 'rejected').length,
            mediaItems: updatedItems,
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
          const nextItems = [newItem, ...alb.mediaItems];
          return {
            ...alb,
            count: nextItems.filter((item) => item.status !== 'rejected').length,
            mediaItems: nextItems,
          };
        }
        return alb;
      })
    );

    logAudit('Photo Uploaded', `${currentUser.name} uploaded "${title}" to gallery (${newItem.status})`);

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

    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }

    setUsers(INITIAL_USERS);
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
    setBaseSociety(BASE_SOCIETY);
    addToast('Demo State Reset', 'Restored all dynamic seed data and state to defaults.', 'info');
  };

  return (
    <SocietyContext.Provider
      value={{
        currentRole,
        setRole,
        currentUser,
        authReady,
        isAuthenticated,
        enterWithSocietyCode,
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
