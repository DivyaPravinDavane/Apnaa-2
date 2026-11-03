import type { RowDataPacket } from 'mysql2/promise';
import { ApiError, apiSuccess, getClientIp, getParamAsync, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { execute, query } from '@/lib/server/db';
import { writeAudit } from '@/lib/server/audit';
import { createNotification } from '@/lib/server/notifications';
import { mapBooking } from '@/lib/server/mappers';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export const POST = route<Ctx>(async (request, context) => {
  const user = await requireUser(['resident', 'admin', 'facility', 'security']);
  const id = await getParamAsync(context, 'id');

  const rows = await query<RowDataPacket>('SELECT * FROM bookings WHERE id = ? AND society_id = ? LIMIT 1', [
    id,
    user.societyId,
  ]);
  if (!rows[0]) throw new ApiError(404, 'BOOKING_NOT_FOUND', 'Booking was not found.');
  const booking = mapBooking(rows[0]);

  if (user.role === 'resident' && booking.userId !== user.id) {
    throw new ApiError(403, 'FORBIDDEN', 'You can only cancel your own bookings.');
  }
  if (booking.status === 'cancelled') {
    throw new ApiError(409, 'ALREADY_CANCELLED', 'This booking is already cancelled.');
  }
  if (booking.status === 'completed') {
    throw new ApiError(409, 'INVALID_BOOKING_STATE', 'A completed booking cannot be cancelled.');
  }

  await execute(`UPDATE bookings SET status = 'cancelled' WHERE id = ? AND society_id = ?`, [id, user.societyId]);

  if (booking.userId !== user.id) {
    await createNotification({
      societyId: user.societyId,
      userId: booking.userId,
      title: 'Booking Cancelled',
      message: `${booking.amenityName} on ${booking.date} (${booking.timeSlot}) was cancelled by the society team.`,
      type: 'booking',
      link: '/bookings',
    });
  }

  await writeAudit({
    actor: user,
    action: 'Booking Cancelled',
    details: `Cancelled reservation ${booking.bookingReference} for ${booking.amenityName}.`,
    ip: getClientIp(request),
  });

  const updated = await query<RowDataPacket>('SELECT * FROM bookings WHERE id = ? LIMIT 1', [id]);
  return apiSuccess(mapBooking(updated[0]));
});
