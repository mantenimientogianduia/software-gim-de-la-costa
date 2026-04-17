import { db } from '@/lib/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';

export interface UserProfile {
  email: string;
  role: 'admin' | 'profesor' | 'socio';
  firstName: string;
  lastName: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: any;
  updatedAt: any;
}

export class UserService {
  async createUserProfile(userId: string, email: string, firstName: string, lastName: string, role: 'admin' | 'profesor' | 'socio' = 'socio'): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      email,
      role,
      firstName,
      lastName,
      status: role === 'admin' ? 'active' : 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return null;
    return snap.data() as UserProfile;
  }

  async getAllUsers(): Promise<UserProfile[]> {
    const q = query(collection(db, 'users'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => {
      const data = doc.data();
      return { 
        ...data,
        id: doc.id,
      } as UserProfile & { id: string };
    });
  }

  async updateUserStatus(userId: string, status: 'active' | 'inactive' | 'pending'): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { status, updatedAt: serverTimestamp() });
  }

  async updateUserRole(userId: string, role: 'admin' | 'profesor' | 'socio'): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { role, updatedAt: serverTimestamp() });
  }
}

export const userService = new UserService();
