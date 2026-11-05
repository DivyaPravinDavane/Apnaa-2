import fs from 'node:fs/promises';
import path from 'node:path';
import type { RowDataPacket } from 'mysql2/promise';
import { query } from './db';

const TABLES_IN_ORDER = [
  'societies',
  'users',
  'rate_limits',
  'otp_codes',
  'sessions',
  'visitors',
  'amenities',
  'bookings',
  'notices',
  'notice_acknowledgements',
  'notice_reads',
  'events',
  'event_rsvps',
  'albums',
  'media_items',
  'notifications',
  'security_logs',
  'facility_check_ins',
  'audit_logs',
  'community_polls',
  'poll_votes',
  'unit_bills',
  'gate_updates',
  'service_requests',
];

function escapeSqlValue(val: unknown): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return val ? '1' : '0';
  if (val instanceof Date) {
    return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
  }
  const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
  return `'${str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "''")
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')}'`;
}

export async function exportLiveDatabaseToSqlFiles(): Promise<void> {
  try {
    const schemaPath = path.resolve(process.cwd(), 'db/schema.sql');
    const schemaSql = await fs.readFile(schemaPath, 'utf8');

    const insertBlocks: string[] = [];

    for (const table of TABLES_IN_ORDER) {
      const rows = await query<RowDataPacket>(`SELECT * FROM \`${table}\``);
      if (!rows.length) continue;

      const colRows = await query<RowDataPacket>(`SHOW COLUMNS FROM \`${table}\``);
      // Exclude GENERATED ALWAYS columns (such as active_slot_key in bookings)
      const insertableCols = colRows
        .filter((c) => !String(c.Extra || '').toUpperCase().includes('GENERATED'))
        .map((c) => String(c.Field));

      const colList = insertableCols.map((c) => `\`${c}\``).join(', ');
      const valuesList = rows
        .map(
          (row) =>
            `  (${insertableCols.map((col) => escapeSqlValue(row[col])).join(', ')})`
        )
        .join(',\n');

      insertBlocks.push(`INSERT INTO \`${table}\` (${colList}) VALUES\n${valuesList};`);
    }

    const bodySql = [
      '-- ============================================================================',
      `--  Live Synced MySQL Dump - Updated at: ${new Date().toISOString()}`,
      '--  Target Host: auth-db1947.hstgr.io | Database: u762329739_apnaaentrydb',
      '-- ============================================================================',
      '',
      schemaSql.trim(),
      '',
      'SET FOREIGN_KEY_CHECKS = 0;',
      ...insertBlocks,
      'SET FOREIGN_KEY_CHECKS = 1;',
      '',
    ].join('\n\n');

    await fs.writeFile(path.resolve(process.cwd(), 'db/apnaentry_society_full.sql'), bodySql, 'utf8');
    await fs.writeFile(
      path.resolve(process.cwd(), 'db/Apna_society.sql'),
      `CREATE DATABASE IF NOT EXISTS \`Apna society\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\nUSE \`Apna society\`;\n\n${bodySql}`,
      'utf8'
    );
  } catch {
    // Non-fatal background export
  }
}

