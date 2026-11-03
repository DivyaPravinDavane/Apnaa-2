import type { RowDataPacket } from 'mysql2/promise';
import { apiSuccess, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { query } from '@/lib/server/db';
import { mapAmenity } from '@/lib/server/mappers';

export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  const user = await requireUser();
  const rows = await query<RowDataPacket>(
    `SELECT * FROM amenities WHERE society_id = ? ORDER BY FIELD(category, 'Fitness', 'Sports', 'Indoor', 'Outdoor', 'Events'), name`,
    [user.societyId]
  );
  return apiSuccess(rows.map(mapAmenity));
});
