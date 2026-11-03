import { apiSuccess, getParamAsync, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { execute } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export const POST = route<Ctx>(async (_request, context) => {
  const user = await requireUser();
  const id = await getParamAsync(context, 'id');
  await execute('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ? AND society_id = ?', [
    id,
    user.id,
    user.societyId,
  ]);
  return apiSuccess({ success: true });
});
