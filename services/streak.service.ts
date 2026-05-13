import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  Timestamp
} from 'firebase/firestore';

export interface StreakDay {
  date: Date;
  hasWorkout: boolean;
  type: 'fire' | 'ice';
}

export interface WeeklyGoal {
  weekStart: Date;
  count: number;
  goal: number;
  completed: boolean;
}

export interface StreakData {
  currentStreak: number;
  history: StreakDay[];
  weeklyGoals: WeeklyGoal[];
}

export class StreakService {
  private attendanceRef = collection(db, 'attendance');

  async getStreakData(userId: string, daysToLookBack: number = 30): Promise<StreakData> {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - daysToLookBack);
    startDate.setHours(0, 0, 0, 0);

    // Simplified query to avoid index requirements
    // We only filter by userId and do the rest in memory
    const q = query(
      this.attendanceRef,
      where('userId', '==', userId)
    );

    const snap = await getDocs(q);
    const workoutDates = new Set<string>();
    
    snap.docs.forEach(doc => {
      const data = doc.data();
      if (data.checkInAt) {
        const date = (data.checkInAt as Timestamp).toDate();
        // Only consider if it's within our lookback window
        if (date >= startDate) {
          workoutDates.add(date.toDateString());
        }
      }
    });

    // Generate history
    const history: StreakDay[] = [];
    for (let i = 0; i < daysToLookBack; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const isWorkout = workoutDates.has(d.toDateString());
      history.push({
        date: d,
        hasWorkout: isWorkout,
        type: isWorkout ? 'fire' : 'ice'
      });
    }

    // Current Streak calculation
    let currentStreak = 0;
    // Iterate from today backwards
    for (let i = 0; i < history.length; i++) {
      if (history[i].hasWorkout) {
        currentStreak++;
      } else {
        // If it's today and no workout yet, streak might not be broken
        if (i === 0) continue; 
        break;
      }
    }

    // Weekly Goals (Fixed goal of 3 days per week)
    const weeklyGoals: WeeklyGoal[] = [];
    const goalValue = 3; 

    for (let i = 0; i < 4; i++) {
      const ws = new Date(now);
      // Start of week (Monday)
      const day = now.getDay();
      const diff = now.getDate() - (day === 0 ? 6 : day - 1) - (i * 7); 
      ws.setDate(diff);
      ws.setHours(0, 0, 0, 0);
      
      const we = new Date(ws);
      we.setDate(ws.getDate() + 6);
      we.setHours(23, 59, 59, 999);

      let count = 0;
      workoutDates.forEach(dateStr => {
        const d = new Date(dateStr);
        if (d >= ws && d <= we) count++;
      });

      weeklyGoals.push({
        weekStart: ws,
        count,
        goal: goalValue,
        completed: count >= goalValue
      });
    }

    return {
      currentStreak,
      history,
      weeklyGoals
    };
  }
}

export const streakService = new StreakService();
