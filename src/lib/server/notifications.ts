import { execute } from './db';
import { newId } from './ids';

export type NotificationType = 'visitor' | 'booking' | 'notice' | 'event' | 'admin';

export async function createNotification(input: {
  societyId: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
}): Promise<void> {
  await execute(
    `INSERT INTO notifications (id, society_id, user_id, title, message, type, link)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      newId('notif'),
      input.societyId,
      input.userId,
      input.title.slice(0, 190),
      input.message.slice(0, 2000),
      input.type,
      input.link?.slice(0, 190) || null,
    ]
  );
}
