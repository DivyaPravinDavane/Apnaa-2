import { apiSuccess, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { execute, query } from '@/lib/server/db';
import { writeAudit } from '@/lib/server/audit';
import type { RowDataPacket } from 'mysql2/promise';
import type { Vehicle } from '@/types';

export const dynamic = 'force-dynamic';

function rowToVehicle(r: RowDataPacket): Vehicle {
  return {
    id: r.id,
    userId: r.user_id,
    unit: r.unit,
    vehicleType: r.vehicle_type,
    makeModel: r.make_model,
    vehicleNumber: r.vehicle_number,
    parkingSlot: r.parking_slot,
    isLocked: Boolean(Number(r.is_locked)),
    lastMovement: r.last_movement,
    createdAt: r.created_at,
  };
}

export const GET = route(async () => {
  const user = await requireUser();
  const rows = await query<RowDataPacket>(
    `SELECT * FROM vehicles WHERE society_id = ? ORDER BY is_locked DESC, created_at DESC`,
    [user.societyId]
  );
  return apiSuccess(rows.map(rowToVehicle));
});

export const PATCH = route(async (request) => {
  const user = await requireUser();
  const body = (await request.json()) as { id: string; isLocked: boolean };
  const nextLockState = body.isLocked ? 1 : 0;

  const movementText = body.isLocked
    ? `Digital Lock Activated by ${user.name} (Gate alerted)`
    : `Unlocked by ${user.name} • Ready for Gate Exit`;

  await execute(
    `UPDATE vehicles 
     SET is_locked = ?, last_movement = ? 
     WHERE id = ? AND society_id = ?`,
    [nextLockState, movementText, body.id, user.societyId]
  );

  await writeAudit({
    actor: user,
    action: body.isLocked ? 'Vehicle Wheel Clamp Locked' : 'Vehicle Security Unlocked',
    details: `${user.name} (${user.unit}) set vehicle ${body.id} lock status to ${body.isLocked ? 'LOCKED' : 'UNLOCKED'}`,
  });

  return apiSuccess({ success: true, id: body.id, isLocked: Boolean(body.isLocked) });
});

export const POST = route(async (request) => {
  const user = await requireUser();
  const body = (await request.json()) as Partial<Vehicle>;

  const id = `veh_${Date.now()}`;
  const vehicleType = body.vehicleType || 'Car';
  const makeModel = body.makeModel || 'Personal Vehicle';
  const vehicleNumber = (body.vehicleNumber || 'MH 02 AA 1111').toUpperCase().trim();
  const parkingSlot = body.parkingSlot || `Slot-${user.unit}`;

  await execute(
    `INSERT INTO vehicles (id, society_id, user_id, unit, vehicle_type, make_model, vehicle_number, parking_slot, is_locked, last_movement)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 'Registered in Gated Community')`,
    [id, user.societyId, user.id, user.unit, vehicleType, makeModel, vehicleNumber, parkingSlot]
  );

  await writeAudit({
    actor: user,
    action: 'Vehicle Registered',
    details: `Registered ${makeModel} (${vehicleNumber}) in slot ${parkingSlot}`,
  });

  return apiSuccess(
    {
      id,
      userId: user.id,
      unit: user.unit,
      vehicleType,
      makeModel,
      vehicleNumber,
      parkingSlot,
      isLocked: false,
      lastMovement: 'Registered in Gated Community',
    },
    undefined,
    201
  );
});

