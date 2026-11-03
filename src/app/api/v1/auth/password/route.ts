import { ApiError, apiSuccess, getClientIp, readJson, route } from '@/lib/server/http';
import { enforceRateLimit } from '@/lib/server/rate-limit';
import { createSession, findUserByLogin, publicUser, verifyPassword } from '@/lib/server/auth';
import { writeAudit } from '@/lib/server/audit';
import { passwordLoginSchema } from '@/lib/server/validation';

export const dynamic = 'force-dynamic';

export const POST = route(async (request) => {
  const { login, password } = await readJson(request, passwordLoginSchema);
  const ip = getClientIp(request);

  await enforceRateLimit(`password:login:ip:${ip}`, 10, 900);
  await enforceRateLimit(`password:login:account:${login.toLowerCase().slice(0, 120)}`, 8, 900);

  const user = await findUserByLogin(login);
  // Always run a hash comparison to reduce user-enumeration timing signals.
  const valid = await verifyPassword(password, user?.passwordHash);
  if (!user || !valid) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email/phone or password is incorrect.');
  }

  await createSession(user.id, request);
  await writeAudit({
    actor: user,
    action: 'Password Login',
    details: `Successful password login for ${user.name} (${user.role}).`,
    ip,
  });

  return apiSuccess(publicUser(user));
});
