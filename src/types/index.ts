export type UserRole = 'resident' | 'admin' | 'security' | 'facility';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  unit: string;
  wing: string;
  floor: string;
  societyName: string;
  avatar: string;
  membershipType: 'Owner' | 'Tenant' | 'Family Member';
  pinCode?: string;
  gender?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  govtIdNumber?: string;
  bio?: string;
  interests?: string[];
  isPhonePublic?: boolean;
  isEmailPublic?: boolean;
}

export type VisitorStatus = 
  | 'expected' 
  | 'pending' 
  | 'approved' 
  | 'denied' 
  | 'checked_in' 
  | 'checked_out' 
  | 'cancelled' 
  | 'expired';

export interface Visitor {
  id: string;
  name: string;
  phone: string;
  visitDate: string;
  arrivalTime: string;
  departureTime?: string;
  purpose: string;
  visitorCount: number;
  vehicleType?: 'None' | 'Two-Wheeler' | 'Car';
  vehicleNumber?: string;
  unit: string;
  residentId: string;
  residentName: string;
  status: VisitorStatus;
  passCode: string;
  createdAt: string;
  approvedAt?: string;
  entryTime?: string;
  exitTime?: string;
  notes?: string;
}

export type AmenityCategory = 'Sports' | 'Fitness' | 'Indoor' | 'Outdoor' | 'Events';

export interface Amenity {
  id: string;
  name: string;
  category: AmenityCategory;
  description: string;
  location: string;
  capacity: number;
  operatingHours: string;
  slotDurationMinutes: number;
  coverImage: string;
  galleryImages: string[];
  rules: string[];
  facilities: string[];
  status: 'available' | 'closed' | 'maintenance';
  bookingHorizonDays: number;
}

export interface BookingSlot {
  id: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  isAvailable: boolean;
}

export type BookingStatus = 'confirmed' | 'checked_in' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  bookingReference: string;
  amenityId: string;
  amenityName: string;
  amenityImage: string;
  unit: string;
  userId: string;
  userName: string;
  date: string;
  timeSlot: string;
  guestCount: number;
  status: BookingStatus;
  qrToken: string;
  notes?: string;
  createdAt: string;
}

export type NoticePriority = 'urgent' | 'high' | 'normal';
export type NoticeCategory = 
  | 'Water Shutdown' 
  | 'Maintenance' 
  | 'Security Alert' 
  | 'AGM Notification' 
  | 'General Rules' 
  | 'Events';

export interface Notice {
  id: string;
  title: string;
  body: string;
  category: NoticeCategory;
  priority: NoticePriority;
  publishDate: string;
  expiryDate?: string;
  author: string;
  attachmentName?: string;
  attachmentSize?: string;
  isRead: boolean;
  requiresAcknowledgement: boolean;
  isAcknowledged: boolean;
  acknowledgedCount?: number;
  totalResidentsCount?: number;
}

export type RSVPStatus = 'attending' | 'tentative' | 'not_attending' | 'none';

export interface SocietyEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  capacity: number;
  attendeesCount: number;
  coverImage: string;
  organizer: string;
  rsvpStatus: RSVPStatus;
  deadline: string;
}

export interface Member {
  id: string;
  name: string;
  unit: string;
  wing: string;
  floor: string;
  role: string;
  roleKey?: UserRole;
  membershipType?: 'Owner' | 'Tenant' | 'Family Member';
  isActive?: boolean;
  temporaryPassword?: string;
  avatar: string;
  bio: string;
  interests: string[];
  email: string;
  phone: string;
  isPhonePublic: boolean;
  isEmailPublic: boolean;
}

export interface MediaItem {
  id: string;
  url: string;
  title: string;
  date: string;
  uploader: string;
  status: 'approved' | 'pending' | 'rejected';
}

export interface Album {
  id: string;
  title: string;
  category: string;
  coverImage: string;
  count: number;
  date: string;
  mediaItems: MediaItem[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'visitor' | 'booking' | 'notice' | 'event' | 'admin';
  time: string;
  isRead: boolean;
  link?: string;
}

export interface SecurityLog {
  id: string;
  visitorName: string;
  unit: string;
  gate: string;
  entryTime?: string;
  exitTime?: string;
  status: 'entry' | 'exit' | 'denied';
  guardName: string;
  passCode: string;
}

export interface FacilityCheckIn {
  id: string;
  bookingReference: string;
  amenityName: string;
  residentName: string;
  unit: string;
  timeSlot: string;
  attendeeCount: number;
  status: 'checked_in' | 'completed';
  checkedInAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  details: string;
}

export interface SocietyInfo {
  id: string;
  name: string;
  address: string;
  totalHouseholds: number;
  totalUnits: number;
  activeResidents: number;
  pendingApprovals: number;
  activeClosures: number;
  nextMaintenanceDate?: string;
  nextMaintenanceNote?: string;
}
