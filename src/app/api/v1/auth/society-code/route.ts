import { ApiError, apiSuccess, getClientIp, readJson, route } from '@/lib/server/http';
import { enforceRateLimit } from '@/lib/server/rate-limit';
import { createSession, findUserByRole } from '@/lib/server/auth';
import { writeAudit } from '@/lib/server/audit';
import { societyCodeLoginSchema } from '@/lib/server/validation';
import type { UserRole } from '@/types';

export const dynamic = 'force-dynamic';

const REQUIRED_SOCIETY_CODE = '1234';

export const POST = route(async (request) => {
  const { code, role } = await readJson(request, societyCodeLoginSchema);
  const ip = getClientIp(request);
  await enforceRateLimit(`auth:society-code:ip:${ip}`, 30, 600);

  if (code.trim() !== REQUIRED_SOCIETY_CODE) {
    throw new ApiError(401, 'INVALID_SOCIETY_CODE', 'Invalid society code. Please enter 1234 to enter.');
  }

  const selectedRole: UserRole = role || 'resident';
  const user = await findUserByRole(selectedRole);
  if (!user) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'No user configured for this role.');
  }

  await createSession(user.id, request);
  await writeAudit({
    actor: user,
    action: 'Society Code Access Verified',
    details: `User entered society with code ${code} as ${selectedRole}.`,
    ip,
  });

  return apiSuccess(user);
});
