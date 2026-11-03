import crypto from 'node:crypto';
import { query } from './db';

export function newId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function randomDigits(length: number): string {
  let value = '';
  while (value.length < length) value += String(crypto.randomInt(0, 10));
  return value;
}

export function timeInIst(): string {
  return new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
}

export function todayInIst(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export async function uniquePassCode(preferred?: string): Promise<string> {
  if (preferred && /^V-\d{4,8}$/.test(preferred)) {
    const existing = await query<{ id: string } & import('mysql2/promise').RowDataPacket>(
      'SELECT id FROM visitors WHERE pass_code = ? LIMIT 1',
      [preferred]
    );
    if (!existing.length) return preferred;
  }
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const code = `V-${randomDigits(4)}`;
    const rows = await query<{ id: string } & import('mysql2/promise').RowDataPacket>(
      'SELECT id FROM visitors WHERE pass_code = ? LIMIT 1',
      [code]
    );
    if (!rows.length) return code;
  }
  return `V-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

export async function uniqueBookingReference(preferred?: string): Promise<string> {
  if (preferred && /^BK-\d{4,8}$/.test(preferred)) {
    const existing = await query<{ id: string } & import('mysql2/promise').RowDataPacket>(
      'SELECT id FROM bookings WHERE booking_reference = ? LIMIT 1',
      [preferred]
    );
    if (!existing.length) return preferred;
  }
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const reference = `BK-${randomDigits(4)}`;
    const rows = await query<{ id: string } & import('mysql2/promise').RowDataPacket>(
      'SELECT id FROM bookings WHERE booking_reference = ? LIMIT 1',
      [reference]
    );
    if (!rows.length) return reference;
  }
  return `BK-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}
