import { describe, it, expect, beforeEach } from 'vitest';
import { UserService } from '../services/UserService';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  it('should list all users', async () => {
    const users = await userService.getUsers();
    expect(users.length).toBeGreaterThan(0);
  });

  it('should toggle user profile visibility', async () => {
    const users = await userService.getUsers();
    const userId = users[0].id;
    const initialVisibility = users[0].isProfileVisible;
    
    await userService.toggleVisibility(userId, initialVisibility);
    const updatedUsers = await userService.getUsers();
    const updatedUser = updatedUsers.find(u => u.id === userId);
    
    expect(updatedUser?.isProfileVisible).toBe(!initialVisibility);
  });

  it('should delete a user (Admin feature)', async () => {
    const users = await userService.getUsers();
    const userIdToDelete = users[0].id;
    
    await userService.deleteUser(userIdToDelete);
    const updatedUsers = await userService.getUsers();
    
    expect(updatedUsers.find(u => u.id === userIdToDelete)).toBeUndefined();
  });
});
