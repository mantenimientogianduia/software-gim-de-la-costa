export interface AccessLog {
  id: string;
  userId: string;
  timestamp: Date;
  type: 'in' | 'out';
}

export class AccessService {
  private inGymUserIds: Set<string> = new Set();
  private logs: AccessLog[] = [];

  async checkIn(userId: string): Promise<AccessLog> {
    const entry: AccessLog = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      timestamp: new Date(),
      type: 'in'
    };
    this.logs.push(entry);
    this.inGymUserIds.add(userId);
    return entry;
  }

  async checkOut(userId: string): Promise<AccessLog> {
    const entry: AccessLog = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      timestamp: new Date(),
      type: 'out'
    };
    this.logs.push(entry);
    this.inGymUserIds.delete(userId);
    return entry;
  }

  async getUsersInGym(): Promise<string[]> {
    return Array.from(this.inGymUserIds);
  }

  async getRecentLogs(limit = 10): Promise<AccessLog[]> {
    return [...this.logs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
  }
}
