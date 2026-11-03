import { ApiError, apiSuccess, readJson, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { mapVisitor } from '@/lib/server/mappers';
import { passVerifySchema } from '@/lib/server/validation';
import { effectiveVisitorStatus, findVisitorByPass } from '@/lib/server/visitors';
import { todayInIst } from '@/lib/server/ids';

export const dynamic = 'force-dynamic';

export const POST = route(async (request) => {
  const user = await requireUser(['security', 'admin']);
  const { token } = await readJson(request, passVerifySchema);

  const visitor = await findVisitorByPass(token, user.societyId);
  if (!visitor) {
    throw new ApiError(404, 'PASS_NOT_FOUND', 'Pass not found or invalid.');
  }

  const status = effectiveVisitorStatus(visitor, todayInIst());
  const messages: Record<string, string> = {
    approved: 'Valid pass. Entry permitted.',
    expected: 'Valid pre-approved pass. Entry permitted.',
    pending: 'Pass is awaiting resident approval.',
    checked_in: 'Pass has already been used to check in.',
    checked_out: 'Visitor has already checked out.',
    denied: 'Entry was denied by the resident.',
    cancelled: 'Pass was cancelled by the host.',
    expired: 'Pass has expired.',
  };

  return apiSuccess({ status, message: messages[status] || 'Pass status retrieved.', visitor: mapVisitor(visitor) });
});
