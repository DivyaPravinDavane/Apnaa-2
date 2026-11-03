import { ApiError, apiSuccess, getClientIp, getParamAsync, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { execute } from '@/lib/server/db';
import { writeAudit } from '@/lib/server/audit';
import { newId, timeInIst } from '@/lib/server/ids';
import { mapVisitor } from '@/lib/server/mappers';
import { loadVisitor } from '@/lib/server/visitors';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export const POST = route<Ctx>(async (request, context) => {
  const user = await requireUser(['security', 'admin']);
  const id = await getParamAsync(context, 'id');
  const visitor = await loadVisitor(id, user.societyId);

  if (visitor.status !== 'checked_in') {
    throw new ApiError(409, 'INVALID_VISITOR_STATE', 'This visitor is not currently checked in.');
  }

  const exitTime = timeInIst();
  await execute(
    `UPDATE visitors SET status = 'checked_out', exit_time = ? WHERE id = ? AND society_id = ?`,
    [exitTime, id, user.societyId]
  );

  await execute(
    `INSERT INTO security_logs
      (id, society_id, visitor_id, visitor_name, unit, gate, exit_time, status, guard_id, guard_name, pass_code)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'exit', ?, ?, ?)`,
    [
      newId('log'),
      user.societyId,
      visitor.id,
      visitor.name,
      visitor.unit,
      'Gate 1 - Main Entrance',
      exitTime,
      user.id,
      user.name,
      visitor.pass_code,
    ]
  );

  await writeAudit({
    actor: user,
    action: 'Visitor Checked Out',
    details: `Recorded exit for ${visitor.name} (${visitor.pass_code}).`,
    ip: getClientIp(request),
  });

  const updated = await loadVisitor(id, user.societyId);
  return apiSuccess(mapVisitor(updated));
});
