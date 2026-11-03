import type { RowDataPacket } from 'mysql2/promise';
import { z } from 'zod';
import { ApiError, apiSuccess, getParamAsync, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { query } from '@/lib/server/db';
import { mapAmenity } from '@/lib/server/mappers';
import { todayInIst } from '@/lib/server/ids';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

function parseTimeToMinutes(value: string): number | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hours += 12;
  return hours * 60 + Number(match[2]);
}

function formatMinutes(minutes: number): string {
  const hours24 = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  const suffix = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${String(mins).padStart(2, '0')} ${suffix}`;
}

export const GET = route<Ctx>(async (request, context) => {
  const user = await requireUser();
  const id = await getParamAsync(context, 'id');
  const parsedDate = dateSchema.safeParse(request.nextUrl.searchParams.get('date') || '');
  if (!parsedDate.success) throw new ApiError(422, 'VALIDATION_ERROR', 'A valid ?date=YYYY-MM-DD is required.');
  const date = parsedDate.data;

  if (date < todayInIst()) {
    throw new ApiError(422, 'DATE_IN_PAST', 'Availability can only be requested for today or a future date.');
  }

  const rows = await query<RowDataPacket>('SELECT * FROM amenities WHERE id = ? AND society_id = ? LIMIT 1', [
    id,
    user.societyId,
  ]);
  if (!rows[0]) throw new ApiError(404, 'AMENITY_NOT_FOUND', 'Amenity was not found.');
  const amenity = mapAmenity(rows[0]);

  const [startRaw, endRaw] = amenity.operatingHours.split('-').map((part) => part.trim());
  const start = parseTimeToMinutes(startRaw);
  const end = parseTimeToMinutes(endRaw);
  if (start === null || end === null || end <= start) {
    throw new ApiError(500, 'INVALID_OPERATING_HOURS', 'This amenity has invalid operating hours.');
  }

  const duration = amenity.slotDurationMinutes > 0 ? amenity.slotDurationMinutes : 60;
  const booked = await query<RowDataPacket>(
    `SELECT time_slot FROM bookings
     WHERE amenity_id = ? AND booking_date = ? AND status <> 'cancelled'`,
    [amenity.id, date]
  );
  const bookedSlots = new Set(booked.map((row) => String(row.time_slot)));

  const slots = [];
  for (let cursor = start; cursor + duration <= end && slots.length < 48; cursor += duration) {
    const startLabel = formatMinutes(cursor);
    const endLabel = formatMinutes(cursor + duration);
    const timeSlot = `${startLabel} - ${endLabel}`;
    const isBooked = bookedSlots.has(timeSlot);
    slots.push({
      id: `${amenity.id}|${date}|${timeSlot}`,
      startTime: startLabel,
      endTime: endLabel,
      capacity: amenity.capacity,
      bookedCount: isBooked ? 1 : 0,
      isAvailable: amenity.status === 'available' && !isBooked,
    });
  }

  return apiSuccess({
    amenityId: amenity.id,
    date,
    status: amenity.status,
    bookingHorizonDays: amenity.bookingHorizonDays,
    slots,
  });
});
