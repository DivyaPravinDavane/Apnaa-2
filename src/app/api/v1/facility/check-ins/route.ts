import type { RowDataPacket } from 'mysql2/promise';
import { apiSuccess, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { query } from '@/lib/server/db';
import { mapFacilityCheckIn } from '@/lib/server/mappers';

export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  const user = await requireUser(['facility', 'admin', 'security']);
  const rows = await query<RowDataPacket>(
    `SELECT * FROM facility_check_ins WHERE society_id = ? ORDER BY created_at DESC LIMIT 200`,
    [user.societyId]
  );
  return apiSuccess(rows.map(mapFacilityCheckIn));
});
