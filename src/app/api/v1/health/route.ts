import { apiSuccess, route } from '@/lib/server/http';
import { pingDatabase } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  let database = 'down';
  try {
    await pingDatabase();
    database = 'up';
  } catch {
    database = 'down';
  }
  return apiSuccess({ status: database === 'up' ? 'ok' : 'degraded', database });
});
