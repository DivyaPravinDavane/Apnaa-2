import { apiSuccess, getClientIp, readJson, route } from '@/lib/server/http';
import { findUserById, requireUser } from '@/lib/server/auth';
import { execute } from '@/lib/server/db';
import { writeAudit } from '@/lib/server/audit';
import { profileUpdateSchema } from '@/lib/server/validation';

export const dynamic = 'force-dynamic';

export const PATCH = route(async (request) => {
  const user = await requireUser();
  const data = await readJson(request, profileUpdateSchema);

  const sets: string[] = [];
  const params: unknown[] = [];

  if (data.name !== undefined) {
    sets.push('name = ?');
    params.push(data.name);
  }
  if (data.email !== undefined) {
    sets.push('email = ?');
    params.push(data.email);
  }
  if (data.phone !== undefined) {
    sets.push('phone = ?');
    params.push(data.phone);
  }
  if (data.bio !== undefined) {
    sets.push('bio = ?');
    params.push(data.bio);
  }
  if (data.gender !== undefined) {
    sets.push('gender = ?');
    params.push(data.gender);
  }
  if (data.dateOfBirth !== undefined) {
    sets.push('date_of_birth = ?');
    params.push(data.dateOfBirth);
  }
  if (data.bloodGroup !== undefined) {
    sets.push('blood_group = ?');
    params.push(data.bloodGroup);
  }
  if (data.govtIdNumber !== undefined) {
    sets.push('govt_id_number = ?');
    params.push(data.govtIdNumber);
  }
  if (data.interests !== undefined) {
    sets.push('interests = ?');
    params.push(JSON.stringify(data.interests));
  }
  if (data.isPhonePublic !== undefined) {
    sets.push('is_phone_public = ?');
    params.push(data.isPhonePublic ? 1 : 0);
  }
  if (data.isEmailPublic !== undefined) {
    sets.push('is_email_public = ?');
    params.push(data.isEmailPublic ? 1 : 0);
  }

  // `sets` is assembled only from the fixed allowlist above, never user input.
  await execute(`UPDATE users SET ${sets.join(', ')} WHERE id = ? AND society_id = ?`, [
    ...params,
    user.id,
    user.societyId,
  ]);

  await writeAudit({
    actor: user,
    action: 'Profile Updated',
    details: `Updated own profile (${Object.keys(data).join(', ')}).`,
    ip: getClientIp(request),
  });

  const updated = await findUserById(user.id);
  return apiSuccess(updated);
});
