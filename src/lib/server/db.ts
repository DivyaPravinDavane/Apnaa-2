import mysql from 'mysql2/promise';
import type { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { getDbConfig } from './config';

let pool: Pool | null = null;
let remotePool: Pool | null = null;

/**
 * Primary MySQL pool (Local MySQL 127.0.0.1:3306).
 */
export function getPool(): Pool {
  if (pool) return pool;

  const globalRef = globalThis as typeof globalThis & { __apnaaMysqlPool?: Pool };
  if (globalRef.__apnaaMysqlPool) {
    pool = globalRef.__apnaaMysqlPool;
    return pool;
  }

  pool = mysql.createPool({
    ...getDbConfig(),
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60_000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    charset: 'utf8mb4',
    timezone: 'Z',
    dateStrings: true,
    supportBigNumbers: true,
    multipleStatements: false,
  });

  globalRef.__apnaaMysqlPool = pool;
  return pool;
}

/**
 * Optional Remote Hostinger MySQL pool (`auth-db1947.hstgr.io` / `82.25.121.3`).
 * Every write (`execute`) automatically mirrors to this remote pool if configured.
 */
function getRemotePool(): Pool | null {
  const host = process.env.REMOTE_DB_HOST;
  const user = process.env.REMOTE_DB_USER;
  if (!host || !user) return null;

  if (remotePool) return remotePool;

  const globalRef = globalThis as typeof globalThis & { __apnaaRemoteMysqlPool?: Pool };
  if (globalRef.__apnaaRemoteMysqlPool) {
    remotePool = globalRef.__apnaaRemoteMysqlPool;
    return remotePool;
  }

  remotePool = mysql.createPool({
    host,
    port: Number(process.env.REMOTE_DB_PORT || 3306),
    user,
    password: process.env.REMOTE_DB_PASSWORD || '',
    database: process.env.REMOTE_DB_NAME || 'u762329739_apnaaentrydb',
    waitForConnections: true,
    connectionLimit: 4,
    connectTimeout: 4000,
    charset: 'utf8mb4',
    timezone: 'Z',
    dateStrings: true,
  });

  globalRef.__apnaaRemoteMysqlPool = remotePool;
  return remotePool;
}

/** Run a parameterised query and return typed rows. */
export async function query<T extends RowDataPacket = RowDataPacket>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const [rows] = await getPool().query<T[]>(sql, params);
  return rows;
}

/**
 * Run a parameterised statement on the primary MySQL database AND mirror the
 * exact statement to the remote Hostinger MySQL database (`auth-db1947.hstgr.io`).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function execute(sql: string, params: any[] = []): Promise<ResultSetHeader> {
  const [result] = await getPool().execute<ResultSetHeader>(sql, params);

  const remote = getRemotePool();
  if (remote) {
    void remote.execute(sql, params).catch(() => {
      // Ignore if Hostinger Remote MySQL firewall hasn't whitelisted current IP yet
    });
  }

  // Also auto-update db/apnaentry_society_full.sql and db/Apna_society.sql with the latest live rows
  void import('./live-sql-export').then((m) => m.exportLiveDatabaseToSqlFiles()).catch(() => undefined);

  return result;
}

/** Run several statements atomically. */
export async function withTransaction<T>(fn: (conn: PoolConnection) => Promise<T>): Promise<T> {
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

/** Verify the database is reachable (used by /api/v1/health). */
export async function pingDatabase(): Promise<void> {
  await getPool().query('SELECT 1');
}
