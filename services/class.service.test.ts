import { beforeEach, describe, expect, it, vi } from 'vitest';

const firestoreState = vi.hoisted(() => ({
  docs: new Map<string, any>(),
  writes: [] as any[],
}));

vi.mock('@/lib/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((_db, name: string) => ({ path: name })),
  doc: vi.fn((ref: any, id?: string) => ({
    path: id ? `${ref.path}/${id}` : `${ref.path}/auto`,
    id: id || 'auto',
  })),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
  updateDoc: vi.fn(),
  increment: vi.fn((value: number) => ({ __increment: value })),
  runTransaction: vi.fn(async (_db, callback: any) => {
    const transaction = {
      get: vi.fn(async (ref: any) => ({
        exists: () => firestoreState.docs.has(ref.path),
        data: () => firestoreState.docs.get(ref.path),
      })),
      set: vi.fn((ref: any, data: any) => firestoreState.writes.push(['set', ref.path, data])),
      update: vi.fn((ref: any, data: any) => firestoreState.writes.push(['update', ref.path, data])),
    };

    await callback(transaction);
    return transaction;
  }),
}));

describe('ClassService booking', () => {
  beforeEach(() => {
    firestoreState.docs.clear();
    firestoreState.writes = [];
    vi.clearAllMocks();
  });

  it('uses a deterministic booking id so the same user cannot book a class twice', async () => {
    const { ClassService } = await import('./class.service');
    const service = new ClassService();

    firestoreState.docs.set('classes/class-1', {
      id: 'class-1',
      title: 'Funcional',
      capacity: 10,
      enrolledCount: 2,
      status: 'active',
    });

    await service.bookClass('class-1', 'socio+test@example.com');

    expect(firestoreState.writes[0][0]).toBe('set');
    expect(firestoreState.writes[0][1]).toBe('bookings/class-1_socio_test_example_com');
    expect(firestoreState.writes[1]).toEqual([
      'update',
      'classes/class-1',
      { enrolledCount: { __increment: 1 } },
    ]);
  });

  it('rejects duplicate confirmed bookings before incrementing class count', async () => {
    const { ClassService } = await import('./class.service');
    const service = new ClassService();

    firestoreState.docs.set('classes/class-1', {
      id: 'class-1',
      title: 'Funcional',
      capacity: 10,
      enrolledCount: 2,
      status: 'active',
    });
    firestoreState.docs.set('bookings/class-1_socio_test_example_com', {
      classId: 'class-1',
      userId: 'socio+test@example.com',
      status: 'confirmed',
    });

    await expect(service.bookClass('class-1', 'socio+test@example.com')).rejects.toThrow(
      'Ya estas anotado en esta clase'
    );
    expect(firestoreState.writes).toEqual([]);
  });
});
