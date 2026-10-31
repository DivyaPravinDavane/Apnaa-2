'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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

export function SocietyProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setRoleState] = useState<UserRole>('resident');
  const [users, setUsers] = useState<Record<string, User>>(INITIAL_USERS);
  const [visitors, setVisitors] = useState<Visitor[]>(INITIAL_VISITORS);
  const [amenities, setAmenities] = useState<Amenity[]>(INITIAL_AMENITIES);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [notices, setNotices] = useState<Notice[]>(INITIAL_NOTICES);
  const [events, setEvents] = useState<SocietyEvent[]>(INITIAL_EVENTS);
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [albums, setAlbums] = useState<Album[]>(INITIAL_ALBUMS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>(INITIAL_SECURITY_LOGS);
  const [facilityCheckIns, setFacilityCheckIns] = useState<FacilityCheckIn[]>(INITIAL_FACILITY_CHECKINS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const currentUser = useMemo(() => {
    return users[currentRole] || users.resident;
  }, [currentRole, users]);

  const addToast = (title: string, message?: string, type: ToastMessage['type'] = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

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

  const setRole = (role: UserRole) => {
    setRoleState(role);
    addToast('Demonstration Role Changed', `Now viewing as ${role.toUpperCase()}: ${users[role].name}`, 'info');
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

    return newVisitor;
  };

  const checkInVisitor = (idOrPassCode: string, gate: string = 'Gate 1 - Main Entrance') => {
    const trimmed = idOrPassCode.trim().toUpperCase();
    const visitor = visitors.find(
      (v) => v.id === idOrPassCode || v.passCode.toUpperCase() === trimmed
    );

    if (!visitor) {
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
  };

  const checkInFacilityBooking = (bookingRef: string) => {
    const trimmed = bookingRef.trim().toUpperCase();
    const booking = bookings.find((b) => b.bookingReference.toUpperCase() === trimmed);

    if (!booking) {
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

    return { success: true, message: `Check-in recorded for ${booking.userName}`, checkIn };
  };

  // Notices
  const markNoticeRead = (id: string) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
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
  };

  const createNotice = (data: Omit<Notice, 'id' | 'isRead' | 'isAcknowledged' | 'acknowledgedCount' | 'totalResidentsCount'>): Notice => {
    const newNotice: Notice = {
      ...data,
      id: `not_${Date.now()}`,
      isRead: false,
      isAcknowledged: false,
      acknowledgedCount: 0,
      totalResidentsCount: 248,
    };
    setNotices((prev) => [newNotice, ...prev]);
    logAudit('Notice Published', `Published notice: "${newNotice.title}" (${newNotice.priority})`);
    addToast('Notice Published', `"${newNotice.title}" has been broadcast to all residents.`);
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
  };

  // Notifications
  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    addToast('Notifications Cleared', 'All notifications marked as read.');
  };

  // Reset
  const resetDemoData = () => {
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
    addToast('Demo State Reset', 'Restored all seed data and state to original demonstration defaults.', 'info');
  };

  return (
    <SocietyContext.Provider
      value={{
        currentRole,
        setRole,
        currentUser,
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
        notices,
        markNoticeRead,
        acknowledgeNotice,
        createNotice,
        events,
        updateEventRSVP,
        createEvent,
        members,
        updateUserProfile,
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
