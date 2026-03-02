export type { User, Group, AvailabilitySlot, AuthResponse } from '@yellow-house/shared';
import type { User } from '@yellow-house/shared';
export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}
