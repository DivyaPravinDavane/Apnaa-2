import type { RowDataPacket } from 'mysql2/promise';
import type { Visitor } from '@/types';
import { apiSuccess, getClientIp, readJson, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { execute, query } from '@/lib/server/db';
import { writeAudit } from '@/lib/server/audit';
import { createNotification } from '@/lib/server/notifications';
import { newId, timeInIst, todayInIst, uniquePassCode } from '@/lib/server/ids';
import { mapVisitor } from '@/lib/server/mappers';
import { visitorCreateSchema } from '@/lib/server/validation';
import { loadVisitor, effectiveVisitorStatus, type VisitorRow } from '@/lib/server/visitors';

export const dynamic = 'force-dynamic';

interface ResidentRow extends RowDataPacket {
  id: string;
  name: string;
}

const ALLOWED_STATUSES: Visitor['status'][] = [
  'expected',
  'pending',
  'approved',
  'denied',
  'checked_in',
  'checked_out',
  'cancelled',
  'expired',
];

export const GET = route(async (request) => {
  const user = await requireUser();
  const status = request.nextUrl.searchParams.get('status');
  const today = todayInIst();

  const conditions = ['v.society_id = ?'];
  const params: unknown[] = [user.societyId];

  if (user.role === 'resident') {
    conditions.push('v.resident_id = ?');
    params.push(user.id);
  } else if (!['admin', 'security'].includes(user.role)) {
    conditions.push('v.resident_id = ?');
    params.push(user.id);
  }

  if (status && ALLOWED_STATUSES.includes(status as Visitor['status'])) {
    // `expired` is computed, not stored, so filter it in SQL explicitly.
    if (status === 'expired') {
      conditions.push("v.visit_date < ? AND v.status NOT IN ('checked_in', 'checked_out', 'denied', 'cancelled')");
      params.push(today);
    } else {
      conditions.push('v.status = ?');
      params.push(status);
    }
  }

  const rows = await query<VisitorRow>(
    `SELECT v.* FROM visitors v
     WHERE ${conditions.join(' AND ')}
     ORDER BY v.created_at DESC
     LIMIT 200`,
    params
  );

  return apiSuccess(rows.map((row) => mapVisitor({ ...row, status: effectiveVisitorStatus(row, today) })));
});

export const POST = route(async (request) => {
  const user = await requireUser(['resident', 'admin', 'security']);
  const input = await readJson(request, visitorCreateSchema);
  const ip = getClientIp(request);

  let residentId: string;
  let residentName: string;
  let unit: string;

  if (user.role === 'resident') {
    residentId = user.id;
    residentName = user.name;
    unit = user.unit;
  } else {
    if (!input.unit) {
      return Response.json(
        { error: { code: 'UNIT_REQUIRED', message: 'Select the resident unit for this visitor.' } },
        { status: 422 }
      );
    }
    const residents = await query<ResidentRow>(
      `SELECT id, name FROM users
       WHERE society_id = ? AND unit = ? AND role = 'resident' AND is_active = 1
       LIMIT 1`,
      [user.societyId, input.unit]
    );
    if (!residents[0]) {
      return Response.json(
        { error: { code: 'INVALID_UNIT', message: 'No active resident was found for that unit.' } },
        { status: 422 }
      );
    }
    residentId = residents[0].id;
    residentName = residents[0].name;
    unit = input.unit;
  }

  const id = newId('vis');
  const passCode = await uniquePassCode(input.passCode);
  const status: Visitor['status'] = user.role === 'security' ? 'pending' : 'expected';
  const createdAt = new Date();

  await execute(
    `INSERT INTO visitors
      (id, society_id, resident_id, resident_name, name, phone, visit_date, arrival_time,
       departure_time, purpose, visitor_count, vehicle_type, vehicle_number, unit, status,
       pass_code, notes, approved_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      user.societyId,
      residentId,
      residentName,
      input.name,
      input.phone,
      input.visitDate || todayInIst(),
      input.arrivalTime || timeInIst(),
      input.departureTime || null,
      input.purpose,
      input.visitorCount,
      input.vehicleType,
      input.vehicleNumber || '',
      unit,
      status,
      passCode,
      input.notes || '',
      status === 'expected' ? createdAt : null,
      createdAt,
    ]
  );

  if (residentId !== user.id) {
    await createNotification({
      societyId: user.societyId,
      userId: residentId,
      title: 'Walk-in Visitor Pending Approval',
      message: `${input.name} is at the gate requesting entry to Flat ${unit}.`,
      type: 'visitor',
      link: '/visitors',
    });
  }

  await writeAudit({
    actor: user,
    action: user.role === 'security' ? 'Walk-in Visitor Registered' : 'Visitor Pre-Approved',
    details: `${user.name} registered visitor ${input.name} for unit ${unit} (pass ${passCode}).`,
    ip,
  });

  const visitor = await loadVisitor(id, user.societyId);
  return apiSuccess(mapVisitor(visitor), undefined, 201);
});
