import { useEffect, useState } from 'react';

interface Overlap {
  time_slot: string;
  overlap_count: number;
  total_members: number;
  percentage: number;
}

interface OverlapsPageProps {
  groupId: string;
}

export function OverlapsPage({ groupId }: OverlapsPageProps) {
  const [overlaps, setOverlaps] = useState<Overlap[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

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
      if (!res.ok) throw new Error('Failed to fetch overlaps');
      const data = await res.json();
      setOverlaps(data.sort((a: Overlap, b: Overlap) => b.overlap_count - a.overlap_count));
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching overlaps');
    } finally {
      setLoading(false);
    }
  };

  const getColorClass = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Time Overlaps</h2>
        <div className="flex gap-2">
          <button
            onClick={fetchOverlaps}
            disabled={loading}
            className="btn-secondary"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          {lastRefresh && (
            <span className="text-sm text-gray-600">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {overlaps.length === 0 ? (
          <div className="card">
            <p className="text-gray-600">No overlapping times yet. Mark your availability!</p>
          </div>
        ) : (
          overlaps.map((overlap) => (
            <div key={overlap.time_slot} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-800">
                    {new Date(overlap.time_slot).toLocaleString()}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {overlap.overlap_count} out of {overlap.total_members} available
                  </p>
                </div>
                <span className="text-lg font-bold text-gray-800">
                  {overlap.percentage}%
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getColorClass(
                    overlap.percentage
                  )}`}
                  style={{ width: `${overlap.percentage}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="text-xs text-gray-600">
        Data updates automatically every 60 seconds
      </div>
    </div>
  );
}
