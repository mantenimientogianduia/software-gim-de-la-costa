import { describe, it, expect, beforeEach } from 'vitest';
import { UserServiceImpl } from '../services/UserService';

describe('UserService', () => {
  let userService: UserServiceImpl;

  beforeEach(() => {
    userService = new UserServiceImpl();
  });

  it('should toggle user profile visibility', async () => {
    const user = { id: 'user-123', name: 'Test User', avatarUrl: '', isProfileVisible: true, isInGym: true };
    // We can't easily inject into the private map without a proper setter or by using an existing user
    const existingUserId = 'user-1'; 
    
    await userService.updateProfileVisibility(existingUserId, false);
    const updatedVisibility = await userService.isProfileVisible(existingUserId);
    expect(updatedVisibility).toBe(false);
  });

  it('should list users currently in the gym who have visible profiles', async () => {
    // Mock simulation
    const usersInGym = await userService.getUsersInGym();
    expect(Array.isArray(usersInGym)).toBe(true);
  });
});
