import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from './user.service';

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  doc: vi.fn((...path) => ({ path })),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'MOCK_TIMESTAMP'),
}));

vi.mock('@/lib/firebase', () => ({
  db: {},
}));

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    vi.clearAllMocks();
  });

  it('should create a new socio user profile', async () => {
    const { setDoc, doc } = await import('firebase/firestore');
    await userService.createUserProfile('user123', 'test@test.com', 'John', 'Doe');
    
    expect(setDoc).toHaveBeenCalled();
    expect(doc).toHaveBeenCalled();
    expect(setDoc).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      currentPlan: 'Básico',
      socialVisibility: 'hidden',
    }));
  });
});
