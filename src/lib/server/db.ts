import mysql from 'mysql2/promise';
import type { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { getDbConfig } from './config';

let pool: Pool | null = null;

/**
 * Primary MySQL pool connected directly to the remote Hostinger phpMyAdmin
 * database (`auth-db1947.hstgr.io:3306` / `u762329739_apnaaentrydb`).
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
    connectionLimit: 6,
    maxIdle: 6,
    idleTimeout: 60_000,
    connectTimeout: 15_000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10_000,
    charset: 'utf8mb4',
    timezone: 'Z',
    dateStrings: true,
    supportBigNumbers: true,
    multipleStatements: false,
  });

  globalRef.__apnaaMysqlPool = pool;
  return pool;
}

/** Run a parameterised query and return typed rows from the remote MySQL database. */
export async function query<T extends RowDataPacket = RowDataPacket>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const [rows] = await getPool().query<T[]>(sql, params);
  return rows;
}

/**
 * Run a parameterised write statement directly on the remote Hostinger MySQL database
 * (`auth-db1947.hstgr.io` / `u762329739_apnaaentrydb`).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function execute(sql: string, params: any[] = []): Promise<ResultSetHeader> {
  const [result] = await getPool().execute<ResultSetHeader>(sql, params);
  return result;
}

/** Run several statements atomically on the remote MySQL database. */
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
