/**
 * Server-side configuration. Values are read lazily so a missing database
 * configuration does not break `next build` - only the API call fails.
 */

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

export function getDbConfig() {
  return {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'apnaa_society',
  };
}

export function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
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

export function isProduction() {
  return process.env.NODE_ENV === 'production';
}

/**
 * Demo role switching is a development convenience. It is enabled by default
 * outside production and must be explicitly enabled in production.
 */
export function demoLoginEnabled() {
  if (process.env.ALLOW_DEMO_LOGIN === 'true') return true;
  if (process.env.ALLOW_DEMO_LOGIN === 'false') return false;
  return !isProduction();
}

export function sessionTtlSeconds() {
  const value = Number(process.env.SESSION_TTL_MINUTES || 480);
  return (Number.isFinite(value) && value > 0 ? value : 480) * 60;
}

export function allowedOrigins(): string[] {
  const raw = process.env.ALLOWED_ORIGINS || process.env.APP_URL || 'http://localhost:3000';
  return raw
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);
}
