import crypto from 'node:crypto';
import type { RowDataPacket } from 'mysql2/promise';
import { apiSuccess, getClientIp, readJson, route } from '@/lib/server/http';
import { hashPassword, requireUser } from '@/lib/server/auth';
import { execute, query } from '@/lib/server/db';
import { writeAudit } from '@/lib/server/audit';
import { newId } from '@/lib/server/ids';
import { mapMember } from '@/lib/server/mappers';
import { residentCreateSchema } from '@/lib/server/validation';

export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  const user = await requireUser(['admin']);
  const rows = await query<RowDataPacket>(
    `SELECT u.*, s.name AS society_name
     FROM users u
     JOIN societies s ON s.id = u.society_id
     WHERE u.society_id = ? AND u.deleted_at IS NULL
       AND u.role IN ('resident', 'admin', 'security', 'facility')
     ORDER BY u.wing, u.unit, u.name
     LIMIT 500`,
    [user.societyId]
  );
  return apiSuccess(rows.map(mapMember));
});

function generateTemporaryPassword(): string {
  // 18 characters mixing upper/lower/digits; always satisfies the 12-char policy.
  return `Apnaa@${crypto.randomBytes(9).toString('base64url')}`;
}

export const POST = route(async (request) => {
  const admin = await requireUser(['admin']);
  const input = await readJson(request, residentCreateSchema);
  const id = newId('usr');
  const temporaryPassword = input.password || generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);

  await execute(
    `INSERT INTO users
      (id, society_id, name, email, phone, password_hash, role, unit, wing, floor, avatar,
       membership_type, bio, interests, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', ?, '', JSON_ARRAY(), 1)`,
    [
      id,
      admin.societyId,
      input.name,
      input.email,
      input.phone,
      passwordHash,
      input.role,
      input.unit,
      input.wing,
      input.floor,
      input.membershipType,
    ]
  );

  await writeAudit({
    actor: admin,
    action: 'Resident Onboarded',
    details: `Created ${input.role} account for ${input.name} (${input.unit}).`,
    ip: getClientIp(request),
  });

  const rows = await query<RowDataPacket>(
    `SELECT u.*, s.name AS society_name FROM users u JOIN societies s ON s.id = u.society_id WHERE u.id = ? LIMIT 1`,
    [id]
  );
  const member = mapMember(rows[0]);
  // The plaintext value is returned exactly once so the admin can share it.
  // It is never stored anywhere except as the bcrypt hash above.
  if (!input.password) member.temporaryPassword = temporaryPassword;
  return apiSuccess(member, undefined, 201);
});
