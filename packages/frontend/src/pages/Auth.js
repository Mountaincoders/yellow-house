import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { signup, login, setAuthToken } from '../lib/api.js';
export function AuthPage() {
    const [mode, setMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (mode === 'login') {
                const response = await login(email, password);
                setAuthToken(response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                window.location.href = '/';
            }
            else {
                const response = await signup(email, password, name);
                setAuthToken(response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                window.location.href = '/';
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center p-4", children: _jsxs("div", { className: "card max-w-md w-full", children: [_jsx("h1", { className: "text-3xl font-bold mb-2 text-gray-800", children: "Yellow House" }), _jsx("p", { className: "text-gray-600 mb-6", children: "Find the perfect time to meet" }), _jsxs("div", { className: "flex gap-2 mb-6", children: [_jsx("button", { onClick: () => setMode('login'), className: `flex-1 py-2 rounded-lg font-medium transition-colors ${mode === 'login'
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`, children: "Login" }), _jsx("button", { onClick: () => setMode('signup'), className: `flex-1 py-2 rounded-lg font-medium transition-colors ${mode === 'signup'
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`, children: "Sign Up" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [mode === 'signup' && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Name" }), _jsx("input", { type: "text", value: name, onChange: (e) => setName(e.target.value), className: "input-field w-full", placeholder: "Your name", required: true })] })), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Email" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "input-field w-full", placeholder: "your@email.com", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Password" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), className: "input-field w-full", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true })] }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm", children: error })), _jsx("button", { type: "submit", disabled: loading, className: "btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed", children: loading ? 'Loading...' : mode === 'login' ? 'Login' : 'Sign Up' })] })] }) }));
}
//# sourceMappingURL=Auth.js.map