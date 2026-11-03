import type { RowDataPacket } from 'mysql2/promise';
import { ApiError, apiSuccess, getClientIp, getParamAsync, readJson, route } from '@/lib/server/http';
import { hashPassword, requireUser } from '@/lib/server/auth';
import { execute, query } from '@/lib/server/db';
import { writeAudit } from '@/lib/server/audit';
import { mapMember } from '@/lib/server/mappers';
import { residentUpdateSchema } from '@/lib/server/validation';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

interface TargetRow extends RowDataPacket {
  id: string;
  role: string;
  is_active: number;
}

export const PATCH = route<Ctx>(async (request, context) => {
  const admin = await requireUser(['admin']);
  const id = await getParamAsync(context, 'id');
  const input = await readJson(request, residentUpdateSchema);

  const targets = await query<TargetRow>(
    'SELECT id, role, is_active FROM users WHERE id = ? AND society_id = ? AND deleted_at IS NULL LIMIT 1',
    [id, admin.societyId]
  );
  const target = targets[0];
  if (!target) throw new ApiError(404, 'RESIDENT_NOT_FOUND', 'Resident was not found.');

  if (target.id === admin.id && (input.isActive === false || (input.role && input.role !== 'admin'))) {
    throw new ApiError(422, 'SELF_LOCKOUT', 'You cannot deactivate or demote your own admin account.');
  }

  // Never leave the society without an active committee administrator.
  if (
    target.role === 'admin' &&
    (input.isActive === false || (input.role && input.role !== 'admin'))
  ) {
    const remaining = await query<RowDataPacket>(
      `SELECT COUNT(*) AS total FROM users
       WHERE society_id = ? AND role = 'admin' AND is_active = 1 AND deleted_at IS NULL
         AND id <> ?`,
      [admin.societyId, id]
    );
    if (!Number(remaining[0]?.total || 0)) {
      throw new ApiError(422, 'LAST_ADMIN', 'At least one active committee administrator is required.');
    }
  }

  const columns: Record<string, string> = {
    name: 'name',
    email: 'email',
    phone: 'phone',
    unit: 'unit',
    wing: 'wing',
    floor: 'floor',
    role: 'role',
    membershipType: 'membership_type',
    isActive: 'is_active',
  };

  const sets: string[] = [];
  const params: unknown[] = [];
  for (const [key, column] of Object.entries(columns)) {
    const value = (input as Record<string, unknown>)[key];
    if (value !== undefined) {
      sets.push(`${column} = ?`);
      params.push(key === 'isActive' ? (value ? 1 : 0) : value);
    }
  }
  if (input.password) {
    sets.push('password_hash = ?');
    params.push(await hashPassword(input.password));
  }
  if (!sets.length) throw new ApiError(422, 'VALIDATION_ERROR', 'Nothing to update.');

  await execute(`UPDATE users SET ${sets.join(', ')} WHERE id = ? AND society_id = ?`, [
    ...params,
    id,
    admin.societyId,
  ]);

  if (input.isActive === false) {
    // Revoke sessions immediately when portal access is suspended.
    await execute(
      'UPDATE sessions SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL',
      [id]
    );
  }

  await writeAudit({
    actor: admin,
    action: input.isActive === false ? 'Resident Access Suspended' : 'Resident Updated',
    details: `Updated ${target.role} account ${id} (${Object.keys(input).join(', ')}).`,
    ip: getClientIp(request),
  });

  const rows = await query<RowDataPacket>(
    `SELECT u.*, s.name AS society_name FROM users u JOIN societies s ON s.id = u.society_id WHERE u.id = ? LIMIT 1`,
    [id]
  );
  return apiSuccess(mapMember(rows[0]));
});

export const DELETE = route<Ctx>(async (request, context) => {
  const admin = await requireUser(['admin']);
  const id = await getParamAsync(context, 'id');
  if (id === admin.id) {
    throw new ApiError(422, 'SELF_DELETE', 'You cannot delete your own account.');
  }

  const targets = await query<TargetRow>(
    'SELECT id, role, is_active FROM users WHERE id = ? AND society_id = ? AND deleted_at IS NULL LIMIT 1',
    [id, admin.societyId]
  );
  if (!targets[0]) throw new ApiError(404, 'RESIDENT_NOT_FOUND', 'Resident was not found.');
  if (targets[0].role === 'admin') {
    throw new ApiError(422, 'ADMIN_DELETE', 'Committee administrators must be demoted before deletion.');
  }

  // Soft delete preserves visitor, booking, and audit history while revoking
  // all access and freeing the email/phone for future onboarding.
  const suffix = `del_${Date.now().toString(36)}`;
  await execute(
    `UPDATE users
     SET is_active = 0,
         deleted_at = UTC_TIMESTAMP(),
         email = CONCAT(LEFT(email, 170), '.', ?),
         phone = CONCAT(LEFT(phone, 18), '.', ?)
     WHERE id = ? AND society_id = ?`,
    [suffix, suffix, id, admin.societyId]
  );
  await execute('UPDATE sessions SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL', [id]);
  await writeAudit({
    actor: admin,
    action: 'Resident Removed',
    details: `Removed ${targets[0].role} account ${id} and revoked portal access.`,
    ip: getClientIp(request),
  });

  return apiSuccess({ success: true });
});
