import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  Timestamp, 
  orderBy 
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

  /**
   * Calculates the streak data for a user
   * @param userId The user ID (email in this app)
   * @param daysToLookBack Default 30 days
   */
  async getStreakData(userId: string, daysToLookBack: number = 30): Promise<StreakData> {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - daysToLookBack);
    startDate.setHours(0, 0, 0, 0);

    const q = query(
      this.attendanceRef,
      where('userId', '==', userId)
    );

    const snap = await getDocs(q);
    const startDateMillis = startDate.getTime();

    const docs = snap.docs
      .filter(doc => {
        const data = doc.data();
        if (!data.checkInAt) return false;
        return (data.checkInAt as Timestamp).toMillis() >= startDateMillis;
      })
      .sort((a, b) => {
        const dateA = (a.data().checkInAt as Timestamp).toMillis();
        const dateB = (b.data().checkInAt as Timestamp).toMillis();
        return dateB - dateA;
      });

    const workoutDates = new Set<string>();
    
    docs.forEach(doc => {
      const data = doc.data();
      if (data.checkInAt) {
        const date = (data.checkInAt as Timestamp).toDate();
        workoutDates.add(date.toDateString());
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
    for (let i = 0; i < history.length; i++) {
      if (history[i].hasWorkout) {
        currentStreak++;
      } else if (i === 0) {
        // If today is not a workout, streak doesn't break yet if yesterday was a workout
        continue; 
      } else {
        break;
      }
    }

    // Weekly Goals (Fixed goal of 3 days per week for now)
    const weeklyGoals: WeeklyGoal[] = [];
    const goalValue = 3; 

    for (let i = 0; i < 4; i++) {
      const ws = new Date(now);
      ws.setDate(now.getDate() - (now.getDay() || 7) + 1 - (i * 7)); // Start of week (Monday)
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
