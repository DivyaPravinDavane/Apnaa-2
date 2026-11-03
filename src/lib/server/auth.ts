import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { RowDataPacket } from 'mysql2/promise';
import type { User, UserRole } from '@/types';
import { getJwtSecret, isProduction, sessionTtlSeconds } from './config';
import { execute, query } from './db';
import { ApiError } from './http';

export const SESSION_COOKIE = 'apnaa_session';
const ISSUER = 'apnaa-society';
const AUDIENCE = 'apnaa-web';

export type AuthUser = User & { societyId: string };

interface UserRow extends RowDataPacket {
  id: string;
  society_id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  unit: string;
  wing: string;
  floor: string;
  avatar: string;
  membership_type: User['membershipType'];
  bio: string | null;
  interests: unknown;
  is_phone_public: number;
  is_email_public: number;
  society_name: string;
}

function parseInterests(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function rowToAuthUser(row: UserRow): AuthUser {
  return {
    id: row.id,
    societyId: row.society_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    unit: row.unit,
    wing: row.wing,
    floor: row.floor,
    societyName: row.society_name,
    avatar: row.avatar,
    membershipType: row.membership_type,
    bio: row.bio || undefined,
    interests: parseInterests(row.interests),
    isPhonePublic: Boolean(Number(row.is_phone_public)),
    isEmailPublic: Boolean(Number(row.is_email_public)),
  };
}

const USER_SELECT = `
  SELECT u.*, s.name AS society_name
  FROM users u
  JOIN societies s ON s.id = u.society_id
`;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, hash: string | null | undefined): Promise<boolean> {
  if (!hash) return Promise.resolve(false);
  return bcrypt.compare(password, hash);
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Creates a server-side session row and signs a short-lived JWT whose `jti`
 * points at it. Revoking the row immediately invalidates the cookie.
 */
export async function createSession(userId: string, request?: Request): Promise<{ token: string; expiresAt: Date }> {
  const sessionId = crypto.randomUUID();
  const ttl = sessionTtlSeconds();
  const expiresAt = new Date(Date.now() + ttl * 1000);

  const token = await new SignJWT({ role: undefined })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(userId)
    .setJti(sessionId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(getJwtSecret());

  await execute(
    `INSERT INTO sessions (id, user_id, token_hash, ip, user_agent, expires_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      sessionId,
      userId,
      hashToken(token),
      request?.headers.get('x-forwarded-for')?.split(',')[0]?.trim().slice(0, 64) || null,
      request?.headers.get('user-agent')?.slice(0, 255) || null,
      expiresAt,
    ]
  );

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
    priority: 'high',
  });

  // Opportunistic cleanup of long-expired sessions.
  void execute('DELETE FROM sessions WHERE expires_at < UTC_TIMESTAMP() - INTERVAL 7 DAY').catch(() => undefined);

  return { token, expiresAt };
}

export async function destroySession(): Promise<void> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (token) {
    await execute('UPDATE sessions SET revoked_at = UTC_TIMESTAMP() WHERE token_hash = ? AND revoked_at IS NULL', [
      hashToken(token),
    ]);
  }
  (await cookies()).delete(SESSION_COOKIE);
}

/** Returns the authenticated user or null. Never trusts client-provided roles. */
export async function getSessionUser(): Promise<AuthUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  let sessionId: string | undefined;
  let subject: string | undefined;
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), { issuer: ISSUER, audience: AUDIENCE });
    sessionId = payload.jti;
    subject = payload.sub;
  } catch {
    return null;
  }
  if (!sessionId || !subject) return null;

  const rows = await query<UserRow>(
    `${USER_SELECT}
     JOIN sessions se ON se.user_id = u.id
     WHERE se.id = ? AND se.token_hash = ? AND se.user_id = ?
       AND se.expires_at > UTC_TIMESTAMP() AND se.revoked_at IS NULL
       AND u.is_active = 1
     LIMIT 1`,
    [sessionId, hashToken(token), subject]
  );

  return rows[0] ? rowToAuthUser(rows[0]) : null;
}

export async function requireUser(roles?: UserRole[]): Promise<AuthUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new ApiError(401, 'UNAUTHENTICATED', 'Please sign in to continue.');
  }
  if (roles && !roles.includes(user.role)) {
    throw new ApiError(403, 'FORBIDDEN', 'You do not have permission to perform this action.');
  }
  return user;
}

export async function findUserById(id: string): Promise<AuthUser | null> {
  const rows = await query<UserRow>(`${USER_SELECT} WHERE u.id = ? AND u.is_active = 1 LIMIT 1`, [id]);
  return rows[0] ? rowToAuthUser(rows[0]) : null;
}

export async function findUserByRole(role: UserRole): Promise<AuthUser | null> {
  const rows = await query<UserRow>(
    `${USER_SELECT} WHERE u.role = ? AND u.is_active = 1 ORDER BY u.created_at ASC LIMIT 1`,
    [role]
  );
  return rows[0] ? rowToAuthUser(rows[0]) : null;
}

/** Strips server-only credential columns before a user object leaves the API. */
export function publicUser(user: AuthUser & { passwordHash?: string | null }): AuthUser {
  const clone: AuthUser & { passwordHash?: string | null } = { ...user };
  delete clone.passwordHash;
  return clone;
}

export async function findUserByLogin(login: string): Promise<(AuthUser & { passwordHash: string | null }) | null> {
  const rows = await query<UserRow & { password_hash: string | null }>(
    `${USER_SELECT} WHERE (LOWER(u.email) = LOWER(?) OR REPLACE(REPLACE(u.phone, ' ', ''), '+', '') = ?) AND u.is_active = 1 LIMIT 1`,
    [login, login.replace(/[^\d]/g, '')]
  );
  if (!rows[0]) return null;
  return { ...rowToAuthUser(rows[0]), passwordHash: rows[0].password_hash };
}
