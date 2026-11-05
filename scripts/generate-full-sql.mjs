import fs from 'node:fs/promises';
import path from 'node:path';
import bcrypt from 'bcryptjs';

const SOCIETY_ID = 'soc_green_valley_01';
const DEMO_PASSWORD = 'Apnaa@12345';

function sqlVal(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(v);
  if (v instanceof Date) return `'${v.toISOString().slice(0, 19).replace('T', ' ')}'`;
  return `'${String(v).replace(/\\/g, '\\\\').replace(/'/g, "''").replace(/\r/g, '\\r').replace(/\n/g, '\\n')}'`;
}

async function run() {
  const schemaPath = path.resolve('db/schema.sql');
  const schemaSql = await fs.readFile(schemaPath, 'utf8');

  // Also update seed.mjs to insert into the 4 new tables
  let seedCode = await fs.readFile(path.resolve('scripts/seed.mjs'), 'utf8');
  if (!seedCode.includes('community_polls')) {
    const extraInserts = `
    await conn.query(
      \`INSERT INTO community_polls
        (id, society_id, author_name, author_initial, group_name, publish_timestamp, title, subtitle, expires_on, responses_count, min_select, max_select, candidates_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\`,
      [
        'poll_01',
        SOCIETY_ID,
        'Executive Committee WHCA...',
        'E',
        'All Owners',
        '10 Aug 2022, 09:05 PM',
        'TEST POLL',
        'CHOOSE ONLY 15 CANDIDATES',
        '11 Aug 2026',
        1,
        15,
        15,
        JSON.stringify([
          '01 CANDIDATE A', '02 CANDIDATE B', '03 CANDIDATE C', '04 CANDIDATE D',
          '05 CANDIDATE E', '06 CANDIDATE F', '07 CANDIDATE G', '08 CANDIDATE H',
          '09 CANDIDATE I', '10 CANDIDATE J', '11 CANDIDATE K', '12 CANDIDATE L',
          '13 CANDIDATE M', '14 CANDIDATE N', '15 CANDIDATE O', '16 CANDIDATE P',
          '17 CANDIDATE Q', '18 CANDIDATE R'
        ]),
      ]
    );

    await conn.query(
      \`INSERT INTO poll_votes (id, poll_id, user_id, unit, selected_candidates_json)
       VALUES (?, ?, ?, ?, ?)\`,
      [
        'vote_01',
        'poll_01',
        'usr_adm_01',
        'C-402',
        JSON.stringify([
          '01 CANDIDATE A', '02 CANDIDATE B', '03 CANDIDATE C', '04 CANDIDATE D', '05 CANDIDATE E',
          '06 CANDIDATE F', '07 CANDIDATE G', '08 CANDIDATE H', '09 CANDIDATE I', '10 CANDIDATE J',
          '11 CANDIDATE K', '12 CANDIDATE L', '13 CANDIDATE M', '14 CANDIDATE N', '15 CANDIDATE O'
        ]),
      ]
    );

    await conn.query(
      \`INSERT INTO unit_bills (id, society_id, unit, user_id, invoice_no, title, category, billing_period, amount, status, due_date, paid_at, payment_method)
       VALUES
        ('bill_01', ?, 'A-1204', 'usr_res_01', 'INV-2026-1101', 'Monthly Society Maintenance Statement', 'Statement', 'November 2026', 4850.00, 'unpaid', ?, NULL, NULL),
        ('bill_02', ?, 'A-1204', 'usr_res_01', 'INV-2026-1102', 'Sinking Fund & EV Infrastructure Dues', 'Dues', 'Q4 2026', 1500.00, 'unpaid', ?, NULL, NULL),
        ('bill_03', ?, 'A-1204', 'usr_res_01', 'INV-2026-1001', 'October Maintenance & Water Charges', 'Payment history', 'October 2026', 4850.00, 'paid', ?, NOW(), 'UPI (GPay)')\`,
      [SOCIETY_ID, isoDate(10), SOCIETY_ID, isoDate(15), SOCIETY_ID, isoDate(-20)]
    );

    await conn.query(
      \`INSERT INTO gate_updates (id, society_id, unit, user_id, update_type, details, pass_code, status)
       VALUES
        ('gu_01', ?, 'A-1204', 'usr_res_01', 'Cab', 'Uber Premier (MH 02 EZ 4091) expected at Main Gate', 'CAB-4091', 'active'),
        ('gu_02', ?, 'A-1204', 'usr_res_01', 'Exit pass', 'Domestic help carrying 2 carton boxes approved by Priya Sharma', 'EXT-8820', 'active'),
        ('gu_03', ?, 'A-1204', 'usr_res_01', 'School bus', 'Route #4 Yellow School Bus drop-off alert at 3:15 PM', 'BUS-0004', 'active')\`,
      [SOCIETY_ID, SOCIETY_ID, SOCIETY_ID]
    );

    await conn.query(
      \`INSERT INTO service_requests (id, society_id, unit, user_id, desk_type, category, title, description, status)
       VALUES
        ('sr_01', ?, 'A-1204', 'usr_res_01', 'Helpdesk', 'Plumbing', 'Kitchen RO inlet pressure check', 'Low water pressure in kitchen sink line since morning.', 'open'),
        ('sr_02', ?, 'A-1204', 'usr_res_01', 'Service Desk', 'Electrical', 'Balcony LED fixture replacement', 'Requesting society electrician to inspect balcony spot light.', 'in_progress')\`,
      [SOCIETY_ID, SOCIETY_ID]
    );
`;
    seedCode = seedCode.replace(
      "'Green Valley Residency'",
      "'Westend Heights D... (Apnaentry Society)'"
    );
    seedCode = seedCode.replace(
      "'audit_logs',",
      "'service_requests',\n        'gate_updates',\n        'unit_bills',\n        'poll_votes',\n        'community_polls',\n        'audit_logs',"
    );
    seedCode = seedCode.replace(
      'await conn.commit();',
      extraInserts + '\n    await conn.commit();'
    );
    await fs.writeFile(path.resolve('scripts/seed.mjs'), seedCode, 'utf8');
    console.log('Updated scripts/seed.mjs');
  }

  // Capture all SQL queries executed by seedDatabase using a mock pool
  const capturedQueries = [];
  const mockPool = {
    async getConnection() {
      return {
        async beginTransaction() {},
        async commit() {},
        async rollback() {},
        release() {},
        async query(sql, params = []) {
          let idx = 0;
          const formatted = sql.replace(/\?/g, () => sqlVal(params[idx++]));
          capturedQueries.push(formatted.trim() + ';');
          return [[]];
        },
      };
    },
  };

  const { seedDatabase } = await import('./seed.mjs');
  await seedDatabase(mockPool, { reset: false });

  // 1) Version for Hostinger phpMyAdmin (select database in left sidebar -> Import)
  const hostingerSql = [
    '-- ============================================================================',
    '--  Apna Society (Westend Heights D...) - Complete Schema + Seed Data Dump',
    '--  Target Host: auth-db1947.hstgr.io | User: u762329739_apnaaentry',
    '--  Includes all 24 UI tables + 75 initial seed records.',
    '-- ============================================================================',
    '',
    schemaSql.trim(),
    '',
    '-- ============================================================================',
    '--  Seed Data Inserts',
    '-- ============================================================================',
    'SET FOREIGN_KEY_CHECKS = 0;',
    ...capturedQueries,
    'SET FOREIGN_KEY_CHECKS = 1;',
    '',
  ].join('\n\n');

  await fs.writeFile(path.resolve('db/apnaentry_society_full.sql'), hostingerSql, 'utf8');

  // 2) Version with explicit CREATE DATABASE `Apna society` and USE `Apna society`
  const createDbSql = [
    '-- ============================================================================',
    '--  Database: `Apna society` (`apna_society`)',
    '--  Creates the new database `Apna society` and populates all 24 UI tables.',
    '-- ============================================================================',
    '',
    'CREATE DATABASE IF NOT EXISTS `Apna society` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;',
    'USE `Apna society`;',
    '',
    hostingerSql,
  ].join('\n');

  await fs.writeFile(path.resolve('db/Apna_society.sql'), createDbSql, 'utf8');
  console.log('Generated db/Apna_society.sql and db/apnaentry_society_full.sql');
}

run();

