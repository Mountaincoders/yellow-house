const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export async function apiCall(endpoint, options) {
    const url = `${API_BASE}${endpoint}`;
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(typeof options?.headers === 'object' && options?.headers !== null
            ? Object.fromEntries(Object.entries(options.headers).map(([k, v]) => [
                k,
                typeof v === 'string' ? v : v?.toString() ?? '',
            ]))
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
        const error = (await response.json());
        throw new Error(error.error || 'API Error');
    }
    return response.json();
}
export async function signup(email, password, name) {
    return apiCall('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
    });
}
export async function login(email, password) {
    return apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
}
export function setAuthToken(token) {
    localStorage.setItem('token', token);
}
export function getAuthToken() {
    return localStorage.getItem('token');
}
export function clearAuthToken() {
    localStorage.removeItem('token');
}
//# sourceMappingURL=api.js.map