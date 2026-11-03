import { apiSuccess, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  const user = await requireUser();
  return apiSuccess(user);
});
