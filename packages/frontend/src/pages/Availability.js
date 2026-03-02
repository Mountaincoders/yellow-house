import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
export function AvailabilityPage({ groupId }) {
    const [slots, setSlots] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [selectedSlots, setSelectedSlots] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [newTimeSlot, setNewTimeSlot] = useState('');
    useEffect(() => {
        fetchAvailability();
    }, [groupId]);
    const fetchAvailability = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3001/groups/${groupId}/availability`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok)
                throw new Error('Failed to fetch availability');
            const data = await res.json();
            setSlots(data);
            // Extract unique time slots
            const unique = Array.from(new Set(data.map((s) => s.time_slot)));
            setTimeSlots(unique);
            // Mark selected ones
            const selected = new Set(data.filter((s) => s.marked).map((s) => s.time_slot));
            setSelectedSlots(selected);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Error fetching availability');
        }
    };
    const handleAddTimeSlot = (e) => {
        e.preventDefault();
        if (newTimeSlot && !timeSlots.includes(newTimeSlot)) {
            setTimeSlots([...timeSlots, newTimeSlot].sort());
            setNewTimeSlot('');
        }
    };
    const handleToggleSlot = (timeSlot) => {
        const newSelected = new Set(selectedSlots);
        if (newSelected.has(timeSlot)) {
            newSelected.delete(timeSlot);
        }
        else {
            newSelected.add(timeSlot);
        }
        setSelectedSlots(newSelected);
    };
    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3001/groups/${groupId}/availability/bulk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    time_slots: Array.from(selectedSlots),
                    marked: true,
                }),
            });
            if (!res.ok)
                throw new Error('Failed to save availability');
            await fetchAvailability();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Error saving availability');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-800", children: "Mark Your Availability" }), _jsxs("div", { className: "card", children: [_jsx("h3", { className: "text-lg font-bold mb-4 text-gray-800", children: "Add Time Slots" }), _jsxs("form", { onSubmit: handleAddTimeSlot, className: "flex gap-2", children: [_jsx("input", { type: "datetime-local", value: newTimeSlot, onChange: (e) => setNewTimeSlot(e.target.value), className: "input-field flex-1" }), _jsx("button", { type: "submit", className: "btn-primary", children: "Add" })] })] }), _jsxs("div", { className: "card", children: [_jsx("h3", { className: "text-lg font-bold mb-4 text-gray-800", children: "Available Times" }), _jsx("div", { className: "space-y-2", children: timeSlots.length === 0 ? (_jsx("p", { className: "text-gray-600", children: "No time slots added yet" })) : (timeSlots.map((slot) => (_jsxs("label", { className: "flex items-center gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: selectedSlots.has(slot), onChange: () => handleToggleSlot(slot), className: "w-4 h-4 rounded border-gray-300" }), _jsx("span", { className: "flex-1 text-gray-700", children: new Date(slot).toLocaleString() })] }, slot)))) })] }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg", children: error })), _jsx("button", { onClick: handleSubmit, disabled: loading, className: "btn-primary", children: loading ? 'Saving...' : 'Save Availability' })] }));
}
//# sourceMappingURL=Availability.js.map