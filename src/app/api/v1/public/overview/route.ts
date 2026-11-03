import type { RowDataPacket } from 'mysql2/promise';
import { apiSuccess, route } from '@/lib/server/http';
import { getDefaultSocietyId } from '@/lib/server/config';
import { query } from '@/lib/server/db';
import { mapAmenity, mapSociety } from '@/lib/server/mappers';
import { todayInIst } from '@/lib/server/ids';

export const dynamic = 'force-dynamic';

const SOCIETY_SELECT = `
  SELECT s.*,
    (SELECT COUNT(*) FROM users u
      WHERE u.society_id = s.id AND u.role IN ('resident', 'admin')
        AND u.is_active = 1 AND u.deleted_at IS NULL
    ) AS active_residents,
    (SELECT COUNT(*) FROM visitors v
      WHERE v.society_id = s.id AND v.status = 'pending'
    ) AS pending_approvals,
    (SELECT COUNT(*) FROM amenities a
      WHERE a.society_id = s.id AND a.status <> 'available'
    ) AS active_closures
  FROM societies s
  WHERE s.id = ?
  LIMIT 1
`;

export const GET = route(async () => {
  const societyId = getDefaultSocietyId();
  const today = todayInIst();

  const [
    societyRows,
    amenityRows,
    roleUserRows,
    countsRows,
  ] = await Promise.all([
    query<RowDataPacket>(SOCIETY_SELECT, [societyId]),
    query<RowDataPacket>(
      `SELECT * FROM amenities
       WHERE society_id = ?
       ORDER BY FIELD(category, 'Fitness', 'Sports', 'Indoor', 'Outdoor', 'Events'), name`,
      [societyId]
    ),
    query<RowDataPacket>(
      `SELECT id, name, role, unit, membership_type
       FROM users
       WHERE society_id = ? AND is_active = 1 AND deleted_at IS NULL
       ORDER BY created_at ASC`,
      [societyId]
    ),
    query<RowDataPacket>(
      `SELECT
        (SELECT COUNT(*) FROM bookings WHERE society_id = ? AND status = 'confirmed') AS confirmed_bookings,
        (SELECT COUNT(*) FROM bookings WHERE society_id = ? AND booking_date = ? AND status <> 'cancelled') AS todays_bookings,
        (SELECT COUNT(*) FROM visitors WHERE society_id = ? AND status IN ('expected', 'approved')) AS expected_visitors,
        (SELECT COUNT(*) FROM visitors WHERE society_id = ? AND status = 'pending') AS pending_visitors,
        (SELECT COUNT(*) FROM security_logs WHERE society_id = ? AND status = 'entry') AS checked_in_logs,
        (SELECT COUNT(*) FROM events WHERE society_id = ?) AS upcoming_events,
        (SELECT COUNT(*) FROM media_items m JOIN albums al ON al.id = m.album_id WHERE al.society_id = ? AND m.status = 'pending') AS pending_media`,
      [societyId, societyId, today, societyId, societyId, societyId, societyId, societyId]
    ),
  ]);

  const society = mapSociety(
    societyRows[0] || {
      id: societyId,
      name: 'Green Valley Residency',
      address: 'Green Valley Road, Powai, Mumbai 400076',
      total_households: 248,
      total_units: 180,
    }
  );
  const amenities = amenityRows.map(mapAmenity);

  const residentUser = roleUserRows.find((u) => u.role === 'resident');
  const adminUser = roleUserRows.find((u) => u.role === 'admin');
  const securityUser = roleUserRows.find((u) => u.role === 'security');
  const facilityUser = roleUserRows.find((u) => u.role === 'facility');

  const counts = countsRows[0] || {};
  const availableAmenitiesCount = amenities.filter((a) => a.status === 'available').length;

  return apiSuccess({
    society,
    amenities,
    stats: {
      totalHouseholds: society.totalHouseholds,
      totalUnits: society.totalUnits,
      totalAmenities: amenities.length,
      availableAmenities: availableAmenitiesCount,
      activeResidents: society.activeResidents,
      confirmedBookings: Number(counts.confirmed_bookings ?? 0),
      todaysBookings: Number(counts.todays_bookings ?? 0),
      expectedVisitors: Number(counts.expected_visitors ?? 0),
      pendingVisitors: Number(counts.pending_visitors ?? 0),
      checkedInToday: Number(counts.checked_in_logs ?? 0),
      upcomingEvents: Number(counts.upcoming_events ?? 0),
      pendingMedia: Number(counts.pending_media ?? 0),
    },
    personas: {
      resident: {
        name: String(residentUser?.name || 'Priya Sharma'),
        unit: String(residentUser?.unit || 'A-1204'),
        membershipType: String(residentUser?.membership_type || 'Owner'),
      },
      admin: {
        name: String(adminUser?.name || 'Rajesh Nair'),
        unit: String(adminUser?.unit || 'C-402'),
        membershipType: 'Secretary',
      },
      security: {
        name: String(securityUser?.name || 'Vikram Singh'),
        unit: String(securityUser?.unit || 'Gate 1'),
        membershipType: 'Head Guard',
      },
      facility: {
        name: String(facilityUser?.name || 'Anand Verma'),
        unit: String(facilityUser?.unit || 'Clubhouse'),
        membershipType: 'Manager',
      },
    },
  });
});
