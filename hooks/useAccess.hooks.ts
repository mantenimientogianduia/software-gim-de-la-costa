import { useState, useEffect, useCallback } from 'react';
import { AccessService, AccessLog } from '@/services/AccessService';

const accessService = new AccessService();

export function useAccess() {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [inGymCount, setInGymCount] = useState(0);

  const refresh = useCallback(async () => {
    const recentLogs = await accessService.getRecentLogs(5);
    const inGym = await accessService.getUsersInGym();
    setLogs(recentLogs);
    setInGymCount(inGym.length);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleCheckIn = async (userId: string) => {
    await accessService.checkIn(userId);
    await refresh();
  };

  const handleCheckOut = async (userId: string) => {
    await accessService.checkOut(userId);
    await refresh();
  };

  return {
    logs,
    inGymCount,
    handleCheckIn,
    handleCheckOut
  };
}
