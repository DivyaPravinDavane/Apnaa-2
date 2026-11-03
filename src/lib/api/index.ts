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
  User,
  Visitor,
} from '@/types';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1').replace(/\/$/, '');
const DATA_SOURCE = process.env.NEXT_PUBLIC_DATA_SOURCE || 'mock';

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
 * Society API client. Works in both mock mode (no network) and API mode.
 * Components should read `isApiMode()` before assuming persistence.
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

  health: () => apiFetch<{ status: string; database: string }>('/health'),
};
