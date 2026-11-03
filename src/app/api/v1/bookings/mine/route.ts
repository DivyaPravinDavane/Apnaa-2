import type { RowDataPacket } from 'mysql2/promise';
import { apiSuccess, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { query } from '@/lib/server/db';
import { mapBooking } from '@/lib/server/mappers';

export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  const user = await requireUser();
  const rows = await query<RowDataPacket>(
    `SELECT * FROM bookings
     WHERE society_id = ? AND user_id = ?
     ORDER BY booking_date DESC, created_at DESC
     LIMIT 200`,
    [user.societyId, user.id]
  );
  return apiSuccess(rows.map(mapBooking));
});
