import { ApiError, apiSuccess, getClientIp, readJson, route } from '@/lib/server/http';
import { enforceRateLimit } from '@/lib/server/rate-limit';
import { createSession, findUserByLogin, findUserByRole, upsertResidentUser, type AuthUser } from '@/lib/server/auth';
import { writeAudit } from '@/lib/server/audit';
import { societyCodeLoginSchema } from '@/lib/server/validation';
import { INITIAL_MEMBERS, INITIAL_USERS } from '@/lib/mock-data';
import type { UserRole } from '@/types';

export const dynamic = 'force-dynamic';

const REQUIRED_SOCIETY_CODE = '1234';

function buildFallbackAuthUser(
  role: UserRole,
  name?: string,
  phone?: string,
  unit?: string
): AuthUser {
  const digits = (phone || '').replace(/\D/g, '').slice(-10);
  const matchedMember = digits.length >= 10
    ? INITIAL_MEMBERS.find((m) => m.phone.replace(/\D/g, '').slice(-10) === digits)
    : undefined;

  const base = INITIAL_USERS[role] || INITIAL_USERS.resident;
  const resolvedName = name?.trim() || matchedMember?.name || base.name || 'Resident Member';
  const resolvedUnit = unit?.trim() || matchedMember?.unit || base.unit || 'A-101';
  const resolvedPhone = phone?.trim() || matchedMember?.phone || base.phone || '+91 98123 45678';

  return {
    ...base,
    id: matchedMember?.id || base.id || `usr_${role}_01`,
    societyId: 'soc_green_valley_01',
    name: resolvedName,
    phone: resolvedPhone,
    unit: resolvedUnit,
    wing: matchedMember?.wing || base.wing || 'A Wing',
    floor: matchedMember?.floor || base.floor || '1st Floor',
    role,
    societyName: base.societyName || 'Green Valley Residency',
    membershipType: matchedMember?.membershipType || base.membershipType || 'Owner',
  };
}

export const POST = route(async (request) => {
  const { code, name, phone, unit, role } = await readJson(request, societyCodeLoginSchema);
  const ip = getClientIp(request);

  if (code.trim() !== REQUIRED_SOCIETY_CODE) {
    throw new ApiError(401, 'INVALID_SOCIETY_CODE', 'Incorrect Society Passcode. Access denied.');
  }

  const selectedRole: UserRole = role || 'resident';

  try {
    await enforceRateLimit(`auth:society-code:ip:${ip}`, 40, 600);

    let user: AuthUser | null = null;

    if (selectedRole === 'resident' && name && phone) {
      user = await upsertResidentUser(name, phone, unit);
    } else if (phone) {
      // Registered member login via registered mobile + society passcode
      const existing = await findUserByLogin(phone);
      if (existing) {
        user = existing;
      } else {
        user = await upsertResidentUser(name || 'Resident Member', phone, unit || 'A-101');
      }
    } else {
      user = await findUserByRole(selectedRole);
    }

    if (!user) {
      user = buildFallbackAuthUser(selectedRole, name, phone, unit);
    } else {
      await createSession(user.id, request);
      await writeAudit({
        actor: user,
        action: 'Resident Access Verified',
        details: `${user.name} (${user.phone || 'no phone'}, Unit ${user.unit || 'N/A'}) entered Apnaa Society with passcode.`,
        ip,
      });
    }

    return apiSuccess(user);
  } catch {
    // Graceful fallback when remote MySQL reaches hourly connection limit or is temporarily unavailable
    const fallbackUser = buildFallbackAuthUser(selectedRole, name, phone, unit);
    return apiSuccess(fallbackUser);
  }
});

