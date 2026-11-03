import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import type { RowDataPacket } from 'mysql2/promise';
import { apiSuccess, getClientIp, readJson, route } from '@/lib/server/http';
import { enforceRateLimit } from '@/lib/server/rate-limit';
import { execute, query } from '@/lib/server/db';
import { getDefaultSocietyId, isProduction } from '@/lib/server/config';
import { otpRequestSchema } from '@/lib/server/validation';

export const dynamic = 'force-dynamic';

interface UserRow extends RowDataPacket {
  id: string;
}

const OTP_TTL_SECONDS = 300;

function lastTenDigits(value: string): string {
  return value.replace(/\D/g, '').slice(-10);
}

export const POST = route(async (request) => {
  const { mobile } = await readJson(request, otpRequestSchema);
  const ip = getClientIp(request);
  const digits = lastTenDigits(mobile);

  await enforceRateLimit(`otp:request:ip:${ip}`, 10, 600);
  await enforceRateLimit(`otp:request:mobile:${digits}`, 4, 600);

  const users = await query<UserRow>(
    `SELECT id FROM users
     WHERE is_active = 1 AND society_id = ?
       AND RIGHT(REGEXP_REPLACE(phone, '[^0-9]', ''), 10) = ?
     LIMIT 1`,
    [getDefaultSocietyId(), digits]
  );

  const otp = String(crypto.randomInt(100000, 1000000));
  const codeHash = await bcrypt.hash(otp, 10);
  const requestId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000);

  await execute(
    `INSERT INTO otp_codes (id, user_id, mobile, code_hash, expires_at, request_ip)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [requestId, users[0]?.id || null, digits, codeHash, expiresAt, ip]
  );

  // Never reveal whether a phone number belongs to an account.
  return apiSuccess({
    requestId,
    expiresInSeconds: OTP_TTL_SECONDS,
    // Development convenience only. Production must deliver the OTP over SMS.
    ...(isProduction() ? {} : { devOtp: otp }),
  });
});
