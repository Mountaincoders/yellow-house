import { useEffect, useState } from 'react';
import { AvailabilityPage } from './Availability.js';
import { OverlapsPage } from './Overlaps.js';
import type { Group } from '../types/index.js';

interface GroupMember {
  id: string;
  email: string;
  name: string;
}

type SubPage = 'members' | 'availability' | 'overlaps';

interface GroupDetailPageProps {
  groupId: string;
  onBack: () => void;
}

export function GroupDetailPage({ groupId, onBack }: GroupDetailPageProps) {
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSubPage, setCurrentSubPage] = useState<SubPage>('availability');
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
      if (!groupRes.ok) throw new Error('Failed to fetch group');
      const groupData = await groupRes.json();
      setGroup(groupData);

      // Fetch members
      const membersRes = await fetch(`http://localhost:3001/groups/${groupId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!membersRes.ok) throw new Error('Failed to fetch members');
      const membersData = await membersRes.json();
      setMembers(membersData);

      setJoinCode(groupId.slice(0, 8).toUpperCase());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading group');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="card bg-red-50 border border-red-200">
        <p className="text-red-700">{error || 'Group not found'}</p>
        <button onClick={onBack} className="btn-primary mt-4">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{group.name}</h1>
          <p className="text-gray-600">
            Join code: <code className="bg-gray-100 px-2 py-1 rounded font-mono">{joinCode}</code>
          </p>
        </div>
        <button onClick={onBack} className="btn-secondary">
          Back
        </button>
      </div>

      <div className="flex gap-2 border-b border-gray-200 pb-4">
        <button
          onClick={() => setCurrentSubPage('members')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            currentSubPage === 'members'
              ? 'bg-primary-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Members ({members.length})
        </button>
        <button
          onClick={() => setCurrentSubPage('availability')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            currentSubPage === 'availability'
              ? 'bg-primary-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Availability
        </button>
        <button
          onClick={() => setCurrentSubPage('overlaps')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            currentSubPage === 'overlaps'
              ? 'bg-primary-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Overlaps
        </button>
      </div>

      {currentSubPage === 'members' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Group Members</h2>
          <div className="grid gap-3">
            {members.length === 0 ? (
              <p className="text-gray-600">No members yet</p>
            ) : (
              members.map((member) => (
                <div key={member.id} className="card">
                  <h3 className="font-bold text-gray-800">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.email}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {currentSubPage === 'availability' && <AvailabilityPage groupId={groupId} />}

      {currentSubPage === 'overlaps' && <OverlapsPage groupId={groupId} />}
    </div>
  );
}
