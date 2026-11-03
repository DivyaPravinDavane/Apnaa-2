import { apiSuccess, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { execute } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

export const POST = route(async () => {
  const user = await requireUser();
  await execute('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND society_id = ? AND is_read = 0', [
    user.id,
    user.societyId,
  ]);
  return apiSuccess({ success: true });
});
