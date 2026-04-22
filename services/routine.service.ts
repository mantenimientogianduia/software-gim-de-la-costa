import { db } from '@/lib/firebase';
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

export const ExerciseSchema = z.object({
  name: z.string().min(1, 'Nombre del ejercicio requerido'),
  sets: z.string().min(1, 'Series/Reps requeridas'),
  notes: z.string().optional(),
});

export const RoutineSchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1, 'Usuario requerido'),
  instructorId: z.string().min(1, 'Instructor requerido'),
  title: z.string().min(3, 'Título debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  exercises: z.array(ExerciseSchema).min(1, 'Al menos un ejercicio es requerido'),
  status: z.enum(['active', 'archived']).default('active'),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

export type Exercise = z.infer<typeof ExerciseSchema>;
export type Routine = z.infer<typeof RoutineSchema>;

export interface IRoutineService {
  createRoutine(routine: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
  updateRoutine(id: string, routine: Partial<Routine>): Promise<void>;
  getUserRoutines(userId: string): Promise<Routine[]>;
  getInstructorRoutines(instructorId: string): Promise<Routine[]>;
  getRoutineById(id: string): Promise<Routine | null>;
}

export class RoutineService implements IRoutineService {
  private collectionRef = collection(db, 'routines');

  async createRoutine(routineData: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const validated = RoutineSchema.parse(routineData);
    const newDocRef = doc(this.collectionRef);
    
    await setDoc(newDocRef, {
      ...validated,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return newDocRef.id;
  }

  async updateRoutine(id: string, routineData: Partial<Routine>): Promise<void> {
    const routineRef = doc(this.collectionRef, id);
    await updateDoc(routineRef, {
      ...routineData,
      updatedAt: serverTimestamp(),
    });
  }

  async getUserRoutines(userId: string): Promise<Routine[]> {
    const q = query(this.collectionRef, where('userId', '==', userId), where('status', '==', 'active'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Routine));
  }

  async getInstructorRoutines(instructorId: string): Promise<Routine[]> {
    const q = query(this.collectionRef, where('instructorId', '==', instructorId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Routine));
  }

  async getRoutineById(id: string): Promise<Routine | null> {
    const docRef = doc(this.collectionRef, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Routine;
  }

  async getAllExercises(): Promise<Exercise[]> {
    const q = query(this.collectionRef);
    const snap = await getDocs(q);
    const allEx: Exercise[] = [];
    const names = new Set<string>();

    snap.docs.forEach(doc => {
      const routine = doc.data() as Routine;
      routine.exercises.forEach(ex => {
        if (!names.has(ex.name.toLowerCase())) {
          allEx.push(ex);
          names.add(ex.name.toLowerCase());
        }
      });
    });

    return allEx;
  }
}

export const routineService = new RoutineService();
