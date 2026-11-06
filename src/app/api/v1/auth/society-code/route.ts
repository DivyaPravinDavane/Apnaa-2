import { ApiError, apiSuccess, getClientIp, readJson, route } from '@/lib/server/http';
import { enforceRateLimit } from '@/lib/server/rate-limit';
import { createSession, findUserByRole, upsertResidentUser, type AuthUser } from '@/lib/server/auth';
import { writeAudit } from '@/lib/server/audit';
import { societyCodeLoginSchema } from '@/lib/server/validation';
import type { UserRole } from '@/types';

export const dynamic = 'force-dynamic';

const REQUIRED_SOCIETY_CODE = '1234';

export const POST = route(async (request) => {
  const { code, name, phone, unit, role } = await readJson(request, societyCodeLoginSchema);
  const ip = getClientIp(request);
  await enforceRateLimit(`auth:society-code:ip:${ip}`, 40, 600);

  if (code.trim() !== REQUIRED_SOCIETY_CODE) {
    throw new ApiError(401, 'INVALID_SOCIETY_CODE', 'Incorrect Society Passcode. Access denied.');
  }

  const selectedRole: UserRole = role || 'resident';
  let user: AuthUser | null = null;

  if (selectedRole === 'resident' && name && phone) {
    user = await upsertResidentUser(name, phone, unit);
  } else {
    user = await findUserByRole(selectedRole);
  }

  if (!user) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'Could not locate user account.');
  }

  await createSession(user.id, request);
  await writeAudit({
    actor: user,
    action: 'Resident Access Verified',
    details: `${user.name} (${user.phone || 'no phone'}, Unit ${user.unit || 'N/A'}) entered Apnaa Society with passcode.`,
    ip,
  });

  return apiSuccess(user);
});

