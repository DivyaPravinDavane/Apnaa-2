import { apiSuccess, route } from '@/lib/server/http';
import { query } from '@/lib/server/db';
import type { RowDataPacket } from 'mysql2/promise';

export const dynamic = 'force-dynamic';

const ALLOWED_TABLES = [
  'societies',
  'users',
  'visitors',
  'community_polls',
  'poll_votes',
  'unit_bills',
  'gate_updates',
  'service_requests',
  'amenities',
  'bookings',
  'notices',
  'notice_reads',
  'notice_acknowledgements',
  'events',
  'event_rsvps',
  'albums',
  'media_items',
  'notifications',
  'security_logs',
  'facility_check_ins',
  'audit_logs',
  'sessions',
  'otp_codes',
  'rate_limits',
] as const;

export const GET = route(async (request) => {
  const tableParam = request.nextUrl.searchParams.get('table') || 'visitors';
  const safeTable = ALLOWED_TABLES.includes(tableParam as (typeof ALLOWED_TABLES)[number])
    ? tableParam
    : 'visitors';

  const counts: Record<string, number> = {};
  for (const tbl of ALLOWED_TABLES) {
    try {
      const [row] = await query<RowDataPacket>(`SELECT COUNT(*) AS cnt FROM \`${tbl}\``);
      counts[tbl] = Number(row?.cnt || 0);
    } catch {
      counts[tbl] = 0;
    }
  }

  let rows: RowDataPacket[] = [];
  let columns: string[] = [];
  try {
    const colRows = await query<RowDataPacket>(`SHOW COLUMNS FROM \`${safeTable}\``);
    columns = colRows.map((c) => String(c.Field));
    const hasCreatedAt = columns.includes('created_at');
    const orderClause = hasCreatedAt ? 'ORDER BY created_at DESC' : '';
    rows = await query<RowDataPacket>(`SELECT * FROM \`${safeTable}\` ${orderClause} LIMIT 100`);
  } catch {
    rows = [];
  }

  return apiSuccess({
    database: process.env.DB_NAME || 'apna_society',
    host: process.env.DB_HOST || '127.0.0.1',
    activeTable: safeTable,
    tables: ALLOWED_TABLES,
    counts,
    columns,
    rows,
  });
});

