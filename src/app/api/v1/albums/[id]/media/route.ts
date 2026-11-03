import type { RowDataPacket } from 'mysql2/promise';
import { ApiError, apiSuccess, getClientIp, getParamAsync, readJson, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { execute, query } from '@/lib/server/db';
import { writeAudit } from '@/lib/server/audit';
import { newId, todayInIst } from '@/lib/server/ids';
import { mapMediaItem } from '@/lib/server/mappers';
import { mediaUploadSchema } from '@/lib/server/validation';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export const POST = route<Ctx>(async (request, context) => {
  const user = await requireUser();
  const albumId = await getParamAsync(context, 'id');
  const input = await readJson(request, mediaUploadSchema);

  const albums = await query<RowDataPacket>('SELECT id, title FROM albums WHERE id = ? AND society_id = ? LIMIT 1', [
    albumId,
    user.societyId,
  ]);
  if (!albums[0]) throw new ApiError(404, 'ALBUM_NOT_FOUND', 'Album was not found.');

  const id = newId('m');
  const status = user.role === 'admin' ? 'approved' : 'pending';

  await execute(
    `INSERT INTO media_items
      (id, album_id, url, title, uploader_id, uploader_name, status, media_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, albumId, input.url, input.title, user.id, user.name, status, todayInIst()]
  );

  await writeAudit({
    actor: user,
    action: 'Gallery Media Uploaded',
    details: `Uploaded "${input.title}" to album "${albums[0].title}" (${status}).`,
    ip: getClientIp(request),
  });

  const rows = await query<RowDataPacket>('SELECT * FROM media_items WHERE id = ? LIMIT 1', [id]);
  return apiSuccess(mapMediaItem(rows[0]), undefined, 201);
});
