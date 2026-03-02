import { useEffect, useState } from 'react';
import type { Group } from '../types/index.js';

interface GroupsPageProps {
  onSelectGroup?: (groupId: string) => void;
}

export function GroupsPage({ onSelectGroup }: GroupsPageProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/groups', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch groups');
      const data = await res.json();
      setGroups(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching groups');
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
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
      if (!res.ok) throw new Error('Failed to create group');
      const newGroup = await res.json();
      setGroups([newGroup, ...groups]);
      setNewGroupName('');
      await fetchGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Groups</h2>
        <form onSubmit={handleCreateGroup} className="card max-w-md space-y-4">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="input-field w-full"
            placeholder="Group name"
            required
          />
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Group'}
          </button>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </form>
      </div>

      <div className="grid gap-4">
        {groups.length === 0 ? (
          <p className="text-gray-600">No groups yet. Create one to get started!</p>
        ) : (
          groups.map((group) => (
            <div key={group.id} className="card hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="text-lg font-bold text-gray-800 mb-2">{group.name}</h3>
              <p className="text-sm text-gray-600 mb-4">
                Created {new Date(group.created_at).toLocaleDateString()}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => onSelectGroup?.(group.id)}
                  className="btn-primary text-sm"
                >
                  View
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
