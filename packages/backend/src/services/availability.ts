import * as availRepo from '../repositories/availability.js';
import * as groupRepo from '../repositories/group.js';
import type { AvailabilitySlot } from '@yellow-house/shared';

export async function markAvailability(
  userId: string,
  groupId: string,
  timeSlot: string,
  marked: boolean
): Promise<AvailabilitySlot> {
  const isMember = await groupRepo.isGroupMember(groupId, userId);
  if (!isMember) {
    throw new Error('User is not a member of this group');
  }

  const slot = await availRepo.createOrUpdateAvailability(userId, groupId, timeSlot, marked);
  return {
    id: slot.id,
    user_id: slot.user_id,
    group_id: slot.group_id,
    time_slot: slot.time_slot,
    marked: slot.marked,
  };
}

export async function getUserAvailability(
  userId: string,
  groupId: string
): Promise<AvailabilitySlot[]> {
  const slots = await availRepo.getAvailability(userId, groupId);
  return slots.map((s) => ({
    id: s.id,
    user_id: s.user_id,
    group_id: s.group_id,
    time_slot: s.time_slot,
    marked: s.marked,
  }));
}

export async function getGroupAvailability(groupId: string) {
  const slots = await availRepo.getGroupAvailability(groupId);
  return slots.map((s) => ({
    id: s.id,
    user_id: s.user_id,
    group_id: s.group_id,
    time_slot: s.time_slot,
    marked: s.marked,
  }));
}

export async function getOverlaps(groupId: string, startDate?: string, endDate?: string) {
  const overlaps = await availRepo.calculateOverlaps(groupId);
  
  let filtered = overlaps;
  
  // Filter by date range if provided
  if (startDate || endDate) {
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date('2099-12-31');
    
    filtered = overlaps.filter((o) => {
      // Assuming time_slot contains date information
      const slotDate = new Date(o.time_slot.split('T')[0]);
      return slotDate >= start && slotDate <= end;
    });
  }
  
  return filtered.map((o) => ({
    time_slot: o.time_slot,
    overlap_count: o.overlap_count,
    total_members: o.total_members,
    percentage: Math.round((o.overlap_count / o.total_members) * 100),
  }));
}

export async function bulkMarkAvailability(
  userId: string,
  groupId: string,
  timeSlots: string[],
  marked: boolean
): Promise<AvailabilitySlot[]> {
  const isMember = await groupRepo.isGroupMember(groupId, userId);
  if (!isMember) {
    throw new Error('User is not a member of this group');
  }

  const slots = await Promise.all(
    timeSlots.map((slot) =>
      availRepo.createOrUpdateAvailability(userId, groupId, slot, marked)
    )
  );

  return slots.map((s) => ({
    id: s.id,
    user_id: s.user_id,
    group_id: s.group_id,
    time_slot: s.time_slot,
    marked: s.marked,
  }));
}

export async function editAvailabilitySlot(
  slotId: string,
  userId: string,
  groupId: string,
  newTimeSlot: string
): Promise<AvailabilitySlot> {
  const isMember = await groupRepo.isGroupMember(groupId, userId);
  if (!isMember) {
    throw new Error('User is not a member of this group');
  }

  // Delete old slot and create new one
  await availRepo.deleteAvailabilitySlot(slotId);
  const newSlot = await availRepo.createOrUpdateAvailability(userId, groupId, newTimeSlot, true);
  
  return {
    id: newSlot.id,
    user_id: newSlot.user_id,
    group_id: newSlot.group_id,
    time_slot: newSlot.time_slot,
    marked: newSlot.marked,
  };
}

export async function deleteAvailabilitySlot(
  slotId: string,
  userId: string,
  groupId: string
): Promise<void> {
  const isMember = await groupRepo.isGroupMember(groupId, userId);
  if (!isMember) {
    throw new Error('User is not a member of this group');
  }

  await availRepo.deleteAvailabilitySlot(slotId);
}
