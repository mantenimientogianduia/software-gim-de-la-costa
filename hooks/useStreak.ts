import { useState, useEffect } from 'react';
import { streakService, StreakData } from '@/services/streak.service';

export function useStreak(userId: string) {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const data = await streakService.getStreakData(userId);
        setStreakData(data);
      } catch (err: any) {
        console.error('Error fetching streak data:', err);
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchData();
    }
  }, [userId]);

  return { streakData, loading, error };
}
