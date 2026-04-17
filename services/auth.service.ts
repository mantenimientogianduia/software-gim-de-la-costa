import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User, GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo } from 'firebase/auth';
import { app } from '@/lib/firebase';

export class AuthService {
  private auth = getAuth(app);
  private googleProvider = new GoogleAuthProvider();

  async login(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    return userCredential.user;
  }

  async loginWithGoogle(): Promise<{ user: User; isNewUser: boolean }> {
    const userCredential = await signInWithPopup(this.auth, this.googleProvider);
    const additionalInfo = getAdditionalUserInfo(userCredential);
    return {
      user: userCredential.user,
      isNewUser: additionalInfo?.isNewUser || false
    };
  }

  async register(email: string, password: string): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    return userCredential.user;
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }
}

export const authService = new AuthService();
