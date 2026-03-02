export type { User, Group, AvailabilitySlot, AuthResponse } from '@yellow-house/shared';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

export interface AvailabilitySlot {
  id: string;
  user_id: string;
  group_id: string;
  time_slot: string;
  marked: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}
