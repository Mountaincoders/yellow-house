import type { AuthResponse } from '@yellow-house/shared';
export declare function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T>;
export declare function signup(email: string, password: string, name: string): Promise<AuthResponse>;
export declare function login(email: string, password: string): Promise<AuthResponse>;
export declare function setAuthToken(token: string): void;
export declare function getAuthToken(): string | null;
export declare function clearAuthToken(): void;
