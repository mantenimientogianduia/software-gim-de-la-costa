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
  weight?: number;
  height?: number;
  gender?: 'masculino' | 'femenino' | 'otro';
  otherSports?: string;
  injuries?: string;
  medications?: string;
  isSmoker?: boolean;
  fitnessLevel?: 'principiante' | 'intermedio' | 'avanzado';
  goals?: string;
  weeklyTrainingGoal?: number;
  currentPlan?: string;
  createdAt: any;
  updatedAt: any;
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
      weight: 0,
      height: 0,
      gender: 'otro',
      otherSports: '',
      injuries: '',
      medications: '',
      isSmoker: false,
      fitnessLevel: 'principiante',
      goals: '',
      weeklyTrainingGoal: 3,
      currentPlan: 'Básico',
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

  async updatePersonalInfo(userId: string, data: Partial<Pick<UserProfile, 'weight' | 'height' | 'gender' | 'otherSports' | 'injuries' | 'medications' | 'isSmoker' | 'fitnessLevel' | 'goals' | 'weeklyTrainingGoal' | 'currentPlan' | 'firstName' | 'lastName'>>): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { ...data, updatedAt: serverTimestamp() });
  }
}

export const userService = new UserService();
