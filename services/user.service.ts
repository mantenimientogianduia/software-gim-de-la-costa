import { db, auth } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp, 
  updateDoc 
} from 'firebase/firestore';
import { z } from 'zod';

export const UserProfileSchema = z.object({
  id: z.string().optional(),
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  role: z.enum(['admin', 'instructor', 'socio']).default('socio'),
  status: z.enum(['active', 'inactive', 'pending']).default('pending'),
   dni: z.string().optional(),
  membershipValidUntil: z.any().optional(),
  lastPaymentDate: z.any().optional(),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

export class UserService {
  private usersRef = collection(db, 'users');

  async createUserProfile(uid: string, email: string, firstName: string, lastName: string, role: 'admin' | 'instructor' | 'socio' = 'socio', dni?: string): Promise<void> {
    const userDoc = doc(this.usersRef, uid);
    await setDoc(userDoc, {
      email,
      firstName,
      lastName,
      role,
      status: role === 'admin' ? 'active' : 'pending',
      dni: dni || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const docSnap = await getDoc(doc(this.usersRef, uid));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as UserProfile;
    }
    return null;
  }

  async getUserByEmail(email: string): Promise<UserProfile | null> {
    const q = query(this.usersRef, where('email', '==', email));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return { id: snap.docs[0].id, ...snap.docs[0].data() } as UserProfile;
    }
    return null;
  }

  async getAllUsers(): Promise<UserProfile[]> {
    const snap = await getDocs(this.usersRef);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
  }

  async getSocios(): Promise<UserProfile[]> {
    const q = query(this.usersRef, where('role', '==', 'socio'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
  }

  async updateUserStatus(uid: string, status: UserProfile['status']): Promise<void> {
    const userRef = doc(this.usersRef, uid);
    await updateDoc(userRef, { 
      status, 
      updatedAt: serverTimestamp() 
    });
  }
}

export const userService = new UserService();
