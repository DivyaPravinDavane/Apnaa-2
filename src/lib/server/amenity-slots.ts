export interface AmenitySlot {
  startTime: string;
  endTime: string;
  timeSlot: string;
}

export function parseTimeToMinutes(value: string): number | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hours += 12;
  return hours * 60 + Number(match[2]);
}

export function formatMinutes(minutes: number): string {
  const hours24 = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  const suffix = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${String(mins).padStart(2, '0')} ${suffix}`;
}

export function buildAmenitySlots(operatingHours: string, slotDurationMinutes: number): AmenitySlot[] {
  const [startRaw, endRaw] = operatingHours.split('-').map((part) => part.trim());
  const start = parseTimeToMinutes(startRaw);
  const end = parseTimeToMinutes(endRaw);
  if (start === null || end === null || end <= start) return [];

  const duration = slotDurationMinutes > 0 ? slotDurationMinutes : 60;
  const slots: AmenitySlot[] = [];
  for (let cursor = start; cursor + duration <= end && slots.length < 48; cursor += duration) {
    const startTime = formatMinutes(cursor);
    const endTime = formatMinutes(cursor + duration);
    slots.push({ startTime, endTime, timeSlot: `${startTime} - ${endTime}` });
  }
  return slots;
}
