import type { ApiError, AuthResponse } from '@yellow-house/shared';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(typeof options?.headers === 'object' && options?.headers !== null
      ? Object.fromEntries(
          Object.entries(options.headers).map(([k, v]) => [
            k,
            typeof v === 'string' ? v : v?.toString() ?? '',
          ])
        )
      : {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = (await response.json()) as ApiError;
    throw new Error(error.error || 'API Error');
  }

  return response.json() as Promise<T>;
}

export async function signup(
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> {
  return apiCall<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return apiCall<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function setAuthToken(token: string): void {
  localStorage.setItem('token', token);
}

export function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

export function clearAuthToken(): void {
  localStorage.removeItem('token');
}
