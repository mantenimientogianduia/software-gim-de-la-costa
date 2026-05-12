export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  isProfileVisible: boolean;
  plan: 'Basic' | 'Pro' | 'Elite';
  status: 'Active' | 'Inactive' | 'Pending';
  lastActivity?: string;
}

export class UserService {
  private users: User[] = [
    {
      id: '1',
      name: 'Alex Rivera',
      email: 'alex@example.com',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      isProfileVisible: true,
      plan: 'Elite',
      status: 'Active',
      lastActivity: 'CARDIO ROOM'
    },
    {
      id: '2',
      name: 'Elena Silva',
      email: 'elena@example.com',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
      isProfileVisible: true,
      plan: 'Pro',
      status: 'Active',
      lastActivity: 'STRENGTH AREA'
    },
    {
      id: '3',
      name: 'Marcus Bell',
      email: 'marcus@example.com',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
      isProfileVisible: false,
      plan: 'Basic',
      status: 'Inactive',
      lastActivity: 'RECOVERY ZONE'
    }
  ];

  async getUsers(): Promise<User[]> {
    return [...this.users];
  }

  async toggleVisibility(userId: string, currentStatus: boolean): Promise<void> {
    const index = this.users.findIndex(u => u.id === userId);
    if (index !== -1) {
      this.users[index].isProfileVisible = !currentStatus;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    this.users = this.users.filter(u => u.id !== userId);
  }

  async updateUserPlan(userId: string, plan: User['plan']): Promise<void> {
    const index = this.users.findIndex(u => u.id === userId);
    if (index !== -1) {
      this.users[index].plan = plan;
    }
  }
}
