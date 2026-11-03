import type { RowDataPacket } from 'mysql2/promise';
import { ApiError, apiSuccess, getClientIp, readJson, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { execute, query } from '@/lib/server/db';
import { writeAudit } from '@/lib/server/audit';
import { createNotification } from '@/lib/server/notifications';
import { newId, todayInIst, uniqueBookingReference } from '@/lib/server/ids';
import { mapAmenity, mapBooking } from '@/lib/server/mappers';
import { bookingCreateSchema } from '@/lib/server/validation';
import { buildAmenitySlots } from '@/lib/server/amenity-slots';

export const dynamic = 'force-dynamic';

export const GET = route(async (request) => {
  const user = await requireUser();
  const status = request.nextUrl.searchParams.get('status');
  const conditions = ['b.society_id = ?'];
  const params: unknown[] = [user.societyId];

  if (!['admin', 'facility'].includes(user.role)) {
    conditions.push('b.user_id = ?');
    params.push(user.id);
  }
  if (status && ['confirmed', 'checked_in', 'completed', 'cancelled'].includes(status)) {
    conditions.push('b.status = ?');
    params.push(status);
  }

  const rows = await query<RowDataPacket>(
    `SELECT b.* FROM bookings b
     WHERE ${conditions.join(' AND ')}
     ORDER BY b.booking_date DESC, b.created_at DESC
     LIMIT 200`,
    params
  );
  return apiSuccess(rows.map(mapBooking));
});

export const POST = route(async (request) => {
  const user = await requireUser(['resident', 'admin']);
  const input = await readJson(request, bookingCreateSchema);
  const today = todayInIst();

  const amenityRows = await query<RowDataPacket>('SELECT * FROM amenities WHERE id = ? AND society_id = ? LIMIT 1', [
    input.amenityId,
    user.societyId,
  ]);
  if (!amenityRows[0]) throw new ApiError(404, 'AMENITY_NOT_FOUND', 'Amenity was not found.');
  const amenity = mapAmenity(amenityRows[0]);

  if (amenity.status !== 'available') {
    throw new ApiError(409, 'AMENITY_UNAVAILABLE', 'This amenity is currently not accepting bookings.');
  }
  if (input.date < today) {
    throw new ApiError(422, 'DATE_IN_PAST', 'Bookings cannot be made for a past date.');
  }
  const horizon = new Date(`${today}T00:00:00Z`);
  horizon.setUTCDate(horizon.getUTCDate() + amenity.bookingHorizonDays);
  if (input.date > horizon.toISOString().slice(0, 10)) {
    throw new ApiError(422, 'OUTSIDE_BOOKING_HORIZON', `Bookings open ${amenity.bookingHorizonDays} days in advance.`);
  }

  const validSlots = buildAmenitySlots(amenity.operatingHours, amenity.slotDurationMinutes);
  if (!validSlots.some((slot) => slot.timeSlot === input.timeSlot)) {
    throw new ApiError(422, 'INVALID_SLOT', 'That time slot is not offered for this amenity.');
  }

  const existing = await query<RowDataPacket>(
    `SELECT id FROM bookings
     WHERE amenity_id = ? AND booking_date = ? AND time_slot = ? AND status <> 'cancelled'
     LIMIT 1`,
    [amenity.id, input.date, input.timeSlot]
  );
  if (existing.length) {
    throw new ApiError(409, 'SLOT_TAKEN', 'This time slot has already been booked. Please choose another.');
  }

  const id = newId('bk');
  const bookingReference = await uniqueBookingReference();
  const qrToken = `SOCIETY|${bookingReference}|${amenity.id}|${input.date}`;

  try {
    await execute(
      `INSERT INTO bookings
        (id, society_id, booking_reference, amenity_id, amenity_name, amenity_image, unit, user_id,
         user_name, booking_date, time_slot, guest_count, status, qr_token, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?)`,
      [
        id,
        user.societyId,
        bookingReference,
        amenity.id,
        amenity.name,
        amenity.coverImage,
        user.unit,
        user.id,
        user.name,
        input.date,
        input.timeSlot,
        input.guestCount,
        qrToken,
        input.notes || null,
      ]
    );
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === 'ER_DUP_ENTRY') {
      // The unique generated column is the final guard against two residents
      // racing for the same slot.
      throw new ApiError(409, 'SLOT_TAKEN', 'This time slot has already been booked. Please choose another.');
    }
    throw error;
  }

  await createNotification({
    societyId: user.societyId,
    userId: user.id,
    title: 'Amenity Reservation Confirmed',
    message: `${amenity.name} on ${input.date} (${input.timeSlot}) is confirmed. Reference ${bookingReference}.`,
    type: 'booking',
    link: '/bookings',
  });

  await writeAudit({
    actor: user,
    action: 'Amenity Booked',
    details: `Booked ${amenity.name} on ${input.date} (${input.timeSlot}) - ${bookingReference}.`,
    ip: getClientIp(request),
  });

  const rows = await query<RowDataPacket>('SELECT * FROM bookings WHERE id = ? LIMIT 1', [id]);
  return apiSuccess(mapBooking(rows[0]), undefined, 201);
});
