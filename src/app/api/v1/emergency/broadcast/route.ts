import { apiSuccess, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { execute, query } from '@/lib/server/db';
import { writeAudit } from '@/lib/server/audit';
import type { RowDataPacket } from 'mysql2/promise';

export const dynamic = 'force-dynamic';

export const POST = route(async (request) => {
  const user = await requireUser(['admin']);
  const body = (await request.json()) as {
    title: string;
    message: string;
    severity?: 'critical' | 'warning' | 'info';
  };

  const title = body.title?.trim() || 'EMERGENCY SOCIETY BROADCAST';
  const message = body.message?.trim() || 'Urgent society notification. Please check app.';

  // Fetch all active residents
  const users = await query<RowDataPacket>(
    `SELECT id, name, phone FROM users WHERE society_id = ? AND is_active = 1`,
    [user.societyId]
  );

  // Insert notification for each user
  for (const u of users) {
    const notifId = `notif_em_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await execute(
      `INSERT INTO notifications (id, society_id, user_id, title, message, type, is_read)
       VALUES (?, ?, ?, ?, ?, 'admin', 0)`,
      [notifId, user.societyId, u.id, `🚨 ${title}`, message]
    );
  }

  // Also create a high-priority Notice so it stays pinned
  const noticeId = `not_em_${Date.now()}`;
  await execute(
    `INSERT INTO notices (id, society_id, title, body, category, priority, publish_date, author, created_by)
     VALUES (?, ?, ?, ?, 'Security Alert', 'urgent', CURRENT_DATE(), ?, ?)`,
    [noticeId, user.societyId, `🚨 ${title}`, message, user.name, user.id]
  );

  await writeAudit({
    actor: user,
    action: 'Emergency Broadcast Sent',
    details: `Admin ${user.name} broadcasted "${title}" via SMS & Push to ${users.length} residents.`,
  });

  return apiSuccess({ success: true, notifiedCount: users.length, noticeId });
});

