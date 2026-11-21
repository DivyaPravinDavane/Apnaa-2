import { apiSuccess, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { execute, query } from '@/lib/server/db';
import { writeAudit } from '@/lib/server/audit';
import type { RowDataPacket } from 'mysql2/promise';
import type { DomesticStaff } from '@/types';

export const dynamic = 'force-dynamic';

function rowToStaff(r: RowDataPacket): DomesticStaff {
  return {
    id: r.id,
    unit: r.unit,
    name: r.name,
    role: r.role,
    phone: r.phone,
    passCode: r.pass_code,
    status: r.status,
    entryTime: r.entry_time,
    exitTime: r.exit_time,
    rating: Number(r.rating || 4.8),
  };
}

export const GET = route(async () => {
  const user = await requireUser();
  const rows = await query<RowDataPacket>(
    `SELECT * FROM domestic_staff WHERE society_id = ? ORDER BY status ASC, created_at DESC`,
    [user.societyId]
  );
  return apiSuccess(rows.map(rowToStaff));
});

export const POST = route(async (request) => {
  const user = await requireUser();
  const body = (await request.json()) as Partial<DomesticStaff>;

  const id = `stf_${Date.now()}`;
  const name = body.name?.trim() || 'Domestic Helper';
  const role = body.role || 'House Maid';
  const phone = body.phone || '+91 98000 00000';
  const passCode = `HELP-${Math.floor(1000 + Math.random() * 9000)}`;

  await execute(
    `INSERT INTO domestic_staff (id, society_id, unit, user_id, name, role, phone, pass_code, status, rating)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'outside', 4.9)`,
    [id, user.societyId, user.unit, user.id, name, role, phone, passCode]
  );

  await writeAudit({
    actor: user,
    action: 'Domestic Staff Onboarded',
    details: `${name} (${role}) issued gate pass ${passCode} for Flat ${user.unit}`,
  });

  return apiSuccess(
    {
      id,
      unit: user.unit,
      name,
      role,
      phone,
      passCode,
      status: 'outside',
      rating: 4.9,
    },
    undefined,
    201
  );
});

