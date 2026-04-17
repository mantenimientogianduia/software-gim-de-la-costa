'use client';
import { useState, useCallback, useEffect } from 'react';
import { routineService, Routine } from '@/services/routine.service';

export function useUserRoutine(userId: string) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutines = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await routineService.getUserRoutines(userId);
      setRoutines(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar tu rutina');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchRoutines();
  }, [fetchRoutines]);

  return {
    routines,
    loading,
    error,
    refreshRoutines: fetchRoutines
  };
}
