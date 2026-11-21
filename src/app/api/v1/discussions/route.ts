import { apiSuccess, route } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth';
import { execute, query } from '@/lib/server/db';
import { writeAudit } from '@/lib/server/audit';
import type { RowDataPacket } from 'mysql2/promise';
import type { CommunityDiscussion } from '@/types';

export const dynamic = 'force-dynamic';

function rowToDiscussion(r: RowDataPacket): CommunityDiscussion {
  return {
    id: r.id,
    userId: r.user_id,
    authorName: r.author_name,
    authorUnit: r.author_unit,
    authorRole: r.author_role,
    groupType: r.group_type,
    groupName: r.group_name,
    title: r.title,
    content: r.content,
    likesCount: Number(r.likes_count || 0),
    commentsCount: Number(r.comments_count || 0),
    imageUrl: r.image_url,
    createdAt: String(r.created_at),
  };
}

export const GET = route(async (request) => {
  const user = await requireUser();
  const groupType = request.nextUrl.searchParams.get('groupType');

  let sql = `SELECT * FROM community_discussions WHERE society_id = ?`;
  const params: unknown[] = [user.societyId];

  if (groupType && (groupType === 'Forum' || groupType === 'Interest Group')) {
    sql += ` AND group_type = ?`;
    params.push(groupType);
  }

  sql += ` ORDER BY created_at DESC`;

  const rows = await query<RowDataPacket>(sql, params);
  return apiSuccess(rows.map(rowToDiscussion));
});

export const POST = route(async (request) => {
  const user = await requireUser();
  const body = (await request.json()) as Partial<CommunityDiscussion>;

  const id = `disc_${Date.now()}`;
  const groupType = body.groupType || 'Forum';
  const groupName = body.groupName || (groupType === 'Forum' ? 'Apartment Owners Forum' : 'Interest Group');
  const title = body.title?.trim() || 'New Discussion';
  const content = body.content?.trim() || '';
  const imageUrl = body.imageUrl || null;

  await execute(
    `INSERT INTO community_discussions 
       (id, society_id, user_id, author_name, author_unit, author_role, group_type, group_name, title, content, likes_count, comments_count, image_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, ?)`,
    [id, user.societyId, user.id, user.name, user.unit, user.role, groupType, groupName, title, content, imageUrl]
  );

  await writeAudit({
    actor: user,
    action: `Discussion Post Created (${groupType})`,
    details: `${user.name} posted "${title}" in ${groupName}`,
  });

  return apiSuccess(
    {
      id,
      userId: user.id,
      authorName: user.name,
      authorUnit: user.unit,
      authorRole: user.role,
      groupType,
      groupName,
      title,
      content,
      likesCount: 1,
      commentsCount: 0,
      imageUrl,
      createdAt: new Date().toISOString(),
    },
    undefined,
    201
  );
});

