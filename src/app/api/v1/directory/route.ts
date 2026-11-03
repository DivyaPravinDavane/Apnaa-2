import type { RowDataPacket } from 'mysql2/promise';
import { apiSuccess, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { query } from '@/lib/server/db';
import { mapMember } from '@/lib/server/mappers';

export const dynamic = 'force-dynamic';

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '••••';
  const country = digits.length > 10 ? `+${digits.slice(0, digits.length - 10)} ` : '';
  return `${country}••••• ${digits.slice(-4)}`;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '••••';
  return `${local.slice(0, 1)}${'•'.repeat(Math.max(3, local.length - 1))}@${domain}`;
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}

export const GET = route(async (request) => {
  const user = await requireUser();
  const search = (request.nextUrl.searchParams.get('search') || '').trim().slice(0, 80);
  const wing = (request.nextUrl.searchParams.get('wing') || '').trim().slice(0, 64);

  const conditions = ["u.society_id = ?", "u.role IN ('resident', 'admin')", 'u.is_active = 1'];
  const params: unknown[] = [user.societyId];

  if (search) {
    conditions.push('(u.name LIKE ? OR u.unit LIKE ?)');
    params.push(`%${escapeLike(search)}%`, `%${escapeLike(search)}%`);
  }
  if (wing && wing !== 'All Wings') {
    conditions.push('u.wing = ?');
    params.push(wing);
  }

  const rows = await query<RowDataPacket>(
    `SELECT u.*, s.name AS society_name
     FROM users u
     JOIN societies s ON s.id = u.society_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY u.wing, u.unit
     LIMIT 200`,
    params
  );

  const members = rows.map(mapMember).map((member) => {
    const canSeePhone = user.role === 'admin' || member.id === user.id || member.isPhonePublic;
    const canSeeEmail = user.role === 'admin' || member.id === user.id || member.isEmailPublic;
    return {
      ...member,
      phone: canSeePhone ? member.phone : maskPhone(member.phone),
      email: canSeeEmail ? member.email : maskEmail(member.email),
    };
  });

  return apiSuccess(members);
});
