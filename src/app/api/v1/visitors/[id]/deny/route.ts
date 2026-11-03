import { ApiError, apiSuccess, getClientIp, getParamAsync, readJson, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { execute } from '@/lib/server/db';
import { writeAudit } from '@/lib/server/audit';
import { createNotification } from '@/lib/server/notifications';
import { mapVisitor } from '@/lib/server/mappers';
import { visitorDenySchema } from '@/lib/server/validation';
import { assertCanManageVisitor, loadVisitor } from '@/lib/server/visitors';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export const POST = route<Ctx>(async (request, context) => {
  const user = await requireUser(['resident', 'admin']);
  const id = await getParamAsync(context, 'id');
  const { reason } = await readJson(request, visitorDenySchema).catch(() => ({ reason: undefined }));
  const visitor = await loadVisitor(id, user.societyId);
  assertCanManageVisitor(user, visitor);

  if (['checked_in', 'checked_out', 'cancelled'].includes(visitor.status)) {
    throw new ApiError(409, 'INVALID_VISITOR_STATE', 'This visitor can no longer be denied.');
  }

  await execute(
    `UPDATE visitors
     SET status = 'denied', notes = COALESCE(?, notes)
     WHERE id = ? AND society_id = ?`,
    [reason ? String(reason).slice(0, 500) : null, id, user.societyId]
  );

  if (visitor.resident_id !== user.id) {
    await createNotification({
      societyId: user.societyId,
      userId: visitor.resident_id,
      title: 'Visitor Request Denied',
      message: `${visitor.name} was denied entry to Flat ${visitor.unit}.`,
      type: 'visitor',
      link: '/visitors',
    });
  }

  await writeAudit({
    actor: user,
    action: 'Visitor Denied',
    details: `Denied gate pass ${visitor.pass_code} for ${visitor.name}${reason ? ` (${reason})` : ''}.`,
    ip: getClientIp(request),
  });

  const updated = await loadVisitor(id, user.societyId);
  return apiSuccess(mapVisitor(updated));
});
