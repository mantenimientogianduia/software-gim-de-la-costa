import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/app/firebase';

export type UserRole = 'admin' | 'profesor' | 'member';

export interface UserProfile {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  dni?: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'pending';
  atGym?: boolean;
  currentActivity?: string;
  lastCheckIn?: any;
  membershipValidUntil?: any;
  lastPaymentDate?: any;
  weight?: number;
  height?: number;
  goals?: string;
  weeklyTrainingGoal?: number;
  currentPlan?: string;
  hasRoutine?: boolean;
  medicalHistory?: string;
  priorExperience?: string;
  createdAt: any;
  updatedAt: any;
}

class UserService {
  private usersRef = collection(db, 'users');

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const userDoc = await getDoc(doc(this.usersRef, userId));
    return userDoc.exists() ? (userDoc.data() as UserProfile) : null;
  }

  async createUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    const { email, firstName, lastName, role = 'member' } = data;
    await setDoc(doc(this.usersRef, userId), {
      email,
      firstName,
      lastName,
      role,
      status: role === 'admin' ? 'active' : 'pending',
      atGym: false,
      currentActivity: '',
      weight: 0,
      goals: '',
      weeklyTrainingGoal: 3,
      currentPlan: 'Básico',
      medicalHistory: '',
      priorExperience: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async getAllUsers(): Promise<(UserProfile & { id: string })[]> {
    const snap = await getDocs(this.usersRef);
    return snap.docs.map(doc => ({ ...doc.data() as UserProfile, id: doc.id }));
  }

  async setAtGym(userId: string, atGym: boolean, activity: string = ''): Promise<void> {
    const userRef = doc(this.usersRef, userId);
    await updateDoc(userRef, { 
      atGym, 
      currentActivity: activity,
      updatedAt: serverTimestamp() 
    });
  }

  async updateDNI(userId: string, dni: string): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { dni, updatedAt: serverTimestamp() });
  }

  async updatePersonalInfo(userId: string, data: Partial<Pick<UserProfile, 'weight' | 'goals' | 'weeklyTrainingGoal' | 'currentPlan' | 'firstName' | 'lastName' | 'medicalHistory' | 'priorExperience'>>): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { ...data, updatedAt: serverTimestamp() });
  }
}

export const userService = new UserService();
