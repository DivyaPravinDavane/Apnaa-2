import type { RowDataPacket } from 'mysql2/promise';
import { ApiError, apiSuccess, getClientIp, getParamAsync, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { execute, query } from '@/lib/server/db';
import { writeAudit } from '@/lib/server/audit';
import { newId, timeInIst } from '@/lib/server/ids';
import { mapBooking, mapFacilityCheckIn } from '@/lib/server/mappers';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export const POST = route<Ctx>(async (request, context) => {
  const user = await requireUser(['facility', 'admin', 'security']);
  const reference = decodeURIComponent(await getParamAsync(context, 'id'));

  const rows = await query<RowDataPacket>(
    `SELECT * FROM bookings
     WHERE society_id = ? AND (id = ? OR booking_reference = ?)
     LIMIT 1`,
    [user.societyId, reference, reference.toUpperCase()]
  );
  if (!rows[0]) throw new ApiError(404, 'BOOKING_NOT_FOUND', 'Reservation reference was not found.');
  const booking = mapBooking(rows[0]);

  if (booking.status === 'cancelled') {
    throw new ApiError(409, 'BOOKING_CANCELLED', 'This reservation has been cancelled.');
  }
  if (booking.status === 'checked_in') {
    throw new ApiError(409, 'ALREADY_CHECKED_IN', 'This reservation is already checked in.');
  }
  if (booking.status === 'completed') {
    throw new ApiError(409, 'INVALID_BOOKING_STATE', 'This reservation is already completed.');
  }

  const checkedInAt = timeInIst();
  await execute(`UPDATE bookings SET status = 'checked_in' WHERE id = ? AND society_id = ?`, [
    booking.id,
    user.societyId,
  ]);

  const checkInId = newId('fac');
  await execute(
    `INSERT INTO facility_check_ins
      (id, society_id, booking_id, booking_reference, amenity_name, resident_name, unit,
       time_slot, attendee_count, status, checked_in_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'checked_in', ?)`,
    [
      checkInId,
      user.societyId,
      booking.id,
      booking.bookingReference,
      booking.amenityName,
      booking.userName,
      booking.unit,
      booking.timeSlot,
      booking.guestCount,
      checkedInAt,
    ]
  );

  await writeAudit({
    actor: user,
    action: 'Facility Check-In',
    details: `Verified reservation ${booking.bookingReference} for ${booking.userName}.`,
    ip: getClientIp(request),
  });

  const updatedBooking = await query<RowDataPacket>('SELECT * FROM bookings WHERE id = ? LIMIT 1', [booking.id]);
  const checkIn = await query<RowDataPacket>('SELECT * FROM facility_check_ins WHERE id = ? LIMIT 1', [checkInId]);

  return apiSuccess({
    success: true,
    booking: mapBooking(updatedBooking[0]),
    checkIn: mapFacilityCheckIn(checkIn[0]),
  });
});
