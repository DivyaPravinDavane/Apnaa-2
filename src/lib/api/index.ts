import {
  AuditLog,
  Amenity,
  Booking,
  FacilityCheckIn,
  MediaItem,
  Member,
  Notice,
  NotificationItem,
  SecurityLog,
  SocietyEvent,
  SocietyInfo,
  User,
  Visitor,
} from '@/types';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1').replace(/\/$/, '');
const DATA_SOURCE = process.env.NEXT_PUBLIC_DATA_SOURCE || 'api';
const API_KEY =
  process.env.NEXT_PUBLIC_API_KEY &&
  process.env.NEXT_PUBLIC_API_KEY !== 'replace-with-your-apnaa-api-key'
    ? process.env.NEXT_PUBLIC_API_KEY
    : '';

export interface PublicOverviewData {
  society: SocietyInfo;
  amenities: Amenity[];
  stats: {
    totalHouseholds: number;
    totalUnits: number;
    totalAmenities: number;
    availableAmenities: number;
    activeResidents: number;
    confirmedBookings: number;
    todaysBookings: number;
    expectedVisitors: number;
    pendingVisitors: number;
    checkedInToday: number;
    upcomingEvents: number;
    pendingMedia: number;
  };
  personas: {
    resident: { name: string; unit: string; membershipType: string };
    admin: { name: string; unit: string; membershipType: string };
    security: { name: string; unit: string; membershipType: string };
    facility: { name: string; unit: string; membershipType: string };
  };
}

export interface PollRecord {
  id: string;
  authorName: string;
  authorInitial: string;
  groupName: string;
  timestamp: string;
  title: string;
  subtitle: string;
  expiresOn: string;
  responsesCount: number;
  minSelect: number;
  maxSelect: number;
  candidates: string[];
  votedCandidates?: string[];
}

export interface UnitBillRecord {
  id: string;
  society_id: string;
  unit: string;
  user_id: string;
  invoice_no: string;
  title: string;
  category: 'Statement' | 'Dues' | 'Payment history';
  billing_period: string;
  amount: string | number;
  status: 'unpaid' | 'paid' | 'overdue';
  due_date: string;
  paid_at: string | null;
  payment_method: string | null;
}

export interface GateUpdateRecord {
  id: string;
  unit: string;
  update_type: 'Cab' | 'Exit pass' | 'School bus';
  details: string;
  pass_code: string;
  status: string;
  created_at: string;
}

export interface ServiceRequestRecord {
  id: string;
  unit: string;
  desk_type: 'Service Desk' | 'Request Desk' | 'Helpdesk';
  category: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    perPage?: number;
    timestamp: string;
    [key: string]: unknown;
  };
}

export interface ApiError {
  code: string;
  message: string;
  fields?: Record<string, string[]>;
}

export type ApiResult<T> = { data: T; error?: undefined } | { data?: undefined; error: ApiError };

/**
 * Every request is same-origin by default and always carries the HTTP-only
 * session cookie. No tokens are ever stored in localStorage.
 */
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(API_KEY ? { 'X-API-Key': API_KEY } : {}),
        ...options.headers,
      },
      ...options,
    });

    const text = await res.text();
    const json = text ? JSON.parse(text) : {};

    if (!res.ok) {
      return {
        error: json.error || {
          code: `HTTP_${res.status}`,
          message: json.message || 'An unexpected server error occurred.',
        },
      };
    }

    return { data: json.data as T };
  } catch (err) {
    return {
      error: {
        code: 'NETWORK_ERROR',
        message: err instanceof Error ? err.message : 'Failed to communicate with the API backend.',
      },
    };
  }
}

/**
 * Society API client connected to the remote Hostinger MySQL backend.
 */
