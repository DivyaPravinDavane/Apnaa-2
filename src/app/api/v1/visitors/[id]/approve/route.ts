import { ApiError, apiSuccess, getClientIp, getParamAsync, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { execute } from '@/lib/server/db';
import { writeAudit } from '@/lib/server/audit';
import { createNotification } from '@/lib/server/notifications';
import { mapVisitor } from '@/lib/server/mappers';
import { assertCanManageVisitor, loadVisitor } from '@/lib/server/visitors';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export const POST = route<Ctx>(async (request, context) => {
  const user = await requireUser(['resident', 'admin']);
  const id = await getParamAsync(context, 'id');
  const visitor = await loadVisitor(id, user.societyId);
  assertCanManageVisitor(user, visitor);

  const result = await execute(
    `UPDATE visitors
     SET status = 'approved', approved_at = UTC_TIMESTAMP()
     WHERE id = ? AND society_id = ? AND status IN ('expected', 'pending')`,
    [id, user.societyId]
  );

  if (result.affectedRows === 0 && visitor.status !== 'approved') {
    throw new ApiError(409, 'INVALID_VISITOR_STATE', 'This visitor request can no longer be approved.');
  }

  if (visitor.resident_id !== user.id) {
    await createNotification({
      societyId: user.societyId,
      userId: visitor.resident_id,
      title: 'Visitor Approved',
      message: `${user.name} approved ${visitor.name} for entry to Flat ${visitor.unit}.`,
      type: 'visitor',
      link: '/visitors',
    });
  }

  await writeAudit({
    actor: user,
    action: 'Visitor Approved',
    details: `Approved gate pass ${visitor.pass_code} for ${visitor.name} (unit ${visitor.unit}).`,
    ip: getClientIp(request),
  });

  const updated = await loadVisitor(id, user.societyId);
  return apiSuccess(mapVisitor(updated));
});
