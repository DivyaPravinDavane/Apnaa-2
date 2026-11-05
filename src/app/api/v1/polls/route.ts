import type { RowDataPacket } from 'mysql2/promise';
import { apiSuccess, getClientIp, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { execute, query } from '@/lib/server/db';
import { writeAudit } from '@/lib/server/audit';
import { newId } from '@/lib/server/ids';

export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  const user = await requireUser();
  const rows = await query<RowDataPacket>(
    `SELECT p.*,
       (SELECT v.selected_candidates_json FROM poll_votes v WHERE v.poll_id = p.id AND v.user_id = ? LIMIT 1) AS voted_candidates_json
     FROM community_polls p
     WHERE p.society_id = ?
     ORDER BY p.created_at DESC`,
    [user.id, user.societyId]
  );

  const data = rows.map((r) => ({
    id: r.id,
    authorName: r.author_name,
    authorInitial: r.author_initial,
    groupName: r.group_name,
    timestamp: r.publish_timestamp,
    title: r.title,
    subtitle: r.subtitle,
    expiresOn: r.expires_on,
    responsesCount: Number(r.responses_count || 0),
    minSelect: Number(r.min_select || 15),
    maxSelect: Number(r.max_select || 15),
    candidates: typeof r.candidates_json === 'string' ? JSON.parse(r.candidates_json) : r.candidates_json,
    votedCandidates: r.voted_candidates_json
      ? typeof r.voted_candidates_json === 'string'
        ? JSON.parse(r.voted_candidates_json)
        : r.voted_candidates_json
      : undefined,
  }));

  return apiSuccess(data);
});

export const POST = route(async (request) => {
  const user = await requireUser();
  const body = (await request.json()) as {
    action?: 'create' | 'vote';
    pollId?: string;
    selectedCandidates?: string[];
    title?: string;
    subtitle?: string;
    candidates?: string[];
    minSelect?: number;
    maxSelect?: number;
  };

  if (body.action === 'vote') {
    const pollId = body.pollId || 'poll_01';
    const selected = Array.isArray(body.selectedCandidates) ? body.selectedCandidates : [];
    const voteId = newId('vote');

    await execute(
      `INSERT INTO poll_votes (id, poll_id, user_id, unit, selected_candidates_json)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE selected_candidates_json = VALUES(selected_candidates_json)`,
      [voteId, pollId, user.id, user.unit, JSON.stringify(selected)]
    );

    await execute(
      `UPDATE community_polls
       SET responses_count = (SELECT COUNT(*) FROM poll_votes WHERE poll_id = ?)
       WHERE id = ?`,
      [pollId, pollId]
    );

    await writeAudit({
      actor: user,
      action: 'Poll Vote Submitted',
      details: `${user.name} (${user.unit}) voted for ${selected.length} candidates in poll ${pollId}`,
      ip: getClientIp(request),
    });

    return apiSuccess({ success: true, pollId, selectedCount: selected.length });
  }

  // Create a new poll in community_polls
  const id = newId('poll');
  const title = (body.title || 'COMMUNITY POLL').trim().toUpperCase();
  const subtitle = (body.subtitle || title).trim();
  const candidates = Array.isArray(body.candidates) && body.candidates.length > 0 ? body.candidates : ['01 OPTION A', '02 OPTION B'];
  const timestamp = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  await execute(
    `INSERT INTO community_polls
      (id, society_id, author_name, author_initial, group_name, publish_timestamp, title, subtitle,
       expires_on, responses_count, min_select, max_select, candidates_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      user.societyId,
      `${user.name} (${user.unit})`,
      user.name.charAt(0).toUpperCase(),
      'Owners & Residents Group',
      timestamp,
      title,
      subtitle,
      '30 Nov 2026, 06:00 PM',
      0,
      body.minSelect || 1,
      body.maxSelect || candidates.length,
      JSON.stringify(candidates),
    ]
  );

  await writeAudit({
    actor: user,
    action: 'Community Poll Created',
    details: `${user.name} published new poll "${title}"`,
    ip: getClientIp(request),
  });

  return apiSuccess({ id, title, subtitle, candidates }, undefined, 201);
});

