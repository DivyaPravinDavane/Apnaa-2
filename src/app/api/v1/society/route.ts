import type { RowDataPacket } from 'mysql2/promise';
import { apiSuccess, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { query } from '@/lib/server/db';
import { mapSociety } from '@/lib/server/mappers';

export const dynamic = 'force-dynamic';

const SOCIETY_SELECT = `
  SELECT s.*,
    (SELECT COUNT(*) FROM users u
      WHERE u.society_id = s.id AND u.role IN ('resident', 'admin')
        AND u.is_active = 1 AND u.deleted_at IS NULL
    ) AS active_residents,
    (SELECT COUNT(*) FROM visitors v
      WHERE v.society_id = s.id AND v.status = 'pending'
    ) AS pending_approvals,
    (SELECT COUNT(*) FROM amenities a
      WHERE a.society_id = s.id AND a.status <> 'available'
    ) AS active_closures
  FROM societies s
  WHERE s.id = ?
  LIMIT 1
`;

export const GET = route(async () => {
  const user = await requireUser();
  const rows = await query<RowDataPacket>(SOCIETY_SELECT, [user.societyId]);
  return apiSuccess(mapSociety(rows[0] || { id: user.societyId, name: user.societyName }));
});
