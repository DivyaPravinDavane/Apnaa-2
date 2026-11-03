import type { RowDataPacket } from 'mysql2/promise';
import { execute, query } from './db';
import { ApiError } from './http';

interface RateLimitRow extends RowDataPacket {
  hits: number;
  reset_at: string;
}

/**
 * Fixed-window rate limiter backed by MySQL so limits are shared between
 * processes/instances (an in-memory limiter is trivially bypassed by scaling).
 */
export async function enforceRateLimit(
  bucket: string,
  limit: number,
  windowSeconds: number
): Promise<{ remaining: number }> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowSeconds * 1000);

  await execute(
    `INSERT INTO rate_limits (bucket_key, hits, reset_at)
     VALUES (?, 1, ?)
     ON DUPLICATE KEY UPDATE
       hits = IF(reset_at <= ?, 1, hits + 1),
       reset_at = IF(reset_at <= ?, ?, reset_at)`,
    [bucket.slice(0, 190), resetAt, now, now, resetAt]
  );

  const rows = await query<RateLimitRow>('SELECT hits, reset_at FROM rate_limits WHERE bucket_key = ?', [
    bucket.slice(0, 190),
  ]);

  const hits = Number(rows[0]?.hits || 0);
  if (hits > limit) {
    throw new ApiError(429, 'RATE_LIMITED', 'Too many attempts. Please try again later.');
  }
  return { remaining: Math.max(0, limit - hits) };
}
