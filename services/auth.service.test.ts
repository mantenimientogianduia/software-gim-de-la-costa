import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth.service';

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  getAdditionalUserInfo: vi.fn(),
  signOut: vi.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    vi.clearAllMocks();
  });

  it('should authenticate a user with email and password', async () => {
    const mockUser = { uid: '123', email: 'test@test.com' };
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    (signInWithEmailAndPassword as any).mockResolvedValue({ user: mockUser });

    const user = await authService.login('test@test.com', 'password123');
    expect(user.uid).toBe('123');
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(undefined, 'test@test.com', 'password123');
  });

  it('should register a new user', async () => {
    const mockUser = { uid: '123', email: 'test@test.com' };
    const { createUserWithEmailAndPassword } = await import('firebase/auth');
    (createUserWithEmailAndPassword as any).mockResolvedValue({ user: mockUser });

    const user = await authService.register('test@test.com', 'password123');
    expect(user.uid).toBe('123');
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(undefined, 'test@test.com', 'password123');
  });
});
