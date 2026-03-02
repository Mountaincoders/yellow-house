export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  created_at: string;
}

export interface GroupRow {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

export interface GroupMemberRow {
  group_id: string;
  user_id: string;
}

export interface AvailabilitySlotRow {
  id: string;
  user_id: string;
  group_id: string;
  time_slot: string;
  marked: boolean;
  created_at: string;
  updated_at: string;
}
