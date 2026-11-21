import { apiSuccess, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { writeAudit } from '@/lib/server/audit';
import { execute } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

export const POST = route(async (request) => {
  const user = await requireUser();
  const body = (await request.json()) as { serviceId: string; notes?: string };

  const orderId = `ord_${Math.floor(10000 + Math.random() * 90000)}`;
  const eta = '15-20 mins';

  // Create gate pass / gate notification for incoming delivery
  const passCode = `DEL-${Math.floor(1000 + Math.random() * 9000)}`;
  await execute(
    `INSERT INTO gate_updates (id, society_id, unit, user_id, update_type, details, pass_code, status)
     VALUES (?, ?, ?, ?, 'Cab', ?, ?, 'active')`,
    [
      `gu_${Date.now()}`,
      user.societyId,
      user.unit,
      user.id,
      `Local Service Order #${orderId} - Delivery arriving for Flat ${user.unit}`,
      passCode,
    ]
  );

  await writeAudit({
    actor: user,
    action: 'Local Service Ordered',
    details: `${user.name} ordered service ${body.serviceId} [Order: #${orderId}, Gate Pass: ${passCode}]`,
  });

  return apiSuccess({ success: true, orderId, eta, passCode });
});

