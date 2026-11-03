import type { RowDataPacket } from 'mysql2/promise';
import { ApiError, apiSuccess, getClientIp, getParamAsync, readJson, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { execute, query } from '@/lib/server/db';
import { writeAudit } from '@/lib/server/audit';
import { mapAmenity } from '@/lib/server/mappers';
import { adminAmenityUpdateSchema } from '@/lib/server/validation';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export const GET = route<Ctx>(async (_request, context) => {
  const user = await requireUser();
  const id = await getParamAsync(context, 'id');
  const rows = await query<RowDataPacket>('SELECT * FROM amenities WHERE id = ? AND society_id = ? LIMIT 1', [
    id,
    user.societyId,
  ]);
  if (!rows[0]) throw new ApiError(404, 'AMENITY_NOT_FOUND', 'Amenity was not found.');
  return apiSuccess(mapAmenity(rows[0]));
});

export const PATCH = route<Ctx>(async (request, context) => {
  const user = await requireUser(['admin']);
  const id = await getParamAsync(context, 'id');
  const input = await readJson(request, adminAmenityUpdateSchema);

  const columns: Record<string, string> = {
    name: 'name',
    capacity: 'capacity',
    operatingHours: 'operating_hours',
    slotDurationMinutes: 'slot_duration_minutes',
    status: 'status',
    bookingHorizonDays: 'booking_horizon_days',
    description: 'description',
    location: 'location',
    rules: 'rules',
    facilities: 'facilities',
  };

  const sets: string[] = [];
  const params: unknown[] = [];
  for (const [key, column] of Object.entries(columns)) {
    const value = (input as Record<string, unknown>)[key];
    if (value !== undefined) {
      sets.push(`${column} = ?`);
      params.push(key === 'rules' || key === 'facilities' ? JSON.stringify(value) : value);
    }
  }
  if (!sets.length) throw new ApiError(422, 'VALIDATION_ERROR', 'Nothing to update.');

  const result = await execute(`UPDATE amenities SET ${sets.join(', ')} WHERE id = ? AND society_id = ?`, [
    ...params,
    id,
    user.societyId,
  ]);
  if (!result.affectedRows) throw new ApiError(404, 'AMENITY_NOT_FOUND', 'Amenity was not found.');

  await writeAudit({
    actor: user,
    action: 'Amenity Updated',
    details: `Updated amenity ${id} (${Object.keys(input).join(', ')}).`,
    ip: getClientIp(request),
  });

  const rows = await query<RowDataPacket>('SELECT * FROM amenities WHERE id = ? AND society_id = ? LIMIT 1', [
    id,
    user.societyId,
  ]);
  return apiSuccess(mapAmenity(rows[0]));
});
