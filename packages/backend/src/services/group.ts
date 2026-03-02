import * as groupRepo from '../repositories/group.js';
import { findUserById } from '../repositories/user.js';
import type { Group } from '@yellow-house/shared';

export async function createGroup(name: string, userId: string): Promise<Group> {
  const group = await groupRepo.createGroup(name, userId);
  return {
    id: group.id,
    name: group.name,
    owner_id: group.owner_id,
    created_at: group.created_at,
  };
}

export async function getGroup(id: string): Promise<Group> {
  const group = await groupRepo.findGroupById(id);
  if (!group) {
    throw new Error('Group not found');
  }
  return {
    id: group.id,
    name: group.name,
    owner_id: group.owner_id,
    created_at: group.created_at,
  };
}

export async function getUserGroups(userId: string): Promise<Group[]> {
  const groups = await groupRepo.findGroupsByUserId(userId);
  return groups.map((g) => ({
    id: g.id,
    name: g.name,
    owner_id: g.owner_id,
    created_at: g.created_at,
  }));
}

export async function joinGroup(groupId: string, userId: string): Promise<void> {
  const isMember = await groupRepo.isGroupMember(groupId, userId);
  if (isMember) {
    throw new Error('User already a member of this group');
  }

  // Check if user is the owner
  const group = await groupRepo.findGroupById(groupId);
  if (!group) {
    throw new Error('Group not found');
  }

  if (group.owner_id === userId) {
    throw new Error('User is already the owner');
  }

  await groupRepo.addGroupMember(groupId, userId);
}

export async function getGroupMembers(
  groupId: string
): Promise<{ id: string; email: string; name: string }[]> {
  const memberIds = await groupRepo.getGroupMembers(groupId);
  const members = await Promise.all(
    memberIds.map(async (id) => {
      const user = await findUserById(id);
      if (!user) throw new Error(`User ${id} not found`);
      return { id: user.id, email: user.email, name: user.name };
    })
  );
  return members;
}
