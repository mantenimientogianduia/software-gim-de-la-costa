'use client';
import { useState, useCallback, useEffect } from 'react';
import { routineService, Routine, Exercise } from '@/services/routine.service';

export function useRoutines(instructorId: string) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutines = useCallback(async () => {
    setLoading(true);
    try {
      const data = await routineService.getInstructorRoutines(instructorId);
      setRoutines(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar rutinas');
    } finally {
      setLoading(false);
    }
  }, [instructorId]);

  useEffect(() => {
    fetchRoutines();
  }, [fetchRoutines]);

  const saveRoutine = async (routine: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => {
    setLoading(true);
    try {
      if (id) {
        await routineService.updateRoutine(id, routine);
      } else {
        await routineService.createRoutine(routine);
      }
      await fetchRoutines();
    } catch (err: any) {
      setError(err.message || 'Error al guardar rutina');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    routines,
    loading,
    error,
    saveRoutine,
    refreshRoutines: fetchRoutines
  };
}
