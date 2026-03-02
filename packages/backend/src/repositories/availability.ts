import { query } from '../db.js';
import type { AvailabilitySlotRow } from '../models/index.js';

export async function createOrUpdateAvailability(
  userId: string,
  groupId: string,
  timeSlot: string,
  marked: boolean
): Promise<AvailabilitySlotRow> {
  const result = await query(
    `INSERT INTO availability_slots (user_id, group_id, time_slot, marked)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, group_id, time_slot) DO UPDATE SET marked = $4, updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [userId, groupId, timeSlot, marked]
  );
  return result.rows[0];
}

export async function getAvailability(
  userId: string,
  groupId: string
): Promise<AvailabilitySlotRow[]> {
  const result = await query(
    `SELECT * FROM availability_slots
     WHERE user_id = $1 AND group_id = $2
     ORDER BY time_slot`,
    [userId, groupId]
  );
  return result.rows;
}

export async function getGroupAvailability(groupId: string): Promise<AvailabilitySlotRow[]> {
  const result = await query(
    `SELECT * FROM availability_slots
     WHERE group_id = $1
     ORDER BY time_slot, user_id`,
    [groupId]
  );
  return result.rows;
}

export async function calculateOverlaps(groupId: string): Promise<{ time_slot: string; overlap_count: number; total_members: number }[]> {
  const result = await query(
    `WITH group_members_count AS (
       SELECT COUNT(*) as total FROM groups g
       LEFT JOIN group_members gm ON g.id = gm.group_id
       WHERE g.id = $1
       UNION ALL
       SELECT 1 FROM groups WHERE id = $1
     ),
     overlaps AS (
       SELECT time_slot, COUNT(DISTINCT user_id) as overlap_count
       FROM availability_slots
       WHERE group_id = $1 AND marked = true
       GROUP BY time_slot
     )
     SELECT o.time_slot, o.overlap_count, COALESCE((SELECT total FROM group_members_count LIMIT 1), 0) + 1 as total_members
     FROM overlaps o
     ORDER BY overlap_count DESC, time_slot`,
    [groupId]
  );
  return result.rows;
}

export async function deleteAvailabilitySlot(id: string): Promise<void> {
  await query('DELETE FROM availability_slots WHERE id = $1', [id]);
}

export async function deleteUserGroupAvailability(
  userId: string,
  groupId: string
): Promise<void> {
  await query(
    'DELETE FROM availability_slots WHERE user_id = $1 AND group_id = $2',
    [userId, groupId]
  );
}
