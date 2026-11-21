import { apiSuccess, getParamAsync, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { execute } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export const POST = route<Ctx>(async (request, context) => {
  const user = await requireUser();
  const discussionId = await getParamAsync(context, 'id');

  await execute(
    `UPDATE community_discussions 
     SET likes_count = likes_count + 1 
     WHERE id = ? AND society_id = ?`,
    [discussionId, user.societyId]
  );

  return apiSuccess({ success: true, id: discussionId });
});
