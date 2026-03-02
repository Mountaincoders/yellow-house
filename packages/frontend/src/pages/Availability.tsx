import { useEffect, useState } from 'react';
import type { AvailabilitySlot } from '../types/index.js';

interface AvailabilityPageProps {
  groupId: string;
}

export function AvailabilityPage({ groupId }: AvailabilityPageProps) {
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      if (!res.ok) throw new Error('Failed to fetch availability');
      const data = (await res.json()) as AvailabilitySlot[];
      
      // Extract unique time slots
      const unique: string[] = Array.from(new Set(data.map((s: AvailabilitySlot) => s.time_slot)));
      setTimeSlots(unique);

      // Mark selected ones
      const selected: Set<string> = new Set(
        data.filter((s: AvailabilitySlot) => s.marked).map((s: AvailabilitySlot) => s.time_slot)
      );
      setSelectedSlots(selected);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching availability');
    }
  };

  const handleAddTimeSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTimeSlot && !timeSlots.includes(newTimeSlot)) {
      setTimeSlots([...timeSlots, newTimeSlot].sort());
      setNewTimeSlot('');
    }
  };

  const handleToggleSlot = (timeSlot: string) => {
    const newSelected = new Set(selectedSlots);
    if (newSelected.has(timeSlot)) {
      newSelected.delete(timeSlot);
    } else {
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
      if (!res.ok) throw new Error('Failed to save availability');
      await fetchAvailability();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving availability');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Mark Your Availability</h2>

      <div className="card">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Add Time Slots</h3>
        <form onSubmit={handleAddTimeSlot} className="flex gap-2">
          <input
            type="datetime-local"
            value={newTimeSlot}
            onChange={(e) => setNewTimeSlot(e.target.value)}
            className="input-field flex-1"
          />
          <button type="submit" className="btn-primary">
            Add
          </button>
        </form>
      </div>

      <div className="card">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Available Times</h3>
        <div className="space-y-2">
          {timeSlots.length === 0 ? (
            <p className="text-gray-600">No time slots added yet</p>
          ) : (
            timeSlots.map((slot) => (
              <label key={slot} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSlots.has(slot)}
                  onChange={() => handleToggleSlot(slot)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="flex-1 text-gray-700">
                  {new Date(slot).toLocaleString()}
                </span>
              </label>
            ))
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="btn-primary"
      >
        {loading ? 'Saving...' : 'Save Availability'}
      </button>
    </div>
  );
}
