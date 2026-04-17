'use client';
import { useState, useCallback, useEffect } from 'react';
import { classService, GymClass, Booking } from '@/services/class.service';

export function useClasses() {
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await classService.getActiveClasses();
      setClasses(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar clases');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  return { classes, loading, error, refreshClasses: fetchClasses };
}

export function useUserBookings(userId: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBookings = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await classService.getUserBookings(userId);
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { bookings, loading, refreshBookings: fetchBookings };
}
