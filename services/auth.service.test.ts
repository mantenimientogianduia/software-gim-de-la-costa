import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth.service';

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  GoogleAuthProvider: vi.fn(function GoogleAuthProvider() {
    return { providerId: 'google.com' };
  }),
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

  it('should authenticate a user with Google and report whether it is new', async () => {
    const mockUser = { uid: 'google-123', email: 'google@test.com' };
    const { signInWithPopup, getAdditionalUserInfo } = await import('firebase/auth');
    (signInWithPopup as any).mockResolvedValue({ user: mockUser });
    (getAdditionalUserInfo as any).mockReturnValue({ isNewUser: true });

    const result = await authService.loginWithGoogle();

    expect(result).toEqual({ user: mockUser, isNewUser: true });
    expect(signInWithPopup).toHaveBeenCalled();
  });
});
