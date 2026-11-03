import type { RowDataPacket } from 'mysql2/promise';
import { apiSuccess, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { query } from '@/lib/server/db';
import { mapNotification } from '@/lib/server/mappers';

export const dynamic = 'force-dynamic';

export const GET = route(async (request) => {
  const user = await requireUser();
  const unreadOnly = request.nextUrl.searchParams.get('unread') === 'true';

  const rows = await query<RowDataPacket>(
    `SELECT * FROM notifications
     WHERE society_id = ? AND user_id = ? ${unreadOnly ? 'AND is_read = 0' : ''}
     ORDER BY created_at DESC
     LIMIT 100`,
    [user.societyId, user.id]
  );
  return apiSuccess(rows.map(mapNotification));
});
