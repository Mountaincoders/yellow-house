// User types
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface AuthPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Group types
export interface Group {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
}

// Availability types
export interface AvailabilitySlot {
  id: string;
  user_id: string;
  group_id: string;
  time_slot: string; // ISO 8601 string
  marked: boolean;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  code?: string;
}

export interface ApiError {
  error: string;
  code?: string;
}
