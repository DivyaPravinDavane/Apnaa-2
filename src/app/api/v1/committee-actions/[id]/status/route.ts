import { apiSuccess, getParamAsync, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { execute } from '@/lib/server/db';
import { writeAudit } from '@/lib/server/audit';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = route<Ctx>(async (request, context) => {
  const user = await requireUser();
  const actionId = await getParamAsync(context, 'id');
  const body = (await request.json()) as { status: string };

  await execute(
    `UPDATE committee_actions 
     SET status = ? 
     WHERE id = ? AND society_id = ?`,
    [body.status, actionId, user.societyId]
  );

  await writeAudit({
    actor: user,
    action: 'Committee Action Status Updated',
    details: `${user.name} changed action ${actionId} status to ${body.status}`,
  });

  return apiSuccess({ success: true, id: actionId, status: body.status });
});
