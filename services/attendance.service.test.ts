import { beforeEach, describe, expect, it, vi } from 'vitest';

const firebaseMocks = vi.hoisted(() => ({
  addDoc: vi.fn(),
  collection: vi.fn((db: unknown, path: string) => ({ db, path })),
  deleteDoc: vi.fn(),
  doc: vi.fn((...path: unknown[]) => ({ path })),
  getDocs: vi.fn(),
  onSnapshot: vi.fn(),
  query: vi.fn((...parts: unknown[]) => ({ parts })),
  serverTimestamp: vi.fn(() => 'SERVER_NOW'),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  where: vi.fn((field: string, op: string, value: unknown) => ({ field, op, value })),
}));

vi.mock('@/lib/firebase', () => ({
  db: { app: 'test-db' },
}));

vi.mock('@/services/social.service', () => ({
  buildPublicPresenceRecord: vi.fn(() => null),
}));

vi.mock('firebase/firestore', () => ({
  addDoc: firebaseMocks.addDoc,
  collection: firebaseMocks.collection,
  deleteDoc: firebaseMocks.deleteDoc,
  doc: firebaseMocks.doc,
  getDocs: firebaseMocks.getDocs,
  onSnapshot: firebaseMocks.onSnapshot,
  query: firebaseMocks.query,
  serverTimestamp: firebaseMocks.serverTimestamp,
  setDoc: firebaseMocks.setDoc,
  updateDoc: firebaseMocks.updateDoc,
  where: firebaseMocks.where,
}));

import { AttendanceService } from './attendance.service';

describe('AttendanceService', () => {
  let service: AttendanceService;

  beforeEach(() => {
    vi.clearAllMocks();
    firebaseMocks.getDocs.mockResolvedValue({ empty: true, docs: [] });
    service = new AttendanceService();
  });

  it('does not create another attendance record when the member already has an open session', async () => {
    firebaseMocks.getDocs.mockResolvedValue({ empty: false, docs: [{ id: 'attendance-1' }] });

    await service.checkIn('socio@test.com', 'user-1', { socialVisibility: 'hidden' });

    expect(firebaseMocks.addDoc).not.toHaveBeenCalled();
    expect(firebaseMocks.updateDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: expect.arrayContaining(['users', 'user-1']) }),
      expect.objectContaining({ atGym: true }),
    );
  });

  it('creates an attendance record when there is no open session', async () => {
    await service.checkIn('socio@test.com', 'user-1', { socialVisibility: 'hidden' });

    expect(firebaseMocks.addDoc).toHaveBeenCalledWith(expect.objectContaining({ path: 'attendance' }), {
      userId: 'socio@test.com',
      checkInAt: 'SERVER_NOW',
      status: 'present',
    });
  });

  it('does not fail check-in when public presence cleanup fails', async () => {
    firebaseMocks.deleteDoc.mockRejectedValue(new Error('Missing permissions on publicPresence'));

    await expect(service.checkIn('socio@test.com', 'user-1', { socialVisibility: 'hidden' })).resolves.toBeUndefined();

    expect(firebaseMocks.updateDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: expect.arrayContaining(['users', 'user-1']) }),
      expect.objectContaining({ atGym: true }),
    );
  });

  it('marks the user outside even if open attendance lookup fails', async () => {
    firebaseMocks.getDocs.mockRejectedValue(new Error('Missing index'));

    await expect(service.checkOut('socio@test.com', 'user-1')).resolves.toBeUndefined();

    expect(firebaseMocks.updateDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: expect.arrayContaining(['users', 'user-1']) }),
      expect.objectContaining({ atGym: false }),
    );
  });
});
