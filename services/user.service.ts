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
import { db } from '@/lib/firebase';

export type UserRole = 'admin' | 'profesor' | 'socio';

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

  async getUserByDni(dni: string): Promise<(UserProfile & { id: string }) | null> {
    const q = query(this.usersRef, where('dni', '==', dni));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { ...snap.docs[0].data() as UserProfile, id: snap.docs[0].id };
  }

  async getUserByEmail(email: string): Promise<(UserProfile & { id: string }) | null> {
    const q = query(this.usersRef, where('email', '==', email));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { ...snap.docs[0].data() as UserProfile, id: snap.docs[0].id };
  }

  async createUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    const { email, firstName, lastName, role = 'socio', dni = '' } = data;
    await setDoc(doc(this.usersRef, userId), {
      email,
      firstName,
      lastName,
      role,
      dni,
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

  async updateUserStatus(userId: string, status: UserProfile['status']): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { status, updatedAt: serverTimestamp() });
  }

  async updateUserRole(userId: string, role: UserRole): Promise<void> {
    const userRef = doc(this.usersRef, userId);
    await updateDoc(userRef, { role, updatedAt: serverTimestamp() });
  }

  async updateUserDni(userId: string, dni: string): Promise<void> {
    const userRef = doc(this.usersRef, userId);
    await updateDoc(userRef, { dni, updatedAt: serverTimestamp() });
  }
}

export const userService = new UserService();
