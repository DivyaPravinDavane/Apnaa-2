/**
 * Server-side configuration. Values default to the remote Hostinger phpMyAdmin
 * MySQL database (auth-db1947.hstgr.io / u762329739_apnaaentrydb).
 */

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

export function getDbConfig() {
  const user = process.env.DB_USER || 'u762329739_apnaaentry';
  const rawPassword = process.env.DB_PASSWORD || 'Apna$@123';
  const password =
    user === 'u762329739_apnaaentry' && !rawPassword.includes('$')
      ? 'Apna$@123'
      : rawPassword;

  return {
    host: process.env.DB_HOST || 'auth-db1947.hstgr.io',
    port: Number(process.env.DB_PORT || 3306),
    user,
    password,
    database: process.env.DB_NAME || 'u762329739_apnaaentrydb',
  };
}

export function getJwtSecret(): Uint8Array {
  const secret =
    process.env.JWT_SECRET ||
    'apnaa-smart-society-live-jwt-secret-key-2026-secure-token-9876543210';
  if (!secret || secret.length < 32) {
    throw new ConfigError(
      'JWT_SECRET is missing or shorter than 32 characters. Generate one with: openssl rand -base64 48'
    );
  }
  return new TextEncoder().encode(secret);
}

export function getDefaultSocietyId() {
  return (
    process.env.DEFAULT_SOCIETY_ID ||
    process.env.NEXT_PUBLIC_DEFAULT_SOCIETY_ID ||
    'soc_green_valley_01'
  );
}

export function getApiKey(): string | null {
  const key = (process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY || '').trim();
  if (!key || key === 'replace-with-your-apnaa-api-key') return null;
  return key.length > 0 ? key : null;
}

export function isProduction() {
  return process.env.NODE_ENV === 'production';
}

/**
 * Demo role switching is enabled by default unless explicitly disabled.
 */
export function demoLoginEnabled() {
  if (process.env.ALLOW_DEMO_LOGIN === 'false') return false;
  return true;
}

export function sessionTtlSeconds() {
  const value = Number(process.env.SESSION_TTL_MINUTES || 480);
  return (Number.isFinite(value) && value > 0 ? value : 480) * 60;
}

export function allowedOrigins(): string[] {
  const raw =
    process.env.ALLOWED_ORIGINS ||
    process.env.APP_URL ||
    'http://localhost:3000,http://127.0.0.1:3000';
  return raw
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);
}
