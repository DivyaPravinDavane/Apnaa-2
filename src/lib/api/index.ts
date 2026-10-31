import {
  Visitor,
  Amenity,
  Booking,
  Notice,
  SocietyEvent,
  Member,
  Album,
  NotificationItem,
  User,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
const DATA_SOURCE = process.env.NEXT_PUBLIC_DATA_SOURCE || 'mock';

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    perPage?: number;
    timestamp: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
  fields?: Record<string, string[]>;
}

/**
 * Standard HTTP Request Wrapper for PHP REST API
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: ApiError }> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const json = await res.json();

    if (!res.ok) {
      return {
        error: json.error || {
          code: `HTTP_${res.status}`,
          message: json.message || 'An unexpected server error occurred.',
        },
      };
    }

    return { data: json.data };
  } catch (err: any) {
    return {
      error: {
        code: 'NETWORK_ERROR',
        message: err.message || 'Failed to communicate with PHP API backend.',
      },
    };
  }
}

/**
 * Society API Client
 * Designed for seamless swap from mock state to PHP REST API.
 */
export const SocietyApi = {
  // Mode flag
  isMockMode: () => DATA_SOURCE === 'mock',

  // Authentication & Profile
  auth: {
    requestOtp: (mobile: string) => apiFetch<{ requestId: string }>('/auth/otp/request', {
      method: 'POST',
      body: JSON.stringify({ mobile }),
    }),
    verifyOtp: (mobile: string, otp: string) => apiFetch<{ token: string; user: User }>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ mobile, otp }),
    }),
    getMe: () => apiFetch<User>('/me'),
    updateProfile: (profile: Partial<User>) => apiFetch<User>('/me/profile', {
      method: 'PATCH',
      body: JSON.stringify(profile),
    }),
  },

  // Visitors
  visitors: {
    list: (status?: string) => apiFetch<Visitor[]>(`/visitors${status ? `?status=${status}` : ''}`),
    create: (visitor: Partial<Visitor>) => apiFetch<Visitor>('/visitors', {
      method: 'POST',
      body: JSON.stringify(visitor),
    }),
    approve: (id: string) => apiFetch<Visitor>(`/visitors/${id}/approve`, { method: 'POST' }),
    deny: (id: string, reason?: string) => apiFetch<Visitor>(`/visitors/${id}/deny`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
    verifyPass: (token: string) => apiFetch<{ status: string; visitor: Visitor }>('/passes/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),
    checkIn: (token: string, gate: string) => apiFetch<{ success: boolean; visitor: Visitor }>(`/passes/${token}/check-in`, {
      method: 'POST',
      body: JSON.stringify({ gate }),
    }),
  },

  // Amenities & Bookings
  amenities: {
    list: () => apiFetch<Amenity[]>('/amenities'),
    get: (id: string) => apiFetch<Amenity>(`/amenities/${id}`),
    getAvailability: (id: string, date: string) => apiFetch<any>(`/amenities/${id}/availability?date=${date}`),
  },

  bookings: {
    listMine: () => apiFetch<Booking[]>('/bookings/mine'),
    create: (booking: Partial<Booking>) => apiFetch<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(booking),
    }),
    cancel: (id: string) => apiFetch<{ success: boolean }>(`/bookings/${id}/cancel`, {
      method: 'POST',
    }),
    checkIn: (bookingRef: string) => apiFetch<{ success: boolean }>(`/bookings/${bookingRef}/check-in`, {
      method: 'POST',
    }),
  },

  // Notices
  notices: {
    list: () => apiFetch<Notice[]>('/notices'),
    acknowledge: (id: string) => apiFetch<{ success: boolean }>(`/notices/${id}/acknowledge`, {
      method: 'POST',
    }),
    create: (notice: Partial<Notice>) => apiFetch<Notice>('/notices', {
      method: 'POST',
      body: JSON.stringify(notice),
    }),
  },

  // Events
  events: {
    list: () => apiFetch<SocietyEvent[]>('/events'),
    updateRsvp: (id: string, rsvpStatus: string) => apiFetch<{ success: boolean }>(`/events/${id}/rsvp`, {
      method: 'PUT',
      body: JSON.stringify({ rsvpStatus }),
    }),
  },

  // Members Directory
  directory: {
    list: (search?: string, wing?: string) => apiFetch<Member[]>(`/directory?search=${search || ''}&wing=${wing || ''}`),
  },

  // Gallery
  gallery: {
    albums: () => apiFetch<Album[]>('/albums'),
    moderate: (albumId: string, mediaId: string, action: string) => apiFetch<{ success: boolean }>('/media/moderate', {
      method: 'POST',
      body: JSON.stringify({ albumId, mediaId, action }),
    }),
  },
};
