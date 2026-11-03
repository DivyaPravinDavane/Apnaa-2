import type { RowDataPacket } from 'mysql2/promise';
import type { Visitor } from '@/types';
import { ApiError } from './http';
import { query } from './db';
import { mapVisitor } from './mappers';
import type { AuthUser } from './auth';

export interface VisitorRow extends RowDataPacket {
  id: string;
  society_id: string;
  resident_id: string;
  resident_name: string;
  name: string;
  phone: string;
  visit_date: string;
  arrival_time: string;
  departure_time: string | null;
  purpose: string;
  visitor_count: number;
  vehicle_type: Visitor['vehicleType'];
  vehicle_number: string;
  unit: string;
  status: Visitor['status'];
  pass_code: string;
  notes: string | null;
  approved_at: string | null;
  entry_time: string | null;
  exit_time: string | null;
  created_at: string;
}

export async function loadVisitor(id: string, societyId: string): Promise<VisitorRow> {
  const rows = await query<VisitorRow>('SELECT * FROM visitors WHERE id = ? AND society_id = ? LIMIT 1', [
    id,
    societyId,
  ]);
  if (!rows[0]) throw new ApiError(404, 'VISITOR_NOT_FOUND', 'Visitor was not found.');
  return rows[0];
}

export async function findVisitorByPass(token: string, societyId: string): Promise<VisitorRow | null> {
  const rows = await query<VisitorRow>(
    `SELECT * FROM visitors
     WHERE society_id = ? AND (pass_code = ? OR id = ?)
     LIMIT 1`,
    [societyId, token.toUpperCase(), token]
  );
  return rows[0] || null;
}

/** Residents may only manage visitors for their own unit; admins may manage any. */
export function assertCanManageVisitor(user: AuthUser, visitor: VisitorRow): void {
  if (user.role === 'admin') return;
  if (user.role === 'resident' && visitor.resident_id === user.id) return;
  throw new ApiError(403, 'FORBIDDEN', 'You cannot manage this visitor request.');
}

export function effectiveVisitorStatus(visitor: VisitorRow, today: string): Visitor['status'] {
  if (['checked_in', 'checked_out', 'denied', 'cancelled'].includes(visitor.status)) {
    return visitor.status;
  }
  if (visitor.visit_date < today) return 'expired';
  return visitor.status;
}

export function toVisitor(row: VisitorRow): Visitor {
  return mapVisitor(row);
}
