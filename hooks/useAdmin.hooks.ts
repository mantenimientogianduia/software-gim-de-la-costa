import { useState, useEffect } from 'react';
import { UserService, User } from '@/services/UserService';

const userService = new UserService();

export function useAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const data = await userService.getUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (id: string) => {
    await userService.deleteUser(id);
    await fetchUsers();
  };

  const updatePlan = async (id: string, plan: User['plan']) => {
    await userService.updateUserPlan(id, plan);
    await fetchUsers();
  };

  return {
    users,
    loading,
    deleteUser,
    updatePlan,
    refreshUsers: fetchUsers
  };
}
