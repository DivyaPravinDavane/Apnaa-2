import type { RowDataPacket } from 'mysql2/promise';
import { apiSuccess, getClientIp, readJson, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { execute, query } from '@/lib/server/db';
import { writeAudit } from '@/lib/server/audit';
import { mapEvent } from '@/lib/server/mappers';
import { newId } from '@/lib/server/ids';
import { eventCreateSchema } from '@/lib/server/validation';

export const dynamic = 'force-dynamic';

const EVENT_SELECT = `
  SELECT e.*,
    r.status AS rsvp_status,
    (SELECT COUNT(*) FROM event_rsvps er WHERE er.event_id = e.id AND er.status = 'attending') AS rsvp_count
  FROM events e
  LEFT JOIN event_rsvps r ON r.event_id = e.id AND r.user_id = ?
`;

export const GET = route(async () => {
  const user = await requireUser();
  const rows = await query<RowDataPacket>(
    `${EVENT_SELECT}
     WHERE e.society_id = ?
     ORDER BY e.event_date ASC, e.created_at ASC
     LIMIT 100`,
    [user.id, user.societyId]
  );
  return apiSuccess(rows.map(mapEvent));
});

export const POST = route(async (request) => {
  const user = await requireUser(['admin']);
  const input = await readJson(request, eventCreateSchema);
  const id = newId('evt');

  await execute(
    `INSERT INTO events
      (id, society_id, title, description, category, event_date, event_time, venue, capacity,
       cover_image, organizer, deadline, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      user.societyId,
      input.title,
      input.description,
      input.category,
      input.date,
      input.time,
      input.venue,
      input.capacity,
      input.coverImage || '',
      input.organizer,
      input.deadline || null,
      user.id,
    ]
  );

  await writeAudit({
    actor: user,
    action: 'Event Created',
    details: `Created event "${input.title}" on ${input.date}.`,
    ip: getClientIp(request),
  });

  const rows = await query<RowDataPacket>(`${EVENT_SELECT} WHERE e.id = ? LIMIT 1`, [user.id, id]);
  return apiSuccess(mapEvent(rows[0]), undefined, 201);
});
