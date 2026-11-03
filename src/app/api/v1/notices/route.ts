import type { RowDataPacket } from 'mysql2/promise';
import { apiSuccess, getClientIp, readJson, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { execute, query } from '@/lib/server/db';
import { writeAudit } from '@/lib/server/audit';
import { mapNotice } from '@/lib/server/mappers';
import { newId } from '@/lib/server/ids';
import { noticeCreateSchema } from '@/lib/server/validation';

export const dynamic = 'force-dynamic';

const NOTICE_SELECT = `
  SELECT n.*,
    EXISTS(SELECT 1 FROM notice_reads r WHERE r.notice_id = n.id AND r.user_id = ?) AS is_read,
    EXISTS(SELECT 1 FROM notice_acknowledgements a WHERE a.notice_id = n.id AND a.user_id = ?) AS is_acknowledged,
    (SELECT COUNT(*) FROM notice_acknowledgements a WHERE a.notice_id = n.id) AS acknowledged_count,
    GREATEST(
      s.total_households,
      (SELECT COUNT(*) FROM users u
        WHERE u.society_id = n.society_id AND u.role IN ('resident', 'admin') AND u.is_active = 1
      )
    ) AS total_residents_count
  FROM notices n
  JOIN societies s ON s.id = n.society_id
`;

export const GET = route(async () => {
  const user = await requireUser();
  const rows = await query<RowDataPacket>(
    `${NOTICE_SELECT}
     WHERE n.society_id = ?
     ORDER BY FIELD(n.priority, 'urgent', 'high', 'normal'), n.publish_date DESC, n.created_at DESC
     LIMIT 100`,
    [user.id, user.id, user.societyId]
  );
  return apiSuccess(rows.map(mapNotice));
});

export const POST = route(async (request) => {
  const user = await requireUser(['admin']);
  const input = await readJson(request, noticeCreateSchema);
  const id = newId('not');

  await execute(
    `INSERT INTO notices
      (id, society_id, title, body, category, priority, publish_date, expiry_date, author,
       attachment_name, attachment_size, requires_acknowledgement, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      user.societyId,
      input.title,
      input.body,
      input.category,
      input.priority,
      input.publishDate,
      input.expiryDate || null,
      user.name,
      input.attachmentName || null,
      input.attachmentSize || null,
      input.requiresAcknowledgement ? 1 : 0,
      user.id,
    ]
  );

  await writeAudit({
    actor: user,
    action: 'Notice Published',
    details: `Published notice "${input.title}" (${input.priority}).`,
    ip: getClientIp(request),
  });

  const rows = await query<RowDataPacket>(`${NOTICE_SELECT} WHERE n.id = ? LIMIT 1`, [
    user.id,
    user.id,
    id,
  ]);
  return apiSuccess(mapNotice(rows[0]), undefined, 201);
});
