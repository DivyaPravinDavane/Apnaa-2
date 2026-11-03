import { apiSuccess, route } from '@/lib/server/http';
import { getSessionUser } from '@/lib/server/auth';
import { demoLoginEnabled } from '@/lib/server/config';

export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  const user = await getSessionUser();
  return apiSuccess(user, { authenticated: Boolean(user), demoLoginEnabled: demoLoginEnabled() });
});
