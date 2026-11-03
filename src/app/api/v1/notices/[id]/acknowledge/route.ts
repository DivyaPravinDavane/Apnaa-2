import type { RowDataPacket } from 'mysql2/promise';
import { ApiError, apiSuccess, getClientIp, getParamAsync, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { execute, query } from '@/lib/server/db';
import { writeAudit } from '@/lib/server/audit';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export const POST = route<Ctx>(async (request, context) => {
  const user = await requireUser();
  const id = await getParamAsync(context, 'id');

  const notices = await query<RowDataPacket>('SELECT id FROM notices WHERE id = ? AND society_id = ? LIMIT 1', [
    id,
    user.societyId,
  ]);
  if (!notices[0]) throw new ApiError(404, 'NOTICE_NOT_FOUND', 'Notice was not found.');

  await execute(
    `INSERT INTO notice_acknowledgements (notice_id, user_id)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE acknowledged_at = acknowledged_at`,
    [id, user.id]
  );
  await execute(
    `INSERT INTO notice_reads (notice_id, user_id)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE read_at = read_at`,
    [id, user.id]
  );

  await writeAudit({
    actor: user,
    action: 'Notice Acknowledged',
    details: `Acknowledged notice ${id}.`,
    ip: getClientIp(request),
  });

  const counts = await query<RowDataPacket>(
    'SELECT COUNT(*) AS acknowledged_count FROM notice_acknowledgements WHERE notice_id = ?',
    [id]
  );
  return apiSuccess({ success: true, acknowledgedCount: Number(counts[0]?.acknowledged_count || 0) });
});
