import { useState, useEffect } from 'react';
import { UserService, User } from '@/services/UserService';

const userService = new UserService();

export function useGym() {
  const [usersInGym, setUsersInGym] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    const allUsers = await userService.getUsers();
    // In a real app we'd filter by who is actually "in" the gym
    // For now, let's show all visible users as "in the gym" for the community feel
    setUsersInGym(allUsers.filter(u => u.isProfileVisible));
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleVisibility = async (userId: string, current: boolean) => {
    await userService.toggleVisibility(userId, current);
    await fetchUsers();
  };

  return {
    usersInGym,
    loading,
    toggleVisibility
  };
}
