import type { RowDataPacket } from 'mysql2/promise';
import { apiSuccess, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { query } from '@/lib/server/db';
import { mapSecurityLog } from '@/lib/server/mappers';

export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  const user = await requireUser(['security', 'admin']);
  const rows = await query<RowDataPacket>(
    `SELECT * FROM security_logs WHERE society_id = ? ORDER BY created_at DESC LIMIT 200`,
    [user.societyId]
  );
  return apiSuccess(rows.map(mapSecurityLog));
});
