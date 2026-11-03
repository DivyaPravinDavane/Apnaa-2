/**
 * Create the database, apply db/schema.sql and seed demo data.
 *
 *   npm run db:setup
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

  const host = process.env.DB_HOST || '127.0.0.1';
  const port = Number(process.env.DB_PORT || 3306);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'apnaa_society';

  if (!/^[a-zA-Z0-9_]+$/.test(database)) {
    throw new Error('DB_NAME may only contain letters, digits and underscores.');
  }

  console.log(`Connecting to MySQL at ${host}:${port} as ${user}...`);
  const admin = await mysql.createConnection({ host, port, user, password, multipleStatements: true });
  await admin.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await admin.query(`USE \`${database}\``);

  const schema = await fs.readFile(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
  console.log('Applying schema...');
  await admin.query(schema);
  await admin.end();

  const pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 4,
    timezone: 'Z',
  });

  console.log('Seeding demo data...');
  const result = await seedDatabase(pool, { reset: false });
  await pool.end();

  console.log('');
  console.log(`Database "${database}" is ready.`);
  console.log(`Seeded ${result.users} users and ${result.amenities} amenities.`);
  console.log(`Demo password for every account: ${DEMO_PASSWORD}`);
  console.log('');
  console.log('Next: set NEXT_PUBLIC_DATA_SOURCE=api in .env.local and run npm run dev.');
}

main().catch((error) => {
  console.error('');
  console.error('Database setup failed:', error.message);
  if (error.code === 'ECONNREFUSED') {
    console.error('Is MySQL running? Start it with: brew services start mysql');
  }
  if (error.code === 'ER_ACCESS_DENIED_ERROR') {
    console.error('Check DB_USER / DB_PASSWORD in .env.local.');
  }
  process.exit(1);
});
