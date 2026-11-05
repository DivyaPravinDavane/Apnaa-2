/**
 * Connect to the remote Hostinger MySQL database (auth-db1947.hstgr.io / u762329739_apnaaentrydb),
 * ensure all 24 schema tables exist, and seed initial data if empty.
 *
 *   npm run db:setup
 *   npm run db:setup -- --reset   (drops & recreates all tables and re-seeds)
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import { seedDatabase, DEMO_PASSWORD } from './seed.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Load .env files if they exist; missing files are not an error. */
function loadEnvFile(file) {
  try {
    process.loadEnvFile?.(file);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

async function main() {
  loadEnvFile('.env.local');
  loadEnvFile('.env');

  const host = process.env.DB_HOST || 'auth-db1947.hstgr.io';
  const port = Number(process.env.DB_PORT || 3306);
  const user = process.env.DB_USER || 'u762329739_apnaaentry';
  const rawPassword = process.env.DB_PASSWORD || 'Apna$@123';
  const password =
    user === 'u762329739_apnaaentry' && !rawPassword.includes('$')
      ? 'Apna$@123'
      : rawPassword;
  const database = process.env.DB_NAME || 'u762329739_apnaaentrydb';
  const forceReset = process.argv.includes('--reset');

  if (!/^[a-zA-Z0-9_]+$/.test(database)) {
    throw new Error('DB_NAME may only contain letters, digits and underscores.');
  }

  console.log(`Connecting to remote MySQL at ${host}:${port}/${database} as ${user}...`);
  const admin = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    multipleStatements: true,
    connectTimeout: 20000,
    timezone: 'Z',
  });

  // Check if tables already exist in the remote database
  const [existingTables] = await admin.query('SHOW TABLES');
  const tableCount = Array.isArray(existingTables) ? existingTables.length : 0;

  if (tableCount < 24 || forceReset) {
    const schema = await fs.readFile(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
    console.log(`Applying schema (${tableCount} existing tables, forceReset=${forceReset})...`);
    await admin.query(schema);
  } else {
    console.log(`All ${tableCount} tables already exist in "${database}". Preserving live data.`);
  }
  await admin.end();

  const pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 4,
    connectTimeout: 20000,
    timezone: 'Z',
  });

  const [[{ count: societyCount }]] = await pool.query('SELECT COUNT(*) AS count FROM societies');
  if (Number(societyCount) === 0 || forceReset) {
    console.log('Seeding initial data...');
    const result = await seedDatabase(pool, { reset: forceReset });
    console.log(`Seeded ${result.users} users and ${result.amenities} amenities.`);
  } else {
    const [[{ count: userCount }]] = await pool.query('SELECT COUNT(*) AS count FROM users');
    const [[{ count: pollCount }]] = await pool.query('SELECT COUNT(*) AS count FROM community_polls');
    const [[{ count: voteCount }]] = await pool.query('SELECT COUNT(*) AS count FROM poll_votes');
    console.log(`Initial data already present (${userCount} users, ${pollCount} polls, ${voteCount} poll votes). Skipping seed to preserve live phpMyAdmin changes.`);
  }
  await pool.end();

  console.log('');
  console.log(`Remote Database "${database}" on "${host}" is ready.`);
  console.log(`Demo password for every account: ${DEMO_PASSWORD}`);
}

main().catch((error) => {
  console.error('');
  console.error('Database setup failed:', error.message);
  process.exit(1);
});
