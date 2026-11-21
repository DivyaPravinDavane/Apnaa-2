import { apiSuccess, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { query } from '@/lib/server/db';
import type { RowDataPacket } from 'mysql2/promise';
import type { LocalService } from '@/types';

export const dynamic = 'force-dynamic';

function rowToService(r: RowDataPacket): LocalService {
  return {
    id: r.id,
    title: r.title,
    category: r.category,
    providerName: r.provider_name,
    rating: Number(r.rating || 4.9),
    eta: r.eta,
    priceStarting: r.price_starting,
    phone: r.phone,
    icon: r.icon,
  };
}

export const GET = route(async () => {
  const user = await requireUser();
  const rows = await query<RowDataPacket>(
    `SELECT * FROM local_services WHERE society_id = ? ORDER BY rating DESC`,
    [user.societyId]
  );
  return apiSuccess(rows.map(rowToService));
});

