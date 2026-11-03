import type { RowDataPacket } from 'mysql2/promise';
import { ApiError, apiSuccess, getClientIp, readJson, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { execute, query } from '@/lib/server/db';
import { writeAudit } from '@/lib/server/audit';
import { mediaModerateSchema } from '@/lib/server/validation';

export const dynamic = 'force-dynamic';

export const POST = route(async (request) => {
  const user = await requireUser(['admin']);
  const input = await readJson(request, mediaModerateSchema);

  const rows = await query<RowDataPacket>(
    `SELECT m.id, m.title
     FROM media_items m
     JOIN albums a ON a.id = m.album_id
     WHERE m.id = ? AND m.album_id = ? AND a.society_id = ?
     LIMIT 1`,
    [input.mediaId, input.albumId, user.societyId]
  );
  if (!rows[0]) throw new ApiError(404, 'MEDIA_NOT_FOUND', 'Media item was not found.');

  await execute('UPDATE media_items SET status = ? WHERE id = ?', [input.action, input.mediaId]);

  await writeAudit({
    actor: user,
    action: 'Media Moderation',
    details: `${input.action === 'approved' ? 'Approved' : 'Rejected'} media "${rows[0].title}".`,
    ip: getClientIp(request),
  });

  return apiSuccess({ success: true, status: input.action });
});
