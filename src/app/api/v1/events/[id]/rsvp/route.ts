import type { RowDataPacket } from 'mysql2/promise';
import { ApiError, apiSuccess, getClientIp, getParamAsync, readJson, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { execute, query } from '@/lib/server/db';
import { writeAudit } from '@/lib/server/audit';
import { rsvpSchema } from '@/lib/server/validation';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export const PUT = route<Ctx>(async (request, context) => {
  const user = await requireUser();
  const id = await getParamAsync(context, 'id');
  const { rsvpStatus } = await readJson(request, rsvpSchema);

  const events = await query<RowDataPacket>('SELECT id, title FROM events WHERE id = ? AND society_id = ? LIMIT 1', [
    id,
    user.societyId,
  ]);
  if (!events[0]) throw new ApiError(404, 'EVENT_NOT_FOUND', 'Event was not found.');

  if (rsvpStatus === 'none') {
    await execute('DELETE FROM event_rsvps WHERE event_id = ? AND user_id = ?', [id, user.id]);
  } else {
    await execute(
      `INSERT INTO event_rsvps (event_id, user_id, status)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE status = ?, updated_at = UTC_TIMESTAMP()`,
      [id, user.id, rsvpStatus, rsvpStatus]
    );
  }

  await writeAudit({
    actor: user,
    action: 'Event RSVP',
    details: `Set RSVP for "${events[0].title}" to ${rsvpStatus}.`,
    ip: getClientIp(request),
  });

  const counts = await query<RowDataPacket>(
    `SELECT COUNT(*) AS attending FROM event_rsvps WHERE event_id = ? AND status = 'attending'`,
    [id]
  );
  return apiSuccess({ success: true, rsvpStatus, attendeesCount: Number(counts[0]?.attending || 0) });
});
