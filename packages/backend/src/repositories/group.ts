import { query } from '../db.js';
import type { GroupRow, GroupMemberRow } from '../models/index.js';

export async function createGroup(
  name: string,
  ownerId: string
): Promise<GroupRow> {
  const result = await query(
    'INSERT INTO groups (name, owner_id) VALUES ($1, $2) RETURNING *',
    [name, ownerId]
  );
  return result.rows[0];
}

export async function findGroupById(id: string): Promise<GroupRow | null> {
  const result = await query('SELECT * FROM groups WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function findGroupsByUserId(userId: string): Promise<GroupRow[]> {
  const result = await query(
    `SELECT g.* FROM groups g
     LEFT JOIN group_members gm ON g.id = gm.group_id
     WHERE g.owner_id = $1 OR gm.user_id = $1
     ORDER BY g.created_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function updateGroup(
  id: string,
  updates: { name?: string }
): Promise<GroupRow> {
  const { name } = updates;
  const result = await query(
    'UPDATE groups SET name = COALESCE($1, name) WHERE id = $2 RETURNING *',
    [name, id]
  );
  return result.rows[0];
}

export async function deleteGroup(id: string): Promise<void> {
  await query('DELETE FROM groups WHERE id = $1', [id]);
}

export async function addGroupMember(
  groupId: string,
  userId: string
): Promise<GroupMemberRow> {
  const result = await query(
    'INSERT INTO group_members (group_id, user_id) VALUES ($1, $2) RETURNING *',
    [groupId, userId]
  );
  return result.rows[0];
}

export async function removeGroupMember(groupId: string, userId: string): Promise<void> {
  await query(
    'DELETE FROM group_members WHERE group_id = $1 AND user_id = $2',
    [groupId, userId]
  );
}

export async function getGroupMembers(groupId: string): Promise<string[]> {
  const result = await query(
    'SELECT user_id FROM group_members WHERE group_id = $1 ORDER BY user_id',
    [groupId]
  );
  return result.rows.map((row: { user_id: string }) => row.user_id);
}

export async function isGroupMember(groupId: string, userId: string): Promise<boolean> {
  const result = await query(
    `SELECT 1 FROM groups WHERE id = $1 AND owner_id = $2
     UNION
     SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2`,
    [groupId, userId]
  );
  return result.rows.length > 0;
}
