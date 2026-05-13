import { useState, useEffect } from 'react';
import { streakService, StreakData } from '@/services/streak.service';

export function useStreak(userId: string, weeklyTrainingGoal: number = 3) {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await streakService.getStreakData(userId, 90, weeklyTrainingGoal);
        setStreakData(data);
      } catch (err: any) {
        console.error('Error fetching streak data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchData();
    }
  }, [userId, weeklyTrainingGoal]);

  return { streakData, loading, error };
}
