'use client';

import { useState, useEffect, useMemo } from 'react';
import { UserServiceImpl, UserProfile } from '@/services/UserService';
import { TimerServiceImpl, TimerPreset } from '@/services/TimerService';

export function useGym() {
  const userService = useMemo(() => new UserServiceImpl(), []);
  const timerService = useMemo(() => new TimerServiceImpl(), []);

  const [usersInGym, setUsersInGym] = useState<UserProfile[]>([]);
  const [presets, setPresets] = useState<TimerPreset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const users = await userService.getUsersInGym();
      const p = timerService.getPresets();
      setUsersInGym(users);
      setPresets(p);
      setLoading(false);
    }
    init();
  }, [userService, timerService]);

  const toggleVisibility = async (userId: string, current: boolean) => {
    await userService.updateProfileVisibility(userId, !current);
    const updated = await userService.getUsersInGym();
    setUsersInGym(updated);
  };

  return {
    usersInGym,
    presets,
    loading,
    toggleVisibility,
    timerService
  };
}
