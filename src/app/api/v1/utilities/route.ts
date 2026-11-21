import { apiSuccess, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { execute, query } from '@/lib/server/db';
import { writeAudit } from '@/lib/server/audit';
import type { RowDataPacket } from 'mysql2/promise';
import type { UtilityReading } from '@/types';

export const dynamic = 'force-dynamic';

function rowToUtility(r: RowDataPacket): UtilityReading {
  return {
    id: r.id,
    unit: r.unit,
    meterType: r.meter_type,
    meterNumber: r.meter_number,
    previousReading: Number(r.previous_reading || 0),
    currentReading: Number(r.current_reading || 0),
    unitsConsumed: Number(r.units_consumed || 0),
    recordedByName: r.recorded_by_name,
    recordedDate: String(r.recorded_date).slice(0, 10),
    status: r.status,
  };
}

export const GET = route(async () => {
  const user = await requireUser();
  const rows = await query<RowDataPacket>(
    `SELECT * FROM utility_readings WHERE society_id = ? ORDER BY recorded_date DESC, created_at DESC`,
    [user.societyId]
  );
  return apiSuccess(rows.map(rowToUtility));
});

export const POST = route(async (request) => {
  const user = await requireUser();
  const body = (await request.json()) as Partial<UtilityReading>;

  const id = `utl_${Date.now()}`;
  const unit = body.unit || user.unit;
  const meterType = body.meterType || 'water';
  const meterNumber = body.meterNumber || `${meterType.toUpperCase()}-${unit}`;
  const previousReading = Number(body.previousReading || 0);
  const currentReading = Number(body.currentReading || 0);
  const unitsConsumed = Math.max(0, currentReading - previousReading);
  const recordedByName = user.name;
  const recordedDate = new Date().toISOString().slice(0, 10);

  await execute(
    `INSERT INTO utility_readings 
       (id, society_id, unit, meter_type, meter_number, previous_reading, current_reading, units_consumed, recorded_by_name, recorded_date, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [
      id,
      user.societyId,
      unit,
      meterType,
      meterNumber,
      previousReading,
      currentReading,
      unitsConsumed,
      recordedByName,
      recordedDate,
    ]
  );

  await writeAudit({
    actor: user,
    action: 'Digital Meter Reading Logged',
    details: `${recordedByName} recorded ${unitsConsumed} units for ${meterType} (Meter: ${meterNumber}) in Flat ${unit}`,
  });

  return apiSuccess(
    {
      id,
      unit,
      meterType,
      meterNumber,
      previousReading,
      currentReading,
      unitsConsumed,
      recordedByName,
      recordedDate,
      status: 'pending',
    },
    undefined,
    201
  );
});

