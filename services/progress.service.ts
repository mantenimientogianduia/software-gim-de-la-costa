import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

export interface ExercisePR {
  id?: string;
  userId: string;
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  date: any;
}

export class ProgressService {
  async recordPR(userId: string, exerciseId: string, exerciseName: string, weight: number, reps: number): Promise<void> {
    await addDoc(collection(db, 'exercise_prs'), {
      userId,
      exerciseId,
      exerciseName,
      weight,
      reps,
      date: serverTimestamp(),
    });
  }

  async getExerciseHistory(userId: string, exerciseId: string): Promise<ExercisePR[]> {
    const q = query(
      collection(db, 'exercise_prs'),
      where('userId', '==', userId),
      where('exerciseId', '==', exerciseId),
      orderBy('date', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as ExercisePR));
  }

  async getUserPRs(userId: string): Promise<ExercisePR[]> {
    const q = query(
      collection(db, 'exercise_prs'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as ExercisePR));
  }
}

export const progressService = new ProgressService();
