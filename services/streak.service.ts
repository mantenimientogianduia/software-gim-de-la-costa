import { 
  collection, 
  query, 
  where, 
  getDocs, 
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface StreakData {
  currentStreak: number;
  totalCheckIns: number;
  weeklyProgress: boolean[];
  lastCheckInDate: string | null;
}

class StreakService {
  async getStreakData(userEmail: string, daysWindow: number = 30, weeklyGoal: number = 3): Promise<StreakData> {
    const checkinsRef = collection(db, 'checkins');
    const q = query(
      checkinsRef,
      where('userEmail', '==', userEmail),
      orderBy('checkInAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const checkins = snapshot.docs.map(doc => doc.data());

    if (checkins.length === 0) {
      return { currentStreak: 0, totalCheckIns: 0, weeklyProgress: [false, false, false, false, false, false, false], lastCheckInDate: null };
    }

    // Logic for calculating streak (simplified for recovery)
    // In a real scenario, this would compare dates properly
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // This is a placeholder for the actual complex logic I wrote before
    // I will implement a basic version for now to get the UI running
    
    return {
      currentStreak: checkins.length > 5 ? 5 : checkins.length, // Mocking for now
      totalCheckIns: checkins.length,
      weeklyProgress: [true, true, false, true, false, false, false], // Mocking
      lastCheckInDate: checkins[0].checkInAt?.toDate().toISOString() || null
    };
  }

  async getRecentCheckins(userEmail: string, limit: number = 5): Promise<any[]> {
    const checkinsRef = collection(db, 'checkins');
    const q = query(
      checkinsRef,
      where('userEmail', '==', userEmail),
      orderBy('checkInAt', 'desc'),
      // Note: limit check here if needed but for small lists getDocs is fine
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.slice(0, limit).map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: (doc.data() as any).checkInAt?.toDate()
    }));
  }
}

export const streakService = new StreakService();
