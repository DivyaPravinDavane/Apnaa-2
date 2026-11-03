import { apiSuccess, getClientIp, route } from '@/lib/server/http';
import { destroySession, getSessionUser } from '@/lib/server/auth';
import { writeAudit } from '@/lib/server/audit';

export const dynamic = 'force-dynamic';

export const POST = route(async (request) => {
  const user = await getSessionUser();
  await destroySession();
  if (user) {
    await writeAudit({
      actor: user,
      action: 'Logout',
      details: `${user.name} signed out.`,
      ip: getClientIp(request),
    });
  }
  return apiSuccess({ success: true });
});
