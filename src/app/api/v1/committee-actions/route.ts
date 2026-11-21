import { apiSuccess, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { execute, query } from '@/lib/server/db';
import { writeAudit } from '@/lib/server/audit';
import type { RowDataPacket } from 'mysql2/promise';
import type { CommitteeAction } from '@/types';

export const dynamic = 'force-dynamic';

function rowToAction(r: RowDataPacket): CommitteeAction {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category,
    assignedTo: r.assigned_to,
    assignedRole: r.assigned_role,
    dueDate: String(r.due_date).slice(0, 10),
    priority: r.priority,
    status: r.status,
    createdAt: r.created_at,
  };
}

export const GET = route(async () => {
  const user = await requireUser();
  const rows = await query<RowDataPacket>(
    `SELECT * FROM committee_actions WHERE society_id = ? ORDER BY FIELD(priority, 'urgent', 'high', 'medium', 'low'), due_date ASC`,
    [user.societyId]
  );
  return apiSuccess(rows.map(rowToAction));
});

export const POST = route(async (request) => {
  const user = await requireUser();
  const body = (await request.json()) as Partial<CommitteeAction>;

  const id = `act_${Date.now()}`;
  const title = body.title?.trim() || 'Managing Committee Action';
  const description = body.description || '';
  const category = body.category || 'Maintenance';
  const assignedTo = body.assignedTo || user.name;
  const assignedRole = body.assignedRole || 'Committee Member';
  const dueDate = body.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  const priority = body.priority || 'medium';
  const status = body.status || 'open';

  await execute(
    `INSERT INTO committee_actions (id, society_id, title, description, category, assigned_to, assigned_role, due_date, priority, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, user.societyId, title, description, category, assignedTo, assignedRole, dueDate, priority, status]
  );

  await writeAudit({
    actor: user,
    action: 'Committee Action Item Created',
    details: `Created "${title}" assigned to ${assignedTo} (${priority})`,
  });

  return apiSuccess(
    {
      id,
      title,
      description,
      category,
      assignedTo,
      assignedRole,
      dueDate,
      priority,
      status,
    },
    undefined,
    201
  );
});

