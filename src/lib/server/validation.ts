import { z } from 'zod';

export const idSchema = z.string().trim().min(1).max(64);
const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format.');
const phoneSchema = z
  .string()
  .trim()
  .min(7, 'Enter a valid phone number.')
  .max(20, 'Phone number is too long.')
  .regex(/^[+\d][\d\s\-()]+$/, 'Enter a valid phone number.');
const httpUrlSchema = z
  .string()
  .trim()
  .max(512)
  .regex(/^https?:\/\/[^\s]+$/i, 'Enter a valid http(s) URL.');

export const otpRequestSchema = z.object({
  mobile: phoneSchema,
});

export const otpVerifySchema = z.object({
  mobile: phoneSchema,
  otp: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code.'),
});

export const passwordLoginSchema = z.object({
  login: z.string().trim().min(3, 'Enter your email or phone.').max(190),
  password: z.string().min(8, 'Password must be at least 8 characters.').max(200),
});

export const demoLoginSchema = z.object({
  role: z.enum(['resident', 'admin', 'security', 'facility']),
});

export const societyCodeLoginSchema = z.object({
  code: z.string().trim(),
  role: z.enum(['resident', 'admin', 'security', 'facility']).optional(),
});

export const profileUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    email: z.string().email().max(190).optional(),
    phone: phoneSchema.optional(),
    bio: z.string().max(1000).optional(),
    gender: z.string().trim().max(24).optional(),
    dateOfBirth: z.string().trim().max(32).optional(),
    bloodGroup: z.string().trim().max(16).optional(),
    govtIdNumber: z.string().trim().max(64).optional(),
    interests: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
    isPhonePublic: z.boolean().optional(),
    isEmailPublic: z.boolean().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'Nothing to update.');

export const visitorCreateSchema = z.object({
  name: z.string().trim().min(2, 'Visitor name is required.').max(120),
  phone: phoneSchema,
  visitDate: dateSchema.optional(),
  arrivalTime: z.string().trim().min(1).max(16).optional(),
  departureTime: z.string().trim().max(16).optional().nullable(),
  purpose: z.string().trim().min(1).max(160).default('Visit'),
  visitorCount: z.coerce.number().int().min(1).max(20).default(1),
  vehicleType: z.enum(['None', 'Two-Wheeler', 'Car']).default('None'),
  vehicleNumber: z.string().trim().max(32).optional().default(''),
  unit: z.string().trim().max(32).optional(),
  notes: z.string().trim().max(1000).optional().default(''),
  passCode: z.string().trim().regex(/^V-\d{4,8}$/).optional(),
});

export const visitorDenySchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export const passVerifySchema = z.object({
  token: z.string().trim().min(1).max(128),
});

export const passCheckInSchema = z.object({
  gate: z.string().trim().min(1).max(120).default('Gate 1 - Main Entrance'),
});

export const bookingCreateSchema = z.object({
  amenityId: idSchema,
  date: dateSchema,
  timeSlot: z.string().trim().min(1).max(32),
  guestCount: z.coerce.number().int().min(1).max(20).default(1),
  notes: z.string().trim().max(1000).optional().default(''),
  bookingReference: z.string().trim().regex(/^BK-\d{4,8}$/).optional(),
});

export const noticeCreateSchema = z.object({
  title: z.string().trim().min(4).max(200),
  body: z.string().trim().min(10).max(10000),
  category: z.enum([
    'Water Shutdown',
    'Maintenance',
    'Security Alert',
    'AGM Notification',
    'General Rules',
    'Events',
  ]),
  priority: z.enum(['urgent', 'high', 'normal']).default('normal'),
  publishDate: dateSchema,
  expiryDate: dateSchema.optional().nullable(),
  attachmentName: z.string().trim().max(190).optional().nullable(),
  attachmentSize: z.string().trim().max(32).optional().nullable(),
  requiresAcknowledgement: z.boolean().default(false),
});

export const eventCreateSchema = z.object({
  title: z.string().trim().min(4).max(200),
  description: z.string().trim().min(10).max(10000),
  category: z.string().trim().min(2).max(64),
  date: dateSchema,
  time: z.string().trim().min(1).max(64),
  venue: z.string().trim().min(2).max(160),
  capacity: z.coerce.number().int().min(1).max(10000),
  coverImage: httpUrlSchema.optional().default(''),
  organizer: z.string().trim().min(2).max(160),
  deadline: dateSchema.optional().nullable(),
});

export const rsvpSchema = z.object({
  rsvpStatus: z.enum(['attending', 'tentative', 'not_attending', 'none']),
});

export const mediaUploadSchema = z.object({
  title: z.string().trim().min(2).max(190),
  url: httpUrlSchema,
});

export const mediaModerateSchema = z.object({
  albumId: idSchema,
  mediaId: idSchema,
  action: z.enum(['approved', 'rejected']),
});

export const residentCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email().max(190),
  phone: phoneSchema,
  unit: z.string().trim().min(1).max(32),
  wing: z.string().trim().min(1).max(64),
  floor: z.string().trim().min(1).max(32),
  role: z.enum(['resident', 'admin', 'security', 'facility']).default('resident'),
  membershipType: z.enum(['Owner', 'Tenant', 'Family Member']).default('Owner'),
  password: z.string().min(12, 'Password must be at least 12 characters.').max(200).optional(),
});

export const residentUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    email: z.string().email().max(190).optional(),
    phone: phoneSchema.optional(),
    unit: z.string().trim().min(1).max(32).optional(),
    wing: z.string().trim().min(1).max(64).optional(),
    floor: z.string().trim().min(1).max(32).optional(),
    role: z.enum(['resident', 'admin', 'security', 'facility']).optional(),
    membershipType: z.enum(['Owner', 'Tenant', 'Family Member']).optional(),
    isActive: z.boolean().optional(),
    password: z.string().min(12, 'Password must be at least 12 characters.').max(200).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'Nothing to update.');

export const adminAmenityUpdateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  capacity: z.coerce.number().int().min(1).max(5000).optional(),
  operatingHours: z.string().trim().min(1).max(64).optional(),
  slotDurationMinutes: z.coerce.number().int().min(15).max(480).optional(),
  status: z.enum(['available', 'closed', 'maintenance']).optional(),
  bookingHorizonDays: z.coerce.number().int().min(1).max(90).optional(),
  description: z.string().trim().min(10).max(10000).optional(),
  location: z.string().trim().min(1).max(160).optional(),
  rules: z.array(z.string().trim().min(1).max(300)).max(50).optional(),
  facilities: z.array(z.string().trim().min(1).max(120)).max(50).optional(),
});

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(100),
  offset: z.coerce.number().int().min(0).default(0),
});
