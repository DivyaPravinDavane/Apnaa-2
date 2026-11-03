import crypto from 'node:crypto';
import { execute } from './db';
import type { AuthUser } from './auth';

interface AuditInput {
  actor: Pick<AuthUser, 'id' | 'societyId' | 'name'> | null;
  societyId?: string;
  action: string;
  details: string;
  ip?: string | null;
}

/**
 * Persist a security-relevant action. Failures are swallowed so an audit
 * write never breaks the user-facing operation, but they are logged.
 */
export async function writeAudit({ actor, societyId, action, details, ip }: AuditInput): Promise<void> {
  const resolvedSociety = actor?.societyId || societyId;
  if (!resolvedSociety) return;

  try {
    await execute(
      `INSERT INTO audit_logs (id, society_id, actor_id, actor_name, action, details, ip)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        `aud_${crypto.randomUUID()}`,
        resolvedSociety,
        actor?.id || null,
        actor?.name || 'System',
        action.slice(0, 160),
        details.slice(0, 2000),
        ip?.slice(0, 64) || null,
      ]
    );
  } catch (error) {
    console.error('[audit] failed to write audit log', error);
  }
}
