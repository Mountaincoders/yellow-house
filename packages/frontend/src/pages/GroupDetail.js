import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { AvailabilityPage } from './Availability.js';
import { OverlapsPage } from './Overlaps.js';
export function GroupDetailPage({ groupId, onBack }) {
    const [group, setGroup] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentSubPage, setCurrentSubPage] = useState('availability');
    const [joinCode, setJoinCode] = useState('');
    useEffect(() => {
        fetchGroupDetails();
    }, [groupId]);
    const fetchGroupDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            // Fetch group
            const groupRes = await fetch(`http://localhost:3001/groups/${groupId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!groupRes.ok)
                throw new Error('Failed to fetch group');
            const groupData = await groupRes.json();
            setGroup(groupData);
            // Fetch members
            const membersRes = await fetch(`http://localhost:3001/groups/${groupId}/members`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!membersRes.ok)
                throw new Error('Failed to fetch members');
            const membersData = await membersRes.json();
            setMembers(membersData);
            setJoinCode(groupId.slice(0, 8).toUpperCase());
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Error loading group');
        }
        finally {
            setLoading(false);
        }
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-96", children: _jsx("p", { className: "text-gray-600", children: "Loading..." }) }));
    }
    if (!group) {
        return (_jsxs("div", { className: "card bg-red-50 border border-red-200", children: [_jsx("p", { className: "text-red-700", children: error || 'Group not found' }), _jsx("button", { onClick: onBack, className: "btn-primary mt-4", children: "Go Back" })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-2", children: group.name }), _jsxs("p", { className: "text-gray-600", children: ["Join code: ", _jsx("code", { className: "bg-gray-100 px-2 py-1 rounded font-mono", children: joinCode })] })] }), _jsx("button", { onClick: onBack, className: "btn-secondary", children: "Back" })] }), _jsxs("div", { className: "flex gap-2 border-b border-gray-200 pb-4", children: [_jsxs("button", { onClick: () => setCurrentSubPage('members'), className: `px-4 py-2 rounded-lg font-medium transition-colors ${currentSubPage === 'members'
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'}`, children: ["Members (", members.length, ")"] }), _jsx("button", { onClick: () => setCurrentSubPage('availability'), className: `px-4 py-2 rounded-lg font-medium transition-colors ${currentSubPage === 'availability'
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'}`, children: "Availability" }), _jsx("button", { onClick: () => setCurrentSubPage('overlaps'), className: `px-4 py-2 rounded-lg font-medium transition-colors ${currentSubPage === 'overlaps'
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'}`, children: "Overlaps" })] }), currentSubPage === 'members' && (_jsxs("div", { className: "space-y-4", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-800", children: "Group Members" }), _jsx("div", { className: "grid gap-3", children: members.length === 0 ? (_jsx("p", { className: "text-gray-600", children: "No members yet" })) : (members.map((member) => (_jsxs("div", { className: "card", children: [_jsx("h3", { className: "font-bold text-gray-800", children: member.name }), _jsx("p", { className: "text-sm text-gray-600", children: member.email })] }, member.id)))) })] })), currentSubPage === 'availability' && _jsx(AvailabilityPage, { groupId: groupId }), currentSubPage === 'overlaps' && _jsx(OverlapsPage, { groupId: groupId })] }));
}
//# sourceMappingURL=GroupDetail.js.map