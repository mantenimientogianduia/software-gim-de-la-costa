import { db } from '@/lib/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  where,
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';

export interface UserProfile {
  dni?: string;
  email: string;
  role: 'admin' | 'profesor' | 'socio';
  firstName: string;
  lastName: string;
  status: 'active' | 'inactive' | 'pending';
  atGym?: boolean;
  currentActivity?: string;
  lastCheckIn?: any;
  membershipValidUntil?: any;
  lastPaymentDate?: any;
  createdAt: any;
  updatedAt: any;
  // Onboarding & Profile
  onboardingCompleted?: boolean;
  onboardingData?: {
    age?: number;
    weight?: number;
    height?: number;
    goal?: string;
    experience?: string;
    interests?: string[];
  };
  // Gamification & Progress
  streak?: {
    current: number;
    best: number;
    lastActivityDate?: any;
    activityHistory?: string[]; // ISO Dates
  };
  achievements?: string[]; // Achievement IDs
}

export class UserService {
  async createUserProfile(userId: string, email: string, firstName: string, lastName: string, role: 'admin' | 'profesor' | 'socio' = 'socio', dni?: string): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      dni: dni || '',
      email,
      role,
      firstName,
      lastName,
      status: role === 'admin' ? 'active' : 'pending',
      atGym: false,
      currentActivity: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async getUserByDni(dni: string): Promise<(UserProfile & { id: string }) | null> {
    const q = query(collection(db, 'users'), where('dni', '==', dni));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { ...snap.docs[0].data(), id: snap.docs[0].id } as any;
  }

  async getUserByEmail(email: string): Promise<(UserProfile & { id: string }) | null> {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { ...snap.docs[0].data(), id: snap.docs[0].id } as any;
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

  async updateUserDni(userId: string, dni: string): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { dni, updatedAt: serverTimestamp() });
  }

  async completeOnboarding(userId: string, data: UserProfile['onboardingData']): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { 
      onboardingData: data, 
      onboardingCompleted: true, 
      updatedAt: serverTimestamp() 
    });
  }

  async recordActivity(userId: string): Promise<void> {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return;

    const data = snap.data() as UserProfile;
    const today = new Date().toISOString().split('T')[0];
    
    // Initialize streak if missing
    const streak = data.streak || { current: 0, best: 0, activityHistory: [] };
    
    // Don't record twice the same day
    if (streak.activityHistory?.includes(today)) return;

    const lastDateStr = streak.lastActivityDate ? new Date(streak.lastActivityDate.toDate?.() || streak.lastActivityDate).toISOString().split('T')[0] : null;
    
    let newCurrent = 1;
    if (lastDateStr) {
      const lastDate = new Date(lastDateStr);
      const diff = (new Date(today).getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (diff === 1) {
        newCurrent = streak.current + 1;
      }
    }

    const newBest = Math.max(streak.best, newCurrent);
    const newHistory = [...(streak.activityHistory || []), today];

    await updateDoc(userRef, {
      streak: {
        current: newCurrent,
        best: newBest,
        lastActivityDate: serverTimestamp(),
        activityHistory: newHistory
      },
      updatedAt: serverTimestamp()
    });
  }
}

export const userService = new UserService();
