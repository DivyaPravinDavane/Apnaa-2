import type { RowDataPacket } from 'mysql2/promise';
import { apiSuccess, getClientIp, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { execute, query } from '@/lib/server/db';
import { writeAudit } from '@/lib/server/audit';
import { newId, uniquePassCode } from '@/lib/server/ids';

export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  const user = await requireUser();
  const [bills, gateUpdates, serviceRequests] = await Promise.all([
    query<RowDataPacket>(
      `SELECT * FROM unit_bills WHERE society_id = ? ORDER BY created_at DESC LIMIT 50`,
      [user.societyId]
    ),
    query<RowDataPacket>(
      `SELECT * FROM gate_updates WHERE society_id = ? ORDER BY created_at DESC LIMIT 50`,
      [user.societyId]
    ),
    query<RowDataPacket>(
      `SELECT * FROM service_requests WHERE society_id = ? ORDER BY created_at DESC LIMIT 50`,
      [user.societyId]
    ),
  ]);

  return apiSuccess({ bills, gateUpdates, serviceRequests });
});

export const POST = route(async (request) => {
  const user = await requireUser();
  const body = (await request.json()) as {
    type: 'pay_bill' | 'gate_update' | 'service_request';
    billId?: string;
    amount?: number;
    updateType?: 'Cab' | 'Exit pass' | 'School bus';
    details?: string;
    deskType?: 'Service Desk' | 'Request Desk' | 'Helpdesk';
    category?: string;
    title?: string;
    description?: string;
  };

  if (body.type === 'pay_bill') {
    if (body.billId) {
      await execute(
        `UPDATE unit_bills SET status = 'paid', paid_at = NOW(), payment_method = 'Instant UPI' WHERE id = ?`,
        [body.billId]
      );
    } else {
      await execute(
        `UPDATE unit_bills SET status = 'paid', paid_at = NOW(), payment_method = 'Instant UPI'
         WHERE society_id = ? AND unit = ? AND status = 'unpaid'`,
        [user.societyId, user.unit]
      );
    }

    await writeAudit({
      actor: user,
      action: 'Maintenance Bill Paid',
      details: `${user.name} (Flat ${user.unit}) paid maintenance dues via Instant UPI`,
      ip: getClientIp(request),
    });

    return apiSuccess({ success: true });
  }

  if (body.type === 'gate_update') {
    const id = newId('gu');
    const updateType = body.updateType || 'Cab';
    const passCode = await uniquePassCode(`${updateType.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`);
    const details = body.details || `${updateType} entry pass created by ${user.name} (Flat ${user.unit})`;

    await execute(
      `INSERT INTO gate_updates (id, society_id, unit, user_id, update_type, details, pass_code, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
      [id, user.societyId, user.unit, user.id, updateType, details, passCode]
    );

    await writeAudit({
      actor: user,
      action: `Gate Update Created (${updateType})`,
      details: `${details} [Pass: ${passCode}]`,
      ip: getClientIp(request),
    });

    return apiSuccess({ id, updateType, details, passCode }, undefined, 201);
  }

  // service_request
  const id = newId('sr');
  const deskType = body.deskType || 'Helpdesk';
  const category = body.category || 'General';
  const title = body.title || 'Resident Service Request';
  const description = body.description || '';

  await execute(
    `INSERT INTO service_requests (id, society_id, unit, user_id, desk_type, category, title, description, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
    [id, user.societyId, user.unit, user.id, deskType, category, title, description]
  );

  await writeAudit({
    actor: user,
    action: `${deskType} Ticket Logged`,
    details: `${user.name} (${user.unit}) logged "${title}" (${category})`,
    ip: getClientIp(request),
  });

  return apiSuccess({ id, deskType, category, title, status: 'open' }, undefined, 201);
});

