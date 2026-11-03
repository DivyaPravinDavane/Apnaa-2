import type {
  Album,
  Amenity,
  AuditLog,
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

// Database rows are dynamically shaped; each mapper reads only the columns it
// selects, so a permissive row type keeps the transform readable.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

const bool = (value: unknown) => Boolean(Number(value));

function jsonArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function dateOnly(value: unknown): string {
  if (!value) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  const raw = String(value);
  const normalised = /Z$|[+-]\d{2}:?\d{2}$/.test(raw) ? raw : `${raw.replace(' ', 'T')}Z`;
  const date = new Date(normalised);
  return Number.isNaN(date.getTime()) ? null : date;
}

function timeAgo(value: unknown): string {
  const date = toDate(value);
  if (!date) return '';
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateTime(value: unknown): string {
  const date = toDate(value);
  if (!date) return '';
  return date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

export function mapUser(row: Row): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    unit: row.unit,
    wing: row.wing,
    floor: row.floor,
    societyName: row.society_name || row.societyName || '',
    avatar: row.avatar,
    membershipType: row.membership_type,
    bio: row.bio || undefined,
    interests: jsonArray(row.interests),
    isPhonePublic: bool(row.is_phone_public),
    isEmailPublic: bool(row.is_email_public),
  };
}

export function mapMember(row: Row): Member {
  return {
    id: row.id,
    name: row.name,
    unit: row.unit,
    wing: row.wing,
    floor: row.floor,
    role: row.role === 'admin' ? 'Committee Secretary' : `Resident (${row.membership_type})`,
    roleKey: row.role,
    membershipType: row.membership_type,
    isActive: row.is_active === undefined ? true : bool(row.is_active),
    avatar: row.avatar,
    bio: row.bio || '',
    interests: jsonArray(row.interests),
    email: row.email,
    phone: row.phone,
    isPhonePublic: bool(row.is_phone_public),
    isEmailPublic: bool(row.is_email_public),
  };
}

export function mapSociety(row: Row): SocietyInfo {
  return {
    id: row.id,
    name: row.name,
    address: row.address || '',
    totalHouseholds: Number(row.total_households || 0),
    totalUnits: Number(row.total_units || 0),
    activeResidents: Number(row.active_residents || 0),
    pendingApprovals: Number(row.pending_approvals || 0),
    activeClosures: Number(row.active_closures || 0),
    nextMaintenanceDate: row.next_maintenance_date ? dateOnly(row.next_maintenance_date) : undefined,
    nextMaintenanceNote: row.next_maintenance_note || undefined,
  };
}

export function mapVisitor(row: Row): Visitor {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    visitDate: dateOnly(row.visit_date),
    arrivalTime: row.arrival_time,
    departureTime: row.departure_time || undefined,
    purpose: row.purpose,
    visitorCount: Number(row.visitor_count),
    vehicleType: row.vehicle_type,
    vehicleNumber: row.vehicle_number || undefined,
    unit: row.unit,
    residentId: row.resident_id,
    residentName: row.resident_name,
    status: row.status,
    passCode: row.pass_code,
    createdAt: toDate(row.created_at)?.toISOString() || String(row.created_at || ''),
    approvedAt: toDate(row.approved_at)?.toISOString(),
    entryTime: row.entry_time || undefined,
    exitTime: row.exit_time || undefined,
    notes: row.notes || undefined,
  };
}

export function mapAmenity(row: Row): Amenity {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description,
    location: row.location,
    capacity: Number(row.capacity),
    operatingHours: row.operating_hours,
    slotDurationMinutes: Number(row.slot_duration_minutes),
    coverImage: row.cover_image,
    galleryImages: jsonArray(row.gallery_images),
    rules: jsonArray(row.rules),
    facilities: jsonArray(row.facilities),
    status: row.status,
    bookingHorizonDays: Number(row.booking_horizon_days),
  };
}

export function mapBooking(row: Row): Booking {
  return {
    id: row.id,
    bookingReference: row.booking_reference,
    amenityId: row.amenity_id,
    amenityName: row.amenity_name,
    amenityImage: row.amenity_image,
    unit: row.unit,
    userId: row.user_id,
    userName: row.user_name,
    date: dateOnly(row.booking_date),
    timeSlot: row.time_slot,
    guestCount: Number(row.guest_count),
    status: row.status,
    qrToken: row.qr_token,
    notes: row.notes || undefined,
    createdAt: toDate(row.created_at)?.toISOString() || String(row.created_at || ''),
  };
}

export function mapNotice(row: Row): Notice {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    category: row.category,
    priority: row.priority,
    publishDate: dateOnly(row.publish_date),
    expiryDate: row.expiry_date ? dateOnly(row.expiry_date) : undefined,
    author: row.author,
    attachmentName: row.attachment_name || undefined,
    attachmentSize: row.attachment_size || undefined,
    isRead: bool(row.is_read),
    requiresAcknowledgement: bool(row.requires_acknowledgement),
    isAcknowledged: bool(row.is_acknowledged),
    acknowledgedCount: Number(row.acknowledged_baseline || 0) + Number(row.acknowledged_count || 0),
    totalResidentsCount: Number(row.total_residents_count || 0),
  };
}

export function mapEvent(row: Row): SocietyEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    date: dateOnly(row.event_date),
    time: row.event_time,
    venue: row.venue,
    capacity: Number(row.capacity),
    attendeesCount: Number(row.attendees_baseline || 0) + Number(row.rsvp_count || 0),
    coverImage: row.cover_image,
    organizer: row.organizer,
    rsvpStatus: row.rsvp_status || 'none',
    deadline: row.deadline ? dateOnly(row.deadline) : '',
  };
}

export function mapMediaItem(row: Row): MediaItem {
  return {
    id: row.id,
    url: row.url,
    title: row.title,
    date: toDate(row.media_date)?.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }) || dateOnly(row.media_date),
    uploader: row.uploader_name,
    status: row.status,
  };
}

export function mapAlbum(row: Row, media: MediaItem[]): Album {
  const approved = media.filter((item) => item.status === 'approved');
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    coverImage: row.cover_image,
    count: media.length,
    date: toDate(row.album_date)?.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }) || dateOnly(row.album_date),
    // Non-admins only ever receive approved media from the API, but keep the
    // count honest for the album tile.
    mediaItems: media.length ? media : approved,
  };
}

export function mapNotification(row: Row): NotificationItem {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    type: row.type,
    time: timeAgo(row.created_at),
    isRead: bool(row.is_read),
    link: row.link || undefined,
  };
}

export function mapSecurityLog(row: Row): SecurityLog {
  return {
    id: row.id,
    visitorName: row.visitor_name,
    unit: row.unit,
    gate: row.gate,
    entryTime: row.entry_time || undefined,
    exitTime: row.exit_time || undefined,
    status: row.status,
    guardName: row.guard_name,
    passCode: row.pass_code,
  };
}

export function mapFacilityCheckIn(row: Row): FacilityCheckIn {
  return {
    id: row.id,
    bookingReference: row.booking_reference,
    amenityName: row.amenity_name,
    residentName: row.resident_name,
    unit: row.unit,
    timeSlot: row.time_slot,
    attendeeCount: Number(row.attendee_count),
    status: row.status,
    checkedInAt: row.checked_in_at,
  };
}

export function mapAuditLog(row: Row): AuditLog {
  return {
    id: row.id,
    action: row.action,
    actor: row.actor_name,
    timestamp: formatDateTime(row.created_at),
    details: row.details,
  };
}
