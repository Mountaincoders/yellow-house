import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
export function OverlapsPage({ groupId }) {
    const [overlaps, setOverlaps] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastRefresh, setLastRefresh] = useState(null);
    useEffect(() => {
        fetchOverlaps();
        const interval = setInterval(fetchOverlaps, 60000); // Refresh every 60s
        return () => clearInterval(interval);
    }, [groupId]);
    const fetchOverlaps = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3001/groups/${groupId}/overlaps`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok)
                throw new Error('Failed to fetch overlaps');
            const data = await res.json();
            setOverlaps(data.sort((a, b) => b.overlap_count - a.overlap_count));
            setLastRefresh(new Date());
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Error fetching overlaps');
        }
        finally {
            setLoading(false);
        }
    };
    const getColorClass = (percentage) => {
        if (percentage >= 100)
            return 'bg-green-500';
        if (percentage >= 75)
            return 'bg-blue-500';
        if (percentage >= 50)
            return 'bg-yellow-500';
        return 'bg-orange-500';
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-800", children: "Time Overlaps" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: fetchOverlaps, disabled: loading, className: "btn-secondary", children: loading ? 'Refreshing...' : 'Refresh' }), lastRefresh && (_jsxs("span", { className: "text-sm text-gray-600", children: ["Last updated: ", lastRefresh.toLocaleTimeString()] }))] })] }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg", children: error })), _jsx("div", { className: "space-y-4", children: overlaps.length === 0 ? (_jsx("div", { className: "card", children: _jsx("p", { className: "text-gray-600", children: "No overlapping times yet. Mark your availability!" }) })) : (overlaps.map((overlap) => (_jsxs("div", { className: "card", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-bold text-gray-800", children: new Date(overlap.time_slot).toLocaleString() }), _jsxs("p", { className: "text-sm text-gray-600", children: [overlap.overlap_count, " out of ", overlap.total_members, " available"] })] }), _jsxs("span", { className: "text-lg font-bold text-gray-800", children: [overlap.percentage, "%"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: `h-2 rounded-full transition-all ${getColorClass(overlap.percentage)}`, style: { width: `${overlap.percentage}%` } }) })] }, overlap.time_slot)))) }), _jsx("div", { className: "text-xs text-gray-600", children: "Data updates automatically every 60 seconds" })] }));
}
//# sourceMappingURL=Overlaps.js.map