import { NextRequest, NextResponse } from 'next/server';
import { ZodError, type ZodType } from 'zod';
import { allowedOrigins, ConfigError, isProduction } from './config';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RouteHandler<C> = (request: NextRequest, context: C) => Promise<Response>;

const SENSITIVE_KEYS = new Set(['passwordHash', 'password_hash', 'password', 'code_hash', 'token_hash']);

/**
 * Safety net: no route may ever return a credential field, even if it forgets
 * to strip the column before calling apiSuccess().
 */
function sanitizePayload<T>(value: T, depth = 0): T {
  if (depth > 8 || value === null || typeof value !== 'object') return value;
  if (value instanceof Date) return value;
  if (Array.isArray(value)) return value.map((item) => sanitizePayload(item, depth + 1)) as unknown as T;

  const cleaned: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key)) continue;
    cleaned[key] = sanitizePayload(entry, depth + 1);
  }
  return cleaned as T;
}

export function apiSuccess<T>(data: T, meta?: Record<string, unknown>, status = 200) {
  return NextResponse.json(
    { data: sanitizePayload(data), meta: { timestamp: new Date().toISOString(), ...meta } },
    { status, headers: { 'Cache-Control': 'no-store' } }
  );
}

export function apiError(status: number, code: string, message: string, fields?: Record<string, string[]>) {
  return NextResponse.json(
    { error: { code, message, ...(fields ? { fields } : {}) } },
    { status, headers: { 'Cache-Control': 'no-store' } }
  );
}

/**
 * Wraps a route handler with:
 *  - CSRF origin checks for mutating requests
 *  - consistent JSON errors (no stack traces or SQL details leak to clients)
 *  - credential-free responses
 */
export function route<C = unknown>(handler: RouteHandler<C>): RouteHandler<C> {
  return async (request, context) => {
    try {
      assertSameOrigin(request);
      return await handler(request, context);
    } catch (error) {
      return errorResponse(error);
    }
  };
}

function errorResponse(error: unknown): Response {
  if (error instanceof ApiError) {
    return apiError(error.status, error.code, error.message, error.fields);
  }
  if (error instanceof ZodError) {
    const fields: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const key = issue.path.join('.') || '_form';
      fields[key] = [...(fields[key] || []), issue.message];
    }
    return apiError(422, 'VALIDATION_ERROR', 'Some fields are invalid.', fields);
  }
  if (error instanceof ConfigError) {
    if (!isProduction()) console.error('[config]', error.message);
    return apiError(500, 'CONFIG_ERROR', 'Server configuration is incomplete.');
  }

  const mysqlError = error as { code?: string; errno?: number };
  if (mysqlError?.code === 'ER_DUP_ENTRY' || mysqlError?.errno === 1062) {
    return apiError(409, 'DUPLICATE_RECORD', 'A record with these details already exists.');
  }
  if (mysqlError?.code === 'ER_NO_REFERENCED_ROW_2') {
    return apiError(400, 'INVALID_REFERENCE', 'A referenced record does not exist.');
  }
  if (mysqlError?.code === 'ER_ROW_IS_REFERENCED_2') {
    return apiError(409, 'IN_USE', 'This record is still referenced by other data.');
  }

  // Log server-side only. Never expose internal messages to the client.
  console.error('[api]', error);
  return apiError(500, 'INTERNAL_ERROR', 'An unexpected server error occurred.');
}

function assertSameOrigin(request: NextRequest) {
  const method = request.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return;

  if (request.headers.get('sec-fetch-site') === 'cross-site') {
    throw new ApiError(403, 'CSRF_BLOCKED', 'Cross-site request blocked.');
  }

  const origin = request.headers.get('origin');
  if (!origin) return; // Non-browser client (curl, mobile app, server-to-server).

  const normalised = origin.replace(/\/$/, '');
  const requestOrigin = request.nextUrl.origin.replace(/\/$/, '');
  const configured = allowedOrigins();
  if (normalised !== requestOrigin && !configured.includes(normalised)) {
    throw new ApiError(403, 'CSRF_BLOCKED', 'Request origin is not allowed.');
  }
}

/** Parse and validate a JSON body. */
export async function readJson<T>(request: NextRequest, schema: ZodType<T>): Promise<T> {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 1_000_000) {
    throw new ApiError(413, 'PAYLOAD_TOO_LARGE', 'Request body is too large.');
  }

  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new ApiError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Content-Type must be application/json.');
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ApiError(400, 'INVALID_JSON', 'Request body is not valid JSON.');
  }

  return schema.parse(body);
}

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim().slice(0, 64);
  return (request.headers.get('x-real-ip') || 'unknown').slice(0, 64);
}

export function getParam<C>(context: C, key: string): string {
  const params = (context as { params?: Promise<Record<string, string>> } | undefined)?.params;
  if (!params) throw new ApiError(400, 'BAD_REQUEST', 'Missing route parameter.');
  return String((params as unknown as Record<string, string>)[key] ?? '');
}

export async function getParamAsync<C>(context: C, key: string): Promise<string> {
  const params = (context as { params?: Promise<Record<string, string>> } | undefined)?.params;
  if (!params) throw new ApiError(400, 'BAD_REQUEST', 'Missing route parameter.');
  const resolved = await params;
  const value = resolved[key];
  if (!value) throw new ApiError(400, 'BAD_REQUEST', 'Missing route parameter.');
  return String(value);
}
