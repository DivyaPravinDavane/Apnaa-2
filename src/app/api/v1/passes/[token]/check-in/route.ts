import { ApiError, apiSuccess, getClientIp, getParamAsync, readJson, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { execute } from '@/lib/server/db';
import { writeAudit } from '@/lib/server/audit';
import { createNotification } from '@/lib/server/notifications';
import { newId, timeInIst, todayInIst } from '@/lib/server/ids';
import { mapVisitor } from '@/lib/server/mappers';
import { passCheckInSchema } from '@/lib/server/validation';
import { findVisitorByPass, loadVisitor } from '@/lib/server/visitors';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ token: string }> };

export const POST = route<Ctx>(async (request, context) => {
  const user = await requireUser(['security', 'admin']);
  const token = decodeURIComponent(await getParamAsync(context, 'token'));
  const { gate } = await readJson(request, passCheckInSchema);

  const visitor = await findVisitorByPass(token, user.societyId);
  if (!visitor) {
    throw new ApiError(404, 'PASS_NOT_FOUND', 'Pass not found or invalid.');
  }

  if (visitor.status === 'checked_in') {
    throw new ApiError(409, 'ALREADY_CHECKED_IN', 'This pass has already been checked in.');
  }
  if (['denied', 'cancelled', 'checked_out'].includes(visitor.status)) {
    throw new ApiError(409, 'PASS_INACTIVE', `This pass is ${visitor.status.replace('_', ' ')}.`);
  }
  if (visitor.visit_date < todayInIst()) {
    throw new ApiError(409, 'PASS_EXPIRED', 'This pass has expired.');
  }

  const entryTime = timeInIst();
  await execute(
    `UPDATE visitors SET status = 'checked_in', entry_time = ? WHERE id = ? AND society_id = ?`,
    [entryTime, visitor.id, user.societyId]
  );

  await execute(
    `INSERT INTO security_logs
      (id, society_id, visitor_id, visitor_name, unit, gate, entry_time, status, guard_id, guard_name, pass_code)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'entry', ?, ?, ?)`,
    [
      newId('log'),
      user.societyId,
      visitor.id,
      visitor.name,
      visitor.unit,
      gate,
      entryTime,
      user.id,
      user.name,
      visitor.pass_code,
    ]
  );

  await createNotification({
    societyId: user.societyId,
    userId: visitor.resident_id,
    title: 'Visitor Checked In',
    message: `${visitor.name} entered through ${gate} at ${entryTime}.`,
    type: 'visitor',
    link: '/visitors',
  });

  await writeAudit({
    actor: user,
    action: 'Pass Verified & Check-in',
    details: `Entry recorded for ${visitor.name} (${visitor.pass_code}) at ${gate}.`,
    ip: getClientIp(request),
  });

  const updated = await loadVisitor(visitor.id, user.societyId);
  return apiSuccess({ success: true, status: 'checked_in', visitor: mapVisitor(updated) });
});
