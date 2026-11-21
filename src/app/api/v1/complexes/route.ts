import { apiSuccess, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import type { ApartmentComplex } from '@/types';

export const dynamic = 'force-dynamic';

const DEMO_COMPLEXES: ApartmentComplex[] = [
  {
    id: 'cpx_01',
    name: 'Westend Heights D-Tower',
    unit: 'A-1204',
    wing: 'Tower A',
    role: 'resident',
    membershipType: 'Owner',
    city: 'Mumbai',
    isActive: true,
  },
  {
    id: 'cpx_02',
    name: 'Green Valley Residency',
    unit: 'B-302',
    wing: 'Wing B',
    role: 'resident',
    membershipType: 'Owner',
    city: 'Bangalore',
    isActive: false,
  },
  {
    id: 'cpx_03',
    name: 'Palm Meadows Luxury Villas',
    unit: 'Villa 14',
    wing: 'Phase 2',
    role: 'resident',
    membershipType: 'Owner',
    city: 'Pune',
    isActive: false,
  },
];

export const GET = route(async () => {
  const user = await requireUser();
  const complexes = DEMO_COMPLEXES.map((c) => ({
    ...c,
    unit: c.id === 'cpx_01' ? user.unit : c.unit,
    role: c.id === 'cpx_01' ? user.role : c.role,
  }));
  return apiSuccess(complexes);
});

