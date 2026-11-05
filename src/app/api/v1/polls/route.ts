import type { RowDataPacket } from 'mysql2/promise';
import { apiSuccess, getClientIp, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { execute, query } from '@/lib/server/db';
import { writeAudit } from '@/lib/server/audit';
import { newId } from '@/lib/server/ids';

export const dynamic = 'force-dynamic';

const DEFAULT_CANDIDATES = [
  '01 CANDIDATE A',
  '02 CANDIDATE B',
  '03 CANDIDATE C',
  '04 CANDIDATE D',
  '05 CANDIDATE E',
  '06 CANDIDATE F',
  '07 CANDIDATE G',
  '08 CANDIDATE H',
  '09 CANDIDATE I',
  '10 CANDIDATE J',
  '11 CANDIDATE K',
  '12 CANDIDATE L',
  '13 CANDIDATE M',
  '14 CANDIDATE N',
  '15 CANDIDATE O',
  '16 CANDIDATE P',
  '17 CANDIDATE Q',
  '18 CANDIDATE R',
];

async function ensureDefaultPollExists(societyId: string) {
  const existing = await query<RowDataPacket>(
    `SELECT id FROM community_polls WHERE society_id = ? LIMIT 1`,
    [societyId]
  );
  if (existing.length > 0) return;

  await execute(
    `INSERT IGNORE INTO community_polls
      (id, society_id, author_name, author_initial, group_name, publish_timestamp, title, subtitle,
       expires_on, responses_count, min_select, max_select, candidates_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'poll_01',
      societyId,
      'Executive Committee WHCA...',
      'E',
      'Test Group for Polling',
      '07 Dec 2023 | 05:06 PM',
      'TEST POLL',
      'CHOOSE ONLY 15 CANDIDATES',
      '30 Nov 2026, 06:00 PM',
      1,
      15,
      15,
      JSON.stringify(DEFAULT_CANDIDATES),
    ]
  );
}

export const GET = route(async () => {
  const user = await requireUser();
  await ensureDefaultPollExists(user.societyId);

  const rows = await query<RowDataPacket>(
    `SELECT p.*,
       (SELECT v.selected_candidates_json FROM poll_votes v WHERE v.poll_id = p.id AND v.user_id = ? LIMIT 1) AS user_voted_json,
       (SELECT v.selected_candidates_json FROM poll_votes v WHERE v.poll_id = p.id ORDER BY v.created_at DESC LIMIT 1) AS latest_voted_json
     FROM community_polls p
     WHERE p.society_id = ?
     ORDER BY p.created_at DESC`,
    [user.id, user.societyId]
  );

  const data = rows.map((r) => {
    const rawVoted = r.user_voted_json ?? r.latest_voted_json;
    return {
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
      candidates:
        typeof r.candidates_json === 'string'
          ? JSON.parse(r.candidates_json)
          : r.candidates_json,
      votedCandidates: rawVoted
        ? typeof rawVoted === 'string'
          ? JSON.parse(rawVoted)
          : rawVoted
        : undefined,
    };
  });

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
    await ensureDefaultPollExists(user.societyId);
    const requestedPollId =
      !body.pollId || body.pollId === 'poll_ec_2026' ? 'poll_01' : body.pollId;

    // Verify poll exists so foreign key constraint always succeeds
    const pollCheck = await query<RowDataPacket>(
      `SELECT id FROM community_polls WHERE id = ? LIMIT 1`,
      [requestedPollId]
    );
    const pollId = pollCheck.length > 0 ? requestedPollId : 'poll_01';

    const selected = Array.isArray(body.selectedCandidates) ? body.selectedCandidates : [];
    const voteId = newId('vote');

    await execute(
      `INSERT INTO poll_votes (id, poll_id, user_id, unit, selected_candidates_json)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         unit = VALUES(unit),
         selected_candidates_json = VALUES(selected_candidates_json),
         created_at = CURRENT_TIMESTAMP`,
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
      action: 'Poll Selection Updated',
      details: `${user.name} (${user.unit}) selected ${selected.length} candidate(s) in poll ${pollId}: ${selected.slice(0, 5).join(', ')}${selected.length > 5 ? '...' : ''}`,
      ip: getClientIp(request),
    });

    return apiSuccess({
      success: true,
      pollId,
      selectedCount: selected.length,
      selectedCandidates: selected,
    });
  }

  // Create a new poll in community_polls
  const id = newId('poll');
  const title = (body.title || 'COMMUNITY POLL').trim().toUpperCase();
  const subtitle = (body.subtitle || title).trim();
  const candidates =
    Array.isArray(body.candidates) && body.candidates.length > 0
      ? body.candidates
      : ['01 OPTION A', '02 OPTION B'];
  const timestamp = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

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

  return apiSuccess(
    {
      id,
      authorName: `${user.name} (${user.unit})`,
      authorInitial: user.name.charAt(0).toUpperCase(),
      groupName: 'Owners & Residents Group',
      timestamp,
      title,
      subtitle,
      expiresOn: '30 Nov 2026, 06:00 PM',
      responsesCount: 0,
      minSelect: body.minSelect || 1,
      maxSelect: body.maxSelect || candidates.length,
      candidates,
    },
    undefined,
    201
  );
});
