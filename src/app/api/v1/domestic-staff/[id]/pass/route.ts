import { apiSuccess, getParamAsync, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { execute } from '@/lib/server/db';
import { writeAudit } from '@/lib/server/audit';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export const POST = route<Ctx>(async (request, context) => {
  const user = await requireUser();
  const staffId = await getParamAsync(context, 'id');

  const newPassCode = `HELP-${Math.floor(1000 + Math.random() * 9000)}`;

  await execute(
    `UPDATE domestic_staff 
     SET pass_code = ?, status = 'inside', entry_time = NOW() 
     WHERE id = ? AND society_id = ?`,
    [newPassCode, staffId, user.societyId]
  );

  await writeAudit({
    actor: user,
    action: 'Domestic Staff Gate Pass Reissued',
    details: `Generated fresh digital gate pass ${newPassCode} for staff ${staffId}`,
  });

  return apiSuccess({ success: true, passCode: newPassCode });
});