export const SocietyApi = {
  isMockMode: () => DATA_SOURCE !== 'api',
  isApiMode: () => DATA_SOURCE === 'api',

  // Authentication & Profile
  auth: {
    session: () => apiFetch<User | null>('/auth/session'),
    requestOtp: (mobile: string) =>
      apiFetch<{ requestId: string; expiresInSeconds: number; devOtp?: string }>('/auth/otp/request', {
        method: 'POST',
        body: JSON.stringify({ mobile }),
      }),
    verifyOtp: (mobile: string, otp: string) =>
      apiFetch<User>('/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ mobile, otp }),
      }),
    loginWithPassword: (login: string, password: string) =>
      apiFetch<User>('/auth/password', {
        method: 'POST',
        body: JSON.stringify({ login, password }),
      }),
    demoLogin: (role: string) =>
      apiFetch<User>('/auth/demo', {
        method: 'POST',
        body: JSON.stringify({ role }),
      }),
    societyCodeLogin: (params: {
      code: string;
      name?: string;
      phone?: string;
      unit?: string;
      role?: string;
    }) =>
      apiFetch<User>('/auth/society-code', {
        method: 'POST',
        body: JSON.stringify(params),
      }),
    logout: () => apiFetch<{ success: boolean }>('/auth/logout', { method: 'POST' }),
    getMe: () => apiFetch<User>('/me'),
    updateProfile: (profile: Partial<User>) =>
      apiFetch<User>('/me/profile', {
        method: 'PATCH',
        body: JSON.stringify(profile),
      }),
  },

  // Visitors
  visitors: {
    list: (status?: string) => apiFetch<Visitor[]>(`/visitors${status ? `?status=${encodeURIComponent(status)}` : ''}`),
    create: (visitor: Partial<Visitor>) =>
      apiFetch<Visitor>('/visitors', {
        method: 'POST',
        body: JSON.stringify(visitor),
      }),
    approve: (id: string) => apiFetch<Visitor>(`/visitors/${encodeURIComponent(id)}/approve`, { method: 'POST' }),
    deny: (id: string, reason?: string) =>
      apiFetch<Visitor>(`/visitors/${encodeURIComponent(id)}/deny`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    checkOut: (id: string) => apiFetch<Visitor>(`/visitors/${encodeURIComponent(id)}/checkout`, { method: 'POST' }),
    verifyPass: (token: string) =>
      apiFetch<{ status: string; message: string; visitor: Visitor }>('/passes/verify', {
        method: 'POST',
        body: JSON.stringify({ token }),
      }),
    checkIn: (token: string, gate: string) =>
      apiFetch<{ success: boolean; status: string; visitor: Visitor }>(
        `/passes/${encodeURIComponent(token)}/check-in`,
        {
          method: 'POST',
          body: JSON.stringify({ gate }),
        }
      ),
  },

  // Amenities & Bookings
  amenities: {
    list: () => apiFetch<Amenity[]>('/amenities'),
    get: (id: string) => apiFetch<Amenity>(`/amenities/${encodeURIComponent(id)}`),
    getAvailability: (id: string, date: string) =>
      apiFetch<{
        amenityId: string;
        date: string;
        status: string;
        bookingHorizonDays: number;
        slots: Array<{
          id: string;
          startTime: string;
          endTime: string;
          capacity: number;
          bookedCount: number;
          isAvailable: boolean;
        }>;
      }>(`/amenities/${encodeURIComponent(id)}/availability?date=${encodeURIComponent(date)}`),
    update: (id: string, patch: Record<string, unknown>) =>
      apiFetch<Amenity>(`/amenities/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      }),
  },

  bookings: {
    list: (status?: string) => apiFetch<Booking[]>(`/bookings${status ? `?status=${encodeURIComponent(status)}` : ''}`),
    listMine: () => apiFetch<Booking[]>('/bookings/mine'),
    create: (booking: Partial<Booking>) =>
      apiFetch<Booking>('/bookings', {
        method: 'POST',
        body: JSON.stringify(booking),
      }),
    cancel: (id: string) =>
      apiFetch<Booking>(`/bookings/${encodeURIComponent(id)}/cancel`, {
        method: 'POST',
      }),
    checkIn: (bookingRef: string) =>
      apiFetch<{ success: boolean; booking: Booking; checkIn: FacilityCheckIn }>(
        `/bookings/${encodeURIComponent(bookingRef)}/check-in`,
        { method: 'POST' }
      ),
  },

  // Community Polls & Candidate Votes
  polls: {
    list: () => apiFetch<PollRecord[]>('/polls'),
    vote: (pollId: string, selectedCandidates: string[]) =>
      apiFetch<{ success: boolean; pollId: string; selectedCount: number; selectedCandidates: string[] }>('/polls', {
        method: 'POST',
        body: JSON.stringify({
          action: 'vote',
          pollId,
          selectedCandidates,
        }),
      }),
    create: (payload: {
      title: string;
      subtitle: string;
      candidates: string[];
      minSelect?: number;
      maxSelect?: number;
    }) =>
      apiFetch<PollRecord>('/polls', {
        method: 'POST',
        body: JSON.stringify({
          action: 'create',
          ...payload,
        }),
      }),
  },

  // Bills, Gate Updates & Service Requests
  services: {
    list: () =>
      apiFetch<{
        bills: UnitBillRecord[];
        gateUpdates: GateUpdateRecord[];
        serviceRequests: ServiceRequestRecord[];
      }>('/services'),
    payBill: (billId?: string, amount?: number) =>
      apiFetch<{ success: boolean }>('/services', {
        method: 'POST',
        body: JSON.stringify({ type: 'pay_bill', billId, amount }),
      }),
    createGateUpdate: (updateType: 'Cab' | 'Exit pass' | 'School bus', details?: string) =>
      apiFetch<{ id: string; updateType: string; details: string; passCode: string }>('/services', {
        method: 'POST',
        body: JSON.stringify({ type: 'gate_update', updateType, details }),
      }),
    createServiceRequest: (payload: {
      deskType: 'Service Desk' | 'Request Desk' | 'Helpdesk';
      category: string;
      title: string;
      description: string;
    }) =>
      apiFetch<{ id: string; deskType: string; category: string; title: string; status: string }>('/services', {
        method: 'POST',
        body: JSON.stringify({ type: 'service_request', ...payload }),
      }),
  },

  // Notices
  notices: {
    list: () => apiFetch<Notice[]>('/notices'),
    markRead: (id: string) =>
      apiFetch<{ success: boolean }>(`/notices/${encodeURIComponent(id)}/read`, { method: 'POST' }),
    acknowledge: (id: string) =>
      apiFetch<{ success: boolean; acknowledgedCount: number }>(
        `/notices/${encodeURIComponent(id)}/acknowledge`,
        { method: 'POST' }
      ),
    create: (notice: Partial<Notice>) =>
      apiFetch<Notice>('/notices', {
        method: 'POST',
        body: JSON.stringify(notice),
      }),
  },

  // Events
  events: {
    list: () => apiFetch<SocietyEvent[]>('/events'),
    updateRsvp: (id: string, rsvpStatus: string) =>
      apiFetch<{ success: boolean; rsvpStatus: string; attendeesCount: number }>(
        `/events/${encodeURIComponent(id)}/rsvp`,
        { method: 'PUT', body: JSON.stringify({ rsvpStatus }) }
      ),
    create: (event: Partial<SocietyEvent>) =>
      apiFetch<SocietyEvent>('/events', {
        method: 'POST',
        body: JSON.stringify(event),
      }),
  },

  // Members Directory
  directory: {
    list: (search?: string, wing?: string) =>
      apiFetch<Member[]>(
        `/directory?search=${encodeURIComponent(search || '')}&wing=${encodeURIComponent(wing || '')}`
      ),
  },

  // Gallery
  gallery: {
    albums: () => apiFetch<import('@/types').Album[]>('/albums'),
    upload: (albumId: string, title: string, url: string) =>
      apiFetch<MediaItem>(`/albums/${encodeURIComponent(albumId)}/media`, {
        method: 'POST',
        body: JSON.stringify({ title, url }),
      }),
    moderate: (albumId: string, mediaId: string, action: string) =>
      apiFetch<{ success: boolean; status: string }>('/media/moderate', {
        method: 'POST',
        body: JSON.stringify({ albumId, mediaId, action }),
      }),
  },

  // Notifications
  notifications: {
    list: () => apiFetch<NotificationItem[]>('/notifications'),
    markRead: (id: string) =>
      apiFetch<{ success: boolean }>(`/notifications/${encodeURIComponent(id)}/read`, { method: 'POST' }),
    markAllRead: () => apiFetch<{ success: boolean }>('/notifications/read-all', { method: 'POST' }),
  },

  // Operational logs
  security: {
    logs: () => apiFetch<SecurityLog[]>('/security/logs'),
  },
  facility: {
    checkIns: () => apiFetch<FacilityCheckIn[]>('/facility/check-ins'),
  },
  audit: {
    list: () => apiFetch<AuditLog[]>('/audit-logs'),
  },

  admin: {
    residents: {
      list: () => apiFetch<Member[]>('/admin/residents'),
      create: (resident: Record<string, unknown>) =>
        apiFetch<Member>('/admin/residents', {
          method: 'POST',
          body: JSON.stringify(resident),
        }),
      update: (id: string, patch: Record<string, unknown>) =>
        apiFetch<Member>(`/admin/residents/${encodeURIComponent(id)}`, {
          method: 'PATCH',
          body: JSON.stringify(patch),
        }),
      remove: (id: string) =>
        apiFetch<{ success: boolean }>(`/admin/residents/${encodeURIComponent(id)}`, {
          method: 'DELETE',
        }),
    },
  },

  society: {
    get: () => apiFetch<import('@/types').SocietyInfo>('/society'),
  },

  public: {
    overview: () => apiFetch<PublicOverviewData>('/public/overview'),
  },

  health: () => apiFetch<{ status: string; database: string; apiKeyConfigured?: boolean }>('/health'),
};
