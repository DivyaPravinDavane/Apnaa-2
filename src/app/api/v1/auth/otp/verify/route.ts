import bcrypt from 'bcryptjs';
import type { RowDataPacket } from 'mysql2/promise';
import { ApiError, apiSuccess, getClientIp, readJson, route } from '@/lib/server/http';
import { enforceRateLimit } from '@/lib/server/rate-limit';
import { execute, query } from '@/lib/server/db';
import { createSession, findUserById } from '@/lib/server/auth';
import { writeAudit } from '@/lib/server/audit';
import { otpVerifySchema } from '@/lib/server/validation';

export const dynamic = 'force-dynamic';

interface OtpRow extends RowDataPacket {
  id: string;
  user_id: string | null;
  code_hash: string;
  attempts: number;
}

export const POST = route(async (request) => {
  const { mobile, otp } = await readJson(request, otpVerifySchema);
  const ip = getClientIp(request);
  const digits = mobile.replace(/\D/g, '').slice(-10);

  await enforceRateLimit(`otp:verify:ip:${ip}`, 20, 900);
  await enforceRateLimit(`otp:verify:mobile:${digits}`, 8, 900);

  const rows = await query<OtpRow>(
    `SELECT id, user_id, code_hash, attempts
     FROM otp_codes
     WHERE mobile = ? AND consumed_at IS NULL AND expires_at > UTC_TIMESTAMP() AND attempts < 5
     ORDER BY created_at DESC
     LIMIT 1`,
    [digits]
  );

  const record = rows[0];
  if (!record) {
    throw new ApiError(401, 'INVALID_OTP', 'The code is invalid or has expired.');
  }

  const valid = await bcrypt.compare(otp, record.code_hash);
  if (!valid) {
    await execute('UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?', [record.id]);
    throw new ApiError(401, 'INVALID_OTP', 'The code is invalid or has expired.');
  }

  await execute('UPDATE otp_codes SET consumed_at = UTC_TIMESTAMP() WHERE id = ?', [record.id]);

  if (!record.user_id) {
    // Correct code but no matching account: same generic response as a bad code.
    throw new ApiError(401, 'INVALID_OTP', 'The code is invalid or has expired.');
  }

  const user = await findUserById(record.user_id);
  if (!user) {
    throw new ApiError(401, 'INVALID_OTP', 'The code is invalid or has expired.');
  }

  await createSession(user.id, request);
  await writeAudit({
    actor: user,
    action: 'OTP Login',
    details: `Successful OTP login for ${user.name} (${user.role}).`,
    ip,
  });

  return apiSuccess(user);
});
