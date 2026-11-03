import { ApiError, apiSuccess, getClientIp, readJson, route } from '@/lib/server/http';
import { enforceRateLimit } from '@/lib/server/rate-limit';
import { createSession, findUserByRole } from '@/lib/server/auth';
import { demoLoginEnabled } from '@/lib/server/config';
import { writeAudit } from '@/lib/server/audit';
import { demoLoginSchema } from '@/lib/server/validation';

export const dynamic = 'force-dynamic';

/**
 * Demonstration role switch. Disabled in production unless ALLOW_DEMO_LOGIN=true.
 * Even here the server decides which account is used - the client cannot pick a
 * user id or escalate to a role that is not a valid demo role.
 */
export const POST = route(async (request) => {
  if (!demoLoginEnabled()) {
    throw new ApiError(403, 'DEMO_LOGIN_DISABLED', 'Demo login is disabled. Use OTP or password sign-in.');
  }

  const { role } = await readJson(request, demoLoginSchema);
  const ip = getClientIp(request);
  await enforceRateLimit(`demo:login:ip:${ip}`, 40, 600);

  const user = await findUserByRole(role);
  if (!user) {
    throw new ApiError(404, 'DEMO_USER_NOT_FOUND', 'No demo account is configured for this role.');
  }

  await createSession(user.id, request);
  await writeAudit({
    actor: user,
    action: 'Demo Role Login',
    details: `Demo session started as ${role}.`,
    ip,
  });

  return apiSuccess(user);
});
