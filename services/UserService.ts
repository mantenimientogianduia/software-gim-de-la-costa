import { z } from 'zod';

export const UserProfileSchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  avatarUrl: z.string().url(),
  isProfileVisible: z.boolean(),
  isInGym: z.boolean(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

export interface UserService {
  updateProfileVisibility(userId: string, isVisible: boolean): Promise<void>;
  isProfileVisible(userId: string): Promise<boolean>;
  getUsersInGym(): Promise<UserProfile[]>;
}

export class UserServiceImpl implements UserService {
  private users: Map<string, UserProfile> = new Map([
    ['user-1', { id: 'user-1', name: 'Alex Gym', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', isProfileVisible: true, isInGym: true }],
    ['user-2', { id: 'user-2', name: 'Maria Fit', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria', isProfileVisible: true, isInGym: true }],
    ['user-3', { id: 'user-3', name: 'John Doe', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John', isProfileVisible: false, isInGym: true }],
  ]);

  async updateProfileVisibility(userId: string, isVisible: boolean): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      this.users.set(userId, { ...user, isProfileVisible: isVisible });
    }
  }

  async isProfileVisible(userId: string): Promise<boolean> {
    const user = this.users.get(userId);
    return user ? user.isProfileVisible : true;
  }

  async getUsersInGym(): Promise<UserProfile[]> {
    return Array.from(this.users.values()).filter(u => u.isInGym && u.isProfileVisible);
  }
}
