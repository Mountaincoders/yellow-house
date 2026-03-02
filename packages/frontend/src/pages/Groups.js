import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
export function GroupsPage({ onSelectGroup }) {
    const [groups, setGroups] = useState([]);
    const [newGroupName, setNewGroupName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        fetchGroups();
    }, []);
    const fetchGroups = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3001/groups', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok)
                throw new Error('Failed to fetch groups');
            const data = await res.json();
            setGroups(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Error fetching groups');
        }
    };
    const handleCreateGroup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3001/groups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name: newGroupName }),
            });
            if (!res.ok)
                throw new Error('Failed to create group');
            const newGroup = await res.json();
            setGroups([newGroup, ...groups]);
            setNewGroupName('');
            await fetchGroups();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Error creating group');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold mb-4 text-gray-800", children: "Groups" }), _jsxs("form", { onSubmit: handleCreateGroup, className: "card max-w-md space-y-4", children: [_jsx("input", { type: "text", value: newGroupName, onChange: (e) => setNewGroupName(e.target.value), className: "input-field w-full", placeholder: "Group name", required: true }), _jsx("button", { type: "submit", className: "btn-primary w-full", disabled: loading, children: loading ? 'Creating...' : 'Create Group' }), error && _jsx("p", { className: "text-red-600 text-sm", children: error })] })] }), _jsx("div", { className: "grid gap-4", children: groups.length === 0 ? (_jsx("p", { className: "text-gray-600", children: "No groups yet. Create one to get started!" })) : (groups.map((group) => (_jsxs("div", { className: "card hover:shadow-lg transition-shadow cursor-pointer", children: [_jsx("h3", { className: "text-lg font-bold text-gray-800 mb-2", children: group.name }), _jsxs("p", { className: "text-sm text-gray-600 mb-4", children: ["Created ", new Date(group.created_at).toLocaleDateString()] }), _jsx("div", { className: "flex gap-2", children: _jsx("button", { onClick: () => onSelectGroup?.(group.id), className: "btn-primary text-sm", children: "View" }) })] }, group.id)))) })] }));
}
//# sourceMappingURL=Groups.js.map