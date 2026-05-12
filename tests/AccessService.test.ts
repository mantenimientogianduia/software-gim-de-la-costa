import { describe, it, expect, beforeEach } from 'vitest';
import { AccessService } from '../services/AccessService';

describe('AccessService', () => {
  let accessService: AccessService;

  beforeEach(() => {
    accessService = new AccessService();
  });

  it('should register a check-in', async () => {
    const userId = 'user-1';
    const entry = await accessService.checkIn(userId);
    expect(entry.userId).toBe(userId);
    expect(entry.type).toBe('in');
    expect(entry.timestamp).toBeInstanceOf(Date);
  });

  it('should get current people in gym', async () => {
    await accessService.checkIn('user-1');
    await accessService.checkIn('user-2');
    const inGym = await accessService.getUsersInGym();
    expect(inGym.length).toBe(2);
  });

  it('should register a check-out', async () => {
    const userId = 'user-1';
    await accessService.checkIn(userId);
    await accessService.checkOut(userId);
    const inGym = await accessService.getUsersInGym();
    expect(inGym.find(id => id === userId)).toBeUndefined();
  });
});
