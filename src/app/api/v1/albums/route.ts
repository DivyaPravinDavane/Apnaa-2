import type { RowDataPacket } from 'mysql2/promise';
import { apiSuccess, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { query } from '@/lib/server/db';
import { mapAlbum, mapMediaItem } from '@/lib/server/mappers';

export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  const user = await requireUser();
  const isAdmin = user.role === 'admin';

  const albums = await query<RowDataPacket>(
    `SELECT * FROM albums WHERE society_id = ? ORDER BY album_date DESC LIMIT 100`,
    [user.societyId]
  );

  const media = await query<RowDataPacket>(
    isAdmin
      ? `SELECT m.* FROM media_items m
         JOIN albums a ON a.id = m.album_id
         WHERE a.society_id = ?
         ORDER BY m.created_at DESC`
      : `SELECT m.* FROM media_items m
         JOIN albums a ON a.id = m.album_id
         WHERE a.society_id = ? AND m.status = 'approved'
         ORDER BY m.created_at DESC`,
    [user.societyId]
  );

  const grouped = new Map<string, ReturnType<typeof mapMediaItem>[]>();
  for (const item of media) {
    const key = String(item.album_id);
    const list = grouped.get(key) || [];
    list.push(mapMediaItem(item));
    grouped.set(key, list);
  }

  return apiSuccess(albums.map((album) => mapAlbum(album, grouped.get(String(album.id)) || [])));
});
