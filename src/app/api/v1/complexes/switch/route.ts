import { apiSuccess, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { execute } from '@/lib/server/db';
import { writeAudit } from '@/lib/server/audit';
import type { ApartmentComplex } from '@/types';

export const dynamic = 'force-dynamic';

const DEMO_COMPLEXES: Record<string, ApartmentComplex> = {
  cpx_01: {
    id: 'cpx_01',
    name: 'Westend Heights D-Tower',
    unit: 'A-1204',
    wing: 'Tower A',
    role: 'resident',
    membershipType: 'Owner',
    city: 'Mumbai',
    isActive: true,
  },
  cpx_02: {
    id: 'cpx_02',
    name: 'Green Valley Residency',
    unit: 'B-302',
    wing: 'Wing B',
    role: 'resident',
    membershipType: 'Owner',
    city: 'Bangalore',
    isActive: false,
  },
  cpx_03: {
    id: 'cpx_03',
    name: 'Palm Meadows Luxury Villas',
    unit: 'Villa 14',
    wing: 'Phase 2',
    role: 'resident',
    membershipType: 'Owner',
    city: 'Pune',
    isActive: false,
  },
};

export const POST = route(async (request) => {
  const user = await requireUser();
  const body = (await request.json()) as { complexId: string };

  const target = DEMO_COMPLEXES[body.complexId] || DEMO_COMPLEXES.cpx_01;

  // Update user's active unit in the database
  await execute(`UPDATE users SET unit = ?, wing = ? WHERE id = ?`, [
    target.unit,
    target.wing,
    user.id,
  ]);

  await writeAudit({
    actor: user,
    action: 'Apartment Complex Switched',
    details: `${user.name} switched active dashboard to ${target.name} (${target.unit})`,
  });

  return apiSuccess({ success: true, complex: target });
});

